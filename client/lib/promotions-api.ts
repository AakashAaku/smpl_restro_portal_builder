import { api } from './api-client';

export interface Promotion {
    id: number;
    name: string;
    type: "percentage" | "fixed" | "bogo";
    value: number;
    applicableOn: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    usageCount: number;
}

export interface Coupon {
    id: number;
    code: string;
    discount: number;
    discountType: "percentage" | "fixed";
    minimumOrderValue: number;
    maxUses: number;
    currentUses: number;
    expiryDate: string;
    isActive: boolean;
}

export const getPromotions = async (): Promise<Promotion[]> => {
    return api.get("/promotions");
};

export const createPromotion = async (promotion: Partial<Promotion>): Promise<Promotion> => {
    return api.post("/promotions", promotion);
};

export const updatePromotion = async (id: number, promotion: Partial<Promotion>): Promise<Promotion> => {
    return api.put(`/promotions/${id}`, promotion);
};

export const deletePromotion = async (id: number): Promise<{ success: boolean }> => {
    return api.delete(`/promotions/${id}`);
};

export const getCoupons = async (): Promise<Coupon[]> => {
    return api.get("/promotions/coupons");
};

export const createCoupon = async (coupon: Partial<Coupon>): Promise<Coupon> => {
    return api.post("/promotions/coupons", coupon);
};

export const updateCoupon = async (id: number, coupon: Partial<Coupon>): Promise<Coupon> => {
    return api.put(`/promotions/coupons/${id}`, coupon);
};

export const deleteCoupon = async (id: number): Promise<{ success: boolean }> => {
    return api.delete(`/promotions/coupons/${id}`);
};
