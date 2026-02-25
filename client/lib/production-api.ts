const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const API_PRODUCTION = `${API_URL}/production`;

export interface PrepItem {
    id: number;
    itemName: string;
    category: string;
    expectedOrders: number;
    prepQuantity: number;
    prepTime: number;
    assignedTo?: string;
    status: "pending" | "in-progress" | "completed";
}

export interface PrepList {
    id: number;
    date: string;
    shift: "morning" | "afternoon" | "evening";
    items: PrepItem[];
    status: "pending" | "in-progress" | "completed";
}

export const getPrepLists = async (date?: string): Promise<PrepList[]> => {
    const url = date ? `${API_PRODUCTION}/prep-lists?date=${date}` : `${API_PRODUCTION}/prep-lists`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch prep lists");
    return response.json();
};

export const createPrepList = async (prepList: Partial<PrepList>): Promise<PrepList> => {
    const response = await fetch(`${API_PRODUCTION}/prep-lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prepList),
    });
    if (!response.ok) throw new Error("Failed to create prep list");
    return response.json();
};

export const updatePrepItemStatus = async (prepListId: number, itemId: number, status: string): Promise<void> => {
    const response = await fetch(`${API_PRODUCTION}/prep-lists/${prepListId}/items/${itemId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Failed to update prep item status");
};

export const getForecast = async () => {
    const response = await fetch(`${API_PRODUCTION}/forecast`);
    if (!response.ok) throw new Error("Failed to fetch production forecast");
    return response.json();
};
