import { RequestHandler } from "express";
import prisma from "../lib/prisma";

export const getPurchases: RequestHandler = async (_req, res) => {
    try {
        const purchases = await prisma.purchase.findMany({
            include: {
                supplier: true,
                requisition: true,
                purchaseItems: {
                    include: { ingredient: true },
                },
            },
            orderBy: { date: "desc" } as any,
        });

        const flatPurchases = (purchases as any[]).map(p => {
            const firstItem = p.purchaseItems?.[0];
            return {
                id: p.id.toString(),
                ingredientId: firstItem?.ingredientId,
                ingredientName: p.purchaseItems.length > 1 
                    ? `${firstItem?.ingredient?.name} (+${p.purchaseItems.length - 1} more)` 
                    : firstItem?.ingredient?.name || "Unknown",
                quantity: firstItem?.quantity || 0,
                unit: firstItem?.ingredient?.unit || "",
                unitPrice: firstItem?.unitPrice || 0,
                totalCost: p.totalAmount,
                supplier: p.supplier?.name || "Unknown",
                purchaseDate: (p.date || new Date()).toISOString(),
                expiryDate: p.expiryDate ? new Date(p.expiryDate).toISOString() : undefined,
                invoiceNo: p.invoiceNo,
                notes: p.notes,
                requisitionId: p.requisitionId,
                requisitionNo: p.requisition?.requisitionNo,
                createdAt: (p.createdAt || new Date()).toISOString(),
                items: p.purchaseItems?.map((pi: any) => ({
                    ingredientId: pi.ingredientId,
                    ingredientName: pi.ingredient?.name || "Unknown",
                    quantity: pi.quantity,
                    unit: pi.ingredient?.unit || "",
                    unitPrice: pi.unitPrice,
                    totalCost: pi.quantity * pi.unitPrice
                })) || []
            };
        });

        res.json(flatPurchases);
    } catch (error) {
        console.error("Fetch purchases error:", error);
        res.status(500).json({ error: "Failed to fetch purchases" });
    }
};

