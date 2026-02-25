import { Ingredient } from "./inventory-api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const API_FINISHED_GOODS = `${API_URL}/finished-goods`;

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
    const response = await fetch(API_FINISHED_GOODS);
    if (!response.ok) throw new Error("Failed to fetch finished goods");
    return response.json();
};

export const createFinishedGood = async (good: Partial<FinishedGood>): Promise<FinishedGood> => {
    const response = await fetch(API_FINISHED_GOODS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(good),
    });
    if (!response.ok) throw new Error("Failed to create finished good");
    return response.json();
};

export const produceFinishedGood = async (id: string, quantity: number): Promise<ProductionRecord> => {
    const response = await fetch(`${API_FINISHED_GOODS}/${id}/produce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
    });
    if (!response.ok) throw new Error("Failed to produce finished good");
    return response.json();
};

export const getProductionRecords = async (): Promise<ProductionRecord[]> => {
    const response = await fetch(`${API_FINISHED_GOODS}/production-history`);
    if (!response.ok) throw new Error("Failed to fetch production history");
    return response.json();
};

export const deleteFinishedGood = async (id: string): Promise<void> => {
    const response = await fetch(`${API_FINISHED_GOODS}/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete finished good");
};
