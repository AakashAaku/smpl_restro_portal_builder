import { RequestHandler } from "express";

export interface OrderItem {
  menuItemId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  table?: number;
  items: OrderItem[];
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered";
  total: number;
  specialInstructions?: string;
  placedAt: Date;
  estimatedPrepTime?: number;
}

// Mock data - replace with database queries
let orders: Order[] = [
  {
    id: 1,
    orderNumber: "ORD-001",
    customerName: "Rajesh Kumar",
    table: 5,
    items: [{ menuItemId: 1, quantity: 1, price: 320 }],
    status: "preparing",
    total: 320,
    placedAt: new Date(Date.now() - 15 * 60000),
    estimatedPrepTime: 12,
  },
  {
    id: 2,
    orderNumber: "ORD-002",
    customerName: "Priya Singh",
    table: 8,
    items: [{ menuItemId: 2, quantity: 1, price: 280 }],
    status: "ready",
    total: 280,
    placedAt: new Date(Date.now() - 20 * 60000),
  },
  {
    id: 3,
    orderNumber: "ORD-003",
    customerName: "Amit Patel",
    table: 12,
    items: [{ menuItemId: 1, quantity: 2, price: 320 }],
    status: "confirmed",
    total: 640,
    placedAt: new Date(Date.now() - 25 * 60000),
  },
];

export const getOrders: RequestHandler = (_req, res) => {
  res.json(orders);
};

export const getOrderById: RequestHandler = (req, res) => {
  const { id } = req.params;
  const order = orders.find((order) => order.id === parseInt(id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(order);
};

export const createOrder: RequestHandler = (req, res) => {
  const { customerName, table, items, specialInstructions } = req.body;

  // Validation
  if (!customerName || !items || items.length === 0) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const total = items.reduce(
    (sum: number, item: OrderItem) => sum + item.price * item.quantity,
    0
  );

  const newOrder: Order = {
    id: Math.max(0, ...orders.map((o) => o.id)) + 1,
    orderNumber: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
    customerName,
    table: table || undefined,
    items,
    status: "pending",
    total,
    specialInstructions: specialInstructions || undefined,
    placedAt: new Date(),
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
};

export const updateOrderStatus: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "confirmed", "preparing", "ready", "delivered"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const order = orders.find((order) => order.id === parseInt(id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  order.status = status;
  res.json(order);
};

export const cancelOrder: RequestHandler = (req, res) => {
  const { id } = req.params;

  const orderIndex = orders.findIndex((order) => order.id === parseInt(id));

  if (orderIndex === -1) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const cancelledOrder = orders.splice(orderIndex, 1);
  res.json({ message: "Order cancelled", order: cancelledOrder[0] });
};

export const getOrdersByStatus: RequestHandler = (req, res) => {
  const { status } = req.query;

  if (!status) {
    res.status(400).json({ error: "Status parameter required" });
    return;
  }

  const filteredOrders = orders.filter((order) => order.status === status);
  res.json(filteredOrders);
};

export const getOrderStats: RequestHandler = (_req, res) => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = totalRevenue / totalOrders || 0;
  const statusBreakdown = {
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  res.json({
    totalOrders,
    totalRevenue,
    averageOrderValue: Math.round(averageOrderValue),
    statusBreakdown,
  });
};
