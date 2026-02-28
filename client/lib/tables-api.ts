import { api } from "./api-client";

export interface Table {
    id: number;
    number: string;
    capacity: number;
    status: "available" | "occupied" | "reserved" | "cleaning";
    customerName?: string;
    customerPhone?: string;
    partySize?: number;
    checkedInTime?: string;
    notes?: string;
    qrCode?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const getTables = async (): Promise<Table[]> => {
    return api.get("/tables");
};

export const getTableById = async (id: number): Promise<Table> => {
    return api.get(`/tables/${id}`);
};

export const createTable = async (tableData: Partial<Table>): Promise<Table> => {
    return api.post("/tables", tableData);
};

export const updateTable = async (id: number, tableData: Partial<Table>): Promise<Table> => {
    return api.put(`/tables/${id}`, tableData);
};

export const deleteTable = async (id: number): Promise<void> => {
    return api.delete(`/tables/${id}`);
};

export const updateTableStatus = async (id: number, status: string): Promise<Table> => {
    return api.put(`/tables/${id}/status`, { status });
};
