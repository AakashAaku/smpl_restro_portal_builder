import { api } from './api-client';

export interface FinancialSummary {
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: string;
    growth: string;
}

export interface SalesReport {
    date?: string;
    month?: string;
    revenue: number;
    expense: number;
    profit: number;
}

export interface PaymentBreakdown {
    name: string;
    value: number;
}

export const getFinancialSummary = async (): Promise<FinancialSummary> => {
    return api.get("/accounting/summary");
};

export const getDailySalesReport = async (): Promise<SalesReport[]> => {
    return api.get("/accounting/sales/daily");
};

export const getMonthlySalesReport = async (): Promise<SalesReport[]> => {
    return api.get("/accounting/sales/monthly");
};

export const getPaymentBreakdown = async (): Promise<PaymentBreakdown[]> => {
    return api.get("/accounting/payment-breakdown");
};

export const getTaxReport = async () => {
    return api.get("/accounting/tax-report");
};

export const getExpenses = async () => {
    return api.get("/accounting/expenses");
};

export const createExpense = async (expense: any) => {
    return api.post("/accounting/expenses", expense);
};

export interface ProfitabilityItem {
    id: number;
    name: string;
    category: string;
    price: number;
    foodCost: number;
    margin: number;
    marginPercentage: number;
}

export const getProfitabilityReport = async (): Promise<ProfitabilityItem[]> => {
    return api.get("/accounting/profitability");
};
