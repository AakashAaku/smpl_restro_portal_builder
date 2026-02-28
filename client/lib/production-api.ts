import { api } from './api-client';

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
    return api.get(date ? `/production/prep-lists?date=${date}` : "/production/prep-lists");
};

export const createPrepList = async (prepList: Partial<PrepList>): Promise<PrepList> => {
    return api.post("/production/prep-lists", prepList);
};

export const updatePrepItemStatus = async (prepListId: number, itemId: number, status: string): Promise<void> => {
    return api.patch(`/production/prep-lists/${prepListId}/items/${itemId}/status`, { status });
};

export const getForecast = async () => {
    return api.get("/production/forecast");
};
