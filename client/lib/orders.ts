import { api } from './api-client';
import { BillDetails } from "./billing";

export type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";
export type OrderType = "DELIVERY" | "DINE_IN" | "TAKEAWAY";

export interface OrderItem {
  id?: number;
  menuItemId: number;
  name?: string;
  quantity: number;
  price: number;
  menuItem?: {
    name: string;
    description?: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  billNo?: string;
  orderType?: OrderType;
  tableId?: number;
  tableNumber?: string;
  customerId?: string;
  customerName?: string;
  orderItems: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export const getOrders = async (): Promise<Order[]> => {
  return api.get("/orders");
};

export const getOrderById = async (id: string): Promise<Order> => {
  return api.get(`/orders/${id}`);
};

export const createOrder = async (orderData: any): Promise<Order> => {
  return api.post("/orders", orderData);
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  return api.put(`/orders/${id}/status`, { status });
};

export const cancelOrder = async (id: string): Promise<void> => {
  return api.delete(`/orders/${id}`);
};

export const getOrderStats = async () => {
  return api.get("/orders/stats");
};

export const getOrdersByStatus = async (status: OrderStatus): Promise<Order[]> => {
  return api.get(`/orders/status/${status}`);
};

export function generateTableQRCode(tableNumber: string): string {
  return `/table-order?table=${tableNumber}&token=${Math.random().toString(36).substr(2, 9)}`;
}

export const saveOrder = (order: any) => {
  console.log("Order saved locally/internally:", order);
  // For PWA support, this could also call cacheOfflineData from pwa.ts
};
