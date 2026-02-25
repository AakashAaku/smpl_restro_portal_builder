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
    timestamp: string;
    notes?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const API_INVENTORY = `${API_URL}/inventory`;

export const getIngredients = async (): Promise<Ingredient[]> => {
    const response = await fetch(`${API_INVENTORY}/ingredients`);
    if (!response.ok) throw new Error("Failed to fetch ingredients");
    return response.json();
};

export const createIngredient = async (ingredient: Omit<Ingredient, "id">): Promise<Ingredient> => {
    const response = await fetch(`${API_INVENTORY}/ingredients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ingredient),
    });
    if (!response.ok) throw new Error("Failed to create ingredient");
    return response.json();
};

export const updateIngredient = async (id: number, ingredient: Partial<Ingredient>): Promise<Ingredient> => {
    const response = await fetch(`${API_INVENTORY}/ingredients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ingredient),
    });
    if (!response.ok) throw new Error("Failed to update ingredient");
    return response.json();
};

export const deleteIngredient = async (id: number): Promise<void> => {
    const response = await fetch(`${API_INVENTORY}/ingredients/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete ingredient");
};

export const getSuppliers = async (): Promise<Supplier[]> => {
    const response = await fetch(`${API_INVENTORY}/suppliers`);
    if (!response.ok) throw new Error("Failed to fetch suppliers");
    return response.json();
};

export const createSupplier = async (supplier: Omit<Supplier, "id">): Promise<Supplier> => {
    const response = await fetch(`${API_INVENTORY}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplier),
    });
    if (!response.ok) throw new Error("Failed to create supplier");
    return response.json();
};

export const recordStockMovement = async (movement: Omit<StockMovement, "id" | "timestamp">): Promise<StockMovement> => {
    const response = await fetch(`${API_INVENTORY}/stock-movement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movement),
    });
    if (!response.ok) throw new Error("Failed to record stock movement");
    return response.json();
};

export const getInventoryStats = async () => {
    const response = await fetch(`${API_INVENTORY}/value`);
    if (!response.ok) throw new Error("Failed to fetch inventory stats");
    return response.json();
};
