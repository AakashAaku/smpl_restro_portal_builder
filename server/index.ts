import "dotenv/config";
import express from "express";
import cors from "cors";
import staffRoutes from "./routes/staff";
import promotionRoutes from "./routes/promotions";
import settingsRoutes from "./routes/settings";
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
  getOrdersByCustomer,
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
  getStockMovements,
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
  getPaymentBreakdown,
  getTaxReport,
  getProfitabilityReport,
  getExpenses,
  createExpense,
  updateExpenseStatus,
} from "./routes/accounting";
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
import {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
} from "./routes/tables";
import {
  getRecipesByMenuItem,
  updateMenuItemRecipe,
} from "./routes/recipes";
import {
  getRequisitions,
  createRequisition,
  updateRequisitionStatus,
} from "./routes/requisitions";
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from "./routes/assets";
import { login, getMe } from "./routes/auth";
import { authenticateJWT, authorizeRoles } from "./middleware/auth";
import { Role } from "@prisma/client";

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

  // Authentication Routes
  app.post("/api/auth/login", login);
  app.get("/api/auth/me", authenticateJWT, getMe);

  // Router-based routes
  // app.use("/api/expenses", expenseRoutes); // Redundant, functionality moved to accounting
  app.use("/api/staff", staffRoutes);
  app.use("/api/promotions", promotionRoutes);
  app.use("/api/settings", settingsRoutes);

  // Menu Management Routes
  app.get("/api/menu", getMenuItems);
  app.get("/api/menu/categories", getMenuCategories);
  app.get("/api/menu/:id", getMenuItemById);
  app.post("/api/menu", authenticateJWT, createMenuItem);
  app.put("/api/menu/:id", authenticateJWT, updateMenuItem);
  app.delete("/api/menu/:id", authenticateJWT, deleteMenuItem);

  // Order Management Routes
  app.get("/api/orders", authenticateJWT, getOrders);
  app.get("/api/orders/stats", authenticateJWT, getOrderStats);
  app.get("/api/orders/status/:status", authenticateJWT, getOrdersByStatus);
  app.get("/api/orders/:id", authenticateJWT, getOrderById);
  app.get("/api/orders/customer/:idOrPhone", authenticateJWT, getOrdersByCustomer);
  app.post("/api/orders", authenticateJWT, createOrder);
  app.put("/api/orders/:id/status", authenticateJWT, updateOrderStatus);
  app.delete("/api/orders/:id", authenticateJWT, cancelOrder);

  // Inventory Management Routes
  app.get("/api/inventory/ingredients", authenticateJWT, getIngredients);
  app.get("/api/inventory/low-stock", authenticateJWT, getLowStockIngredients);
  app.get("/api/inventory/value", authenticateJWT, getInventoryValue);
  app.get("/api/inventory/ingredients/:id", authenticateJWT, getIngredientById);
  app.post("/api/inventory/ingredients", authenticateJWT, createIngredient);
  app.put("/api/inventory/ingredients/:id", authenticateJWT, updateIngredient);
  app.delete("/api/inventory/ingredients/:id", authenticateJWT, deleteIngredient);
  app.post("/api/inventory/stock-movement", authenticateJWT, recordStockMovement);
  app.get("/api/inventory/suppliers", authenticateJWT, getSuppliers);
  app.post("/api/inventory/suppliers", authenticateJWT, createSupplier);
  app.get("/api/inventory/stock-movements", authenticateJWT, getStockMovements);

  // Customer Management Routes
  app.get("/api/customers", authenticateJWT, getCustomers);
  app.get("/api/customers/stats", authenticateJWT, getCustomerStats);
  app.get("/api/customers/top", authenticateJWT, getTopCustomers);
  app.get("/api/customers/:id", authenticateJWT, getCustomerById);
  app.post("/api/customers", authenticateJWT, createCustomer);
  app.put("/api/customers/:id", authenticateJWT, updateCustomer);
  app.post("/api/customers/:id/loyalty-points/add", authenticateJWT, addLoyaltyPoints);
  app.post("/api/customers/:id/loyalty-points/redeem", authenticateJWT, redeemLoyaltyPoints);

  // Accounting & Reports Routes (Admin Only)
  app.get("/api/accounting/sales/daily", authenticateJWT, authorizeRoles(Role.ADMIN), getDailySalesReport);
  app.get("/api/accounting/sales/monthly", authenticateJWT, authorizeRoles(Role.ADMIN), getMonthlySalesReport);
  app.get("/api/accounting/summary", authenticateJWT, authorizeRoles(Role.ADMIN), getFinancialSummary);
  app.get("/api/accounting/expenses", authenticateJWT, authorizeRoles(Role.ADMIN), getExpenses);
  app.post("/api/accounting/expenses", authenticateJWT, authorizeRoles(Role.ADMIN), createExpense);
  app.put("/api/accounting/expenses/:id/status", authenticateJWT, authorizeRoles(Role.ADMIN), updateExpenseStatus);
  app.get("/api/accounting/payment-breakdown", authenticateJWT, authorizeRoles(Role.ADMIN), getPaymentBreakdown);
  app.get("/api/accounting/tax-report", authenticateJWT, authorizeRoles(Role.ADMIN), getTaxReport);
  app.get("/api/accounting/profitability", authenticateJWT, authorizeRoles(Role.ADMIN), getProfitabilityReport);

  // Staff Management Routes (Admin Only)
  app.use("/api/staff", authenticateJWT, authorizeRoles(Role.ADMIN), staffRoutes);

  // Purchase Management Routes
  app.get("/api/purchases", authenticateJWT, getPurchases);
  app.get("/api/purchases/stats", authenticateJWT, getPurchaseStats);
  app.get("/api/purchases/ingredient/:ingredientId", authenticateJWT, getPurchasesByIngredient);
  app.post("/api/purchases", authenticateJWT, recordPurchase);

  // Finished Goods & Production Routes
  app.get("/api/finished-goods", authenticateJWT, getFinishedGoods);
  app.post("/api/finished-goods", authenticateJWT, createFinishedGood);
  app.put("/api/finished-goods/:id", authenticateJWT, updateFinishedGood);
  app.post("/api/finished-goods/:id/produce", authenticateJWT, produceFinishedGood);

  // Table Management Routes
  app.get("/api/tables", authenticateJWT, getTables);
  app.get("/api/tables/:id", authenticateJWT, getTableById);
  app.post("/api/tables", authenticateJWT, createTable);
  app.put("/api/tables/:id", authenticateJWT, updateTable);
  app.delete("/api/tables/:id", authenticateJWT, deleteTable);
  app.put("/api/tables/:id/status", authenticateJWT, updateTableStatus);

  // Recipe Management Routes
  app.get("/api/menu/:menuItemId/recipe", authenticateJWT, getRecipesByMenuItem);
  app.put("/api/menu/:menuItemId/recipe", authenticateJWT, updateMenuItemRecipe);

  // Requisition Routes
  app.get("/api/requisitions", authenticateJWT, getRequisitions);
  app.post("/api/requisitions", authenticateJWT, createRequisition);
  app.put("/api/requisitions/:id/status", authenticateJWT, updateRequisitionStatus);

  // Asset Management Routes
  app.get("/api/assets", authenticateJWT, getAssets);
  app.post("/api/assets", authenticateJWT, createAsset);
  app.put("/api/assets/:id", authenticateJWT, updateAsset);
  app.delete("/api/assets/:id", authenticateJWT, deleteAsset);

  return app;
}
