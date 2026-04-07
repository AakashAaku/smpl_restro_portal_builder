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
  Layout,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout, getAuth, isAdmin } from "@/lib/auth";

const navSections = [
  {
    title: "Core Operations",
    items: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/admin/orders", icon: ClipboardList, label: "Orders" },
      { href: "/admin/kitchen-display", icon: ChefHat, label: "Kitchen Ticker" },
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
      { href: "/admin/assets", icon: Layout, label: "Asset Management" },
      { href: "/admin/promotions", icon: Gift, label: "Promotions" },
    ],
  },
  {
    title: "Kitchen Operations",
    items: [
      { href: "/admin/requisition", icon: ClipboardList, label: "Requisitions" },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin/staff", icon: ChefHat, label: "Staff (HR)" },
      { href: "/admin/users", icon: Users2, label: "System Users" },
      { href: "/admin/production", icon: Users2, label: "Production" },
      { href: "/admin/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();

  const { role } = getAuth() || { role: "" };
  const isAdminUser = isAdmin();

  // Filter sections based on role
  const filteredSections = navSections.map(section => {
    const filteredItems = section.items.filter(item => {
      // Admin sees everything
      if (isAdminUser) return true;

      // Chef & Kitchen Staff specific access
      if (role === "CHEF" || role === "chef" || role === "KITCHEN_STAFF") {
        const chefAllowed = [
          "/admin/dashboard",
          "/admin/orders",
          "/admin/kitchen-display",
          "/admin/menu",
          "/admin/inventory",
          "/admin/requisition"
        ];
        return chefAllowed.includes(item.href);
      }

      // Reception specific access
      if (role === "RECEPTION") {
        const receptionAllowed = [
          "/admin/dashboard",
          "/admin/orders",
          "/admin/tables",
          "/admin/table-qr-codes",
          "/admin/inventory",
          "/admin/requisition",
          "/admin/promotions"
        ];
        return receptionAllowed.includes(item.href);
      }

      // Other staff see basic operations
      const staffAllowed = [
        "/admin/dashboard",
        "/admin/orders",
        "/admin/kitchen-display",
        "/admin/tables"
      ];
      return staffAllowed.includes(item.href);
    });

    return { ...section, items: filteredItems };
  }).filter(section => section.items.length > 0);

  return (
    <aside className="h-full w-64 border-r border-sidebar-border bg-sidebar shadow-sm flex flex-col">
      {/* Logo */}
      <div className="border-b border-sidebar-border px-6 py-6 border-b-muted">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <Leaf className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-sidebar-foreground text-lg leading-tight">
              VenzoSmart
            </h1>
            <span className="text-xs text-muted-foreground font-medium">Admin Portal</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {filteredSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-foreground"
                    )} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
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
      className="flex w-full items-center justify-start gap-3 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
