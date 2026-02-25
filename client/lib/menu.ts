export interface MenuItem {
    id: number;
    name: string;
    category: string;
    price: number;
    prepTime: number;
    description: string;
    status: "available" | "unavailable";
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const API_BASE = `${API_URL}/menu`;

export const getMenuItems = async (): Promise<MenuItem[]> => {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error("Failed to fetch menu items");
    return response.json();
};

export const getMenuCategories = async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE}/categories`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
};

export const createMenuItem = async (item: Omit<MenuItem, "id">): Promise<MenuItem> => {
    const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error("Failed to create menu item");
    return response.json();
};

export const updateMenuItem = async (id: number, item: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error("Failed to update menu item");
    return response.json();
};

export const deleteMenuItem = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete menu item");
};
