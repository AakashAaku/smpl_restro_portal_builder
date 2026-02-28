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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Bell,
  Zap,
  Lock,
  Download,
  ToggleRight,
  Loader2,
  Leaf,
  Sparkles,
  ShieldCheck,
  Globe,
  Store,
  MapPin,
  UtensilsCrossed
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings, Setting } from "@/lib/settings-api";
import { toast } from "sonner";

export default function Settings() {
  const queryClient = useQueryClient();
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const mutation = useMutation({
    mutationFn: (newSettings: Partial<Setting>) => updateSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });

  const [formData, setFormData] = useState<Partial<Setting>>({});

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) {
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
              VenzoSmart • Global Configuration
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-sidebar-foreground">
            System <span className="text-primary italic">Settings</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic">
            "Fine-tuning the Organic Architecture"
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="pwa">PWA & Offline</TabsTrigger>
        </TabsList>

        {/* Business Settings */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-name">Restaurant Name</Label>
                    <Input
                      id="restaurant-name"
                      value={formData.restaurantName || ""}
                      onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-phone">Contact Phone</Label>
                    <Input
                      id="restaurant-phone"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      type="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-email">Email</Label>
                    <Input
                      id="restaurant-email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax-percentage">Tax Percentage (%)</Label>
                    <Input
                      id="tax-percentage"
                      type="number"
                      step="0.1"
                      value={formData.taxPercentage || 0}
                      onChange={(e) => setFormData({ ...formData, taxPercentage: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="restaurant-address">Address</Label>
                    <Input
                      id="restaurant-address"
                      value={formData.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer-note">Receipt Footer Note</Label>
                  <Input
                    id="footer-note"
                    value={formData.footerNote || ""}
                    onChange={(e) => setFormData({ ...formData, footerNote: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Operational Currency</Label>
                  <Select
                    value={formData.currency || "NPR"}
                    onValueChange={(val) => setFormData({ ...formData, currency: val, currencySymbol: "Rs." })}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NPR">Nepalese Rupee (Rs.)</SelectItem>
                      <SelectItem value="INR">Indian Rupee (Rs.)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietary-commitment">Dietary Commitment</Label>
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Leaf className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-emerald-950 uppercase tracking-tight">110% Pure Veg & Eggless</p>
                      <p className="text-xs text-emerald-700 font-medium italic">Strictly Vegetarian & Organic Protocol Active</p>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={mutation.isPending} className="h-12 px-8 rounded-xl font-bold border-none shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-[1.02]">
                  {mutation.isPending ? "SYNCING..." : "DEPLOY CHANGES"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Gateway Integration
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setPaymentEnabled(!paymentEnabled)}
                >
                  <ToggleRight className="h-5 w-5 mr-2" />
                  {paymentEnabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-900">Stripe Integration</p>
                <p className="text-sm text-blue-800 mt-2">
                  Accept card payments, UPI, and digital wallets through Stripe
                </p>
              </div>

              {paymentEnabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="stripe-key">Stripe Public Key</Label>
                    <Input
                      id="stripe-key"
                      placeholder="pk_test_..."
                      type="password"
                    />
                    <p className="text-xs text-muted-foreground">
                      Found in your Stripe dashboard settings
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
                    <Input
                      id="stripe-secret"
                      placeholder="sk_test_..."
                      type="password"
                    />
                    <p className="text-xs text-muted-foreground">
                      Keep this key safe and never share it
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      disabled
                      value="https://yourdomain.com/api/webhooks/stripe"
                    />
                  </div>
                </>
              )}

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                <p className="font-medium">Supported Payment Methods:</p>
                <ul className="text-sm space-y-2">
                  <li>✓ Credit & Debit Cards</li>
                  <li>✓ UPI (Razorpay, PhonePe)</li>
                  <li>✓ Digital Wallets (Apple Pay, Google Pay)</li>
                  <li>✓ Net Banking</li>
                  <li>✓ Cash on Delivery</li>
                </ul>
              </div>

              <Button>Test Connection</Button>
              <Button variant="outline">Save Payment Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications & Real-Time Updates
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                >
                  <ToggleRight className="h-5 w-5 mr-2" />
                  {notificationsEnabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {notificationsEnabled && (
                <>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-medium text-green-900">
                      Real-Time Order Updates
                    </p>
                    <p className="text-sm text-green-800 mt-2">
                      Get instant notifications for new orders, status changes, and
                      customer requests using Socket.io
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">New Orders</p>
                        <p className="text-sm text-muted-foreground">
                          Notify when new order is placed
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-5 w-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Order Status Updates</p>
                        <p className="text-sm text-muted-foreground">
                          Notify when order status changes
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-5 w-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Inventory Alerts</p>
                        <p className="text-sm text-muted-foreground">
                          Notify when stock is low
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-5 w-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Payment Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Notify when payment is received
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-5 w-5"
                      />
                    </div>
                  </div>
                </>
              )}

              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PWA & Offline */}
        <TabsContent value="pwa" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Progressive Web App & Offline Mode
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setOfflineMode(!offlineMode)}
                >
                  <ToggleRight className="h-5 w-5 mr-2" />
                  {offlineMode ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="font-medium text-purple-900">
                  Install as App & Offline Access
                </p>
                <p className="text-sm text-purple-800 mt-2">
                  This app works offline and can be installed on your device for
                  quick access
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Service Worker</p>
                      <p className="text-sm text-muted-foreground">
                        Enable caching and offline functionality
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">IndexedDB Storage</p>
                      <p className="text-sm text-muted-foreground">
                        Store orders, menu, and customer data offline
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts even when app is closed
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-5 w-5"
                    />
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Background Sync</p>
                      <p className="text-sm text-muted-foreground">
                        Sync orders and data when reconnected
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-5 w-5"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="font-medium text-sm mb-3">Installation:</p>
                <p className="text-sm text-muted-foreground mb-3">
                  On mobile/tablet: Look for "Add to Home Screen" in your browser
                  menu. On desktop: Click the install icon in the address bar.
                </p>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  View Installation Guide
                </Button>
              </div>

              <Button>Save PWA Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