export const recordPurchase: RequestHandler = async (req, res) => {
    try {
        const { supplierId, supplierName, supplier, items, ingredientId, quantity, unitPrice, ingredientName, invoiceNo, notes, expiryDate, requisitionId, unit } = req.body;

        // Handle supplier name alias
        const finalSupplierName = supplierName || supplier;

        // Normalize items: handle single item or array
        let purchaseItems = items;
        if (!items && (ingredientId || ingredientName)) {
            purchaseItems = [{
                ingredientId: ingredientId ? parseInt(ingredientId) : undefined,
                quantity: parseFloat(quantity),
                unitPrice: parseFloat(unitPrice),
                ingredientName,
                unit: unit || "unit"
            }];
        }

        if (!purchaseItems || purchaseItems.length === 0) {
            res.status(400).json({ error: "Missing required fields: items" });
            return;
        }

        // Handle Supplier: find by ID or name, or create
        let finalSupplierId = supplierId ? parseInt(supplierId) : null;

        if (!finalSupplierId && finalSupplierName) {
            const supplier = await (prisma.supplier as any).upsert({
                where: { name: finalSupplierName },
                update: {}, // Don't update anything if exists
                create: {
                    name: finalSupplierName,
                    contact: "Auto-created",
                    address: "Auto-created",
                    email: `${finalSupplierName.replace(/\s+/g, '').toLowerCase()}@auto.com`
                }
            });
            finalSupplierId = supplier.id;
        }

        if (!finalSupplierId) {
            res.status(400).json({ error: "Missing required fields: supplierId or supplierName" });
            return;
        }

        const totalAmount = purchaseItems.reduce(
            (sum: number, item: any) => sum + item.quantity * item.unitPrice,
            0
        );

        console.log(`Processing purchase for supplier: ${finalSupplierName} (ID: ${finalSupplierId})`);

        const purchase = await prisma.$transaction(async (tx) => {
            // Process purchase items and resolve/create ingredients
            const finalItems = [];
            for (const item of purchaseItems) {
                let currentIngId = item.ingredientId;
                
                // Flexible Raw Materials: create if doesn't exist
                if (!currentIngId && item.ingredientName) {
                    const ingredient = await tx.ingredient.upsert({
                        where: { name: item.ingredientName },
                        update: { unitPrice: parseFloat(item.unitPrice) }, // Update price to latest purchase
                        create: {
                            name: item.ingredientName,
                            unit: item.unit || "unit",
                            unitPrice: parseFloat(item.unitPrice),
                            currentStock: 0,
                            minStock: 0
                        }
                    });
                    currentIngId = ingredient.id;
                }

                if (!currentIngId) {
                    throw new Error(`Ingredient could not be resolved for ${item.ingredientName || 'unknown item'}`);
                }

                finalItems.push({
                    ingredientId: currentIngId,
                    quantity: parseFloat(item.quantity),
                    unitPrice: parseFloat(item.unitPrice)
                });
            }

            // Record the purchase
            console.log("Creating purchase record...");
            const newPurchase = await (tx.purchase as any).create({
                data: {
                    supplierId: finalSupplierId!,
                    totalAmount,
                    invoiceNo: invoiceNo || undefined,
                    notes: notes || undefined,
                    expiryDate: expiryDate ? new Date(expiryDate) : undefined,
                    requisitionId: requisitionId ? parseInt(requisitionId) : undefined,
                    purchaseItems: {
                        create: finalItems
                    },
                },
            });

            // Update ingredient stocks and record movements
            for (const item of finalItems) {
                console.log(`Updating stock for ingredient ID: ${item.ingredientId}`);
                await tx.ingredient.update({
                    where: { id: item.ingredientId },
                    data: {
                        currentStock: { increment: item.quantity },
                    },
                });

                // Record stock movement
                await tx.stockMovement.create({
                    data: {
                        ingredientId: item.ingredientId,
                        quantity: item.quantity,
                        type: "IN",
                        reason: `Purchase #${newPurchase.id}${requisitionId ? ` (from REQ #${requisitionId})` : ''}`,
                    },
                });
            }

            // Update requisition status if applicable
            if (requisitionId) {
                await tx.requisition.update({
                    where: { id: parseInt(requisitionId) },
                    data: { status: "ordered" }
                });
            }

            // Accounting Hook: Record Purchase Entry
            try {
                const { recordPurchaseStock } = await import("../lib/accounting-service");
                await recordPurchaseStock(newPurchase.id);
            } catch (error) {
                console.error(`Failed to record accounting entry for purchase ${newPurchase.id}:`, error);
            }

            return newPurchase;
        });

        res.status(201).json({
            id: purchase.id.toString(),
            totalCost: purchase.totalAmount,
            purchaseDate: purchase.date.toISOString(),
            supplier: finalSupplierName,
            // Add other fields as defaults if missing in immediate return
            ingredientName: purchaseItems[0]?.ingredientName || "Processed",
            quantity: purchaseItems[0]?.quantity || 0,
            unitPrice: purchaseItems[0]?.unitPrice || 0,
        });
    } catch (error) {
        console.error("CRITICAL Purchase error:", error);
        res.status(500).json({ error: "Failed to record purchase", details: (error as any).message });
    }
};

export const getPurchasesByIngredient: RequestHandler = async (req, res) => {
    try {
        const { ingredientId } = req.params;
        const purchases = await prisma.purchaseItem.findMany({
            where: { ingredientId: parseInt(ingredientId as string) },
            include: { purchase: true },
        });
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch purchases by ingredient" });
    }
};

export const getPurchaseStats: RequestHandler = async (_req, res) => {
    try {
        const totalPurchases = await prisma.purchase.count();
        const totalCost = await prisma.purchase.aggregate({
            _sum: { totalAmount: true },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayPurchases = await prisma.purchase.count({
            where: { date: { gte: today } },
        });

        const uniqueSuppliers = await prisma.supplier.count();

        res.json({
            totalPurchases,
            totalCost: totalCost._sum.totalAmount || 0,
            todayPurchases,
            uniqueSuppliers,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch purchase stats" });
    }
};
export const updatePurchase: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { invoiceNo, notes, expiryDate, status, quantity, unitPrice, ingredientId } = req.body;
        const purchaseId = parseInt(id as string);

        const existingPurchase = await prisma.purchase.findUnique({
            where: { id: purchaseId },
            include: { purchaseItems: true },
        });

        if (!existingPurchase) {
            res.status(404).json({ error: "Purchase not found" });
            return;
        }

        const updated = await prisma.$transaction(async (tx) => {
            // If quantity or ingredient changed, we need to adjust stock
            // For simplicity, we assume single-item purchases for now as used by the frontend
            const firstItem = (existingPurchase as any).purchaseItems?.[0];

            if (firstItem && (quantity !== undefined || ingredientId !== undefined)) {
                const newQty = quantity !== undefined ? parseFloat(quantity) : firstItem.quantity;
                const newIngId = ingredientId !== undefined ? parseInt(ingredientId) : firstItem.ingredientId;

                // 1. Reverse old stock
                await tx.ingredient.update({
                    where: { id: firstItem.ingredientId },
                    data: { currentStock: { decrement: firstItem.quantity } },
                });

                // 2. Add new stock
                await tx.ingredient.update({
                    where: { id: newIngId },
                    data: { currentStock: { increment: newQty } },
                });

                // 3. Update the PurchaseItem
                await tx.purchaseItem.update({
                    where: { id: firstItem.id },
                    data: {
                        quantity: newQty,
                        unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : firstItem.unitPrice,
                        ingredientId: newIngId,
                    },
                });

                // 4. Update totalAmount on Purchase
                await (tx.purchase as any).update({
                    where: { id: purchaseId },
                    data: { totalAmount: newQty * (unitPrice !== undefined ? parseFloat(unitPrice) : firstItem.unitPrice) }
                });
            }

            // Update general fields
            return await (tx.purchase as any).update({
                where: { id: purchaseId },
                data: {
                    invoiceNo,
                    notes,
                    expiryDate: expiryDate ? new Date(expiryDate) : undefined,
                    status,
                },
                include: { purchaseItems: { include: { ingredient: true } }, supplier: true }
            });
        });

        res.json(updated);
    } catch (error) {
        console.error("Update purchase error:", error);
        res.status(500).json({ error: "Failed to update purchase" });
    }
};

export const deletePurchase: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const purchaseId = parseInt(id as string);

        const purchase = await prisma.purchase.findUnique({
            where: { id: purchaseId },
            include: { purchaseItems: true },
        });

        if (!purchase) {
            res.status(404).json({ error: "Purchase not found" });
            return;
        }

        // Deletion Guard: Prevent deleting completed purchases
        if (purchase.status === "completed") {
            res.status(403).json({ 
                error: "Illegal action", 
                details: "Completed purchases cannot be deleted. Please use 'Purchase Return' to reverse stock if needed." 
            });
            return;
        }

        await prisma.$transaction(async (tx) => {
            // Reverse stock increments (only if it was somehow not completed, 
            // though our guard above handles completed cases)
            for (const item of purchase.purchaseItems) {
                await tx.ingredient.update({
                    where: { id: item.ingredientId },
                    data: {
                        currentStock: { decrement: item.quantity },
                    },
                });

                // Record reversal movement
                await tx.stockMovement.create({
                    data: {
                        ingredientId: item.ingredientId,
                        quantity: item.quantity,
                        type: "OUT",
                        reason: `Purchase Deletion #${purchaseId}`,
                    },
                });
            }

            // Delete items and purchase
            await tx.purchaseItem.deleteMany({ where: { purchaseId } });
            await tx.purchase.delete({ where: { id: purchaseId } });
        });

        res.json({ message: "Purchase deleted successfully" });
    } catch (error) {
        console.error("Delete purchase error:", error);
        res.status(500).json({ error: "Failed to delete purchase" });
    }
};

export const returnPurchase: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const purchaseId = parseInt(id as string);

        const purchase = await prisma.purchase.findUnique({
            where: { id: purchaseId },
            include: { purchaseItems: true, supplier: true },
        });

        if (!purchase) {
            res.status(404).json({ error: "Purchase not found" });
            return;
        }

        if (purchase.status === "returned") {
            res.status(400).json({ error: "Purchase already returned" });
            return;
        }

        const returned = await prisma.$transaction(async (tx) => {
            // 1. Mark purchase as returned
            const updated = await (tx.purchase as any).update({
                where: { id: purchaseId },
                data: { status: "returned" }
            });

            // 2. Reverse stock for each item
            for (const item of purchase.purchaseItems) {
                await tx.ingredient.update({
                    where: { id: item.ingredientId },
                    data: { currentStock: { decrement: item.quantity } }
                });

                // 3. Record RETURN movement
                await tx.stockMovement.create({
                    data: {
                        ingredientId: item.ingredientId,
                        quantity: item.quantity,
                        type: "OUT",
                        reason: `Purchase Return #${purchaseId} from ${purchase.supplier.name}`,
                    }
                });
            }

            // Accounting Hook: For simplicity, we create a reversal entry here or just note it
            // In a full system, we'd record a 'Purchase Return' journal entry.
            // For now, we'll just log it. 
            // TODO: Implement recordPurchaseReturn in accounting-service

            return updated;
        });

        res.json({ message: "Purchase returned successfully", purchase: returned });
    } catch (error) {
        console.error("Return purchase error:", error);
        res.status(500).json({ error: "Failed to return purchase", details: (error as any).message });
    }
};
