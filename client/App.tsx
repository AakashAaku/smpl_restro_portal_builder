import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, ReactNode } from "react";
import { registerServiceWorker, enableOfflineMode } from "./lib/pwa";
import { getAuth, isAdmin, isCustomer, isStaff } from "./lib/auth";

// Pages
import Login from "./pages/Login";

// Admin Pages
import Dashboard from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import OrderManagement from "./pages/OrderManagement";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import Staff from "./pages/Staff";
import Reports from "./pages/Reports";
import Production from "./pages/Production";
import Settings from "./pages/Settings";
import Bills from "./pages/Bills";
import Accounting from "./pages/Accounting";
import TableManagement from "./pages/TableManagement";
import TableQRCodes from "./pages/TableQRCodes";
import Promotions from "./pages/Promotions";
import PurchaseManagement from "./pages/PurchaseManagement";
import DailyStockReport from "./pages/DailyStockReport";
import FinishedGoods from "./pages/FinishedGoods";
import KitchenDisplay from "./pages/KitchenDisplay";
import EventConfiguration from "./pages/EventConfiguration";
import Requisition from "./pages/Requisition";
import Assets from "./pages/Assets";

// Customer Pages
import CustomerHome from "./pages/customer/CustomerHome";
import CustomerCheckout from "./pages/customer/CustomerCheckout";
import CustomerOrders from "./pages/customer/CustomerOrders";
import TableOrder from "./pages/customer/TableOrder";
import EventBooking from "./pages/customer/EventBooking";

// Layout
import { MainLayout } from "./components/layout/MainLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component for Admin
function AdminRoute({ children }: { children: ReactNode }) {
  const auth = getAuth();

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/customer/home" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
}

// Protected Route Component for Staff (Admin, Chef, Staff, etc.)
function StaffRoute({ children }: { children: ReactNode }) {
  const auth = getAuth();

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (!isStaff()) {
    return <Navigate to="/customer/home" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
}

// Protected Route Component for Customer
function CustomerRoute({ children }: { children: ReactNode }) {
  const auth = getAuth();

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (!isCustomer()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}

const App = () => {
  useEffect(() => {
    // Register service worker for PWA functionality
    registerServiceWorker();

    // Enable offline mode with IndexedDB
    enableOfflineMode();

    // Add manifest link if not already present
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = "/manifest.json";
      document.head.appendChild(link);
    }

    // Set theme color
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement("meta");
      themeColorMeta.setAttribute("name", "theme-color");
      themeColorMeta.setAttribute("content", "#059669");
      document.head.appendChild(themeColorMeta);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth */}
            <Route path="/login" element={<Login />} />

            {/* Admin Portal */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/menu"
              element={
                <AdminRoute>
                  <MenuManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <OrderManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <AdminRoute>
                  <Inventory />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <AdminRoute>
                  <Customers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <AdminRoute>
                  <Staff />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <Reports />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/production"
              element={
                <AdminRoute>
                  <Production />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <Settings />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/bills"
              element={
                <AdminRoute>
                  <Bills />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/accounting"
              element={
                <AdminRoute>
                  <Accounting />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/tables"
              element={
                <AdminRoute>
                  <TableManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/table-qr-codes"
              element={
                <AdminRoute>
                  <TableQRCodes />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/promotions"
              element={
                <AdminRoute>
                  <Promotions />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/purchases"
              element={
                <AdminRoute>
                  <PurchaseManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/stock-report"
              element={
                <AdminRoute>
                  <DailyStockReport />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/finished-goods"
              element={
                <AdminRoute>
                  <FinishedGoods />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <AdminRoute>
                  <EventConfiguration />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/kitchen-display"
              element={
                <StaffRoute>
                  <KitchenDisplay />
                </StaffRoute>
              }
            />

            <Route
              path="/admin/requisition"
              element={
                <StaffRoute>
                  <Requisition />
                </StaffRoute>
              }
            />

            <Route
              path="/admin/assets"
              element={
                <AdminRoute>
                  <Assets />
                </AdminRoute>
              }
            />

            {/* Customer Portal */}
            <Route
              path="/customer/home"
              element={
                <CustomerRoute>
                  <CustomerHome />
                </CustomerRoute>
              }
            />
            <Route
              path="/customer/checkout"
              element={
                <CustomerRoute>
                  <CustomerCheckout />
                </CustomerRoute>
              }
            />
            <Route
              path="/customer/orders"
              element={
                <CustomerRoute>
                  <CustomerOrders />
                </CustomerRoute>
              }
            />
            <Route
              path="/customer/events"
              element={
                <CustomerRoute>
                  <EventBooking />
                </CustomerRoute>
              }
            />

            {/* Table Order (Public - No Auth Required) */}
            <Route path="/table-order" element={<TableOrder />} />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
