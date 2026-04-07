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

export interface Customer {
    id: string; // Match schema cuid
    name: string;
    phone: string;
    email?: string;
    address?: string;
    loyaltyPoints: number;
    totalOrders?: number;
    totalSpent: number;
    loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
    status: "active" | "inactive" | "vip";
}

export const getCustomers = async (): Promise<Customer[]> => {
    return api.get("/customers");
};

export const createCustomer = async (customer: Partial<Customer>): Promise<Customer> => {
    return api.post("/customers", customer);
};

export const updateCustomer = async (id: string, customer: Partial<Customer>): Promise<Customer> => {
    return api.put(`/customers/${id}`, customer);
};

export const getCustomerStats = async () => {
    return api.get("/customers/stats");
};

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
    ingredientName?: string;
    type: "IN" | "OUT";
    quantity: number;
    reason?: string;
    date: string;
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

export const updateSupplier = async (id: number, supplier: Partial<Supplier>): Promise<Supplier> => {
    return api.put(`/inventory/suppliers/${id}`, supplier);
};

export const deleteSupplier = async (id: number): Promise<void> => {
    return api.delete(`/inventory/suppliers/${id}`);
};

export const recordStockMovement = async (movement: Omit<StockMovement, "id" | "date" | "ingredientName">): Promise<StockMovement> => {
    return api.post("/inventory/stock-movement", movement);
};

export const getInventoryStats = async () => {
    return api.get("/inventory/value");
};

export const getStockMovements = async (ingredientId?: number): Promise<StockMovement[]> => {
    const url = ingredientId ? `/inventory/stock-movements?ingredientId=${ingredientId}` : "/inventory/stock-movements";
    return api.get(url);
};
