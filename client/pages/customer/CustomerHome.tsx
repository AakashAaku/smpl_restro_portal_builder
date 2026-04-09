import { useState, useEffect } from "react";
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
  UtensilsCrossed,
  History,
  Calendar
} from "lucide-react";
import { logout } from "@/lib/auth";
import { getMenuItems } from "@/lib/menu";
import { toast } from "sonner";

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
      const mappedData: MenuItem[] = data.map(item => ({
        ...item,
        rating: 4.8 + Math.random() * 0.2,
        veg: true
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
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary p-2 rounded-lg">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  VenzoSmart
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
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
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 hidden sm:flex"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/customer/home")}
              className="gap-2 rounded-md font-medium"
            >
              <UtensilsCrossed className="h-4 w-4" />
              Menu
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/customer/orders")}
              className="gap-2 rounded-md font-medium"
            >
              <History className="h-4 w-4 text-muted-foreground" />
              Orders
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/customer/events")}
              className="gap-2 rounded-md font-medium"
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Book Event
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Banner */}
        <div className="mb-8 rounded-lg overflow-hidden border bg-card relative min-h-[200px] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 to-emerald-800" />
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&q=80')] bg-cover bg-center" />
          <div className="relative z-10 p-8 sm:p-12 text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/20 backdrop-blur-sm border border-white/20 text-xs font-semibold mb-4">
               <Leaf className="h-3 w-3" />
               Pure Veg Certified
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              Fresh Organic Dining
            </h2>
            <p className="text-emerald-50 max-w-md">
              Order your favorite vegetarian crafted meals directly to your table or for takeaway.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Search & Categories */}
          <div className="lg:col-span-1 space-y-4">
            <div className="space-y-4 sticky top-28">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search menu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Categories</p>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === cat
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-muted text-muted-foreground"
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
          <div className="lg:col-span-2 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Menu Items</h2>
              <span className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${filteredItems.length} items`}
              </span>
            </div>
            
            {isLoading ? (
               <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">Loading menu...</div>
            ) : filteredItems.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center border-none">
                  <p className="text-muted-foreground">No items found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className="group cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg line-clamp-1">
                            {item.name}
                          </h3>
                        </div>
                        <div className="bg-primary/10 px-2 py-0.5 rounded text-[10px] font-semibold text-primary shrink-0">
                          Veg
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                        {item.description}
                      </p>

                      <div className="mt-auto pt-4 border-t flex flex-col gap-4">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-medium">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            {(item.rating || 4.5).toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.prepTime}m
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-lg">Rs.{item.price}</p>
                          <Button
                            size="sm"
                            className="h-8 px-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar - Cart Summary */}
          {(showCart || cart.length > 0) && (
            <div className="lg:col-span-1">
               {/* Cart displayed permanently on large screens if items exist, or toggled on mobile */}
              <Card className={`sticky top-28 shadow-sm ${!showCart && 'hidden lg:block'}`}>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base flex justify-between items-center">
                    Your Cart
                    <span className="text-sm font-normal text-muted-foreground">{cartCount} items</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      Your cart is empty
                    </p>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between pb-3 border-b last:border-b-0"
                          >
                            <div className="flex-1 pr-2">
                              <p className="font-medium text-sm leading-tight mb-1">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Rs.{item.price} each
                              </p>
                            </div>
                            <div className="flex items-center gap-1 bg-muted rounded-md shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-5 text-center text-xs font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
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

                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium">Rs.{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Service Fee</span>
                          <span className="font-medium">Rs.40</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">VAT (13%)</span>
                          <span className="font-medium">
                            Rs.{Math.round(cartTotal * 0.13).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold pt-3 border-t text-base">
                          <span>Total</span>
                          <span className="text-primary">
                            Rs.{(cartTotal + 40 + Math.round(cartTotal * 0.13)).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full mt-2"
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex justify-between pr-6">
              {selectedItem?.name}
              <span className="text-primary">Rs.{selectedItem?.price}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6 pt-4">
              <div className="space-y-3">
                <p className="text-sm text-foreground">
                  {selectedItem.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-md font-medium">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    {(selectedItem.rating || 4.5).toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1 border border-border px-2 py-1 rounded-md">
                    <Clock className="h-4 w-4" />
                    {selectedItem.prepTime} min prep
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button
                  className="w-full h-11"
                  onClick={() => {
                    addToCart(selectedItem);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
