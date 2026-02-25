import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuCategories,
} from "./routes/menu";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getOrdersByStatus,
  getOrderStats,
} from "./routes/orders";
import {
  getIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getLowStockIngredients,
  getSuppliers,
  createSupplier,
  recordStockMovement,
  getInventoryValue,
} from "./routes/inventory";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addLoyaltyPoints,
  redeemLoyaltyPoints,
  getCustomerStats,
  getTopCustomers,
} from "./routes/customers";
import {
  getDailySalesReport,
  getMonthlySalesReport,
  getFinancialSummary,
  getExpenses,
  createExpense,
  updateExpenseStatus,
  getPaymentBreakdown,
  getTaxReport,
} from "./routes/accounting";
import {
  getStaff,
  getStaffById,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  getStaffByRole,
  getStaffStats,
  updatePerformance,
} from "./routes/staff";
import {
  getPurchases,
  recordPurchase,
  getPurchaseStats,
  getPurchasesByIngredient,
} from "./routes/purchases";
import {
  getFinishedGoods,
  createFinishedGood,
  updateFinishedGood,
  produceFinishedGood,
} from "./routes/finished-goods";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Menu Management Routes
  app.get("/api/menu", getMenuItems);
  app.get("/api/menu/categories", getMenuCategories);
  app.get("/api/menu/:id", getMenuItemById);
  app.post("/api/menu", createMenuItem);
  app.put("/api/menu/:id", updateMenuItem);
  app.delete("/api/menu/:id", deleteMenuItem);

  // Order Management Routes
  app.get("/api/orders", getOrders);
  app.get("/api/orders/stats", getOrderStats);
  app.get("/api/orders/status/:status", getOrdersByStatus);
  app.get("/api/orders/:id", getOrderById);
  app.post("/api/orders", createOrder);
  app.put("/api/orders/:id/status", updateOrderStatus);
  app.delete("/api/orders/:id", cancelOrder);

  // Inventory Management Routes
  app.get("/api/inventory/ingredients", getIngredients);
  app.get("/api/inventory/low-stock", getLowStockIngredients);
  app.get("/api/inventory/value", getInventoryValue);
  app.get("/api/inventory/ingredients/:id", getIngredientById);
  app.post("/api/inventory/ingredients", createIngredient);
  app.put("/api/inventory/ingredients/:id", updateIngredient);
  app.delete("/api/inventory/ingredients/:id", deleteIngredient);
  app.post("/api/inventory/stock-movement", recordStockMovement);
  app.get("/api/inventory/suppliers", getSuppliers);
  app.post("/api/inventory/suppliers", createSupplier);

  // Customer Management Routes
  app.get("/api/customers", getCustomers);
  app.get("/api/customers/stats", getCustomerStats);
  app.get("/api/customers/top", getTopCustomers);
  app.get("/api/customers/:id", getCustomerById);
  app.post("/api/customers", createCustomer);
  app.put("/api/customers/:id", updateCustomer);
  app.post("/api/customers/:id/loyalty-points/add", addLoyaltyPoints);
  app.post("/api/customers/:id/loyalty-points/redeem", redeemLoyaltyPoints);

  // Accounting & Reports Routes
  app.get("/api/accounting/sales/daily", getDailySalesReport);
  app.get("/api/accounting/sales/monthly", getMonthlySalesReport);
  app.get("/api/accounting/summary", getFinancialSummary);
  app.get("/api/accounting/expenses", getExpenses);
  app.post("/api/accounting/expenses", createExpense);
  app.put("/api/accounting/expenses/:id/status", updateExpenseStatus);
  app.get("/api/accounting/payment-breakdown", getPaymentBreakdown);
  app.get("/api/accounting/tax-report", getTaxReport);

  // Staff Management Routes
  app.get("/api/staff", getStaff);
  app.get("/api/staff/stats", getStaffStats);
  app.get("/api/staff/role/:role", getStaffByRole);
  app.get("/api/staff/:id", getStaffById);
  app.post("/api/staff", createStaffMember);
  app.put("/api/staff/:id", updateStaffMember);
  app.delete("/api/staff/:id", deleteStaffMember);
  app.put("/api/staff/:id/performance", updatePerformance);

  // Purchase Management Routes
  app.get("/api/purchases", getPurchases);
  app.get("/api/purchases/stats", getPurchaseStats);
  app.get("/api/purchases/ingredient/:ingredientId", getPurchasesByIngredient);
  app.post("/api/purchases", recordPurchase);

  // Finished Goods & Production Routes
  app.get("/api/finished-goods", getFinishedGoods);
  app.post("/api/finished-goods", createFinishedGood);
  app.put("/api/finished-goods/:id", updateFinishedGood);
  app.post("/api/finished-goods/:id/produce", produceFinishedGood);

  return app;
}
