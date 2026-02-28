import { api } from './api-client';

export interface MenuItem {
    id: number;
    name: string;
    category: string;
    price: number;
    prepTime: number;
    description: string;
    status: "available" | "unavailable";
}

export interface Recipe {
    id: number;
    menuItemId: number;
    ingredientId: number;
    quantity: number;
    ingredient?: {
        name: string;
        unit: string;
    }
}

export const getMenuItems = async (): Promise<MenuItem[]> => {
    return api.get("/menu");
};

export const getMenuCategories = async (): Promise<string[]> => {
    return api.get("/menu/categories");
};

export const createMenuItem = async (item: Omit<MenuItem, "id">): Promise<MenuItem> => {
    return api.post("/menu", item);
};

export const updateMenuItem = async (id: number, item: Partial<MenuItem>): Promise<MenuItem> => {
    return api.put(`/menu/${id}`, item);
};

export const deleteMenuItem = async (id: number): Promise<void> => {
    return api.delete(`/menu/${id}`);
};

export const getMenuItemRecipe = async (menuItemId: number): Promise<Recipe[]> => {
    return api.get(`/menu/${menuItemId}/recipe`);
};

export const updateMenuItemRecipe = async (menuItemId: number, ingredients: { ingredientId: number, quantity: number }[]): Promise<void> => {
    return api.put(`/menu/${menuItemId}/recipe`, { ingredients });
};
