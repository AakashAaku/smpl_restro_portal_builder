import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle, ShoppingCart, Trash2 } from "lucide-react";
import { generateBill, saveBill, BillDetails } from "@/lib/billing";
import { createOrder, saveOrder } from "@/lib/orders";
import BillDisplay from "@/components/billing/BillDisplay";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 1,
    name: "Butter Chicken",
    price: 320,
    description: "Tender chicken in creamy tomato sauce",
  },
  {
    id: 2,
    name: "Garlic Naan",
    price: 60,
    description: "Soft flatbread with garlic butter",
  },
  {
    id: 3,
    name: "Biryani",
    price: 280,
    description: "Fragrant rice with meat",
  },
  {
    id: 4,
    name: "Samosa",
    price: 40,
    description: "Crispy pastry with filling",
  },
  {
    id: 5,
    name: "Gulab Jamun",
    price: 120,
    description: "Sweet fried dumplings",
  },
  {
    id: 6,
    name: "Tandoori Chicken",
    price: 350,
    description: "Spiced grilled chicken",
  },
  {
    id: 7,
    name: "Aloo Paratha",
    price: 80,
    description: "Potato-filled flatbread",
  },
  {
    id: 8,
    name: "Masala Chai",
    price: 30,
    description: "Spiced tea",
  },
  {
    id: 9,
    name: "Paneer Tikka",
    price: 280,
    description: "Grilled cottage cheese cubes",
  },
  {
    id: 10,
    name: "Dal Makhani",
    price: 200,
    description: "Creamy lentil curry",
  },
];

export default function TableOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<"menu" | "checkout" | "payment" | "bill" | "confirmation">(
    "menu"
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [bill, setBill] = useState<BillDetails | null>(null);
  const [orderId] = useState("ORD-" + Date.now().toString().slice(-6));

  // Validate table number
  useEffect(() => {
    if (!tableNumber) {
      alert("Invalid table access. Please scan a valid QR code.");
      navigate("/");
    }
  }, [tableNumber, navigate]);

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id);
      if (existingItem) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prevCart) => prevCart.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      )
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const vat = Math.round(subtotal * 0.13);
  const total = subtotal + vat;

  const handleCheckout = () => {
    if (!customerName || !customerPhone) {
      alert("Please enter your name and phone number");
      return;
    }
    if (cart.length === 0) {
      alert("Please add items to your order");
      return;
    }
    setStep("payment");
  };

  const handlePayment = () => {
    if (!tableNumber) return;

    // Generate bill for dine-in order
    const billItems = cart.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      taxable: true,
    }));

    const generatedBill = generateBill(
      billItems,
      customerName,
      customerPhone,
      paymentMethod,
      0, // discount percent
      0, // no delivery fee for dine-in
      undefined, // no PAN for simplicity
      undefined, // use default restaurant
      parseInt(tableNumber) // table number for dine-in
    );

    setBill(generatedBill);
    setStep("bill");
  };

  const handleConfirmOrder = () => {
    if (!bill || !tableNumber) return;

    // Save bill
    saveBill(bill);

    // Convert cart items to order items
    const orderItems = cart.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      amount: item.price * item.quantity,
    }));

    // Create dine-in order with table number
    const order = createOrder(
      orderId,
      bill.billNo,
      customerName,
      customerPhone,
      orderItems,
      bill.subtotal,
      bill.discountAmount,
      bill.discountPercent,
      bill.deliveryFee,
      bill.vatAmount,
      bill.totalAmount,
      paymentMethod,
      "dine-in", // order type
      parseInt(tableNumber), // table number
      undefined, // no delivery address
      undefined, // no PAN
      undefined, // no notes
      bill
    );

    saveOrder(order);

    setStep("confirmation");
  };

  // Menu step
  if (step === "menu") {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-block px-4 py-2 bg-orange-100 text-orange-800 rounded-lg font-semibold mb-4">
              Table {tableNumber}
            </div>
            <h1 className="text-3xl font-bold mb-2">Restaurant Menu</h1>
            <p className="text-muted-foreground">
              Select items and place your order
            </p>
          </div>

          {/* Menu Grid and Cart */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Menu Items */}
            <div className="lg:col-span-3 space-y-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MENU_ITEMS.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {item.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-orange-600">
                          ₹{item.price}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => addToCart(item)}
                          className="gap-2"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Cart Sidebar */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No items added
                    </p>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 bg-secondary rounded"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                ₹{item.price} x {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(item.id, parseInt(e.target.value))
                                }
                                className="w-12 h-8"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 pt-4 border-t border-border">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>VAT (13%)</span>
                          <span>₹{vat}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                          <span>Total</span>
                          <span>₹{total}</span>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => setStep("checkout")}
                      >
                        Proceed to Checkout
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Checkout step
  if (step === "checkout") {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Details</h1>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="font-semibold text-orange-900">
                  Table {tableNumber}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="Your phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  type="tel"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("menu")}
                  size="lg"
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCheckout}
                  size="lg"
                >
                  Continue to Payment
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (13%)</span>
                  <span>₹{vat}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Payment step
  if (step === "payment") {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Payment Method</h1>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                {["card", "upi", "cash"].map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors"
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium capitalize">
                        {method === "card"
                          ? "Credit/Debit Card"
                          : method === "upi"
                            ? "UPI"
                            : "Cash at Table"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("checkout")}
                  size="lg"
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handlePayment}
                  size="lg"
                >
                  Review Bill
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Bill step
  if (step === "bill" && bill) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Order Bill</h1>

          <BillDisplay bill={bill} showActions={true} />

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep("payment")}
              size="lg"
            >
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirmOrder}
              size="lg"
            >
              Confirm Order
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation step
  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-12 text-center">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-200 rounded-full blur-lg"></div>
                  <CheckCircle className="h-24 w-24 text-green-600 relative" />
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
              <p className="text-muted-foreground mb-6">
                Your order has been placed successfully
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="text-lg font-bold">{orderId}</p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Table</p>
                  <p className="text-lg font-bold">{tableNumber}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Estimated Preparation Time
                  </p>
                  <p className="text-sm text-blue-800 mt-1">15-20 minutes</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900">
                    Order Total
                  </p>
                  <p className="text-lg font-bold text-green-800">₹{bill?.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate("/")}
              >
                Done
              </Button>
            </CardContent>
          </Card>

          {bill && <BillDisplay bill={bill} showActions={true} />}
        </div>
      </div>
    );
  }

  return null;
}
