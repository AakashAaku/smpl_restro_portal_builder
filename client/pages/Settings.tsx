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
} from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);

  return (
    <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your restaurant and system settings
          </p>
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
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-name">Restaurant Name</Label>
                    <Input
                      id="restaurant-name"
                      defaultValue="The Grand Restaurant"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-phone">Contact Phone</Label>
                    <Input
                      id="restaurant-phone"
                      defaultValue="1800-123-4567"
                      type="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-email">Email</Label>
                    <Input
                      id="restaurant-email"
                      defaultValue="info@restaurant.com"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-address">Address</Label>
                    <Input
                      id="restaurant-address"
                      defaultValue="123 Food Street, Mumbai"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opening-hours">Opening Hours</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input defaultValue="11:00 AM" placeholder="Opening time" />
                    <Input
                      defaultValue="11:00 PM"
                      placeholder="Closing time"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="INR">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button>Save Changes</Button>
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
