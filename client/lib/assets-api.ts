import { api } from './api-client';

export interface Asset {
    id: number;
    name: string;
    category: string;
    value: number;
    status: string;
    purchaseDate: string;
    createdAt: string;
    updatedAt: string;
}

export const getAssets = async (): Promise<Asset[]> => {
    return api.get("/assets");
};

export const createAsset = async (asset: Partial<Asset>): Promise<Asset> => {
    return api.post("/assets", asset);
};

export const updateAsset = async (id: number, asset: Partial<Asset>): Promise<Asset> => {
    return api.put(`/assets/${id}`, asset);
};

export const deleteAsset = async (id: number): Promise<void> => {
    return api.delete(`/assets/${id}`);
};
