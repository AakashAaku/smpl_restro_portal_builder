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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Eye, Search, Clock, CheckCircle, AlertCircle, Trash2, Plus, Printer, Loader2, Leaf, Sparkles, Timer, Utensils, Receipt, TrendingUp } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, updateOrderStatus, getOrderStats, createOrder, type Order, type OrderStatus } from "@/lib/orders";
import { getMenuItems } from "@/lib/menu";
import { printBill, type BillItem, type BillDetails } from "@/lib/billing";
import { toast } from "sonner";

const statusColors = {
  PENDING: { bg: "bg-gray-100", text: "text-gray-800", label: "Pending" },
  CONFIRMED: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    label: "Confirmed",
  },
  PREPARING: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    label: "Preparing",
  },
  READY: { bg: "bg-green-100", text: "text-green-800", label: "Ready" },
  SERVED: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    label: "Served",
  },
  CANCELLED: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
};

export default function OrderManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);

  // Manual order form state
  const [manualOrderForm, setManualOrderForm] = useState({
    customerName: "Walk-in",
    customerPhone: "",
    orderType: "TAKEAWAY" as "DELIVERY" | "TAKEAWAY",
    paymentMethod: "cash",
  });
  const [manualOrderItems, setManualOrderItems] = useState<BillItem[]>([]);
  const [manualOrderStep, setManualOrderStep] = useState(1);

  // Queries
  const { data: menuItems = [] } = useQuery({
    queryKey: ["menu-items"],
    queryFn: getMenuItems,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchInterval: 5000,
  });

  const { data: stats } = useQuery({
    queryKey: ["order-stats"],
    queryFn: getOrderStats,
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      toast.success("Order status updated");
    },
  });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "READY":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "PREPARING":
        return <Clock className="h-5 w-5 text-amber-600" />;
      case "SERVED":
        return <CheckCircle className="h-5 w-5 text-purple-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const statusOptions: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "READY", "SERVED", "CANCELLED"];

  const handleAddItemToManualOrder = (menuItem: any) => {
    const existingItem = manualOrderItems.find((item) => item.id === menuItem.id);
    if (existingItem) {
      setManualOrderItems(
        manualOrderItems.map((item) =>
          item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setManualOrderItems([
        ...manualOrderItems,
        {
          id: menuItem.id,
          name: menuItem.name,
          quantity: 1,
          unitPrice: menuItem.price,
        },
      ]);
    }
  };

  const handleRemoveItemFromManualOrder = (itemId: number) => {
    setManualOrderItems(manualOrderItems.filter((item) => item.id !== itemId));
  };

  const handleCreateManualOrder = async () => {
    if (manualOrderItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    try {
      const orderData = {
        customerName: manualOrderForm.customerName,
        customerPhone: manualOrderForm.customerPhone,
        orderType: manualOrderForm.orderType,
        items: manualOrderItems.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.unitPrice
        })),
        paymentMethod: manualOrderForm.paymentMethod
      };

      await createOrder(orderData);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setIsManualOrderOpen(false);
      setManualOrderItems([]);
      toast.success("Order created successfully");
    } catch (error) {
      toast.error("Failed to create order");
    }
  };

  const handlePrintReceipt = (order: Order) => {
    const bill: BillDetails = {
      billNo: order.billNo || "N/A",
      date: new Date(order.createdAt).toLocaleDateString(),
      time: new Date(order.createdAt).toLocaleTimeString(),
      customerName: order.customerName || "Walk-in",
      customerPhone: "",
      restaurantName: "VenzoSmart",
      restaurantPan: "601234567", // Placeholder PAN
      restaurantAddress: "Radhe Radhe, Bhaktapur, Nepal",
      restaurantPhone: "+977 1-XXXXXXX",
      items: order.orderItems?.map((item: any) => ({
        id: item.menuItemId,
        name: item.menuItem?.name || "Item",
        quantity: item.quantity,
        unitPrice: item.price
      })) || [],
      subtotal: order.totalAmount,
      discountAmount: 0,
      discountPercent: 0,
      taxableAmount: order.totalAmount / 1.13,
      vatAmount: order.totalAmount - (order.totalAmount / 1.13),
      vatPercent: 13,
      deliveryFee: 0,
      totalAmount: order.totalAmount,
      paymentMethod: "CASH"
    };

    printBill(bill);
  };

  if (ordersLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Leaf className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
              VenzoSmart • Order Control Center
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-sidebar-foreground">
            Active <span className="text-primary italic">Orders</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic">
            "Real-time fulfillment of Organic Excellence"
          </p>
        </div>
        <Button className="h-12 px-8 rounded-xl font-bold border-none shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-[1.02]" onClick={() => setIsManualOrderOpen(true)}>
          <Plus className="h-5 w-5" />
          CREATE MANUAL ORDER
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end flex-wrap">
        <div className="flex-1 min-w-64">
          <Label htmlFor="search">Search Orders</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-48">
          <Label htmlFor="status-filter">Status</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>{statusColors[status].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="premium-card border-none shadow-lg overflow-hidden group">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Cycle Count</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground">{stats?.totalOrders || 0}</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-2">Total orders processed</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <Receipt className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Gross Inflow</p>
                <p className="text-3xl font-black tracking-tight text-emerald-700">
                  Rs.{Math.round(stats?.totalRevenue || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-600 font-bold mt-2">Daily aggregate revenue</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Average Ticket</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground">
                  Rs.{Math.round(stats?.averageOrderValue || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-primary font-bold mt-2">Per-customer yield</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                <Timer className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-semibold text-lg">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground font-medium">
                          {order.customerName || "Guest Patron"}
                          {order.tableNumber && ` • Table ${order.tableNumber}`}
                          {` • ${order.orderType}`}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Total</p>
                        <p className="font-black text-emerald-900 italic">Rs.{order.totalAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Placed At</p>
                        <p className="font-semibold">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColors[order.status].bg} ${statusColors[order.status].text}`}>
                          {statusColors[order.status].label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handlePrintReceipt(order)} className="gap-2">
                        <Printer className="h-4 w-4" /> Print
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => { setSelectedOrder(order); setIsDialogOpen(true); }}>
                        <Eye className="h-4 w-4 mr-1" /> Details
                      </Button>
                    </div>
                    {order.status !== "SERVED" && order.status !== "CANCELLED" && (
                      <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}>
                        <SelectTrigger className="w-40 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>{statusColors[status].label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="py-12 text-center text-muted-foreground">
            No orders found
          </Card>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-semibold">{selectedOrder.customerName || "Guest"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Placed At</p>
                  <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="border rounded p-4 space-y-2">
                <p className="font-bold border-b pb-2">Items</p>
                {selectedOrder.orderItems?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.menuItem?.name} x {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <Button className="flex-1" variant="outline" onClick={() => handlePrintReceipt(selectedOrder)}>
                  <Printer className="h-4 w-4 mr-2" /> Print Receipt
                </Button>
                {selectedOrder.status !== "SERVED" && (
                  <Button className="flex-1" onClick={() => { handleStatusChange(selectedOrder.id, "SERVED"); setIsDialogOpen(false); }}>
                    Mark as Served
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Order Dialog */}
      <Dialog open={isManualOrderOpen} onOpenChange={setIsManualOrderOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Manual Order</DialogTitle>
          </DialogHeader>
          <Tabs value={manualOrderStep.toString()} onValueChange={v => setManualOrderStep(parseInt(v))}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="1">Details</TabsTrigger>
              <TabsTrigger value="2">Items</TabsTrigger>
              <TabsTrigger value="3">Review</TabsTrigger>
            </TabsList>
            <TabsContent value="1" className="space-y-4 pt-4">
              <div>
                <Label>Customer Name</Label>
                <Input value={manualOrderForm.customerName} onChange={e => setManualOrderForm({ ...manualOrderForm, customerName: e.target.value })} />
              </div>
              <div>
                <Label>Order Type</Label>
                <Select value={manualOrderForm.orderType} onValueChange={(v: any) => setManualOrderForm({ ...manualOrderForm, orderType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TAKEAWAY">Takeaway</SelectItem>
                    <SelectItem value="DELIVERY">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => setManualOrderStep(2)}>Next</Button>
            </TabsContent>
            <TabsContent value="2" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded p-2">
                {menuItems.map(item => (
                  <Button key={item.id} variant="outline" size="sm" className="justify-start" onClick={() => handleAddItemToManualOrder(item)}>
                    {item.name} - ₹{item.price}
                  </Button>
                ))}
              </div>
              <div className="border rounded p-2 text-sm space-y-1">
                {manualOrderItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span>{item.name} x {item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveItemFromManualOrder(item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={() => setManualOrderStep(3)} disabled={manualOrderItems.length === 0}>Review Order</Button>
            </TabsContent>
            <TabsContent value="3" className="space-y-4 pt-4 text-sm">
              <div className="border rounded p-4 bg-secondary/50">
                <p className="font-bold mb-2">Order Summary</p>
                <p>Customer: {manualOrderForm.customerName}</p>
                <p>Type: {manualOrderForm.orderType}</p>
                <div className="mt-2 border-t pt-2">
                  {manualOrderItems.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border-t pt-2 font-bold text-lg flex justify-between">
                  <span>Total</span>
                  <span>₹{manualOrderItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0).toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full" onClick={handleCreateManualOrder}>Confirm & Create Order</Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
