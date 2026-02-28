import { api } from './api-client';

export interface StaffMember {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: "admin" | "manager" | "chef" | "waiter" | "delivery";
    status: "active" | "inactive" | "on-leave";
    joinDate: string;
    salary?: number;
    performance?: number;
}

export interface StaffStats {
    totalStaff: number;
    activeStaff: number;
    monthlyPayroll: number;
    avgPerformance: number;
    onLeaveCount: number;
    roleCounts: Record<string, number>;
}

export const getStaff = async (): Promise<StaffMember[]> => {
    return api.get("/staff");
};

export const createStaff = async (staff: Partial<StaffMember>): Promise<StaffMember> => {
    return api.post("/staff", staff);
};

export const updateStaff = async (id: number, staff: Partial<StaffMember>): Promise<StaffMember> => {
    return api.put(`/staff/${id}`, staff);
};

export const getStaffStats = async (): Promise<StaffStats> => {
    return api.get("/staff/stats");
};
