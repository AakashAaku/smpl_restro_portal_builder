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
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown, DollarSign, Package, Calendar, Loader2, Leaf, History, Sparkles, Filter, Edit2, Trash2, Send, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getPurchases,
  recordPurchase,
  updatePurchase,
  deletePurchase,
  returnPurchase,
  getPurchaseStats,
  type Purchase
} from "@/lib/purchase-api";
import {
  getIngredients,
  type Ingredient
} from "@/lib/inventory-api";
import { getRequisitions, Requisition as RequisitionType } from "@/lib/requisitions-api";

export default function PurchaseManagement() {
  const [searchParams] = useSearchParams();
  const requisitionIdString = searchParams.get("requisitionId");
  const requisitionId = requisitionIdString ? parseInt(requisitionIdString) : undefined;
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [requisitions, setRequisitions] = useState<RequisitionType[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);
  const [isEditingPurchase, setIsEditingPurchase] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Requisition selection
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string>("");

  // Multi-item support
  const [purchaseItems, setPurchaseItems] = useState<{
    ingredientId: string;
    ingredientName: string;
    unit: string;
    quantity: string;
    unitPrice: string;
  }[]>([]);

  const [formData, setFormData] = useState({
    supplier: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    invoiceNo: "",
    notes: "",
    paymentMethod: "cash",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (requisitionId && ingredients.length > 0) {
      handleRequisitionPreFill();
    }
  }, [requisitionId, ingredients]);

  const handleRequisitionPreFill = async (id?: number) => {
    const targetId = id || requisitionId;
    if (!targetId) return;

    try {
      const data = await getRequisitions();
      const req = data.find(r => r.id === targetId);
      if (req && req.items.length > 0) {
        setPurchaseItems(req.items.map(item => ({
          ingredientId: item.ingredientId.toString(),
          ingredientName: item.ingredient.name,
          unit: item.ingredient.unit,
          quantity: item.quantity.toString(),
          unitPrice: (item.ingredient.unitPrice || 0).toString()
        })));

        setSelectedRequisitionId(req.id.toString());
        setFormData(prev => ({
          ...prev,
          notes: `From ${req.requisitionNo}: ${req.notes || "No notes provided"}`
        }));
        setIsAddingPurchase(true);
      }
    } catch (error) {
      console.error("Failed to fetch requisition for pre-fill", error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ingData, purData, statsData, reqData] = await Promise.all([
        getIngredients(),
        getPurchases(),
        getPurchaseStats(),
        getRequisitions()
      ]);
      setIngredients(ingData);
      setPurchases(purData);
      setStats(statsData);
      setRequisitions(reqData.filter(r => r.status === 'approved' || r.status === 'pending'));
    } catch (error) {
      toast.error("Failed to load purchase data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePurchase = async (id: string, status: string) => {
    if (status === "completed") {
      toast.error("Completed purchases cannot be deleted. Please use 'Return' to reverse stock.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this purchase? This will reverse the stock increment.")) return;
    try {
      await deletePurchase(id);
      toast.success("Purchase deleted and stock reversed");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.details || "Failed to delete purchase");
    }
  };

  const handleReturnPurchase = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to return the purchase for ${name}? This will reverse the stock inflow.`)) return;

    try {
      await returnPurchase(id);
      toast.success("Purchase returned and stock reversed");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.details || "Failed to return purchase");
    }
  };

  const handleUpdatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || purchaseItems.length === 0) return;
    const item = purchaseItems[0];
    try {
      await updatePurchase(editingId, {
        ...formData,
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        ingredientId: parseInt(item.ingredientId)
      });
      toast.success("Purchase updated and stock adjusted");
      setIsEditingPurchase(false);
      loadData();
    } catch (error) {
      toast.error("Failed to update purchase");
    }
  };

  const openEditDialog = (purchase: Purchase) => {
    setEditingId(purchase.id);
    setPurchaseItems([{
      ingredientId: purchase.ingredientId.toString(),
      ingredientName: purchase.ingredientName,
      unit: purchase.unit,
      quantity: purchase.quantity.toString(),
      unitPrice: purchase.unitPrice.toString()
    }]);
    setFormData({
      supplier: purchase.supplier,
      purchaseDate: purchase.purchaseDate.split("T")[0],
      expiryDate: purchase.expiryDate ? purchase.expiryDate.split("T")[0] : "",
      invoiceNo: purchase.invoiceNo || "",
      notes: purchase.notes || "",
      paymentMethod: purchase.paymentMethod || "cash",
    });
    setIsEditingPurchase(true);
  };

  const addPurchaseItem = () => {
    setPurchaseItems([...purchaseItems, {
      ingredientId: "",
      ingredientName: "",
      unit: "unit",
      quantity: "1",
      unitPrice: "0"
    }]);
  };

  const removePurchaseItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const updatePurchaseItem = (index: number, field: string, value: string) => {
    const updated = [...purchaseItems];
    const item = { ...updated[index], [field]: value };

    // If selecting an existing ingredient, auto-fill name and unit
    if (field === 'ingredientId' && value !== 'new') {
      const ing = ingredients.find(i => i.id.toString() === value);
      if (ing) {
        item.ingredientName = ing.name;
        item.unit = ing.unit;
        item.unitPrice = ing.unitPrice.toString();
      }
    }

    updated[index] = item;
    setPurchaseItems(updated);
  };

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (purchaseItems.length === 0 || !formData.supplier || purchaseItems.some(i => !i.quantity || !i.unitPrice || (!i.ingredientId && !i.ingredientName))) {
      toast.error("Please fill in all required fields and add at least one item");
      return;
    }

    try {
      await recordPurchase({
        supplier: formData.supplier,
        purchaseDate: formData.purchaseDate,
        expiryDate: formData.expiryDate || undefined,
        invoiceNo: formData.invoiceNo || undefined,
        notes: formData.notes || undefined,
        paymentMethod: formData.paymentMethod,
        requisitionId: selectedRequisitionId ? parseInt(selectedRequisitionId) : undefined,
        items: purchaseItems.map(item => ({
          ingredientId: item.ingredientId ? parseInt(item.ingredientId) : undefined,
          ingredientName: item.ingredientName,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          unit: item.unit,
          totalCost: parseFloat(item.quantity) * parseFloat(item.unitPrice)
        }))
      });

      toast.success("Purchase recorded successfully");
      setIsAddingPurchase(false);

      // Reset form
      setFormData({
        supplier: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
        invoiceNo: "",
        notes: "",
        paymentMethod: "cash",
      });
      setPurchaseItems([]);
      setSelectedRequisitionId("");
      loadData();
    } catch (error: any) {
      toast.error(`Failed to record purchase: ${error.message || "Unknown error"}`);
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
          <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Record New Purchase</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPurchase} className="space-y-6">
              {/* Requisition Selector */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <RotateCcw className="h-4 w-4 text-emerald-600" />
                  <Label className="font-bold text-emerald-800">Source from Requisition</Label>
                </div>
                <Select
                  value={selectedRequisitionId}
                  onValueChange={(val) => {
                    handleRequisitionPreFill(parseInt(val));
                  }}
                >
                  <SelectTrigger className="bg-white border-emerald-200">
                    <SelectValue placeholder="Select a pending requisition (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Manual Purchase (No Requisition)</SelectItem>
                    {requisitions
                      .filter(req => req.status !== 'ordered')
                      .map((req) => (
                      <SelectItem key={req.id} value={req.id.toString()}>
                        {req.requisitionNo} - {new Date(req.createdAt).toLocaleDateString()} ({req.items.length} items)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-emerald-600 font-medium italic">
                  * Selecting a requisition will auto-populate items and mark the request as fulfilled upon saving.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-extrabold text-base uppercase tracking-tight">Purchase Items</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPurchaseItem}
                    className="h-8 rounded-lg font-bold border-dashed border-2 hover:border-primary hover:text-primary transition-all"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    ADD MORE
                  </Button>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20">
                  {purchaseItems.map((item, index) => (
                    <Card key={index} className="relative bg-slate-50/50 border-none shadow-sm group">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-sm text-rose-500 hover:text-rose-700 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => removePurchaseItem(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-black text-muted-foreground">Select Material</Label>
                            <Select
                              value={item.ingredientId}
                              onValueChange={(val) => updatePurchaseItem(index, 'ingredientId', val)}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Choose Ingredient" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new" className="font-bold text-primary">+ NEW RAW MATERIAL</SelectItem>
                                {ingredients.map((ing) => (
                                  <SelectItem key={ing.id} value={ing.id.toString()}>
                                    {ing.name} ({ing.unit})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {!item.ingredientId || item.ingredientId === 'new' ? (
                            <div className="space-y-1.5">
                              <Label className="text-[10px] uppercase font-black text-muted-foreground">Custom Name</Label>
                              <Input
                                value={item.ingredientName}
                                onChange={(e) => updatePurchaseItem(index, 'ingredientName', e.target.value)}
                                placeholder="Material Name"
                                className="bg-white"
                              />
                            </div>
                          ) : null}
                          {item.ingredientId && item.ingredientId !== 'new' && (
                            <div className="space-y-1.5">
                              <Label className="text-[10px] uppercase font-black text-muted-foreground">Unit</Label>
                              <Input
                                value={item.unit}
                                disabled
                                className="bg-slate-100 opacity-60"
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-black text-muted-foreground">Quantity</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => updatePurchaseItem(index, 'quantity', e.target.value)}
                              placeholder="0.00"
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-black text-muted-foreground">Unit Price (Rs.)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updatePurchaseItem(index, 'unitPrice', e.target.value)}
                              placeholder="0.00"
                              className="bg-white"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {purchaseItems.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-sm text-muted-foreground">No items added. Click 'Add More' or select a requisition.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="space-y-2">
                  <Label htmlFor="supplier" className="font-bold">Supplier Info *</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier: e.target.value })
                    }
                    placeholder="Partner name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate" className="font-bold">Purchase Date</Label>
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
                    <Label htmlFor="invoiceNo" className="font-bold">Invoice No.</Label>
                    <Input
                      id="invoiceNo"
                      value={formData.invoiceNo}
                      onChange={(e) =>
                        setFormData({ ...formData, invoiceNo: e.target.value })
                      }
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="font-bold">Notes / Description</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Optional details"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod" className="font-bold">Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(val) => setFormData({ ...formData, paymentMethod: val })}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash Settlement</SelectItem>
                      <SelectItem value="credit">On Credit Account</SelectItem>
                      <SelectItem value="cheque">Bank Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl h-12 px-6 font-bold"
                  onClick={() => setIsAddingPurchase(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl h-12 px-8 font-black shadow-lg shadow-primary/20"
                >
                  RECORD PROCUREMENT
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={isEditingPurchase} onOpenChange={setIsEditingPurchase}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Purchase Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdatePurchase} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-material">Raw Material *</Label>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="font-bold text-emerald-900">{purchaseItems[0]?.ingredientName || "Loading..."}</p>
                  <p className="text-xs text-muted-foreground uppercase font-black">Fixed Material</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Quantity *</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    step="0.01"
                    value={purchaseItems[0]?.quantity || ""}
                    onChange={(e) => updatePurchaseItem(0, 'quantity', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-unitPrice">Unit Price (Rs.) *</Label>
                  <Input
                    id="edit-unitPrice"
                    type="number"
                    step="0.01"
                    value={purchaseItems[0]?.unitPrice || ""}
                    onChange={(e) => updatePurchaseItem(0, 'unitPrice', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-supplier">Supplier *</Label>
                <Input
                  id="edit-supplier"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-purchaseDate">Purchase Date *</Label>
                  <Input
                    id="edit-purchaseDate"
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
                  <Label htmlFor="edit-expiryDate">Expiry Date</Label>
                  <Input
                    id="edit-expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-invoiceNo">Invoice No.</Label>
                <Input
                  id="edit-invoiceNo"
                  value={formData.invoiceNo}
                  onChange={(e) =>
                    setFormData({ ...formData, invoiceNo: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingPurchase(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Record</Button>
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
                        <th className="text-left py-3 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground/60">Reference</th>
                        <th className="text-left py-3 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground/60">Material</th>
                        <th className="text-left py-3 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground/60">Quantity</th>
                        <th className="text-left py-3 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground/60">Unit Price</th>
                        <th className="text-left py-3 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground/60">Total Cost</th>
                        <th className="text-left py-3 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground/60">Supplier</th>
                        <th className="text-left py-3 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground/60">Payment</th>
                        <th className="text-left py-3 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground/60">Date</th>
                        <th className="text-left py-3 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground/60">Status</th>
                        <th className="text-right py-3 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground/60">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...purchases].reverse().map((purchase) => (
                        <tr
                          key={purchase.id}
                          className="border-b border-sidebar-border/30 hover:bg-emerald-50/30 transition-colors group"
                        >
                          <td className="py-4 px-4">
                            {purchase.requisitionNo ? (
                              <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 italic">
                                  {purchase.requisitionNo}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-muted-foreground/30 italic">Manual</span>
                            )}
                          </td>
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
                          <td className="py-4 px-4">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border shadow-sm",
                              purchase.paymentMethod === "credit" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                purchase.paymentMethod === "cheque" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                  "bg-emerald-50 text-emerald-600 border-emerald-100"
                            )}>
                              {purchase.paymentMethod || "cash"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-xs font-medium text-muted-foreground">
                            {new Date(purchase.purchaseDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="py-4 px-4">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border shadow-sm",
                              purchase.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                purchase.status === "returned" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                  "bg-slate-50 text-slate-600 border-slate-100"
                            )}>
                              {purchase.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => openEditDialog(purchase)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              {purchase.status === "completed" ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                  title="Return Purchase"
                                  onClick={() => handleReturnPurchase(purchase.id, purchase.ingredientName)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              ) : null}
                              {purchase.status !== "completed" ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                  onClick={() => handleDeletePurchase(purchase.id, purchase.status)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ) : null}
                            </div>
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
