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
import { AlertCircle, CheckCircle, ShoppingCart, Trash2, Loader2, Leaf, Clock, Star, Users, Sparkles, UtensilsCrossed, ShieldCheck, Zap, Heart, PartyPopper, History } from "lucide-react";
import { generateBill } from "@/lib/billing";
import { createOrder as apiCreateOrder } from "@/lib/orders";
import { getMenuItems, MenuItem } from "@/lib/menu";
import { getTables } from "@/lib/tables-api";
import BillDisplay from "@/components/billing/BillDisplay";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

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
  const [orderBill, setOrderBill] = useState<any>(null);
  const [orderId] = useState("ORD-" + Date.now().toString().slice(-6));

  const { data: menuItems = [], isLoading: isMenuLoading } = useQuery({
    queryKey: ["menu"],
    queryFn: getMenuItems,
  });

  const { data: tables = [], isLoading: isTablesLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
  });

  const activeTable = tables.find(t => t.number === tableNumber);

  useEffect(() => {
    if (!tableNumber && !isTablesLoading) {
      toast.error("Invalid table access. Please scan a valid QR code.");
      navigate("/");
    }
  }, [tableNumber, navigate, isTablesLoading]);

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id);
      if (existingItem) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
    toast.success(`${item.name} added to tray`);
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
      toast.error("Please enter your name and phone number");
      return;
    }
    if (cart.length === 0) {
      toast.error("Please add items to your order");
      return;
    }
    setStep("payment");
  };

  const handlePayment = () => {
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
      0, 0, undefined, undefined,
      activeTable?.id
    );

    setOrderBill(generatedBill);
    setStep("bill");
  };

  const confirmOrderMutation = useMutation({
    mutationFn: async () => {
      if (!orderBill || !activeTable) throw new Error("Missing order details");

      const orderItems = cart.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      // Create Order (Backend handles Table status and Customer creation automatically)
      const order = await apiCreateOrder({
        tableId: activeTable.id.toString(),
        customerName,
        customerPhone,
        items: orderItems,
      } as any);

      return order;
    },
    onSuccess: () => {
      setStep("confirmation");
      toast.success("Order placed successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to place order");
    }
  });

  if (isMenuLoading || isTablesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Opening Menu...</p>
        </div>
      </div>
    );
  }

  if (step === "menu") {
    return (
      <div className="min-h-screen bg-background py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-[0.2em] mb-6 border border-primary/20 shadow-sm animate-pulse">
                TABLE {tableNumber} • DINE-IN ARCHITECTURE
              </div>
              <h1 className="text-5xl font-black tracking-tighter lg:text-7xl text-sidebar-foreground mb-4">
                Curated <span className="text-primary italic">Atoms</span>
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-green-500 text-white shadow-xl scale-110">
                  <Leaf className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-lg font-black tracking-tight text-emerald-950 flex items-center gap-1">
                    VENZO<span className="text-primary italic">SMART</span>
                    <Sparkles className="h-4 w-4 text-amber-400" />
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 -mt-1 bg-primary/5 px-2 py-0.5 rounded-full inline-block">110% Pure Veg & Eggless</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Menu Sections */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuItems.map((item: MenuItem) => (
                  <Card key={item.id} className="premium-card group relative overflow-hidden border-none shadow-lg hover:shadow-2xl">
                    <CardContent className="pt-8 text-left">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-black text-2xl group-hover:text-primary transition-colors line-clamp-1 italic text-emerald-950">{item.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/5 text-primary rounded-full">Organic</span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                              <Star className="h-3 w-3 fill-amber-500" />
                              4.9
                            </span>
                          </div>
                        </div>
                        <span className="text-2xl font-black text-primary tracking-tighter italic">Rs.{item.price}</span>
                      </div>
                      <p className="text-muted-foreground mb-6 line-clamp-2 text-sm leading-relaxed font-medium">{item.description}</p>
                      <Button
                        size="lg"
                        onClick={() => addToCart(item)}
                        className="w-full rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all font-black gap-2 h-12"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        ADD TO TRAY
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Floating Order Tray */}
            <div className="lg:col-span-4 lg:block">
              <Card className="sticky top-8 border-2 border-primary/20 shadow-[-20px_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-emerald-700 to-green-600 text-white py-8 border-none relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 scale-150">
                    <UtensilsCrossed className="h-24 w-24" />
                  </div>
                  <CardTitle className="flex items-center justify-between text-2xl font-black tracking-tighter uppercase relative z-10">
                    <span>Order Tray</span>
                    <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-2xl text-lg flex items-center gap-2 shadow-inner">
                      <ShoppingCart className="h-5 w-5" />
                      {cart.reduce((a, b) => a + b.quantity, 0)}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {cart.length === 0 ? (
                    <div className="text-center py-20 opacity-30">
                      <ShoppingCart className="h-20 w-20 mx-auto mb-4 stroke-[1.5]" />
                      <p className="font-medium text-lg">Your tray is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                        {cart.map((item) => (
                          <div key={item.id} className="flex flex-col p-4 bg-secondary/30 rounded-2xl border border-border group">
                            <div className="flex justify-between items-start mb-3">
                              <span className="font-bold leading-tight flex-1">{item.name}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/10 rounded-full"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex justify-between items-center mt-auto">
                              <div className="flex items-center bg-background rounded-full border border-border p-1 shadow-sm">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  -
                                </Button>
                                <span className="text-sm font-black w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  +
                                </Button>
                              </div>
                              <span className="font-black text-primary">Rs.{item.price * item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-6 border-t-2 border-dashed space-y-3">
                        <div className="flex justify-between text-muted-foreground font-medium">
                          <span>Subtotal</span>
                          <span>Rs.{subtotal}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-black pt-2">
                          <span>Total</span>
                          <span className="text-primary">Rs.{total}</span>
                        </div>
                        <Button
                          className="w-full mt-6 h-14 text-xl font-bold shadow-2xl rounded-2xl hover:translate-y-[-2px] transition-transform"
                          onClick={() => setStep("checkout")}
                        >
                          Checkout Now
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "checkout") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border-none bg-secondary/10">
          <CardHeader className="text-center py-12">
            <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-4xl font-black tracking-tight">One Last Step</CardTitle>
            <p className="text-muted-foreground mt-2 text-lg">Who should we prepare this order for?</p>
          </CardHeader>
          <CardContent className="px-10 pb-12 space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-lg font-bold">Your Name</Label>
                <Input
                  placeholder="e.g. John Smith"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-14 text-lg rounded-2xl border-2 focus-visible:border-primary transition-all px-6"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-lg font-bold">Phone Number</Label>
                <Input
                  placeholder="For order updates"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-14 text-lg rounded-2xl border-2 focus-visible:border-primary transition-all px-6"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="ghost" className="flex-1 h-14 text-lg font-bold rounded-2xl" onClick={() => setStep("menu")}>Back to Menu</Button>
              <Button className="flex-2 h-14 text-lg font-bold rounded-2xl shadow-xl px-12" onClick={handleCheckout}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-lg shadow-2xl border-none">
          <CardHeader className="text-center py-10 bg-primary/5">
            <CardTitle className="text-3xl font-black">Payment Selection</CardTitle>
          </CardHeader>
          <CardContent className="p-10 space-y-4">
            {["card", "upi", "cash"].map((method) => (
              <Button
                key={method}
                variant={paymentMethod === method ? "default" : "outline"}
                className={`w-full h-20 justify-between text-xl capitalize font-bold rounded-2xl border-2 transition-all ${paymentMethod === method ? 'border-primary ring-4 ring-primary/10' : 'hover:bg-secondary'}`}
                onClick={() => setPaymentMethod(method)}
              >
                <span>{method}</span>
                {paymentMethod === method && <CheckCircle className="h-6 w-6" />}
              </Button>
            ))}
            <div className="flex gap-4 pt-8">
              <Button variant="ghost" className="flex-1 h-14 text-lg font-bold rounded-2xl" onClick={() => setStep("checkout")}>Back</Button>
              <Button className="flex-2 h-14 text-lg font-bold rounded-2xl" onClick={handlePayment}>Review Order</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "bill" && orderBill) {
    return (
      <div className="min-h-screen bg-background py-12 px-6 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <h2 className="text-4xl font-black text-center mb-10">Final <span className="text-primary">Check</span></h2>
          <div className="shadow-[-20px_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden">
            <BillDisplay bill={orderBill} showActions={false} />
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-10">
            <Button variant="ghost" className="flex-1 h-16 text-lg font-bold rounded-2xl uppercase tracking-wider" onClick={() => setStep("payment")}>Edit Payment</Button>
            <Button
              className="flex-2 h-16 text-xl font-black shadow-2xl rounded-2xl bg-green-600 hover:bg-green-700 uppercase tracking-widest transition-all hover:scale-[1.02]"
              onClick={() => confirmOrderMutation.mutate()}
              disabled={confirmOrderMutation.isPending}
            >
              {confirmOrderMutation.isPending ? <Loader2 className="animate-spin h-6 w-6" /> : "Confirm Order"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.05),transparent)]">
        <div className="text-center max-w-lg animate-in fade-in zoom-in duration-700">
          <div className="relative inline-block mb-10">
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
            <CheckCircle className="h-40 w-40 text-green-500 relative drop-shadow-[0_10px_25px_rgba(34,197,94,0.3)]" />
          </div>
          <h1 className="text-6xl font-black mb-4 tracking-tighter italic">Cooking!</h1>
          <p className="text-2xl text-muted-foreground mb-12 font-medium">Your request has hit the kitchen. Stay comfortable!</p>

          <div className="grid grid-cols-2 gap-4 mb-12">
            <div className="bg-secondary/40 backdrop-blur-sm rounded-3xl p-6 border text-left">
              <p className="text-xs uppercase font-black opacity-30 mb-1">Receipt ID</p>
              <p className="text-xl font-mono font-black">{orderId}</p>
            </div>
            <div className="bg-secondary/40 backdrop-blur-sm rounded-3xl p-6 border text-left">
              <p className="text-xs uppercase font-black opacity-30 mb-1">Your Spot</p>
              <p className="text-xl font-black">Table {tableNumber}</p>
            </div>
          </div>

          <Button
            size="lg"
            onClick={() => navigate("/")}
            className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl hover:scale-105 transition-transform"
          >
            Explore More Delights
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
