import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Package,
  BarChart3,
  Users2,
  ChefHat,
  Receipt,
  Wallet,
  TableProperties,
  Gift,
  QrCode,
  ShoppingCart,
  TrendingUp,
  Zap,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";

const navSections = [
  {
    title: "Core Operations",
    items: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/admin/orders", icon: ClipboardList, label: "Orders" },
      { href: "/admin/tables", icon: TableProperties, label: "Table Management" },
      { href: "/admin/table-qr-codes", icon: QrCode, label: "Table QR Codes" },
      { href: "/admin/events", icon: Calendar, label: "Event Configuration" },
    ],
  },
  {
    title: "Business Management",
    items: [
      { href: "/admin/menu", icon: UtensilsCrossed, label: "Menu" },
      { href: "/admin/inventory", icon: Package, label: "Inventory" },
      { href: "/admin/customers", icon: Users, label: "Customers" },
    ],
  },
  {
    title: "Inventory Management",
    items: [
      { href: "/admin/purchases", icon: ShoppingCart, label: "Purchase Management" },
      { href: "/admin/finished-goods", icon: Zap, label: "Finished Goods" },
      { href: "/admin/stock-report", icon: TrendingUp, label: "Daily Stock Report" },
    ],
  },
  {
    title: "Accounting & Finance",
    items: [
      { href: "/admin/accounting", icon: Wallet, label: "Accounting" },
      { href: "/admin/bills", icon: Receipt, label: "Bills & Invoices" },
      { href: "/admin/reports", icon: BarChart3, label: "Reports" },
      { href: "/admin/promotions", icon: Gift, label: "Promotions" },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin/staff", icon: ChefHat, label: "Staff" },
      { href: "/admin/production", icon: Users2, label: "Production" },
      { href: "/admin/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();

  return (
    <aside className="h-full w-64 border-r border-sidebar-border bg-sidebar shadow-sm overflow-y-auto">
      {/* Logo */}
      <div className="border-b border-sidebar-border px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-lg">
            🍽️
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground text-lg">
              Restaurant
            </h1>
            <p className="text-xs text-sidebar-foreground/60">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <p className="px-4 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/10"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-4">
        <LogoutButton />
      </div>
    </aside>
  );
}

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Button
      variant="ghost"
      className="flex w-full items-center justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/10"
      onClick={handleLogout}
    >
      <LogOut className="h-5 w-5" />
      Logout
    </Button>
  );
}
