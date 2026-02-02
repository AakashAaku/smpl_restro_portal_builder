import { BillDetails } from "./billing";

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
export type OrderType = "delivery" | "dine-in" | "takeaway";

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Order {
  orderId: string;
  billNo: string;
  orderType: OrderType;
  tableNumber?: number; // For dine-in orders
  customerName: string;
  customerPhone: string;
  customerPan?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  deliveryFee: number;
  vatAmount: number;
  totalAmount: number;
  paymentMethod: string;
  deliveryAddress?: string;
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes?: string;
  billDetails?: BillDetails;
}

export function createOrder(
  orderId: string,
  billNo: string,
  customerName: string,
  customerPhone: string,
  items: OrderItem[],
  subtotal: number,
  discountAmount: number,
  discountPercent: number,
  deliveryFee: number,
  vatAmount: number,
  totalAmount: number,
  paymentMethod: string,
  orderType: OrderType = "delivery",
  tableNumber?: number,
  deliveryAddress?: string,
  customerPan?: string,
  notes?: string,
  billDetails?: BillDetails
): Order {
  const now = new Date().toISOString();
  return {
    orderId,
    billNo,
    orderType,
    tableNumber,
    customerName,
    customerPhone,
    customerPan,
    items,
    subtotal,
    discountAmount,
    discountPercent,
    deliveryFee,
    vatAmount,
    totalAmount,
    paymentMethod,
    deliveryAddress,
    status: "confirmed",
    statusHistory: [
      {
        status: "confirmed",
        timestamp: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
    notes,
    billDetails,
  };
}

export function saveOrder(order: Order): void {
  const orders = getAllOrders();
  orders.push(order);
  localStorage.setItem("all_orders", JSON.stringify(orders));
  // Trigger custom event for real-time updates
  window.dispatchEvent(
    new CustomEvent("orderCreated", { detail: order })
  );
}

export function getAllOrders(): Order[] {
  const orders = localStorage.getItem("all_orders");
  return orders ? JSON.parse(orders) : [];
}

export function getOrderById(orderId: string): Order | undefined {
  const orders = getAllOrders();
  return orders.find((o) => o.orderId === orderId);
}

export function getOrdersByTable(tableNumber: number): Order[] {
  const orders = getAllOrders();
  return orders.filter((o) => o.tableNumber === tableNumber && o.status !== "delivered" && o.status !== "cancelled");
}

export function getActiveOrders(): Order[] {
  const orders = getAllOrders();
  return orders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled"
  );
}

export function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Order | null {
  const orders = getAllOrders();
  const orderIndex = orders.findIndex((o) => o.orderId === orderId);

  if (orderIndex === -1) return null;

  const order = orders[orderIndex];
  order.status = newStatus;
  order.updatedAt = new Date().toISOString();
  if (newStatus === "delivered" || newStatus === "cancelled") {
    order.completedAt = new Date().toISOString();
  }
  order.statusHistory.push({
    status: newStatus,
    timestamp: new Date().toISOString(),
  });

  orders[orderIndex] = order;
  localStorage.setItem("all_orders", JSON.stringify(orders));

  // Trigger custom event for real-time updates
  window.dispatchEvent(
    new CustomEvent("orderUpdated", { detail: order })
  );

  return order;
}

export function deleteOrder(orderId: string): boolean {
  const orders = getAllOrders();
  const filteredOrders = orders.filter((o) => o.orderId !== orderId);
  localStorage.setItem("all_orders", JSON.stringify(filteredOrders));
  return orders.length !== filteredOrders.length;
}

export function getOrderStatistics() {
  const orders = getAllOrders();
  const today = new Date().toDateString();

  return {
    totalOrders: orders.length,
    todayOrders: orders.filter(
      (o) => new Date(o.createdAt).toDateString() === today
    ).length,
    activeOrders: orders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled"
    ).length,
    totalRevenue: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.totalAmount, 0),
    dineInOrders: orders.filter((o) => o.orderType === "dine-in").length,
    deliveryOrders: orders.filter((o) => o.orderType === "delivery").length,
  };
}

export function generateTableQRCode(tableNumber: number): string {
  // Generate QR code URL using a QR code service
  // Format: /table-order?table=<number>&token=<unique-token>
  const token = Math.random().toString(36).substr(2, 9);
  return `/table-order?table=${tableNumber}&token=${token}`;
}

export function validateTableQRToken(tableNumber: number, token: string): boolean {
  // In a real system, this would validate against stored tokens
  // For now, we accept any token as valid
  return token && tableNumber > 0;
}
