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
import { useState, useEffect } from "react";
import { Eye, Search, Filter, Clock, CheckCircle, AlertCircle, Trash2, Plus } from "lucide-react";
import { Order, getAllOrders, updateOrderStatus, getOrderStatistics, createOrder, saveOrder } from "@/lib/orders";
import { generateBill, type BillItem } from "@/lib/billing";

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

const MENU_ITEMS = [
  { id: 1, name: "Paneer Tikka", price: 280 },
  { id: 2, name: "Butter Chicken", price: 320 },
  { id: 3, name: "Dal Makhani", price: 250 },
  { id: 4, name: "Biryani", price: 300 },
  { id: 5, name: "Samosa", price: 40 },
  { id: 6, name: "Spring Roll", price: 50 },
  { id: 7, name: "Garlic Naan", price: 60 },
  { id: 8, name: "Lassi", price: 80 },
  { id: 9, name: "Gulab Jamun", price: 120 },
  { id: 10, name: "Kheer", price: 100 },
];

export default function OrderManagement() {
  const [orders, setOrders] = useState<OrderDisplay[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderDisplay | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    activeOrders: 0,
    totalRevenue: 0,
    dineInOrders: 0,
    deliveryOrders: 0,
  });

  // Manual order form state
  const [manualOrderForm, setManualOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    orderType: "takeaway" as "delivery" | "takeaway",
    paymentMethod: "cash",
  });
  const [manualOrderItems, setManualOrderItems] = useState<BillItem[]>([]);
  const [manualOrderStep, setManualOrderStep] = useState(1);

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

  const handleAddItemToManualOrder = (itemId: number) => {
    const menuItem = MENU_ITEMS.find((m) => m.id === itemId);
    if (!menuItem) return;

    const existingItem = manualOrderItems.find((item) => item.id === itemId);
    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.unitPrice = menuItem.price;
      setManualOrderItems([...manualOrderItems]);
    } else {
      setManualOrderItems([
        ...manualOrderItems,
        {
          id: itemId,
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

  const handleCreateManualOrder = () => {
    if (!manualOrderForm.customerName || !manualOrderForm.customerPhone || manualOrderItems.length === 0) {
      alert("Please fill in all required fields");
      return;
    }

    const bill = generateBill(
      manualOrderItems,
      manualOrderForm.customerName,
      manualOrderForm.customerPhone,
      manualOrderForm.paymentMethod,
      0,
      manualOrderForm.orderType === "delivery" ? 50 : 0
    );

    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderItems = manualOrderItems.map((item) => ({
      ...item,
      amount: item.quantity * item.unitPrice,
    }));

    const order = createOrder(
      orderId,
      bill.billNo,
      manualOrderForm.customerName,
      manualOrderForm.customerPhone,
      orderItems,
      bill.subtotal,
      bill.discountAmount,
      0,
      bill.deliveryFee,
      bill.vatAmount,
      bill.totalAmount,
      manualOrderForm.paymentMethod,
      manualOrderForm.orderType,
      undefined,
      manualOrderForm.orderType === "delivery" ? "Counter Entry - Delivery" : undefined,
      undefined,
      "Manual counter entry",
      bill
    );

    saveOrder(order);

    // Reset form
    setManualOrderForm({
      customerName: "",
      customerPhone: "",
      orderType: "takeaway",
      paymentMethod: "cash",
    });
    setManualOrderItems([]);
    setManualOrderStep(1);
    setIsManualOrderOpen(false);
    alert("Order created successfully!");
  };

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground mt-2">
              Manage and track all customer orders
            </p>
          </div>
          <Dialog open={isManualOrderOpen} onOpenChange={setIsManualOrderOpen}>
            <Button className="gap-2" onClick={() => setIsManualOrderOpen(true)}>
              <Plus className="h-4 w-4" />
              Manual Order
            </Button>
          </Dialog>
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

        {/* Manual Order Dialog */}
        <Dialog open={isManualOrderOpen} onOpenChange={setIsManualOrderOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Manual Order</DialogTitle>
            </DialogHeader>

            <Tabs value={manualOrderStep.toString()} onValueChange={(value) => setManualOrderStep(parseInt(value))}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="1">Customer</TabsTrigger>
                <TabsTrigger value="2">Items</TabsTrigger>
                <TabsTrigger value="3">Payment</TabsTrigger>
              </TabsList>

              {/* Step 1: Customer Info */}
              <TabsContent value="1" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cust-name">Customer Name *</Label>
                    <Input
                      id="cust-name"
                      value={manualOrderForm.customerName}
                      onChange={(e) =>
                        setManualOrderForm({
                          ...manualOrderForm,
                          customerName: e.target.value,
                        })
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cust-phone">Phone Number *</Label>
                    <Input
                      id="cust-phone"
                      value={manualOrderForm.customerPhone}
                      onChange={(e) =>
                        setManualOrderForm({
                          ...manualOrderForm,
                          customerPhone: e.target.value,
                        })
                      }
                      placeholder="9876543210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="order-type">Order Type *</Label>
                    <Select
                      value={manualOrderForm.orderType}
                      onValueChange={(value: any) =>
                        setManualOrderForm({
                          ...manualOrderForm,
                          orderType: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="takeaway">Takeaway</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => setManualOrderStep(2)}
                    disabled={!manualOrderForm.customerName || !manualOrderForm.customerPhone}
                  >
                    Next: Select Items
                  </Button>
                </div>
              </TabsContent>

              {/* Step 2: Select Items */}
              <TabsContent value="2" className="space-y-4">
                <div>
                  <Label className="mb-3 block">Select Items</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded p-4">
                    {MENU_ITEMS.map((item) => (
                      <Button
                        key={item.id}
                        variant="outline"
                        className="flex flex-col items-start h-auto p-3 text-left"
                        onClick={() => handleAddItemToManualOrder(item.id)}
                      >
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">₹{item.price}</p>
                      </Button>
                    ))}
                  </div>
                </div>

                {manualOrderItems.length > 0 && (
                  <div className="border rounded p-4">
                    <Label className="mb-3 block">Selected Items</Label>
                    <div className="space-y-2">
                      {manualOrderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 bg-secondary rounded"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ₹{item.unitPrice} x {item.quantity}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItemFromManualOrder(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setManualOrderStep(1)}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setManualOrderStep(3)}
                    disabled={manualOrderItems.length === 0}
                  >
                    Next: Payment
                  </Button>
                </div>
              </TabsContent>

              {/* Step 3: Payment */}
              <TabsContent value="3" className="space-y-4">
                <div>
                  <Label htmlFor="payment-method">Payment Method *</Label>
                  <Select
                    value={manualOrderForm.paymentMethod}
                    onValueChange={(value) =>
                      setManualOrderForm({
                        ...manualOrderForm,
                        paymentMethod: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded p-4 bg-secondary">
                  <p className="font-semibold mb-3">Order Summary</p>
                  <div className="space-y-2 text-sm">
                    {manualOrderItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span>₹{(item.quantity * item.unitPrice).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
                      <span>Subtotal</span>
                      <span>
                        ₹
                        {manualOrderItems
                          .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setManualOrderStep(2)}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={handleCreateManualOrder}>
                    Create Order
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
    </div>
  );
}
