import { api } from './api-client';

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
    return api.get("/purchases");
};

export const recordPurchase = async (purchase: Partial<Purchase>): Promise<Purchase> => {
    return api.post("/purchases", purchase);
};

export const getPurchasesByIngredient = async (ingredientId: number): Promise<Purchase[]> => {
    return api.get(`/purchases/ingredient/${ingredientId}`);
};

export const getPurchaseStats = async () => {
    return api.get("/purchases/stats");
};
