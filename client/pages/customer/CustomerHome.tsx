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
  Search,
  LogOut,
  ShoppingCart,
  MapPin,
  Clock,
  Star,
  Plus,
  Minus,
} from "lucide-react";
import { logout } from "@/lib/auth";

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

const mockMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Butter Chicken",
    price: 320,
    category: "Main Course",
    description: "Tender chicken in creamy tomato sauce with aromatic spices",
    rating: 4.8,
    prepTime: 25,
    veg: false,
  },
  {
    id: 2,
    name: "Paneer Tikka Masala",
    price: 280,
    category: "Main Course",
    description: "Grilled paneer in spiced tomato cream sauce",
    rating: 4.7,
    prepTime: 20,
    veg: true,
  },
  {
    id: 3,
    name: "Garlic Naan",
    price: 60,
    category: "Breads",
    description: "Soft naan with garlic and butter",
    rating: 4.9,
    prepTime: 8,
    veg: true,
  },
  {
    id: 4,
    name: "Biryani",
    price: 250,
    category: "Main Course",
    description: "Fragrant rice with meat and aromatic spices",
    rating: 4.6,
    prepTime: 30,
    veg: false,
  },
  {
    id: 5,
    name: "Gulab Jamun",
    price: 120,
    category: "Desserts",
    description: "Sweet milk solids in sugar syrup - homemade specialty",
    rating: 4.8,
    prepTime: 5,
    veg: true,
  },
  {
    id: 6,
    name: "Mango Lassi",
    price: 80,
    category: "Beverages",
    description: "Refreshing mango yogurt drink with cardamom",
    rating: 4.7,
    prepTime: 3,
    veg: true,
  },
  {
    id: 7,
    name: "Dal Makhani",
    price: 200,
    category: "Main Course",
    description: "Slow-cooked lentils in creamy sauce",
    rating: 4.9,
    prepTime: 20,
    veg: true,
  },
  {
    id: 8,
    name: "Tandoori Chicken",
    price: 350,
    category: "Main Course",
    description: "Grilled chicken marinated in yogurt and spices",
    rating: 4.8,
    prepTime: 30,
    veg: false,
  },
  {
    id: 9,
    name: "Samosa",
    price: 40,
    category: "Appetizers",
    description: "Crispy pastry filled with spiced potatoes and peas",
    rating: 4.5,
    prepTime: 10,
    veg: true,
  },
  {
    id: 10,
    name: "Rasgulla",
    price: 100,
    category: "Desserts",
    description: "Soft cheese balls in sugar syrup",
    rating: 4.7,
    prepTime: 5,
    veg: true,
  },
];

export default function CustomerHome() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showCart, setShowCart] = useState(false);

  const categories = [
    "All",
    ...new Set(mockMenuItems.map((item) => item.category)),
  ];

  const filteredItems = mockMenuItems.filter((item) => {
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-xl font-bold">Restaurant Order</h1>
          </div>

          <div className="flex items-center gap-3">
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
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Card */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6 flex items-start gap-4">
            <div>
              <h2 className="font-semibold text-lg mb-2">Welcome to Restaurant</h2>
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  123 Food Street, Mumbai
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Delivery in 30-45 minutes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === cat
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
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardContent className="p-4">
                      {/* Item Header with Badges */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg line-clamp-1">
                            {item.name}
                          </h3>
                        </div>
                        {item.veg ? (
                          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full font-medium flex-shrink-0">
                            🥬 Veg
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-full font-medium flex-shrink-0">
                            🍗 Non-Veg
                          </span>
                        )}
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
                        <p className="font-bold text-xl text-primary">₹{item.price}</p>
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                          Add
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
                                ₹{item.price} each
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
                          <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Delivery Fee</span>
                          <span className="font-medium">₹40</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">VAT (13%)</span>
                          <span className="font-medium text-green-600">
                            ₹{Math.round(cartTotal * 0.13).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold pt-3 border-t border-border text-lg">
                          <span>Total</span>
                          <span className="text-primary">
                            ₹{(cartTotal + 40 + Math.round(cartTotal * 0.13)).toFixed(2)}
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
                <p className="text-2xl font-bold">₹{selectedItem.price}</p>
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
