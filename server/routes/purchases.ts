import { RequestHandler } from "express";
import prisma from "../lib/prisma";

export const getPurchases: RequestHandler = async (_req, res) => {
    try {
        const purchases = await prisma.purchase.findMany({
            include: {
                supplier: true,
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
                ingredientName: firstItem?.ingredient?.name || "Unknown",
                quantity: firstItem?.quantity || 0,
                unit: firstItem?.ingredient?.unit || "",
                unitPrice: firstItem?.unitPrice || 0,
                totalCost: p.totalAmount,
                supplier: p.supplier?.name || "Unknown",
                purchaseDate: (p.date || new Date()).toISOString(),
                expiryDate: p.expiryDate ? new Date(p.expiryDate).toISOString() : undefined,
                invoiceNo: p.invoiceNo,
                notes: p.notes,
                createdAt: (p.createdAt || new Date()).toISOString()
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
        const { supplierId, supplierName, supplier, items, ingredientId, quantity, unitPrice, ingredientName, invoiceNo, notes, expiryDate } = req.body;

        // Handle supplier name alias
        const finalSupplierName = supplierName || supplier;

        // Normalize items: handle single item or array
        let purchaseItems = items;
        if (!items && ingredientId) {
            purchaseItems = [{
                ingredientId: parseInt(ingredientId),
                quantity: parseFloat(quantity),
                unitPrice: parseFloat(unitPrice),
                ingredientName
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
            // Record the purchase
            console.log("Creating purchase record...");
            const newPurchase = await (tx.purchase as any).create({
                data: {
                    supplierId: finalSupplierId!,
                    totalAmount,
                    invoiceNo: invoiceNo || undefined,
                    notes: notes || undefined,
                    expiryDate: expiryDate ? new Date(expiryDate) : undefined,
                    purchaseItems: {
                        create: purchaseItems.map((item: any) => ({
                            ingredientId: parseInt(item.ingredientId),
                            quantity: parseFloat(item.quantity),
                            unitPrice: parseFloat(item.unitPrice),
                        })),
                    },
                },
            });

            // Update ingredient stocks
            for (const item of purchaseItems) {
                console.log(`Updating stock for ingredient ID: ${item.ingredientId}`);
                await tx.ingredient.update({
                    where: { id: parseInt(item.ingredientId) },
                    data: {
                        currentStock: { increment: parseFloat(item.quantity) },
                    },
                });

                // Record stock movement
                await tx.stockMovement.create({
                    data: {
                        ingredientId: parseInt(item.ingredientId),
                        quantity: parseFloat(item.quantity),
                        type: "IN",
                        reason: `Purchase #${newPurchase.id}`,
                    },
                });
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
            where: { ingredientId: parseInt(ingredientId) },
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
        const purchaseId = parseInt(id);

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
        const purchaseId = parseInt(id);

        const purchase = await prisma.purchase.findUnique({
            where: { id: purchaseId },
            include: { purchaseItems: true },
        });

        if (!purchase) {
            res.status(404).json({ error: "Purchase not found" });
            return;
        }

        await prisma.$transaction(async (tx) => {
            // Reverse stock increments
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

            // Delete purchase items first (if no cascade)
            await tx.purchaseItem.deleteMany({
                where: { purchaseId },
            });

            // Delete the purchase
            await tx.purchase.delete({
                where: { id: purchaseId },
            });
        });

        res.json({ message: "Purchase deleted successfully and stock reversed" });
    } catch (error) {
        console.error("Delete purchase error:", error);
        res.status(500).json({ error: "Failed to delete purchase" });
    }
};
