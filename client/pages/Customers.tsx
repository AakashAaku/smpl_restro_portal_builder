import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useState } from "react";
import { Plus, Users, Crown, TrendingUp, Star, Gift } from "lucide-react";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  status: "active" | "inactive" | "vip";
  rating: number;
  reviews: number;
  lastOrder: string;
  birthday?: string;
  referrals: number;
}

const mockCustomers: Customer[] = [
  {
    id: 1,
    name: "Rajesh Kumar",
    phone: "9876543210",
    email: "rajesh@email.com",
    totalOrders: 15,
    totalSpent: 8500,
    loyaltyPoints: 850,
    loyaltyTier: "Platinum",
    status: "vip",
    rating: 4.8,
    reviews: 12,
    lastOrder: "2024-01-20",
    birthday: "1985-03-15",
    referrals: 3,
  },
  {
    id: 2,
    name: "Priya Singh",
    phone: "9876543211",
    email: "priya@email.com",
    totalOrders: 8,
    totalSpent: 4200,
    loyaltyPoints: 420,
    loyaltyTier: "Gold",
    status: "active",
    rating: 4.5,
    reviews: 7,
    lastOrder: "2024-01-18",
    birthday: "1990-07-22",
    referrals: 1,
  },
  {
    id: 3,
    name: "Amit Patel",
    phone: "9876543212",
    email: "amit@email.com",
    totalOrders: 3,
    totalSpent: 1800,
    loyaltyPoints: 180,
    loyaltyTier: "Silver",
    status: "active",
    rating: 4.2,
    reviews: 2,
    lastOrder: "2024-01-15",
    referrals: 0,
  },
];

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const vipCount = customers.filter((c) => c.status === "vip").length;
  const totalPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingCustomer(false);
  };

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground mt-2">
              Manage your customer relationships and loyalty programs
            </p>
          </div>
          <Dialog open={isAddingCustomer} onOpenChange={setIsAddingCustomer}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCustomer} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cust-name">Customer Name</Label>
                  <Input id="cust-name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-phone">Phone Number</Label>
                  <Input id="cust-phone" placeholder="9876543210" type="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-email">Email (Optional)</Label>
                  <Input
                    id="cust-email"
                    placeholder="john@email.com"
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-address">Address (Optional)</Label>
                  <Input id="cust-address" placeholder="123 Main Street" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingCustomer(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Customer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold mt-2">{customers.length}</p>
                </div>
                <Users className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">VIP Members</p>
                  <p className="text-2xl font-bold mt-2">{vipCount}</p>
                </div>
                <Crown className="h-6 w-6 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold mt-2">
                    ₹{Math.round(totalRevenue).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Loyalty Points Pool
                  </p>
                  <p className="text-2xl font-bold mt-2">
                    {totalPoints.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-64">
            <Label htmlFor="search" className="mb-2 block">
              Search Customers
            </Label>
            <Input
              id="search"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Label htmlFor="status-filter" className="mb-2 block">
              Filter by Status
            </Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list">All Customers</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty Tiers</TabsTrigger>
            <TabsTrigger value="ratings">Top Rated</TabsTrigger>
            <TabsTrigger value="vip">VIP Members</TabsTrigger>
          </TabsList>

          {/* List Tab */}
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Tier
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Rating
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Orders
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Total Spent
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Points
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer) => (
                        <tr
                          key={customer.id}
                          className="border-b border-border hover:bg-secondary/30 transition-colors"
                        >
                          <td className="py-4 px-4 font-medium">
                            {customer.name}
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {customer.loyaltyTier}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < Math.floor(customer.rating)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {customer.rating}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">{customer.totalOrders}</td>
                          <td className="py-4 px-4">
                            ₹{customer.totalSpent.toLocaleString()}
                          </td>
                          <td className="py-4 px-4">{customer.loyaltyPoints}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loyalty Tiers Tab */}
          <TabsContent value="loyalty" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {[
                { tier: "Bronze", min: 0, color: "bg-amber-100 text-amber-900", icon: "🥉" },
                { tier: "Silver", min: 500, color: "bg-gray-100 text-gray-900", icon: "🥈" },
                { tier: "Gold", min: 2000, color: "bg-yellow-100 text-yellow-900", icon: "🥇" },
                { tier: "Platinum", min: 5000, color: "bg-purple-100 text-purple-900", icon: "💎" },
              ].map((tier) => (
                <Card key={tier.tier}>
                  <CardContent className="pt-6 text-center space-y-2">
                    <p className="text-2xl">{tier.icon}</p>
                    <p className="font-bold text-lg">{tier.tier}</p>
                    <p className="text-xs text-muted-foreground">
                      {tier.min}+ points
                    </p>
                    <div className="text-xs space-y-1 pt-2 border-t">
                      <p>2x Points</p>
                      <p>Birthday Bonus</p>
                      <p>Priority Support</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Customers by Tier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {["Platinum", "Gold", "Silver", "Bronze"].map((tier) => {
                  const tierCustomers = customers.filter(
                    (c) => c.loyaltyTier === tier
                  );
                  return (
                    <div key={tier} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{tier}</span>
                        <span className="text-sm text-muted-foreground">
                          {tierCustomers.length} customer
                          {tierCustomers.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${
                              (tierCustomers.length / customers.length) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customers
                    .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
                    .map((customer) => (
                      <div
                        key={customer.id}
                        className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {customer.loyaltyTier} • {customer.loyaltyPoints} pts
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">Next Tier:</p>
                          <p className="text-muted-foreground">
                            {customer.loyaltyTier === "Platinum"
                              ? "Max Level"
                              : "In Progress"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ratings Tab */}
          <TabsContent value="ratings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Rated Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customers
                    .sort((a, b) => b.rating - a.rating)
                    .map((customer) => (
                      <div
                        key={customer.id}
                        className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-bold">{customer.name}</p>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < Math.floor(customer.rating)
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {customer.rating} rating • {customer.reviews} reviews •{" "}
                            {customer.referrals} referrals
                          </p>
                        </div>
                        <div className="text-right text-sm font-medium">
                          {customer.loyaltyTier}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                    <p className="text-3xl font-bold">
                      {(
                        customers.reduce((sum, c) => sum + c.rating, 0) /
                        customers.length
                      ).toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Reviews
                    </p>
                    <p className="text-3xl font-bold">
                      {customers.reduce((sum, c) => sum + c.reviews, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Referrals
                    </p>
                    <p className="text-3xl font-bold">
                      {customers.reduce((sum, c) => sum + c.referrals, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VIP Tab */}
          <TabsContent value="vip">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers
                .filter((c) => c.status === "vip")
                .map((customer) => (
                  <Card key={customer.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-lg">
                            {customer.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {customer.phone}
                          </p>
                        </div>
                        <Crown className="h-5 w-5 text-amber-500" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Total Orders
                          </p>
                          <p className="font-semibold text-lg">
                            {customer.totalOrders}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Total Spent
                          </p>
                          <p className="font-semibold text-lg">
                            ₹{customer.totalSpent}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Loyalty Points
                        </p>
                        <p className="font-bold text-primary">
                          {customer.loyaltyPoints} pts
                        </p>
                      </div>

                      <Button variant="outline" className="w-full mt-4">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
}
