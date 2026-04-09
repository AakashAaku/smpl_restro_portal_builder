export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    totalOrders: number;
    totalSpent: number;
    loyaltyPoints: number;
    loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
    status: "active" | "inactive" | "vip";
}

import { api } from './api-client';

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
