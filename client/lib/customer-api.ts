export interface Customer {
    id: number;
    name: string;
    phone: string;
    email?: string;
    totalOrders: number;
    totalSpent: number;
    loyaltyPoints: number;
    loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
    status: "active" | "inactive" | "vip";
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const API_CUSTOMERS = `${API_URL}/customers`;

export const getCustomers = async (): Promise<Customer[]> => {
    const response = await fetch(API_CUSTOMERS);
    if (!response.ok) throw new Error("Failed to fetch customers");
    return response.json();
};

export const createCustomer = async (customer: Partial<Customer>): Promise<Customer> => {
    const response = await fetch(API_CUSTOMERS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
    });
    if (!response.ok) throw new Error("Failed to create customer");
    return response.json();
};

export const updateCustomer = async (id: number, customer: Partial<Customer>): Promise<Customer> => {
    const response = await fetch(`${API_CUSTOMERS}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
    });
    if (!response.ok) throw new Error("Failed to update customer");
    return response.json();
};

export const getCustomerStats = async () => {
    const response = await fetch(`${API_CUSTOMERS}/stats`);
    if (!response.ok) throw new Error("Failed to fetch customer stats");
    return response.json();
};
