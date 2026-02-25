import { RequestHandler } from "express";

export interface Purchase {
    id: number;
    ingredientId: number;
    ingredientName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalCost: number;
    supplier: string;
    purchaseDate: string;
    expiryDate?: string;
    invoiceNo?: string;
    notes?: string;
    createdAt: string;
}

let purchases: Purchase[] = [];

export const getPurchases: RequestHandler = (_req, res) => {
    res.json(purchases);
};

export const recordPurchase: RequestHandler = (req, res) => {
    const {
        ingredientId,
        ingredientName,
        quantity,
        unit,
        unitPrice,
        totalCost,
        supplier,
        purchaseDate,
        expiryDate,
        invoiceNo,
        notes,
    } = req.body;

    if (!ingredientId || !quantity || !unitPrice || !supplier || !purchaseDate) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }

    const newPurchase: Purchase = {
        id: Math.max(...purchases.map((p) => p.id), 0) + 1,
        ingredientId,
        ingredientName,
        quantity: parseFloat(quantity),
        unit,
        unitPrice: parseFloat(unitPrice),
        totalCost: totalCost || parseFloat(quantity) * parseFloat(unitPrice),
        supplier,
        purchaseDate,
        expiryDate,
        invoiceNo,
        notes,
        createdAt: new Date().toISOString(),
    };

    purchases.push(newPurchase);
    res.status(201).json(newPurchase);
};

export const getPurchasesByIngredient: RequestHandler = (req, res) => {
    const { ingredientId } = req.params;
    const filtered = purchases.filter((p) => p.ingredientId === parseInt(ingredientId as string));
    res.json(filtered);
};

export const getPurchaseStats: RequestHandler = (_req, res) => {
    const totalPurchases = purchases.length;
    const totalCost = purchases.reduce((sum, p) => sum + p.totalCost, 0);
    const today = new Date().toISOString().split("T")[0];
    const todayPurchases = purchases.filter((p) => p.purchaseDate === today).length;
    const uniqueSuppliers = new Set(purchases.map((p) => p.supplier)).size;

    res.json({
        totalPurchases,
        totalCost,
        todayPurchases,
        uniqueSuppliers,
    });
};
