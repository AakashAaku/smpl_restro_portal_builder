import { api } from './api-client';
import { Ingredient } from './inventory-api';

export interface RequisitionItem {
    id: number;
    requisitionId: number;
    ingredientId: number;
    ingredient: Ingredient;
    quantity: number;
}

export interface Requisition {
    id: number;
    requisitionNo: string;
    staffId: number;
    status: 'pending' | 'approved' | 'rejected' | 'ordered';
    items: RequisitionItem[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export const getRequisitions = async (): Promise<Requisition[]> => {
    return api.get("/requisitions");
};

export const createRequisition = async (data: { staffId: number; items: { ingredientId: number; quantity: number }[]; notes?: string }): Promise<Requisition> => {
    return api.post("/requisitions", data);
};

export const updateRequisitionStatus = async (id: number, status: string): Promise<Requisition> => {
    return api.put(`/requisitions/${id}/status`, { status });
};
