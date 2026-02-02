import { RequestHandler } from "express";

export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  costPerUnit: number;
  supplierId?: number;
  expiryDate?: string;
  lastRestocked?: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact: string;
  email: string;
  address: string;
  paymentTerms?: string;
}

export interface StockMovement {
  id: number;
  ingredientId: number;
  type: "in" | "out" | "adjustment" | "damage";
  quantity: number;
  reference: string;
  timestamp: Date;
  notes?: string;
}

let ingredients: Ingredient[] = [
  {
    id: 1,
    name: "Paneer",
    unit: "kg",
    currentStock: 5.5,
    reorderLevel: 3,
    costPerUnit: 280,
    supplierId: 1,
    lastRestocked: "2024-01-25",
  },
  {
    id: 2,
    name: "Chicken Breast",
    unit: "kg",
    currentStock: 8.2,
    reorderLevel: 5,
    costPerUnit: 180,
    supplierId: 1,
    lastRestocked: "2024-01-26",
  },
  {
    id: 3,
    name: "Butter",
    unit: "kg",
    currentStock: 2.1,
    reorderLevel: 2,
    costPerUnit: 420,
    supplierId: 2,
    lastRestocked: "2024-01-20",
  },
  {
    id: 4,
    name: "Tomato Sauce",
    unit: "liters",
    currentStock: 1.2,
    reorderLevel: 3,
    costPerUnit: 150,
    supplierId: 2,
    lastRestocked: "2024-01-22",
  },
];

let suppliers: Supplier[] = [
  {
    id: 1,
    name: "Fresh Foods Co",
    contact: "9876543210",
    email: "sales@freshfoods.com",
    address: "123 Market Street, Mumbai",
    paymentTerms: "Net 30",
  },
  {
    id: 2,
    name: "Dairy Essentials",
    contact: "9876543211",
    email: "orders@dairyess.com",
    address: "456 Dairy Road, Pune",
    paymentTerms: "Net 15",
  },
];

let stockMovements: StockMovement[] = [];

export const getIngredients: RequestHandler = (_req, res) => {
  res.json(ingredients);
};

export const getIngredientById: RequestHandler = (req, res) => {
  const { id } = req.params;
  const ingredient = ingredients.find((i) => i.id === parseInt(id));

  if (!ingredient) {
    res.status(404).json({ error: "Ingredient not found" });
    return;
  }

  res.json(ingredient);
};

export const createIngredient: RequestHandler = (req, res) => {
  const { name, unit, currentStock, reorderLevel, costPerUnit, supplierId } =
    req.body;

  if (!name || !unit || currentStock === undefined || !reorderLevel) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const newIngredient: Ingredient = {
    id: Math.max(...ingredients.map((i) => i.id), 0) + 1,
    name,
    unit,
    currentStock: parseFloat(currentStock),
    reorderLevel: parseFloat(reorderLevel),
    costPerUnit: parseFloat(costPerUnit),
    supplierId: supplierId || undefined,
    lastRestocked: new Date().toISOString().split("T")[0],
  };

  ingredients.push(newIngredient);
  res.status(201).json(newIngredient);
};

export const updateIngredient: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { name, unit, currentStock, reorderLevel, costPerUnit, supplierId } =
    req.body;

  const ingredient = ingredients.find((i) => i.id === parseInt(id));

  if (!ingredient) {
    res.status(404).json({ error: "Ingredient not found" });
    return;
  }

  ingredient.name = name || ingredient.name;
  ingredient.unit = unit || ingredient.unit;
  if (currentStock !== undefined) ingredient.currentStock = parseFloat(currentStock);
  if (reorderLevel !== undefined) ingredient.reorderLevel = parseFloat(reorderLevel);
  if (costPerUnit !== undefined) ingredient.costPerUnit = parseFloat(costPerUnit);
  if (supplierId !== undefined) ingredient.supplierId = supplierId;

  res.json(ingredient);
};

export const deleteIngredient: RequestHandler = (req, res) => {
  const { id } = req.params;
  const index = ingredients.findIndex((i) => i.id === parseInt(id));

  if (index === -1) {
    res.status(404).json({ error: "Ingredient not found" });
    return;
  }

  const deleted = ingredients.splice(index, 1);
  res.json(deleted[0]);
};

export const getLowStockIngredients: RequestHandler = (_req, res) => {
  const lowStock = ingredients.filter((i) => i.currentStock <= i.reorderLevel);
  res.json(lowStock);
};

export const getSuppliers: RequestHandler = (_req, res) => {
  res.json(suppliers);
};

export const createSupplier: RequestHandler = (req, res) => {
  const { name, contact, email, address, paymentTerms } = req.body;

  if (!name || !contact || !email) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const newSupplier: Supplier = {
    id: Math.max(...suppliers.map((s) => s.id), 0) + 1,
    name,
    contact,
    email,
    address: address || "",
    paymentTerms: paymentTerms || undefined,
  };

  suppliers.push(newSupplier);
  res.status(201).json(newSupplier);
};

export const recordStockMovement: RequestHandler = (req, res) => {
  const { ingredientId, type, quantity, reference, notes } = req.body;

  if (!ingredientId || !type || !quantity || !reference) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const ingredient = ingredients.find((i) => i.id === ingredientId);
  if (!ingredient) {
    res.status(404).json({ error: "Ingredient not found" });
    return;
  }

  // Update stock
  if (type === "in") {
    ingredient.currentStock += parseFloat(quantity);
    ingredient.lastRestocked = new Date().toISOString().split("T")[0];
  } else {
    ingredient.currentStock -= parseFloat(quantity);
  }

  const movement: StockMovement = {
    id: Math.max(...stockMovements.map((m) => m.id), 0) + 1,
    ingredientId,
    type,
    quantity: parseFloat(quantity),
    reference,
    timestamp: new Date(),
    notes: notes || undefined,
  };

  stockMovements.push(movement);
  res.status(201).json(movement);
};

export const getInventoryValue: RequestHandler = (_req, res) => {
  const totalValue = ingredients.reduce(
    (sum, i) => sum + i.currentStock * i.costPerUnit,
    0
  );

  const itemCount = ingredients.length;
  const lowStockCount = ingredients.filter(
    (i) => i.currentStock <= i.reorderLevel
  ).length;

  res.json({
    totalInventoryValue: Math.round(totalValue),
    itemCount,
    lowStockCount,
    ingredients: ingredients.map((i) => ({
      ...i,
      value: Math.round(i.currentStock * i.costPerUnit),
      isLowStock: i.currentStock <= i.reorderLevel,
    })),
  });
};
