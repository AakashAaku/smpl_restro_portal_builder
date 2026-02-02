import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Eye, Search, Filter, Clock, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { Order, getAllOrders, updateOrderStatus, getOrderStatistics } from "@/lib/orders";

interface OrderDisplay extends Order {
  itemCount: number;
  formattedTime: string;
}

const statusColors = {
  pending: { bg: "bg-gray-100", text: "text-gray-800", label: "Pending" },
  confirmed: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    label: "Confirmed",
  },
  preparing: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    label: "Preparing",
  },
  ready: { bg: "bg-green-100", text: "text-green-800", label: "Ready" },
  delivered: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    label: "Delivered",
  },
  cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<OrderDisplay[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderDisplay | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    activeOrders: 0,
    totalRevenue: 0,
    dineInOrders: 0,
    deliveryOrders: 0,
  });

  // Load orders on mount and set up real-time listening
  useEffect(() => {
    const loadOrders = () => {
      const allOrders = getAllOrders();
      const displayOrders: OrderDisplay[] = allOrders.map((order) => ({
        ...order,
        itemCount: order.items.length,
        formattedTime: new Date(order.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
      setOrders(displayOrders);
      setStats(getOrderStatistics());
    };

    loadOrders();

    // Listen for order updates
    const handleOrderCreated = (e: Event) => {
      loadOrders();
    };

    const handleOrderUpdated = (e: Event) => {
      loadOrders();
    };

    window.addEventListener("orderCreated", handleOrderCreated);
    window.addEventListener("orderUpdated", handleOrderUpdated);

    // Refresh orders every 2 seconds for real-time updates
    const interval = setInterval(loadOrders, 2000);

    return () => {
      window.removeEventListener("orderCreated", handleOrderCreated);
      window.removeEventListener("orderUpdated", handleOrderUpdated);
      clearInterval(interval);
    };
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: any) => {
    updateOrderStatus(orderId, newStatus);
    if (selectedOrder?.orderId === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "preparing":
        return <Clock className="h-5 w-5 text-amber-600" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-purple-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const statusOptions = ["pending", "confirmed", "preparing", "ready", "delivered"];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all customer orders
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-64">
            <Label htmlFor="search" className="mb-2 block">
              Search Orders
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by customer name or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-48">
            <Label htmlFor="status-filter" className="mb-2 block">
              Filter by Status
            </Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Active Orders</p>
                <p className="text-3xl font-bold">{stats.activeOrders}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Today's Orders</p>
                <p className="text-3xl font-bold">{stats.todayOrders}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
                <p className="text-3xl font-bold">₹{stats.totalRevenue.toFixed(0)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Grid */}
        <div className="grid gap-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <Card
                key={order.orderId}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <p className="font-semibold">{order.orderId}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.customerName}
                            {order.tableNumber && ` • Table ${order.tableNumber}`}
                            {order.orderType === "delivery" && " • Delivery"}
                            {order.orderType === "takeaway" && " • Takeaway"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Items</p>
                          <p className="font-semibold">{order.itemCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="font-semibold">₹{order.totalAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Placed At
                          </p>
                          <p className="font-semibold text-sm">
                            {order.formattedTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Bill No
                          </p>
                          <p className="font-semibold text-sm">
                            {order.billNo}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 items-end">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColors[order.status as keyof typeof statusColors].bg
                        } ${statusColors[order.status as keyof typeof statusColors].text}`}
                      >
                        {statusColors[order.status as keyof typeof statusColors].label}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        {order.status !== "delivered" && order.status !== "cancelled" && (
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              handleStatusChange(order.orderId, value)
                            }
                          >
                            <SelectTrigger className="w-32 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {statusColors[status as keyof typeof statusColors].label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No orders found</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Order Details - {selectedOrder?.orderId}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Customer Name
                    </p>
                    <p className="font-semibold">
                      {selectedOrder.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold">{selectedOrder.customerPhone}</p>
                  </div>
                  {selectedOrder.tableNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Table</p>
                      <p className="font-semibold">Table {selectedOrder.tableNumber}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Order Type</p>
                    <p className="font-semibold capitalize">{selectedOrder.orderType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="font-semibold">{selectedOrder.itemCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-semibold">₹{selectedOrder.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Status</p>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColors[selectedOrder.status as keyof typeof statusColors].bg
                      } ${statusColors[selectedOrder.status as keyof typeof statusColors].text}`}
                    >
                      {statusColors[selectedOrder.status as keyof typeof statusColors].label}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Order Items
                  </p>
                  <div className="space-y-2 border rounded p-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between py-2 border-b last:border-b-0">
                        <span>{item.name} x {item.quantity}</span>
                        <span className="font-medium">₹{item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (13%)</span>
                    <span>₹{selectedOrder.vatAmount.toFixed(2)}</span>
                  </div>
                  {selectedOrder.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>₹{selectedOrder.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      handleStatusChange(selectedOrder.orderId, "delivered");
                      setIsDialogOpen(false);
                    }}
                  >
                    Mark as Delivered
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
