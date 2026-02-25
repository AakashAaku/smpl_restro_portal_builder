import { Ingredient } from "./inventory-api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const API_PURCHASES = `${API_URL}/purchases`;

export interface Purchase {
    id: string;
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

export const getPurchases = async (): Promise<Purchase[]> => {
    const response = await fetch(API_PURCHASES);
    if (!response.ok) throw new Error("Failed to fetch purchases");
    return response.json();
};

export const recordPurchase = async (purchase: Partial<Purchase>): Promise<Purchase> => {
    const response = await fetch(API_PURCHASES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchase),
    });
    if (!response.ok) throw new Error("Failed to record purchase");
    return response.json();
};

export const getPurchasesByIngredient = async (ingredientId: number): Promise<Purchase[]> => {
    const response = await fetch(`${API_PURCHASES}/ingredient/${ingredientId}`);
    if (!response.ok) throw new Error("Failed to fetch purchases for ingredient");
    return response.json();
};

export const getPurchaseStats = async () => {
    const response = await fetch(`${API_PURCHASES}/stats`);
    if (!response.ok) throw new Error("Failed to fetch purchase stats");
    return response.json();
};
