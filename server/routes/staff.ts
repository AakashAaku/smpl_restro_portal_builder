import { RequestHandler } from "express";

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "chef" | "waiter" | "delivery";
  status: "active" | "inactive" | "on-leave";
  joinDate: string;
  salary?: number;
  department?: string;
  performance?: number;
}

let staff: StaffMember[] = [
  {
    id: 1,
    name: "Ramesh Kumar",
    email: "ramesh@restaurant.com",
    phone: "9876543210",
    role: "admin",
    status: "active",
    joinDate: "2022-03-15",
    salary: 75000,
    department: "Management",
    performance: 95,
  },
  {
    id: 2,
    name: "Vikram Singh",
    email: "vikram@restaurant.com",
    phone: "9876543211",
    role: "manager",
    status: "active",
    joinDate: "2022-08-20",
    salary: 55000,
    department: "Operations",
    performance: 88,
  },
  {
    id: 3,
    name: "Arjun Verma",
    email: "arjun@restaurant.com",
    phone: "9876543212",
    role: "chef",
    status: "active",
    joinDate: "2021-12-10",
    salary: 45000,
    department: "Kitchen",
    performance: 92,
  },
  {
    id: 4,
    name: "Pooja Sharma",
    email: "pooja@restaurant.com",
    phone: "9876543213",
    role: "waiter",
    status: "active",
    joinDate: "2023-06-05",
    salary: 25000,
    department: "Front Desk",
    performance: 85,
  },
  {
    id: 5,
    name: "Ravi Gupta",
    email: "ravi@restaurant.com",
    phone: "9876543214",
    role: "delivery",
    status: "on-leave",
    joinDate: "2023-04-15",
    salary: 22000,
    department: "Delivery",
    performance: 78,
  },
];

export const getStaff: RequestHandler = (_req, res) => {
  res.json(staff);
};

export const getStaffById: RequestHandler = (req, res) => {
  const { id } = req.params;
  const member = staff.find((s) => s.id === parseInt(id));

  if (!member) {
    res.status(404).json({ error: "Staff member not found" });
    return;
  }

  res.json(member);
};

export const createStaffMember: RequestHandler = (req, res) => {
  const { name, email, phone, role, department, salary } = req.body;

  if (!name || !email || !phone || !role) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const newMember: StaffMember = {
    id: Math.max(...staff.map((s) => s.id), 0) + 1,
    name,
    email,
    phone,
    role,
    status: "active",
    joinDate: new Date().toISOString().split("T")[0],
    salary: salary ? parseFloat(salary) : undefined,
    department: department || undefined,
    performance: 80,
  };

  staff.push(newMember);
  res.status(201).json(newMember);
};

export const updateStaffMember: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role, status, salary, department } = req.body;

  const member = staff.find((s) => s.id === parseInt(id));

  if (!member) {
    res.status(404).json({ error: "Staff member not found" });
    return;
  }

  if (name) member.name = name;
  if (email) member.email = email;
  if (phone) member.phone = phone;
  if (role) member.role = role;
  if (status) member.status = status;
  if (salary) member.salary = parseFloat(salary);
  if (department) member.department = department;

  res.json(member);
};

export const deleteStaffMember: RequestHandler = (req, res) => {
  const { id } = req.params;
  const index = staff.findIndex((s) => s.id === parseInt(id));

  if (index === -1) {
    res.status(404).json({ error: "Staff member not found" });
    return;
  }

  const deleted = staff.splice(index, 1);
  res.json(deleted[0]);
};

export const getStaffByRole: RequestHandler = (req, res) => {
  const { role } = req.query;

  if (!role) {
    res.status(400).json({ error: "Role parameter required" });
    return;
  }

  const filtered = staff.filter((s) => s.role === role);
  res.json(filtered);
};

export const getStaffStats: RequestHandler = (_req, res) => {
  const totalStaff = staff.length;
  const activeStaff = staff.filter((s) => s.status === "active").length;
  const inactiveStaff = staff.filter((s) => s.status === "inactive").length;
  const onLeaveStaff = staff.filter((s) => s.status === "on-leave").length;

  const roleCounts = {
    admin: staff.filter((s) => s.role === "admin").length,
    manager: staff.filter((s) => s.role === "manager").length,
    chef: staff.filter((s) => s.role === "chef").length,
    waiter: staff.filter((s) => s.role === "waiter").length,
    delivery: staff.filter((s) => s.role === "delivery").length,
  };

  const totalSalaries = staff.reduce((sum, s) => sum + (s.salary || 0), 0);
  const averagePerformance = Math.round(
    staff.reduce((sum, s) => sum + (s.performance || 0), 0) / staff.length
  );

  res.json({
    totalStaff,
    activeStaff,
    inactiveStaff,
    onLeaveStaff,
    roleCounts,
    totalMonthlySalaries: totalSalaries,
    averagePerformance,
  });
};

export const updatePerformance: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (rating === undefined || rating < 0 || rating > 100) {
    res.status(400).json({ error: "Rating must be between 0 and 100" });
    return;
  }

  const member = staff.find((s) => s.id === parseInt(id));

  if (!member) {
    res.status(404).json({ error: "Staff member not found" });
    return;
  }

  member.performance = parseInt(rating);
  res.json(member);
};
