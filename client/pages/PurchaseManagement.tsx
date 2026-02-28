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
import { Plus, TrendingUp, DollarSign, Package, Calendar, Loader2, Leaf, History, Sparkles, Filter } from "lucide-react";
import { toast } from "sonner";
import {
  getPurchases,
  recordPurchase,
  getPurchaseStats,
  type Purchase
} from "@/lib/purchase-api";
import {
  getIngredients,
  type Ingredient
} from "@/lib/inventory-api";

export default function PurchaseManagement() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [formData, setFormData] = useState({
    quantity: "",
    unitPrice: "",
    supplier: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    invoiceNo: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ingData, purData, statsData] = await Promise.all([
        getIngredients(),
        getPurchases(),
        getPurchaseStats()
      ]);
      setIngredients(ingData);
      setPurchases(purData);
      setStats(statsData);
    } catch (error) {
      toast.error("Failed to load purchase data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedIngredient || !formData.quantity || !formData.unitPrice || !formData.supplier) {
      toast.error("Please fill in all required fields");
      return;
    }

    const ingredient = ingredients.find((i) => i.id.toString() === selectedIngredient);
    if (!ingredient) return;

    try {
      await recordPurchase({
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        quantity: parseFloat(formData.quantity),
        unit: ingredient.unit,
        unitPrice: parseFloat(formData.unitPrice),
        totalCost: parseFloat(formData.quantity) * parseFloat(formData.unitPrice),
        supplier: formData.supplier,
        purchaseDate: formData.purchaseDate,
        expiryDate: formData.expiryDate || undefined,
        invoiceNo: formData.invoiceNo || undefined,
        notes: formData.notes || undefined,
      });

      toast.success("Purchase recorded successfully");
      setIsAddingPurchase(false);

      // Reset form
      setFormData({
        quantity: "",
        unitPrice: "",
        supplier: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
        invoiceNo: "",
        notes: "",
      });
      setSelectedIngredient("");
      loadData();
    } catch (error) {
      toast.error("Failed to record purchase");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPurchases = purchases.length;
  const totalCost = purchases.reduce((sum, p) => sum + p.totalCost, 0);
  const todayPurchases = purchases.filter(
    (p) => new Date(p.purchaseDate).toDateString() === new Date().toDateString()
  ).length;
  const uniqueSuppliers = new Set(purchases.map((p) => p.supplier)).size;

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
              VenzoSmart • Procurement & SCM
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-sidebar-foreground">
            Inventory <span className="text-primary italic">Inbound</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic">
            "Sourcing Freshness, Daily"
          </p>
        </div>
        <Dialog open={isAddingPurchase} onOpenChange={setIsAddingPurchase}>
          <DialogTrigger asChild>
            <Button className="h-12 px-8 rounded-xl font-bold border-none shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-[1.02]">
              <Plus className="h-5 w-5" />
              NEW PROCUREMENT
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record New Purchase</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPurchase} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="material">Raw Material *</Label>
                <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select raw material" />
                  </SelectTrigger>
                  <SelectContent>
                    {ingredients.map((ingredient) => (
                      <SelectItem key={ingredient.id} value={ingredient.id.toString()}>
                        {ingredient.name} ({ingredient.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price (Rs.) *</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, unitPrice: e.target.value })
                    }
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier *</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                  placeholder="Supplier name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date *</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchaseDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNo">Invoice No.</Label>
                <Input
                  id="invoiceNo"
                  value={formData.invoiceNo}
                  onChange={(e) =>
                    setFormData({ ...formData, invoiceNo: e.target.value })
                  }
                  placeholder="INV-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional notes"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingPurchase(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Record Purchase</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="premium-card border-none shadow-lg overflow-hidden group">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Total Procurement</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground">{stats?.totalPurchases || totalPurchases}</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Lifetime records
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Total Expenditure</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground">
                  Rs.{Math.round(stats?.totalCost || totalCost).toLocaleString()}
                </p>
                <p className="text-[10px] text-rose-600 font-bold mt-2">Inventory investment</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Today's Inflow</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground">{stats?.todayPurchases || todayPurchases}</p>
                <p className="text-[10px] text-blue-600 font-bold mt-2">Active batches</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Active Suppliers</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground">{stats?.uniqueSuppliers || uniqueSuppliers}</p>
                <p className="text-[10px] text-amber-600 font-bold mt-2">Verified partners</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                <History className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-emerald-50/50 p-1 h-12 rounded-xl max-w-md">
          <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Purchase History</TabsTrigger>
          <TabsTrigger value="byMaterial" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Analytics By Item</TabsTrigger>
        </TabsList>

        {/* All Purchases Tab */}
        <TabsContent value="all" className="space-y-4 pt-4">
          <Card className="premium-card border-none shadow-xl overflow-hidden">
            <CardHeader className="border-b border-sidebar-border/50 bg-emerald-50/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-extrabold tracking-tight">Purchase Logs</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg font-bold gap-2 bg-white/50 border border-emerald-100 px-3">
                    <Filter className="h-3 w-3" />
                    Filter
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg font-bold gap-2 bg-white/50 border border-emerald-100 px-3">
                    <Sparkles className="h-3 w-3" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {purchases.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No purchases recorded yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">Material</th>
                        <th className="text-left py-3 px-4 font-medium">Quantity</th>
                        <th className="text-left py-3 px-4 font-medium">Unit Price</th>
                        <th className="text-left py-3 px-4 font-medium">Total Cost</th>
                        <th className="text-left py-3 px-4 font-medium">Supplier</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Expiry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...purchases].reverse().map((purchase) => (
                        <tr
                          key={purchase.id}
                          className="border-b border-sidebar-border/30 hover:bg-emerald-50/30 transition-colors group"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center font-black text-[10px] text-emerald-600 border border-emerald-100">
                                {purchase.ingredientName.charAt(0)}
                              </div>
                              <span className="font-bold text-emerald-950">{purchase.ingredientName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-medium text-muted-foreground">
                            {purchase.quantity} {purchase.unit}
                          </td>
                          <td className="py-4 px-4 font-bold text-emerald-800">Rs.{purchase.unitPrice.toFixed(0)}</td>
                          <td className="py-4 px-4 border-none">
                            <span className="font-black text-emerald-950 text-base">Rs.{purchase.totalCost.toFixed(0)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200 uppercase tracking-tight">
                              {purchase.supplier}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-xs font-medium text-muted-foreground">
                            {new Date(purchase.purchaseDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="py-4 px-4">
                            {purchase.expiryDate ? (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-100">
                                {new Date(purchase.expiryDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-muted-foreground/40">NO EXPIRY</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Material Tab */}
        <TabsContent value="byMaterial" className="space-y-4">
          {ingredients.map((ingredient) => {
            const ingredientPurchases = purchases.filter(p => p.ingredientId === ingredient.id);
            const totalQuantity = ingredientPurchases.reduce(
              (sum, p) => sum + p.quantity,
              0
            );
            const avgPrice =
              ingredientPurchases.length > 0
                ? ingredientPurchases.reduce((sum, p) => sum + p.unitPrice, 0) /
                ingredientPurchases.length
                : 0;
            const totalSpent = ingredientPurchases.reduce(
              (sum, p) => sum + p.totalCost,
              0
            );

            if (ingredientPurchases.length === 0) return null;

            return (
              <Card key={ingredient.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{ingredient.name}</CardTitle>
                  <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Purchased</p>
                      <p className="font-semibold">
                        {totalQuantity} {ingredient.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Price</p>
                      <p className="font-semibold">Rs.{avgPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Spent</p>
                      <p className="font-semibold">Rs.{totalSpent.toFixed(2)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-4 font-medium">Supplier</th>
                          <th className="text-left py-2 px-4 font-medium">Quantity</th>
                          <th className="text-left py-2 px-4 font-medium">Price</th>
                          <th className="text-left py-2 px-4 font-medium">Total</th>
                          <th className="text-left py-2 px-4 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ingredientPurchases.map((purchase) => (
                          <tr
                            key={purchase.id}
                            className="border-b border-border"
                          >
                            <td className="py-2 px-4">{purchase.supplier}</td>
                            <td className="py-2 px-4">
                              {purchase.quantity} {purchase.unit}
                            </td>
                            <td className="py-2 px-4">
                              Rs.{purchase.unitPrice.toFixed(2)}
                            </td>
                            <td className="py-2 px-4 font-semibold">
                              Rs.{purchase.totalCost.toFixed(2)}
                            </td>
                            <td className="py-2 px-4">
                              {new Date(purchase.purchaseDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
