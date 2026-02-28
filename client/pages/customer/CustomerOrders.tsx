import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  CheckCircle,
  Truck,
  LogOut,
  ChefHat,
  MapPin,
  Loader2,
  Package,
  Leaf,
  ShoppingCart,
  Sparkles,
  UtensilsCrossed,
  History,
  ShieldCheck,
  Zap,
  Star,
  PartyPopper
} from "lucide-react";
import { logout, getMe } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface OrderItem {
  id: string;
  menuItem: {
    name: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  orderItems: OrderItem[];
  tableId?: number;
}

const statusConfig: Record<string, any> = {
  PENDING: {
    icon: Clock,
    label: "Order Placed",
    color: "bg-gray-100 text-gray-800",
    bgColor: "bg-gray-50",
  },
  CONFIRMED: {
    icon: CheckCircle,
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800",
    bgColor: "bg-blue-50",
  },
  PREPARING: {
    icon: ChefHat,
    label: "Preparing",
    color: "bg-amber-100 text-amber-800",
    bgColor: "bg-amber-50",
  },
  READY: {
    icon: CheckCircle,
    label: "Ready for Pickup",
    color: "bg-green-100 text-green-800",
    bgColor: "bg-green-50",
  },
  DELIVERED: {
    icon: CheckCircle,
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    bgColor: "bg-green-50",
  },
  CANCELLED: {
    icon: LogOut,
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    bgColor: "bg-red-50",
  },
};

export default function CustomerOrders() {
  const navigate = useNavigate();
  const user = getMe();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["customer-orders", user?.phone],
    queryFn: async () => {
      if (!user?.phone) return [];
      const response = await api.get(`/orders/customer/${user.phone}`);
      return response.data as Order[];
    },
    enabled: !!user?.phone,
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleBackToMenu = () => {
    navigate("/customer/home");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-600 to-green-500 text-white p-2.5 rounded-xl shadow-lg organic-glow scale-110">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter text-emerald-950 flex items-center gap-1">
                  VENZO<span className="text-primary italic">SMART</span>
                  <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                </h1>
                <p className="text-[9px] text-primary font-black uppercase tracking-[0.3em] -mt-1 bg-primary/5 px-2 py-0.5 rounded-full inline-block">
                  110% Pure Veg & Eggless
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToMenu}
              className="gap-2 rounded-full px-6 h-10 font-bold border-emerald-100 bg-white hover:bg-emerald-50 whitespace-nowrap"
            >
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              CURATED MENU
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/customer/orders")}
              className="gap-2 rounded-full px-6 h-10 font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-105 whitespace-nowrap"
            >
              <History className="h-4 w-4" />
              PREVIOUS ORDERS
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/customer/events")}
              className="gap-2 rounded-full px-6 h-10 font-bold border-emerald-100 bg-white hover:bg-emerald-50 whitespace-nowrap"
            >
              <PartyPopper className="h-4 w-4 text-primary" />
              GALA BOOKING
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No orders yet</p>
              <Button
                className="mt-4"
                onClick={handleBackToMenu}
              >
                Place Your First Order
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.PENDING;
              const Icon = config.icon;

              return (
                <Card key={order.id} className={cn("premium-card border-none overflow-hidden", config.bgColor)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40">Manifest ID</span>
                        </div>
                        <CardTitle className="text-xl font-black tracking-tighter text-emerald-950 italic">
                          {order.orderNumber}
                        </CardTitle>
                        <p className="text-xs font-black text-emerald-700/60 mt-0.5">
                          Transmitted: {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2", config.color)}>
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Items */}
                    <div>
                      <p className="text-sm font-semibold mb-3">Items Ordered</p>
                      <div className="space-y-2">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                            <span>• {item.menuItem?.name || "Unknown Item"} x{item.quantity}</span>
                            <span>Rs.{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold">Order Status</p>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold">
                            1
                          </div>
                          <div>
                            <p className="text-sm font-medium">Order Placed</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        {["CONFIRMED", "PREPARING"].includes(order.status) && (
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 text-xs font-bold">
                              2
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {order.status === "CONFIRMED"
                                  ? "Confirmed & Preparing"
                                  : "Preparing Your Order"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Restaurant is working on your order
                              </p>
                            </div>
                          </div>
                        )}

                        {["READY", "DELIVERED"].includes(order.status) && (
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200 text-xs font-bold">
                              2
                            </div>
                            <div>
                              <p className="text-sm font-medium">Ready</p>
                              <p className="text-xs text-muted-foreground">
                                Your order is ready for pickup/delivery
                              </p>
                            </div>
                          </div>
                        )}

                        {order.status === "DELIVERED" && (
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">
                              ✓
                            </div>
                            <div>
                              <p className="text-sm font-medium">Delivered</p>
                              <p className="text-xs text-muted-foreground">
                                Enjoy your meal!
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <p className="font-bold text-xl text-primary">Total: Rs.{order.totalAmount}</p>
                        {order.tableId && (
                          <p className="text-xs text-muted-foreground">Table #{order.tableId}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/customer/home`)}>
                          Reorder
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
