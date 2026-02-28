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
            orderBy: { date: "desc" },
        });
        res.json(purchases);
    } catch (error) {
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
            const existingSupplier = await prisma.supplier.findFirst({
                where: { name: { equals: finalSupplierName, mode: 'insensitive' } }
            });

            if (existingSupplier) {
                finalSupplierId = existingSupplier.id;
            } else {
                const newSupplier = await prisma.supplier.create({
                    data: {
                        name: finalSupplierName,
                        contact: "Auto-created",
                        address: "Auto-created",
                        email: `${finalSupplierName.replace(/\s+/g, '').toLowerCase()}@auto.com`
                    }
                });
                finalSupplierId = newSupplier.id;
            }
        }

        if (!finalSupplierId) {
            res.status(400).json({ error: "Missing required fields: supplierId or supplierName" });
            return;
        }

        const totalAmount = purchaseItems.reduce(
            (sum: number, item: any) => sum + item.quantity * item.unitPrice,
            0
        );

        const purchase = await prisma.$transaction(async (tx) => {
            // Record the purchase
            const newPurchase = await tx.purchase.create({
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

        res.status(201).json(purchase);
    } catch (error) {
        console.error("Purchase error:", error);
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
