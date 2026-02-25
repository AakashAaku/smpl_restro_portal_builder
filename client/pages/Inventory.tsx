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
import {
  Plus,
  Search,
  AlertTriangle,
  TrendingDown,
  Package,
  TrendingUp,
} from "lucide-react";
import {
  Ingredient,
  Supplier,
  getIngredients,
  getSuppliers,
  createIngredient,
  createSupplier,
  recordStockMovement,
  getInventoryStats
} from "@/lib/inventory-api";
import { toast } from "sonner";

export default function Inventory() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [isRecordingWaste, setIsRecordingWaste] = useState(false);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [ingredientForm, setIngredientForm] = useState<Omit<Ingredient, "id">>({
    name: "",
    unit: "kg",
    currentStock: 0,
    reorderLevel: 5,
    costPerUnit: 0,
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

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createIngredient({
        ...ingredientForm,
        currentStock: parseFloat(ingredientForm.currentStock.toString()),
        reorderLevel: parseFloat(ingredientForm.reorderLevel.toString()),
        costPerUnit: parseFloat(ingredientForm.costPerUnit.toString()),
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
        type: wasteForm.reason === "damaged" ? "damage" : "out",
        quantity: parseFloat(wasteForm.quantity),
        reference: "Waste Recording",
        notes: wasteForm.notes
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
      reorderLevel: 5,
      costPerUnit: 0,
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground mt-2">
            Track stock levels, waste, and supplier performance
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isRecordingWaste} onOpenChange={setIsRecordingWaste}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Record Waste
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Food Waste</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRecordWaste} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ingredient">Ingredient</Label>
                  <Select value={wasteForm.ingredientId} onValueChange={(val) => setWasteForm({ ...wasteForm, ingredientId: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ingredient" />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredients.map((ing) => (
                        <SelectItem key={ing.id} value={ing.id.toString()}>
                          {ing.name} ({ing.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waste-qty">Quantity</Label>
                  <Input
                    id="waste-qty"
                    type="number"
                    placeholder="0.00"
                    value={wasteForm.quantity}
                    onChange={(e) => setWasteForm({ ...wasteForm, quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Select value={wasteForm.reason} onValueChange={(val) => setWasteForm({ ...wasteForm, reason: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damaged">Damage/Spillage</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="quality">Quality Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waste-notes">Notes</Label>
                  <Input
                    id="waste-notes"
                    placeholder="Additional details..."
                    value={wasteForm.notes}
                    onChange={(e) => setWasteForm({ ...wasteForm, notes: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">Submit Waste Record</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddingIngredient} onOpenChange={setIsAddingIngredient}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Ingredient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Ingredient</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddIngredient} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ing-name">Ingredient Name</Label>
                  <Input
                    id="ing-name"
                    required
                    value={ingredientForm.name}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ing-unit">Unit</Label>
                    <Select value={ingredientForm.unit} onValueChange={(val) => setIngredientForm({ ...ingredientForm, unit: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="liters">Liters (l)</SelectItem>
                        <SelectItem value="pieces">Pieces (pcs)</SelectItem>
                        <SelectItem value="packs">Packs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ing-stock">Current Stock</Label>
                    <Input
                      id="ing-stock"
                      type="number"
                      required
                      value={ingredientForm.currentStock}
                      onChange={(e) => setIngredientForm({ ...ingredientForm, currentStock: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ing-reorder">Reorder Level</Label>
                    <Input
                      id="ing-reorder"
                      type="number"
                      required
                      value={ingredientForm.reorderLevel}
                      onChange={(e) => setIngredientForm({ ...ingredientForm, reorderLevel: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ing-cost">Cost per Unit</Label>
                    <Input
                      id="ing-cost"
                      type="number"
                      required
                      value={ingredientForm.costPerUnit}
                      onChange={(e) => setIngredientForm({ ...ingredientForm, costPerUnit: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ing-supplier">Default Supplier</Label>
                  <Select value={ingredientForm.supplierId?.toString()} onValueChange={(val) => setIngredientForm({ ...ingredientForm, supplierId: parseInt(val) })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((sup) => (
                        <SelectItem key={sup.id} value={sup.id.toString()}>{sup.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Add Ingredient</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold mt-2">₹{stats?.totalInventoryValue?.toLocaleString() || "0"}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold mt-2">{stats?.itemCount || 0}</p>
              </div>
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold mt-2">{stats?.lowStockCount || 0}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Waste</p>
                <p className="text-2xl font-bold mt-2">₹{stats?.monthlyWaste || "0"}</p>
              </div>
              <TrendingDown className="h-6 w-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ingredients" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="expiry">Stock Status</TabsTrigger>
          <TabsTrigger value="waste">Waste Management</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-sm">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Stock</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Unit</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Reorder Level</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIngredients.map((item) => (
                      <tr key={item.id} className="border-b border-border">
                        <td className="py-4 px-4 font-medium">{item.name}</td>
                        <td className="py-4 px-4">{item.currentStock}</td>
                        <td className="py-4 px-4">{item.unit}</td>
                        <td className="py-4 px-4">{item.reorderLevel}</td>
                        <td className="py-4 px-4">
                          {item.currentStock <= item.reorderLevel ? (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Low Stock</span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Healthy</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Vendor List</h3>
            <Dialog open={isAddingSupplier} onOpenChange={setIsAddingSupplier}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => resetSupplierForm()}>Add Supplier</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddSupplier} className="space-y-4">
                  <div>
                    <Label htmlFor="sup-name">Company Name</Label>
                    <Input
                      id="sup-name"
                      required
                      value={supplierForm.name}
                      onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sup-contact">Contact Person</Label>
                      <Input
                        id="sup-contact"
                        required
                        value={supplierForm.contact}
                        onChange={(e) => setSupplierForm({ ...supplierForm, contact: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sup-email">Email</Label>
                      <Input
                        id="sup-email"
                        type="email"
                        required
                        value={supplierForm.email}
                        onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="sup-address">Address</Label>
                    <Input
                      id="sup-address"
                      value={supplierForm.address}
                      onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">Register Supplier</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((sup) => (
              <Card key={sup.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{sup.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p><strong>Contact:</strong> {sup.contact}</p>
                  <p><strong>Email:</strong> {sup.email}</p>
                  <p><strong>Address:</strong> {sup.address}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
