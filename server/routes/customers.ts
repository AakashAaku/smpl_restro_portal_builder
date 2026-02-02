import { RequestHandler } from "express";

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  lastOrder?: string;
  status: "active" | "inactive" | "vip";
  joinedDate: string;
}

let customers: Customer[] = [
  {
    id: 1,
    name: "Rajesh Kumar",
    phone: "9876543210",
    email: "rajesh@email.com",
    address: "Mumbai, Maharashtra",
    totalOrders: 15,
    totalSpent: 8500,
    loyaltyPoints: 850,
    lastOrder: "2024-01-26",
    status: "vip",
    joinedDate: "2023-06-15",
  },
  {
    id: 2,
    name: "Priya Singh",
    phone: "9876543211",
    email: "priya@email.com",
    address: "Delhi, India",
    totalOrders: 8,
    totalSpent: 4200,
    loyaltyPoints: 420,
    lastOrder: "2024-01-25",
    status: "active",
    joinedDate: "2023-09-20",
  },
  {
    id: 3,
    name: "Amit Patel",
    phone: "9876543212",
    email: "amit@email.com",
    address: "Bangalore, Karnataka",
    totalOrders: 3,
    totalSpent: 1800,
    loyaltyPoints: 180,
    lastOrder: "2024-01-20",
    status: "active",
    joinedDate: "2024-01-10",
  },
];

export const getCustomers: RequestHandler = (_req, res) => {
  res.json(customers);
};

export const getCustomerById: RequestHandler = (req, res) => {
  const { id } = req.params;
  const customer = customers.find((c) => c.id === parseInt(id));

  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.json(customer);
};

export const createCustomer: RequestHandler = (req, res) => {
  const { name, phone, email, address } = req.body;

  if (!name || !phone) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const newCustomer: Customer = {
    id: Math.max(...customers.map((c) => c.id), 0) + 1,
    name,
    phone,
    email: email || undefined,
    address: address || undefined,
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    status: "active",
    joinedDate: new Date().toISOString().split("T")[0],
  };

  customers.push(newCustomer);
  res.status(201).json(newCustomer);
};

export const updateCustomer: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { name, phone, email, address, status, dateOfBirth } = req.body;

  const customer = customers.find((c) => c.id === parseInt(id));

  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  if (name) customer.name = name;
  if (phone) customer.phone = phone;
  if (email) customer.email = email;
  if (address) customer.address = address;
  if (status) customer.status = status;
  if (dateOfBirth) customer.dateOfBirth = dateOfBirth;

  res.json(customer);
};

export const addLoyaltyPoints: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { points } = req.body;

  if (points === undefined) {
    res.status(400).json({ error: "Points required" });
    return;
  }

  const customer = customers.find((c) => c.id === parseInt(id));

  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  customer.loyaltyPoints += parseInt(points);
  res.json(customer);
};

export const redeemLoyaltyPoints: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { points } = req.body;

  if (points === undefined) {
    res.status(400).json({ error: "Points required" });
    return;
  }

  const customer = customers.find((c) => c.id === parseInt(id));

  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  if (customer.loyaltyPoints < points) {
    res.status(400).json({ error: "Insufficient points" });
    return;
  }

  customer.loyaltyPoints -= parseInt(points);
  res.json(customer);
};

export const getCustomerStats: RequestHandler = (_req, res) => {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "active").length;
  const vipCustomers = customers.filter((c) => c.status === "vip").length;
  const totalLoyaltyPoints = customers.reduce(
    (sum, c) => sum + c.loyaltyPoints,
    0
  );
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const averageOrderValue = Math.round(totalRevenue / customers.length);

  res.json({
    totalCustomers,
    activeCustomers,
    vipCustomers,
    totalLoyaltyPoints,
    totalRevenue,
    averageOrderValue,
  });
};

export const getTopCustomers: RequestHandler = (_req, res) => {
  const top = customers
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);
  res.json(top);
};
