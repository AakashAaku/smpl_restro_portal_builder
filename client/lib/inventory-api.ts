import { api } from './api-client';

export interface Ingredient {
    id: number;
    name: string;
    unit: string;
    currentStock: number;
    minStock: number;
    unitPrice: number;
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
    type: "IN" | "OUT";
    quantity: number;
    reference: string;
    timestamp: string;
    notes?: string;
}

export const getIngredients = async (): Promise<Ingredient[]> => {
    return api.get("/inventory/ingredients");
};

export const createIngredient = async (ingredient: Omit<Ingredient, "id">): Promise<Ingredient> => {
    return api.post("/inventory/ingredients", ingredient);
};

export const updateIngredient = async (id: number, ingredient: Partial<Ingredient>): Promise<Ingredient> => {
    return api.put(`/inventory/ingredients/${id}`, ingredient);
};

export const deleteIngredient = async (id: number): Promise<void> => {
    return api.delete(`/inventory/ingredients/${id}`);
};

export const getSuppliers = async (): Promise<Supplier[]> => {
    return api.get("/inventory/suppliers");
};

export const createSupplier = async (supplier: Omit<Supplier, "id">): Promise<Supplier> => {
    return api.post("/inventory/suppliers", supplier);
};

export const recordStockMovement = async (movement: Omit<StockMovement, "id" | "timestamp">): Promise<StockMovement> => {
    return api.post("/inventory/stock-movement", movement);
};

export const getInventoryStats = async () => {
    return api.get("/inventory/value");
};

export const getStockMovements = async (): Promise<StockMovement[]> => {
    return api.get("/inventory/stock-movements");
};
