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
import { Plus, TrendingUp, DollarSign, Package, Calendar } from "lucide-react";
import {
  getAllRawMaterials,
  getAllPurchases,
  savePurchase,
  createPurchase,
  getPurchasesByMaterial,
  type RawMaterial,
  type Purchase,
} from "@/lib/inventory";

export default function PurchaseManagement() {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState("");
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
    // Listen for purchase and material updates
    window.addEventListener("purchaseAdded", loadData);
    window.addEventListener("rawMaterialAdded", loadData);
    window.addEventListener("rawMaterialUpdated", loadData);
    
    return () => {
      window.removeEventListener("purchaseAdded", loadData);
      window.removeEventListener("rawMaterialAdded", loadData);
      window.removeEventListener("rawMaterialUpdated", loadData);
    };
  }, []);

  const loadData = () => {
    setRawMaterials(getAllRawMaterials());
    setPurchases(getAllPurchases());
  };

  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMaterial || !formData.quantity || !formData.unitPrice || !formData.supplier) {
      alert("Please fill in all required fields");
      return;
    }

    const material = rawMaterials.find((m) => m.id === selectedMaterial);
    if (!material) return;

    const purchase = createPurchase(
      selectedMaterial,
      material.name,
      parseFloat(formData.quantity),
      material.unit,
      parseFloat(formData.unitPrice),
      formData.supplier,
      formData.purchaseDate,
      formData.expiryDate || undefined,
      formData.invoiceNo || undefined,
      formData.notes || undefined
    );

    savePurchase(purchase);

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
    setSelectedMaterial("");
    setIsAddingPurchase(false);
    loadData();
  };

  const totalPurchases = purchases.length;
  const totalCost = purchases.reduce((sum, p) => sum + p.totalCost, 0);
  const todayPurchases = purchases.filter(
    (p) => new Date(p.purchaseDate).toDateString() === new Date().toDateString()
  ).length;
  const uniqueSuppliers = new Set(purchases.map((p) => p.supplier)).size;

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Purchase Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Track raw material purchases and procurement costs
            </p>
          </div>
          <Dialog open={isAddingPurchase} onOpenChange={setIsAddingPurchase}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Purchase
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record New Purchase</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPurchase} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="material">Raw Material *</Label>
                  <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select raw material" />
                    </SelectTrigger>
                    <SelectContent>
                      {rawMaterials.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.name} ({material.unit})
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
                    <Label htmlFor="unitPrice">Unit Price (₹) *</Label>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Purchases</p>
                  <p className="text-2xl font-bold mt-2">{totalPurchases}</p>
                </div>
                <Package className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold mt-2">
                    ₹{Math.round(totalCost).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today Purchases</p>
                  <p className="text-2xl font-bold mt-2">{todayPurchases}</p>
                </div>
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Suppliers</p>
                  <p className="text-2xl font-bold mt-2">{uniqueSuppliers}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Purchases</TabsTrigger>
            <TabsTrigger value="byMaterial">By Material</TabsTrigger>
          </TabsList>

          {/* All Purchases Tab */}
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
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
                            className="border-b border-border hover:bg-secondary/30"
                          >
                            <td className="py-3 px-4 font-medium">
                              {purchase.rawMaterialName}
                            </td>
                            <td className="py-3 px-4">
                              {purchase.quantity} {purchase.unit}
                            </td>
                            <td className="py-3 px-4">₹{purchase.unitPrice.toFixed(2)}</td>
                            <td className="py-3 px-4 font-semibold">
                              ₹{purchase.totalCost.toFixed(2)}
                            </td>
                            <td className="py-3 px-4">{purchase.supplier}</td>
                            <td className="py-3 px-4">
                              {new Date(purchase.purchaseDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              {purchase.expiryDate ? (
                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                  {new Date(purchase.expiryDate).toLocaleDateString()}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
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
            {rawMaterials.map((material) => {
              const materialPurchases = getPurchasesByMaterial(material.id);
              const totalQuantity = materialPurchases.reduce(
                (sum, p) => sum + p.quantity,
                0
              );
              const avgPrice =
                materialPurchases.length > 0
                  ? materialPurchases.reduce((sum, p) => sum + p.unitPrice, 0) /
                    materialPurchases.length
                  : 0;
              const totalSpent = materialPurchases.reduce(
                (sum, p) => sum + p.totalCost,
                0
              );

              if (materialPurchases.length === 0) return null;

              return (
                <Card key={material.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{material.name}</CardTitle>
                    <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Purchased</p>
                        <p className="font-semibold">
                          {totalQuantity} {material.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Price</p>
                        <p className="font-semibold">₹{avgPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Spent</p>
                        <p className="font-semibold">₹{totalSpent.toFixed(2)}</p>
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
                          {materialPurchases.map((purchase) => (
                            <tr
                              key={purchase.id}
                              className="border-b border-border"
                            >
                              <td className="py-2 px-4">{purchase.supplier}</td>
                              <td className="py-2 px-4">
                                {purchase.quantity} {purchase.unit}
                              </td>
                              <td className="py-2 px-4">
                                ₹{purchase.unitPrice.toFixed(2)}
                              </td>
                              <td className="py-2 px-4 font-semibold">
                                ₹{purchase.totalCost.toFixed(2)}
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
