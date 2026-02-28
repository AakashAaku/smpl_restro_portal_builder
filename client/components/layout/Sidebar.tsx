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
      { href: "/admin/staff", icon: ChefHat, label: "Staff" },
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

      // Chef role specific access
      if (role === "CHEF" || role === "chef") {
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
    <aside className="h-full w-64 border-r border-sidebar-border bg-sidebar shadow-sm overflow-y-auto">
      {/* Logo */}
      <div className="border-b border-sidebar-border px-6 py-10 bg-gradient-to-b from-sidebar to-sidebar/50">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-green-500 text-white shadow-lg organic-glow">
            <Leaf className="h-10 w-10" />
          </div>
          <div>
            <h1 className="font-extrabold text-sidebar-foreground text-2xl tracking-tighter">
              VENZO<span className="text-primary">SMART</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mt-1">
              110% Pure Veg & Eggless
            </p>
            <p className="text-xs text-sidebar-foreground/50 mt-2 flex items-center justify-center gap-1">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              Radhe Radhe, Bhaktapur
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-8">
        {filteredSections.map((section) => (
          <div key={section.title} className="space-y-3">
            <p className="px-4 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-[0.15em]">
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
                      "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary/20 scale-[1.02]"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-primary hover:translate-x-1"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                      isActive ? "text-primary-foreground" : "text-primary/60"
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
