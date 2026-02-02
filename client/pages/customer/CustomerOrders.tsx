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
} from "lucide-react";
import { logout } from "@/lib/auth";

interface Order {
  id: string;
  orderNumber: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "out-for-delivery" | "delivered";
  items: string[];
  total: number;
  placedAt: string;
  estimatedDelivery: string;
  deliveryAddress: string;
}

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-001524",
    status: "preparing",
    items: ["Butter Chicken x1", "Garlic Naan x2"],
    total: 450,
    placedAt: "Today at 10:30 AM",
    estimatedDelivery: "10:55 AM",
    deliveryAddress: "123 Main Street, Mumbai",
  },
  {
    id: "2",
    orderNumber: "ORD-001423",
    status: "delivered",
    items: ["Paneer Tikka Masala x1", "Mango Lassi x1"],
    total: 380,
    placedAt: "Yesterday at 7:45 PM",
    estimatedDelivery: "Delivered at 8:20 PM",
    deliveryAddress: "123 Main Street, Mumbai",
  },
];

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Order Placed",
    color: "bg-gray-100 text-gray-800",
    bgColor: "bg-gray-50",
  },
  confirmed: {
    icon: CheckCircle,
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800",
    bgColor: "bg-blue-50",
  },
  preparing: {
    icon: ChefHat,
    label: "Preparing",
    color: "bg-amber-100 text-amber-800",
    bgColor: "bg-amber-50",
  },
  ready: {
    icon: CheckCircle,
    label: "Ready for Pickup",
    color: "bg-green-100 text-green-800",
    bgColor: "bg-green-50",
  },
  "out-for-delivery": {
    icon: Truck,
    label: "Out for Delivery",
    color: "bg-purple-100 text-purple-800",
    bgColor: "bg-purple-50",
  },
  delivered: {
    icon: CheckCircle,
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    bgColor: "bg-green-50",
  },
};

export default function CustomerOrders() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleBackToMenu = () => {
    navigate("/customer/home");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Orders</h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToMenu}
              className="gap-2"
            >
              Continue Shopping
            </Button>
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
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {mockOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
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
            {mockOrders.map((order) => {
              const config = statusConfig[order.status];
              const Icon = config.icon;

              return (
                <Card key={order.id} className={config.bgColor}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {order.orderNumber}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.placedAt}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Items */}
                    <div>
                      <p className="text-sm font-semibold mb-3">Items Ordered</p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            • {item}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold">Order Status</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold">
                            1
                          </div>
                          <div>
                            <p className="text-sm font-medium">Order Placed</p>
                            <p className="text-xs text-muted-foreground">
                              {order.placedAt}
                            </p>
                          </div>
                        </div>

                        {["confirmed", "preparing"].includes(order.status) && (
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 text-xs font-bold">
                              2
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {order.status === "confirmed"
                                  ? "Confirmed & Preparing"
                                  : "Preparing Your Order"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Restaurant is working on your order
                              </p>
                            </div>
                          </div>
                        )}

                        {["ready", "out-for-delivery", "delivered"].includes(
                          order.status
                        ) && (
                          <>
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200 text-xs font-bold">
                                2
                              </div>
                              <div>
                                <p className="text-sm font-medium">Ready</p>
                                <p className="text-xs text-muted-foreground">
                                  Order is ready
                                </p>
                              </div>
                            </div>

                            {["out-for-delivery", "delivered"].includes(
                              order.status
                            ) && (
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-200 text-xs font-bold">
                                  3
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    Out for Delivery
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Driver is on the way
                                  </p>
                                </div>
                              </div>
                            )}

                            {order.status === "delivered" && (
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">
                                  ✓
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    Delivered
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {order.estimatedDelivery}
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="p-3 bg-white border border-border rounded-lg">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Delivery Address</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {order.deliveryAddress}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <p className="font-semibold">Total: ₹{order.total}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {order.status === "delivered" && (
                          <Button variant="outline" size="sm">
                            Reorder
                          </Button>
                        )}
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
