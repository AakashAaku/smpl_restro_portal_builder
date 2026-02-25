const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const API_STAFF = `${API_URL}/staff`;

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
    const response = await fetch(API_STAFF);
    if (!response.ok) throw new Error("Failed to fetch staff");
    return response.json();
};

export const createStaff = async (staff: Partial<StaffMember>): Promise<StaffMember> => {
    const response = await fetch(API_STAFF, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staff),
    });
    if (!response.ok) throw new Error("Failed to create staff member");
    return response.json();
};

export const updateStaff = async (id: number, staff: Partial<StaffMember>): Promise<StaffMember> => {
    const response = await fetch(`${API_STAFF}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staff),
    });
    if (!response.ok) throw new Error("Failed to update staff member");
    return response.json();
};

export const getStaffStats = async (): Promise<StaffStats> => {
    const response = await fetch(`${API_STAFF}/stats`);
    if (!response.ok) throw new Error("Failed to fetch staff stats");
    return response.json();
};
