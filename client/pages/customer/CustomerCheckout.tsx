import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { AlertCircle, MapPin, CreditCard, CheckCircle } from "lucide-react";
import { generateBill, saveBill, BillDetails } from "@/lib/billing";
import { createOrder, saveOrder } from "@/lib/orders";
import BillDisplay from "@/components/billing/BillDisplay";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function CustomerCheckout() {
  const navigate = useNavigate();
  const [cart] = useState<CartItem[]>(
    JSON.parse(localStorage.getItem("cart_items") || "[]")
  );
  const [step, setStep] = useState<"address" | "payment" | "bill" | "confirmation">(
    "address"
  );
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPan, setCustomerPan] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [orderId] = useState("ORD-" + Date.now().toString().slice(-6));
  const [bill, setBill] = useState<BillDetails | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 40;

  const handlePlaceOrder = () => {
    if (!address || !phone || !customerName) {
      alert("Please fill in all required fields");
      return;
    }
    setStep("payment");
  };

  const handlePayment = () => {
    // Generate bill
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
      phone,
      paymentMethod,
      0, // discount percent
      deliveryFee,
      customerPan || undefined
    );

    setBill(generatedBill);
    setStep("bill");
  };

  const handleConfirmOrder = () => {
    if (bill) {
      // Save bill to localStorage
      saveBill(bill);

      // Convert cart items to order items format
      const orderItems = cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        amount: item.price * item.quantity,
      }));

      // Create and save order using order management system
      const order = createOrder(
        orderId,
        bill.billNo,
        customerName,
        phone,
        orderItems,
        bill.subtotal,
        bill.discountAmount,
        bill.discountPercent,
        bill.deliveryFee,
        bill.vatAmount,
        bill.totalAmount,
        paymentMethod,
        "delivery", // order type
        undefined, // no table for delivery
        address,
        customerPan || undefined,
        undefined, // no notes
        bill // include full bill details
      );

      saveOrder(order);

      setStep("confirmation");
      // Clear cart
      localStorage.removeItem("cart_items");
    }
  };

  const handleBackToMenu = () => {
    navigate("/customer/home");
  };

  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
            <CardContent className="pt-12 text-center">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-lg"></div>
                  <CheckCircle className="h-24 w-24 text-accent relative" />
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
                {bill && (
                  <div className="bg-secondary rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Bill No</p>
                    <p className="text-lg font-bold">{bill.billNo}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6 text-left">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Estimated Delivery
                  </p>
                  <p className="text-sm text-blue-800 mt-1">30-45 minutes</p>
                </div>
                {bill && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-900">
                      Order Total
                    </p>
                    <p className="text-lg font-bold text-green-800">₹{bill.totalAmount.toFixed(2)}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => navigate("/customer/orders")}
                >
                  Track Order
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={handleBackToMenu}
                >
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>

          {bill && <BillDisplay bill={bill} showActions={true} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info Step */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {step !== "address" ? (
                    <CheckCircle className="h-5 w-5 text-accent" />
                  ) : (
                    <MapPin className="h-5 w-5" />
                  )}
                  Customer Information
                </CardTitle>
              </CardHeader>
              {step !== "confirmation" && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      disabled={step !== "address"}
                      type="text"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={step !== "address"}
                      type="tel"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pan">PAN (Optional)</Label>
                    <Input
                      id="pan"
                      placeholder="Your PAN number (for billing)"
                      value={customerPan}
                      onChange={(e) => setCustomerPan(e.target.value)}
                      disabled={step !== "address"}
                      type="text"
                    />
                    <p className="text-xs text-muted-foreground">
                      Provide your PAN for tax compliance
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address *</Label>
                    <textarea
                      id="address"
                      placeholder="Enter your delivery address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      rows={3}
                      disabled={step !== "address"}
                    />
                  </div>

                  {step === "address" && (
                    <Button
                      className="w-full"
                      onClick={handlePlaceOrder}
                      size="lg"
                    >
                      Continue to Payment
                    </Button>
                  )}
                </CardContent>
              )}
              {step !== "address" && (
                <CardContent className="space-y-2 text-sm">
                  <p className="font-medium">{customerName}</p>
                  <p className="text-muted-foreground">{phone}</p>
                  <p className="text-muted-foreground">{address}</p>
                </CardContent>
              )}
            </Card>

            {/* Payment Step */}
            {step !== "bill" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {step === "confirmation" || step === "bill" ? (
                      <CheckCircle className="h-5 w-5 text-accent" />
                    ) : (
                      <CreditCard className="h-5 w-5" />
                    )}
                    Payment Method
                  </CardTitle>
                </CardHeader>
                {step === "payment" && (
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {["card", "upi", "wallet", "cod"].map((method) => (
                        <label
                          key={method}
                          className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors"
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
                                  : method === "wallet"
                                    ? "Digital Wallet"
                                    : "Cash on Delivery"}
                            </p>
                            {method === "cod" && (
                              <p className="text-xs text-muted-foreground">
                                Pay when order arrives
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>

                    {paymentMethod !== "cod" && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-900">
                          Demo mode: Payment will be simulated. Use any card details
                          for testing.
                        </p>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={handlePayment}
                      size="lg"
                    >
                      Review Bill
                    </Button>
                  </CardContent>
                )}
                {(step === "confirmation" || step === "bill") && (
                  <CardContent className="space-y-2 text-sm">
                    <p className="font-medium capitalize">
                      {paymentMethod === "card"
                        ? "Credit Card"
                        : paymentMethod === "upi"
                          ? "UPI"
                          : paymentMethod === "wallet"
                            ? "Wallet"
                            : "Cash on Delivery"}
                    </p>
                    <p className="text-muted-foreground">Payment processed</p>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Bill Display Step */}
            {step === "bill" && bill && (
              <>
                <BillDisplay bill={bill} showActions={true} />
                <div className="flex gap-3">
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
                    Confirm & Place Order
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Right - Order Summary */}
          {step !== "bill" && (
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm pb-2 border-b border-border last:border-b-0"
                      >
                        <span className="text-muted-foreground">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="font-medium">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">VAT (13%)</span>
                      <span>₹{Math.round(subtotal * 0.13).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span>₹{deliveryFee.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between font-bold text-lg pt-4 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">₹{(subtotal + Math.round(subtotal * 0.13) + deliveryFee).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
