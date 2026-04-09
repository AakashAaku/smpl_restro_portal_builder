import { api } from './api-client';

export interface Setting {
    id: number;
    restaurantName: string;
    address?: string;
    phone?: string;
    email?: string;
    taxPercentage: number;
    currency: string;
    currencySymbol: string;
    footerNote?: string;
}

export const getSettings = async (): Promise<Setting> => {
    return api.get("/settings");
};

export const updateSettings = async (settings: Partial<Setting>): Promise<Setting> => {
    return api.put("/settings", settings);
};
