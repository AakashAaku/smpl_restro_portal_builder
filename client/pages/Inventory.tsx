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
import { useState, useEffect, Fragment } from "react";
import {
  Plus,
  Search,
  AlertCircle,
  Package,
  TrendingUp,
  CheckCircle,
  Box,
  Truck,
  History,
  AlertTriangle,
  TrendingDown
} from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import {
  Ingredient,
  Supplier,
  getIngredients,
  getSuppliers,
  createIngredient,
  createSupplier,
  recordStockMovement,
  getInventoryStats,
  getStockMovements
} from "@/lib/inventory-api";
import { toast } from "sonner";
import { isAdmin } from "@/lib/auth";

export default function Inventory() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [isRecordingWaste, setIsRecordingWaste] = useState(false);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const adminUser = isAdmin();

  // Form states
  const [ingredientForm, setIngredientForm] = useState<Omit<Ingredient, "id">>({
    name: "",
    unit: "kg",
    currentStock: 0,
    minStock: 5,
    unitPrice: 0,
    supplierId: undefined,
  });

  const [wasteForm, setWasteForm] = useState({
    ingredientId: "",
    quantity: "",
    reason: "damaged",
    notes: "",
  });

  const [supplierForm, setSupplierForm] = useState<Omit<Supplier, "id">>({
    name: "",
    contact: "",
    email: "",
    address: "",
    paymentTerms: "Net 30",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ingData, supData, statsData] = await Promise.all([
        getIngredients(),
        getSuppliers(),
        getInventoryStats()
      ]);
      setIngredients(ingData);
      setSuppliers(supData);
      setStats(statsData);
    } catch (error) {
      toast.error("Failed to load inventory data");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredIngredients = ingredients.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRow = async (id: number) => {
    if (expandedRow === id) {
      setExpandedRow(null);
      return;
    }
    setExpandedRow(id);
    setIsLoadingHistory(true);
    try {
      const history = await getStockMovements(id);
      setHistoryData(history);
    } catch (error) {
      toast.error("Failed to load history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createIngredient({
        ...ingredientForm,
        currentStock: parseFloat(ingredientForm.currentStock.toString()),
        minStock: parseFloat(ingredientForm.minStock.toString()),
        unitPrice: parseFloat(ingredientForm.unitPrice.toString()),
      });
      toast.success("Ingredient added successfully");
      setIsAddingIngredient(false);
      loadData();
      resetIngredientForm();
    } catch (error) {
      toast.error("Failed to add ingredient");
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSupplier(supplierForm);
      toast.success("Supplier added successfully");
      setIsAddingSupplier(false);
      loadData();
      resetSupplierForm();
    } catch (error) {
      toast.error("Failed to add supplier");
    }
  };

  const handleRecordWaste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteForm.ingredientId || !wasteForm.quantity) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await recordStockMovement({
        ingredientId: parseInt(wasteForm.ingredientId),
        type: "OUT",
        quantity: parseFloat(wasteForm.quantity),
        reason: `Waste Recording - ${wasteForm.reason}: ${wasteForm.notes}`
      });
      toast.success("Waste recorded successfully");
      setIsRecordingWaste(false);
      loadData();
      setWasteForm({ ingredientId: "", quantity: "", reason: "damaged", notes: "" });
    } catch (error) {
      toast.error("Failed to record waste");
    }
  };

  const resetIngredientForm = () => {
    setIngredientForm({
      name: "",
      unit: "kg",
      currentStock: 0,
      minStock: 5,
      unitPrice: 0,
    });
  };

  const resetSupplierForm = () => {
    setSupplierForm({
      name: "",
      contact: "",
      email: "",
      address: "",
      paymentTerms: "Net 30",
    });
  };

  return (
    <div className="space-y-6">
      <AdminHeader 
        title="Inventory Control" 
        subtitle="Manage materials, stock levels, and vendors"
        actions={
          adminUser && (
            <div className="flex gap-2">
              <Button variant="outline" className="font-bold gap-2" onClick={() => setIsRecordingWaste(true)}>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                RECORD WASTE
              </Button>
              <Button className="font-bold gap-2" onClick={() => setIsAddingIngredient(true)}>
                <Plus className="h-4 w-4" />
                ADD MATERIAL
              </Button>
            </div>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Stock Value</p>
                <p className="text-2xl font-bold">Rs.{stats?.totalInventoryValue?.toLocaleString() || "0"}</p>
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
                <p className="text-xs font-semibold text-muted-foreground mb-1">Active Items</p>
                <p className="text-2xl font-bold">{stats?.itemCount || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Low Stock</p>
                <p className="text-2xl font-bold text-rose-600">{stats?.lowStockCount || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Monthly Loss</p>
                <p className="text-2xl font-bold text-amber-600">Rs.{stats?.monthlyWaste || "0"}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ingredients" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
          <TabsTrigger value="ingredients" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-2 pb-2 h-auto font-bold">Ingredients</TabsTrigger>
          <TabsTrigger value="suppliers" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-2 pb-2 h-auto font-bold">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients" className="space-y-4 pt-4">
          <div className="flex justify-between items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Find materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </div>

          <Card className="border shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="text-left py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Material Name</th>
                      <th className="text-right py-3 px-4 font-bold uppercase tracking-wider text-[10px]">In Stock</th>
                      <th className="text-right py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Min Level</th>
                      <th className="text-right py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Price</th>
                      <th className="text-center py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredIngredients.map((item) => (
                      <Fragment key={item.id}>
                        <tr 
                          className="hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => toggleRow(item.id)}
                        >
                          <td className="py-3 px-4 font-medium">{item.name}</td>
                          <td className="py-3 px-4 text-right">{item.currentStock} {item.unit}</td>
                          <td className="py-3 px-4 text-right text-muted-foreground">{item.minStock} {item.unit}</td>
                          <td className="py-3 px-4 text-right">Rs.{item.unitPrice}</td>
                          <td className="py-3 px-4 text-center">
                            {item.currentStock <= item.minStock ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 uppercase">Low Stock</span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">Healthy</span>
                            )}
                          </td>
                        </tr>
                        {expandedRow === item.id && (
                          <tr className="bg-muted/10">
                            <td colSpan={5} className="p-4 border-b border-t shadow-inner">
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold flex items-center gap-2"><History className="h-4 w-4 text-muted-foreground"/> Stock History</h4>
                                {isLoadingHistory ? (
                                  <div className="text-sm text-muted-foreground py-2 text-center animate-pulse">Loading history...</div>
                                ) : historyData.length === 0 ? (
                                  <div className="text-sm text-muted-foreground py-2 text-center">No history available</div>
                                ) : (
                                  <div className="overflow-hidden rounded-md border bg-background">
                                    <table className="w-full text-xs">
                                      <thead className="bg-muted/40 text-muted-foreground">
                                        <tr>
                                          <th className="text-left py-2 px-3 font-medium">Date</th>
                                          <th className="text-left py-2 px-3 font-medium">Type</th>
                                          <th className="text-right py-2 px-3 font-medium">Quantity</th>
                                          <th className="text-left py-2 px-3 font-medium">Reason</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y">
                                        {historyData.map(record => (
                                          <tr key={record.id} className="hover:bg-muted/30">
                                            <td className="py-2 px-3 whitespace-nowrap text-muted-foreground">
                                              {new Date(record.date).toLocaleDateString()} {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className={`py-2 px-3 font-semibold ${record.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                              {record.type}
                                            </td>
                                            <td className="py-2 px-3 text-right font-medium">
                                              {record.type === 'IN' ? '+' : '-'}{record.quantity} {item.unit}
                                            </td>
                                            <td className="py-2 px-3 text-muted-foreground">{record.reason || '-'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Verified Vendors</h3>
            {adminUser && <Button size="sm" onClick={() => setIsAddingSupplier(true)}>Add Supplier</Button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppliers.map((sup) => (
              <Card key={sup.id} className="border shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base font-bold">{sup.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="h-3.5 w-3.5" />
                    <span>{sup.contact || "No contact info"}</span>
                  </div>
                  <p className="truncate">{sup.address || "No address provided"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={isAddingIngredient} onOpenChange={setIsAddingIngredient}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Raw Material</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddIngredient} className="space-y-4">
            <div className="space-y-2">
              <Label>Material Name</Label>
              <Input
                required
                value={ingredientForm.name}
                onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input
                  required
                  value={ingredientForm.unit}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, unit: e.target.value })}
                  placeholder="kg, ltr, pcs..."
                />
              </div>
              <div className="space-y-2">
                <Label>Unit Price (Rs.)</Label>
                <Input
                  type="number"
                  required
                  value={ingredientForm.unitPrice}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, unitPrice: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Stock</Label>
                <Input
                  type="number"
                  required
                  value={ingredientForm.currentStock}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, currentStock: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Minimum Stock</Label>
                <Input
                  type="number"
                  required
                  value={ingredientForm.minStock}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, minStock: Number(e.target.value) })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">Save Material</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRecordingWaste} onOpenChange={setIsRecordingWaste}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Waste Recording</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRecordWaste} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Material</Label>
              <Select onValueChange={(val) => setWasteForm({ ...wasteForm, ingredientId: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ingredient" />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map(ing => (
                    <SelectItem key={ing.id} value={ing.id.toString()}>{ing.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity to Deduct</Label>
              <Input
                type="number"
                required
                value={wasteForm.quantity}
                onChange={(e) => setWasteForm({ ...wasteForm, quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select onValueChange={(val) => setWasteForm({ ...wasteForm, reason: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="damaged">Damage / Spillage</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="quality">Quality Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" variant="destructive" className="w-full">Confirm Deduction</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddingSupplier} onOpenChange={setIsAddingSupplier}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Vendor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSupplier} className="space-y-4">
            <div className="space-y-2">
              <Label>Vendor Name</Label>
              <Input
                required
                value={supplierForm.name}
                onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  required
                  value={supplierForm.contact}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contact: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={supplierForm.address}
                onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full">Add Vendor</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
