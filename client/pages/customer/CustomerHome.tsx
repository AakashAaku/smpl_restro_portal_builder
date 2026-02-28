import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Minus,
  Leaf,
  Search,
  LogOut,
  ShoppingCart,
  MapPin,
  Clock,
  Star,
  Sparkles,
  UtensilsCrossed,
  Heart,
  ChevronRight,
  User,
  PartyPopper,
  History
} from "lucide-react";
import { logout } from "@/lib/auth";
import { getMenuItems, MenuItem as ApiMenuItem } from "@/lib/menu";
import { toast } from "sonner";
import { useEffect } from "react";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  rating: number;
  prepTime: number;
  image?: string;
  veg: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const mockMenuItems: MenuItem[] = []; // Will be replaced by API data

export default function CustomerHome() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const data = await getMenuItems();
      // Map API MenuItem to Customer MenuItem format
      const mappedData: MenuItem[] = data.map(item => ({
        ...item,
        rating: 4.8 + Math.random() * 0.2, // Premium ratings
        veg: true // 110% Pure Veg & Eggless
      }));
      setMenuItems(mappedData);
    } catch (error) {
      toast.error("Failed to load menu");
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    "All",
    ...new Set(menuItems.map((item) => item.category)),
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: MenuItem) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    setSelectedItem(null);
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    localStorage.setItem("cart_items", JSON.stringify(cart));
    navigate("/customer/checkout");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCart(!showCart)}
                className="gap-2 relative"
              >
                <ShoppingCart className="h-4 w-4" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
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

          {/* Navigation */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/customer/home")}
              className="gap-2 rounded-full px-6 h-10 font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-105 whitespace-nowrap"
            >
              <UtensilsCrossed className="h-4 w-4" />
              CURATED MENU
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/customer/orders")}
              className="gap-2 rounded-full px-6 h-10 font-bold border-emerald-100 bg-white hover:bg-emerald-50 whitespace-nowrap"
            >
              <History className="h-4 w-4 text-primary" />
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl organic-glow group h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-emerald-900/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&q=80')] bg-cover bg-center group-hover:scale-110 transition-transform duration-[10s]" />
          <div className="absolute inset-0 z-20 flex flex-col justify-center px-10 sm:px-20">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-xl border border-emerald-400/30 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-2xl">
                <Sparkles className="h-3 w-3" />
                Verified Pure Veg & Eggless
              </div>
              <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
                Divine <span className="text-primary italic">Purity</span><br />
                Organic Bliss.
              </h2>
              <p className="text-xl text-emerald-50/70 font-medium mb-10 max-w-lg leading-relaxed">
                Elevating the vegetarian craft in Bhaktapur. 110% committed to ethical, organic, and eggless gastronomy.
              </p>
              <div className="flex flex-wrap gap-5">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 shadow-xl transition-all hover:bg-white/20">
                  <div className="bg-emerald-500/30 p-2 rounded-lg">
                    <MapPin className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Sanctuary</p>
                    <p className="text-sm font-bold text-white tracking-tight">Radhe Radhe, Bhaktapur</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 shadow-xl transition-all hover:bg-white/20">
                  <div className="bg-emerald-500/30 p-2 rounded-lg">
                    <Clock className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Status</p>
                    <p className="text-sm font-bold text-white tracking-tight">Accepting Orders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Circular Accent */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] z-10" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Search & Categories */}
          <div className="lg:col-span-1 space-y-4">
            <div className="space-y-2 sticky top-24">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Categories</p>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Menu Items */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Menu</h2>
              <span className="text-sm text-muted-foreground">
                {filteredItems.length} items available
              </span>
            </div>
            {filteredItems.length === 0 ? (
              <Card>
                <CardContent className="pt-12 text-center">
                  <p className="text-muted-foreground">No items found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className="premium-card group cursor-pointer overflow-hidden border-none"
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardContent className="p-4">
                      {/* Item Header with Badges */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div className="flex-1">
                          <h3 className="font-black text-xl tracking-tighter text-emerald-950 line-clamp-1 italic">
                            {item.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 bg-emerald-100/50 px-2 py-1 rounded-full border border-emerald-200 shadow-sm">
                          <Leaf className="h-3 w-3 text-emerald-600" />
                          <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Pure Veg</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 h-9">
                        {item.description}
                      </p>

                      {/* Rating and Time */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950 px-2 py-1 rounded">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="font-medium">{item.rating}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {item.prepTime} min
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-center justify-between">
                        <p className="font-black text-2xl text-primary tracking-tighter italic">Rs.{item.price}</p>
                        <Button
                          size="sm"
                          className="h-10 px-6 rounded-xl font-black border-none shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          ACQUIRE
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar - Cart Summary */}
          {showCart && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Your Cart</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Your cart is empty
                    </p>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 pb-3 border-b border-border last:border-b-0"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Rs.{item.price} each
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 pt-4 border-t border-border">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium">Rs.{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Delivery Fee</span>
                          <span className="font-medium">Rs.40</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">VAT (13%)</span>
                          <span className="font-medium text-green-600">
                            Rs.{Math.round(cartTotal * 0.13).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold pt-3 border-t border-border text-lg">
                          <span>Total</span>
                          <span className="text-primary">
                            Rs.{(cartTotal + 40 + Math.round(cartTotal * 0.13)).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full mt-4"
                        size="lg"
                        onClick={handleCheckout}
                      >
                        Proceed to Checkout
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {selectedItem.description}
                </p>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {selectedItem.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedItem.prepTime} min
                  </span>
                </div>
              </div>

              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-2xl font-bold">Rs.{selectedItem.price}</p>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  addToCart(selectedItem);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
