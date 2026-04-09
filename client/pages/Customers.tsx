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
import { useState, useEffect } from "react";
import { Plus, Users, Crown, TrendingUp, Star, Leaf, Sparkles, ChevronRight, Search, Filter, ShieldCheck, Heart } from "lucide-react";
import {
  Customer,
  getCustomers,
  createCustomer,
  getCustomerStats
} from "@/lib/customer-api";
import { toast } from "sonner";
import { AdminHeader } from "@/components/layout/AdminHeader";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cusData, statsData] = await Promise.all([
        getCustomers(),
        getCustomerStats()
      ]);
      setCustomers(cusData);
      setStats(statsData);
    } catch (error) {
      toast.error("Failed to load customer data");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomer(customerForm);
      toast.success("Customer added successfully");
      setIsAddingCustomer(false);
      loadData();
      setCustomerForm({ name: "", phone: "", email: "", address: "" });
    } catch (error) {
      toast.error("Failed to add customer");
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader 
        title="Customer CRM" 
        subtitle="Manage customer relationships and loyalty programs"
        actions={
          <Dialog open={isAddingCustomer} onOpenChange={setIsAddingCustomer}>
            <DialogTrigger asChild>
              <Button className="font-bold gap-2">
                <Plus className="h-4 w-4" />
                REGISTER NEW PATRON
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input
                    required
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      required
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email (Optional)</Label>
                    <Input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address (Optional)</Label>
                  <Input
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">Register Customer</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Total Patrons</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">VIP Members</p>
                <p className="text-2xl font-bold text-amber-600">{stats?.vipCount || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Crown className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-700">
                  Rs.{stats?.totalRevenue?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Loyalty Points</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.totalLoyaltyPoints?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Star className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex gap-4 items-end flex-wrap">
        <div className="flex-1 min-w-64">
          <Label htmlFor="search" className="mb-2 block">Search Customers</Label>
          <Input
            id="search"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Label htmlFor="status-filter" className="mb-2 block">Filter by Status</Label>
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">All Customers</TabsTrigger>
          <TabsTrigger value="vip">VIP Members</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-sm">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Tier</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Spent</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-sidebar-border/30 hover:bg-emerald-50/30 transition-colors group">
                        <td className="py-4 px-4 font-bold text-emerald-950">{customer.name}</td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">
                            {customer.loyaltyTier}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-medium text-muted-foreground">{customer.phone}</td>
                        <td className="py-4 px-4 font-black text-emerald-900">Rs.{customer.totalSpent.toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 font-bold text-purple-700">
                            <Star className="h-3.5 w-3.5 fill-purple-700/20" />
                            {customer.loyaltyPoints}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vip">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers
              .filter((c) => c.status === "vip")
              .map((customer) => (
                <Card key={customer.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-lg">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      </div>
                      <Crown className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Orders</p>
                        <p className="font-semibold">{customer.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Spent</p>
                        <p className="font-semibold">₹{customer.totalSpent}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
