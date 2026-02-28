import { api } from './api-client';

export interface RecipeItem {
    ingredientId: number;
    ingredientName: string;
    quantityRequired: number;
    unit: string;
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

export interface ProductionRecord {
    id: string;
    finishedGoodId: string;
    finishedGoodName: string;
    quantityProduced: number;
    dateProduced: string;
    rawMaterialsUsed: {
        ingredientId: number;
        ingredientName: string;
        quantityUsed: number;
        unit: string;
    }[];
    createdAt: string;
}

export const getFinishedGoods = async (): Promise<FinishedGood[]> => {
    return api.get("/finished-goods");
};

export const createFinishedGood = async (good: Partial<FinishedGood>): Promise<FinishedGood> => {
    return api.post("/finished-goods", good);
};

export const produceFinishedGood = async (id: string, quantity: number): Promise<ProductionRecord> => {
    return api.post(`/finished-goods/${id}/produce`, { quantity });
};

export const getProductionRecords = async (): Promise<ProductionRecord[]> => {
    return api.get("/finished-goods/production-history");
};

export const deleteFinishedGood = async (id: string): Promise<void> => {
    return api.delete(`/finished-goods/${id}`);
};
