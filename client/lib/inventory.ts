// Raw Materials Inventory & Finished Goods Management System

export type Unit = "kg" | "liters" | "pieces" | "grams" | "ml";

export interface RawMaterial {
  id: string;
  name: string;
  category: string;
  unit: Unit;
  currentStock: number;
  minStock: number;
  maxStock: number;
  expiryDate?: string;
  supplier?: string;
  lastPurchasePrice: number;
  averageCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  rawMaterialId: string;
  rawMaterialName: string;
  quantity: number;
  unit: Unit;
  unitPrice: number;
  totalCost: number;
  supplier: string;
  purchaseDate: string;
  expiryDate?: string;
  invoiceNo?: string;
  notes?: string;
  createdAt: string;
}

export interface FinishedGood {
  id: string;
  name: string;
  category: string;
  recipe: RecipeItem[];
  totalCost: number;
  sellingPrice: number;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeItem {
  rawMaterialId: string;
  rawMaterialName: string;
  quantityRequired: number;
  unit: Unit;
}

export interface ConsumptionRecord {
  id: string;
  finishedGoodId: string;
  finishedGoodName: string;
  quantityProduced: number;
  dateProduced: string;
  rawMaterialsUsed: {
    rawMaterialId: string;
    rawMaterialName: string;
    quantityUsed: number;
    unit: Unit;
  }[];
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  rawMaterialId: string;
  rawMaterialName: string;
  oldStock: number;
  newStock: number;
  adjustmentReason: "purchase" | "consumption" | "manual" | "expiry";
  notes?: string;
  createdAt: string;
}

// ===== RAW MATERIALS =====

export function createRawMaterial(
  name: string,
  category: string,
  unit: Unit,
  minStock: number,
  maxStock: number,
  supplier?: string
): RawMaterial {
  return {
    id: `raw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    category,
    unit,
    currentStock: 0,
    minStock,
    maxStock,
    supplier,
    lastPurchasePrice: 0,
    averageCost: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function addRawMaterial(material: RawMaterial): void {
  const materials = getAllRawMaterials();
  materials.push(material);
  localStorage.setItem("raw_materials", JSON.stringify(materials));
  window.dispatchEvent(
    new CustomEvent("rawMaterialAdded", { detail: material })
  );
}

export function getAllRawMaterials(): RawMaterial[] {
  const materials = localStorage.getItem("raw_materials");
  return materials ? JSON.parse(materials) : [];
}

export function getRawMaterialById(id: string): RawMaterial | undefined {
  const materials = getAllRawMaterials();
  return materials.find((m) => m.id === id);
}

export function updateRawMaterial(material: RawMaterial): void {
  const materials = getAllRawMaterials();
  const index = materials.findIndex((m) => m.id === material.id);
  if (index !== -1) {
    materials[index] = { ...material, updatedAt: new Date().toISOString() };
    localStorage.setItem("raw_materials", JSON.stringify(materials));
    window.dispatchEvent(
      new CustomEvent("rawMaterialUpdated", { detail: material })
    );
  }
}

export function deleteRawMaterial(id: string): boolean {
  const materials = getAllRawMaterials();
  const filtered = materials.filter((m) => m.id !== id);
  localStorage.setItem("raw_materials", JSON.stringify(filtered));
  return materials.length !== filtered.length;
}

// ===== PURCHASES =====

export function createPurchase(
  rawMaterialId: string,
  rawMaterialName: string,
  quantity: number,
  unit: Unit,
  unitPrice: number,
  supplier: string,
  purchaseDate: string,
  expiryDate?: string,
  invoiceNo?: string,
  notes?: string
): Purchase {
  return {
    id: `purch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    rawMaterialId,
    rawMaterialName,
    quantity,
    unit,
    unitPrice,
    totalCost: quantity * unitPrice,
    supplier,
    purchaseDate,
    expiryDate,
    invoiceNo,
    notes,
    createdAt: new Date().toISOString(),
  };
}

export function savePurchase(purchase: Purchase): void {
  const purchases = getAllPurchases();
  purchases.push(purchase);
  localStorage.setItem("purchases", JSON.stringify(purchases));

  // Update raw material stock
  const material = getRawMaterialById(purchase.rawMaterialId);
  if (material) {
    const oldStock = material.currentStock;
    material.currentStock += purchase.quantity;
    material.lastPurchasePrice = purchase.unitPrice;
    
    // Calculate average cost
    const allPurchases = purchases.filter((p) => p.rawMaterialId === purchase.rawMaterialId);
    const totalCost = allPurchases.reduce((sum, p) => sum + p.totalCost, 0);
    const totalQuantity = allPurchases.reduce((sum, p) => sum + p.quantity, 0);
    material.averageCost = totalQuantity > 0 ? totalCost / totalQuantity : purchase.unitPrice;

    if (expiryDate) {
      material.expiryDate = purchase.expiryDate;
    }

    updateRawMaterial(material);

    // Record stock adjustment
    recordStockAdjustment(
      purchase.rawMaterialId,
      purchase.rawMaterialName,
      oldStock,
      material.currentStock,
      "purchase",
      `Purchase of ${purchase.quantity} ${purchase.unit} from ${purchase.supplier}`
    );
  }

  window.dispatchEvent(
    new CustomEvent("purchaseAdded", { detail: purchase })
  );
}

export function getAllPurchases(): Purchase[] {
  const purchases = localStorage.getItem("purchases");
  return purchases ? JSON.parse(purchases) : [];
}

export function getPurchasesByMaterial(rawMaterialId: string): Purchase[] {
  const purchases = getAllPurchases();
  return purchases.filter((p) => p.rawMaterialId === rawMaterialId);
}

export function getPurchaseHistory(days: number = 30): Purchase[] {
  const purchases = getAllPurchases();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return purchases.filter((p) => new Date(p.purchaseDate) >= cutoffDate);
}

// ===== FINISHED GOODS =====

export function createFinishedGood(
  name: string,
  category: string,
  recipe: RecipeItem[],
  sellingPrice: number
): FinishedGood {
  // Calculate total cost from recipe
  let totalCost = 0;
  recipe.forEach((item) => {
    const material = getRawMaterialById(item.rawMaterialId);
    if (material) {
      totalCost += item.quantityRequired * material.averageCost;
    }
  });

  return {
    id: `finished_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    category,
    recipe,
    totalCost,
    sellingPrice,
    currentStock: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function addFinishedGood(good: FinishedGood): void {
  const goods = getAllFinishedGoods();
  goods.push(good);
  localStorage.setItem("finished_goods", JSON.stringify(goods));
  window.dispatchEvent(
    new CustomEvent("finishedGoodAdded", { detail: good })
  );
}

export function getAllFinishedGoods(): FinishedGood[] {
  const goods = localStorage.getItem("finished_goods");
  return goods ? JSON.parse(goods) : [];
}

export function getFinishedGoodById(id: string): FinishedGood | undefined {
  const goods = getAllFinishedGoods();
  return goods.find((g) => g.id === id);
}

export function updateFinishedGood(good: FinishedGood): void {
  const goods = getAllFinishedGoods();
  const index = goods.findIndex((g) => g.id === good.id);
  if (index !== -1) {
    goods[index] = { ...good, updatedAt: new Date().toISOString() };
    localStorage.setItem("finished_goods", JSON.stringify(goods));
    window.dispatchEvent(
      new CustomEvent("finishedGoodUpdated", { detail: good })
    );
  }
}

export function deleteFinishedGood(id: string): boolean {
  const goods = getAllFinishedGoods();
  const filtered = goods.filter((g) => g.id !== id);
  localStorage.setItem("finished_goods", JSON.stringify(filtered));
  return goods.length !== filtered.length;
}

// ===== CONSUMPTION PLANNING =====

export function produceFinishedGood(
  finishedGoodId: string,
  quantityProduced: number
): ConsumptionRecord | null {
  const finishedGood = getFinishedGoodById(finishedGoodId);
  if (!finishedGood) return null;

  // Validate raw materials availability
  for (const recipeItem of finishedGood.recipe) {
    const material = getRawMaterialById(recipeItem.rawMaterialId);
    const requiredQuantity = recipeItem.quantityRequired * quantityProduced;
    if (!material || material.currentStock < requiredQuantity) {
      return null; // Insufficient stock
    }
  }

  // Create consumption record
  const record: ConsumptionRecord = {
    id: `consume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    finishedGoodId,
    finishedGoodName: finishedGood.name,
    quantityProduced,
    dateProduced: new Date().toISOString(),
    rawMaterialsUsed: [],
    createdAt: new Date().toISOString(),
  };

  // Deduct raw materials from stock
  finishedGood.recipe.forEach((recipeItem) => {
    const material = getRawMaterialById(recipeItem.rawMaterialId);
    if (material) {
      const quantityUsed = recipeItem.quantityRequired * quantityProduced;
      const oldStock = material.currentStock;
      material.currentStock -= quantityUsed;

      record.rawMaterialsUsed.push({
        rawMaterialId: recipeItem.rawMaterialId,
        rawMaterialName: recipeItem.rawMaterialName,
        quantityUsed,
        unit: recipeItem.unit,
      });

      updateRawMaterial(material);
      recordStockAdjustment(
        material.id,
        material.name,
        oldStock,
        material.currentStock,
        "consumption",
        `Consumed in production of ${quantityProduced} ${finishedGood.name}`
      );
    }
  });

  // Update finished good stock
  const oldStock = finishedGood.currentStock;
  finishedGood.currentStock += quantityProduced;
  updateFinishedGood(finishedGood);
  recordStockAdjustment(
    finishedGoodId,
    finishedGood.name,
    oldStock,
    finishedGood.currentStock,
    "consumption",
    `Produced ${quantityProduced} units`
  );

  // Save consumption record
  const records = getAllConsumptionRecords();
  records.push(record);
  localStorage.setItem("consumption_records", JSON.stringify(records));

  window.dispatchEvent(
    new CustomEvent("finishedGoodProduced", { detail: record })
  );

  return record;
}

export function getAllConsumptionRecords(): ConsumptionRecord[] {
  const records = localStorage.getItem("consumption_records");
  return records ? JSON.parse(records) : [];
}

export function getConsumptionByDate(date: string): ConsumptionRecord[] {
  const records = getAllConsumptionRecords();
  return records.filter(
    (r) => new Date(r.dateProduced).toDateString() === new Date(date).toDateString()
  );
}

// ===== STOCK ADJUSTMENTS (TRACKING) =====

export function recordStockAdjustment(
  rawMaterialId: string,
  rawMaterialName: string,
  oldStock: number,
  newStock: number,
  reason: StockAdjustment["adjustmentReason"],
  notes?: string
): void {
  const adjustment: StockAdjustment = {
    id: `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    rawMaterialId,
    rawMaterialName,
    oldStock,
    newStock,
    adjustmentReason: reason,
    notes,
    createdAt: new Date().toISOString(),
  };

  const adjustments = getAllStockAdjustments();
  adjustments.push(adjustment);
  localStorage.setItem("stock_adjustments", JSON.stringify(adjustments));

  window.dispatchEvent(
    new CustomEvent("stockAdjusted", { detail: adjustment })
  );
}

export function getAllStockAdjustments(): StockAdjustment[] {
  const adjustments = localStorage.getItem("stock_adjustments");
  return adjustments ? JSON.parse(adjustments) : [];
}

export function getStockAdjustmentsByDate(date: string): StockAdjustment[] {
  const adjustments = getAllStockAdjustments();
  return adjustments.filter(
    (a) =>
      new Date(a.createdAt).toDateString() === new Date(date).toDateString()
  );
}

// ===== REPORTING & ANALYTICS =====

export function getDailyStockReport(date: string) {
  const targetDate = new Date(date).toDateString();
  const materials = getAllRawMaterials();
  const adjustments = getStockAdjustmentsByDate(date);

  const reportItems = materials.map((material) => {
    const materialAdjustments = adjustments.filter(
      (a) => a.rawMaterialId === material.id
    );
    const openingStock = material.currentStock - 
      materialAdjustments
        .filter((a) => a.adjustmentReason === "purchase")
        .reduce((sum, a) => sum + (a.newStock - a.oldStock), 0) +
      materialAdjustments
        .filter((a) => a.adjustmentReason === "consumption")
        .reduce((sum, a) => sum + (a.oldStock - a.newStock), 0);

    return {
      rawMaterialId: material.id,
      rawMaterialName: material.name,
      unit: material.unit,
      openingStock: Math.max(0, openingStock),
      purchases: materialAdjustments
        .filter((a) => a.adjustmentReason === "purchase")
        .reduce((sum, a) => sum + (a.newStock - a.oldStock), 0),
      consumption: materialAdjustments
        .filter((a) => a.adjustmentReason === "consumption")
        .reduce((sum, a) => sum + (a.oldStock - a.newStock), 0),
      closingStock: material.currentStock,
      cost: material.averageCost,
    };
  });

  return {
    date,
    items: reportItems,
    totalValue: reportItems.reduce((sum, item) => sum + (item.closingStock * item.cost), 0),
  };
}

export function getLowStockItems(): RawMaterial[] {
  const materials = getAllRawMaterials();
  return materials.filter((m) => m.currentStock <= m.minStock);
}

export function getInventoryValue(): number {
  const materials = getAllRawMaterials();
  return materials.reduce((sum, m) => sum + (m.currentStock * m.averageCost), 0);
}

export function getInventoryStats() {
  const materials = getAllRawMaterials();
  const lowStockItems = getLowStockItems();
  const expiredItems = materials.filter(
    (m) => m.expiryDate && new Date(m.expiryDate) < new Date()
  );

  return {
    totalItems: materials.length,
    lowStockCount: lowStockItems.length,
    expiredCount: expiredItems.length,
    totalValue: getInventoryValue(),
  };
}
