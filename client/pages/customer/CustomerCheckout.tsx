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
import { AlertCircle, MapPin, CreditCard, CheckCircle, Leaf, Clock, Sparkles, ShieldCheck, Truck, Receipt, ArrowRight, ArrowLeft, ShoppingCart } from "lucide-react";
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
  const [step, setStep] = useState<string>("address");
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
      const orderData = {
        orderNumber: orderId,
        billNo: bill.billNo,
        customerName: customerName,
        phone: phone,
        orderItems: orderItems,
        subtotal: bill.subtotal,
        discountAmount: bill.discountAmount,
        discountPercent: bill.discountPercent,
        deliveryFee: bill.deliveryFee,
        taxAmount: bill.vatAmount,
        totalAmount: bill.totalAmount,
        paymentMethod: paymentMethod,
        orderType: "DELIVERY",
        address: address,
        customerPan: customerPan || undefined,
        bill: bill
      };

      const order = createOrder(orderData);

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
          <Card className="premium-card mb-6 shadow-2xl border-none overflow-hidden">
            <CardContent className="pt-12 text-center">
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-600 to-green-500 text-white shadow-xl">
                    <CheckCircle className="h-12 w-12" />
                  </div>
                </div>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tighter mb-2">Order Confirmed!</h1>
              <p className="text-muted-foreground mb-8 font-medium">
                Your organic meal is being prepared with love
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 text-left">
                  <p className="text-[10px] uppercase font-bold text-emerald-900/40 mb-1">Order Tracking</p>
                  <p className="text-lg font-bold text-emerald-900">{orderId}</p>
                </div>
                {bill && (
                  <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 text-left">
                    <p className="text-[10px] uppercase font-bold text-emerald-900/40 mb-1">Receipt Number</p>
                    <p className="text-lg font-bold text-emerald-900">{bill.billNo}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-8 text-left">
                <div className="p-4 bg-white rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Estimated Delivery</p>
                    <p className="text-xs text-emerald-700/60 font-medium">30-45 minutes • Freshly Packed</p>
                  </div>
                </div>
                {bill && (
                  <div className="p-4 bg-emerald-600 rounded-2xl shadow-lg flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <Leaf className="h-5 w-5 opacity-80" />
                      <p className="text-sm font-bold">Total Amount Paid</p>
                    </div>
                    <p className="text-xl font-black">Rs.{bill.totalAmount.toFixed(2)}</p>
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Leaf className="h-4 w-4 text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                VenzoSmart • Secure Gateway
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-sidebar-foreground">
              Manifest <span className="text-primary italic">Order</span>
            </h1>
            <p className="text-muted-foreground mt-1 font-medium italic">
              "110% Pure Veg & Eggless • Freshly Cultivated"
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info Step */}
            <Card className="premium-card border-none shadow-2xl overflow-hidden group">
              <CardHeader className="bg-emerald-50/30 border-b border-emerald-900/5">
                <CardTitle className="flex items-center gap-2 text-emerald-900 font-extrabold">
                  {step !== "address" ? (
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <MapPin className="h-5 w-5 text-primary" />
                  )}
                  I. RECIPIENT LOGISTICS
                </CardTitle>
              </CardHeader>
              {step !== "bill" && step !== "confirmation" && (
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

                  <Button
                    className="w-full h-14 rounded-2xl text-lg font-black transition-all hover:scale-[1.02] shadow-xl shadow-primary/20 bg-primary text-white gap-3"
                    onClick={handlePlaceOrder}
                  >
                    CONTINUE TO FINANCIALS
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </CardContent>
              )}
              {(step === "payment" || step === "bill") && (
                <CardContent className="space-y-2 text-sm">
                  <p className="font-medium">{customerName}</p>
                  <p className="text-muted-foreground">{phone}</p>
                  <p className="text-muted-foreground">{address}</p>
                </CardContent>
              )}
            </Card>

            {/* Payment Step */}
            {step !== "bill" && (
              <Card className="premium-card border-none shadow-2xl overflow-hidden group">
                <CardHeader className="bg-emerald-50/30 border-b border-emerald-900/5">
                  <CardTitle className="flex items-center gap-2 text-emerald-900 font-extrabold">
                    {step === "bill" ? (
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-primary" />
                    )}
                    II. PAYMENT ARCHITECTURE
                  </CardTitle>
                </CardHeader>
                {step === "payment" && (
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {["card", "upi", "wallet", "cod"].map((method) => (
                        <label
                          key={method}
                          className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors"
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method}
                            checked={paymentMethod === method}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="flex-1">
                            <p className="font-bold capitalize text-emerald-900">
                              {method === "card"
                                ? "Credit/Debit Card"
                                : method === "upi"
                                  ? "UPI"
                                  : method === "wallet"
                                    ? "Digital Wallet"
                                    : "Cash on Delivery"}
                            </p>
                            {method === "cod" && (
                              <p className="text-[10px] text-emerald-600/60 font-medium">
                                Pay when order arrives
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>

                    {paymentMethod !== "cod" && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-900 font-medium">
                          Demo mode: Payment will be simulated.
                        </p>
                      </div>
                    )}

                    <Button
                      className="w-full h-14 rounded-2xl text-lg font-black transition-all hover:scale-[1.02] shadow-xl shadow-primary/20 bg-primary text-white gap-3"
                      onClick={handlePayment}
                    >
                      GENERATE PROXIMAL BILL
                      <Receipt className="h-5 w-5" />
                    </Button>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Bill Display Step */}
            {step === "bill" && bill && (
              <>
                <BillDisplay bill={bill} showActions={true} />
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl font-black border-2 border-emerald-100/50 text-emerald-900 gap-2"
                    onClick={() => setStep("payment")}
                    size="lg"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    PREVIOUS
                  </Button>
                  <Button
                    className="flex-2 h-14 rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.05] gap-3"
                    onClick={handleConfirmOrder}
                    size="lg"
                  >
                    AUTHORIZE & DISPATCH
                    <Truck className="h-5 w-5 text-white/50" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Right - Order Summary */}
          {step !== "bill" && (
            <div className="lg:col-span-1">
              <Card className="premium-card border-none shadow-2xl sticky top-24 overflow-hidden">
                <CardHeader className="bg-emerald-50/30 border-b border-emerald-900/5">
                  <CardTitle className="text-emerald-900 font-extrabold flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    BASKET INTEL
                  </CardTitle>
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
                          Rs.{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>Rs.{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">VAT (13%)</span>
                      <span>Rs.{Math.round(subtotal * 0.13).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span>Rs.{deliveryFee.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between font-bold text-lg pt-4 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">Rs.{(subtotal + Math.round(subtotal * 0.13) + deliveryFee).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div >
  );
}
