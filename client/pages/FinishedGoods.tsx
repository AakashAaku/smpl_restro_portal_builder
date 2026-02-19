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
import { Plus, Trash2, AlertTriangle, Package, TrendingUp, Zap } from "lucide-react";
import {
  getAllRawMaterials,
  getAllFinishedGoods,
  getRawMaterialById,
  createFinishedGood,
  addFinishedGood,
  updateFinishedGood,
  deleteFinishedGood,
  produceFinishedGood,
  getAllConsumptionRecords,
  type RawMaterial,
  type FinishedGood,
  type RecipeItem,
  type ConsumptionRecord,
} from "@/lib/inventory";

export default function FinishedGoods() {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [finishedGoods, setFinishedGoods] = useState<FinishedGood[]>([]);
  const [consumptionRecords, setConsumptionRecords] = useState<ConsumptionRecord[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isProducing, setIsProducing] = useState(false);
  const [selectedProductForProduction, setSelectedProductForProduction] = useState("");
  const [productionQuantity, setProductionQuantity] = useState("");

  // Form state for new finished good
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Snacks",
    sellingPrice: "",
  });
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);
  const [selectedMaterialForRecipe, setSelectedMaterialForRecipe] = useState("");
  const [recipeMaterialQty, setRecipeMaterialQty] = useState("");

  useEffect(() => {
    loadData();
    window.addEventListener("finishedGoodAdded", loadData);
    window.addEventListener("finishedGoodUpdated", loadData);
    window.addEventListener("finishedGoodProduced", loadData);
    return () => {
      window.removeEventListener("finishedGoodAdded", loadData);
      window.removeEventListener("finishedGoodUpdated", loadData);
      window.removeEventListener("finishedGoodProduced", loadData);
    };
  }, []);

  const loadData = () => {
    setRawMaterials(getAllRawMaterials());
    setFinishedGoods(getAllFinishedGoods());
    setConsumptionRecords(getAllConsumptionRecords());
  };

  const handleAddRecipeItem = () => {
    if (!selectedMaterialForRecipe || !recipeMaterialQty) {
      alert("Please select a material and quantity");
      return;
    }

    const material = rawMaterials.find((m) => m.id === selectedMaterialForRecipe);
    if (!material) return;

    const newItem: RecipeItem = {
      rawMaterialId: selectedMaterialForRecipe,
      rawMaterialName: material.name,
      quantityRequired: parseFloat(recipeMaterialQty),
      unit: material.unit,
    };

    setRecipe([...recipe, newItem]);
    setSelectedMaterialForRecipe("");
    setRecipeMaterialQty("");
  };

  const handleRemoveRecipeItem = (index: number) => {
    setRecipe(recipe.filter((_, i) => i !== index));
  };

  const handleCreateFinishedGood = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productForm.name || !productForm.sellingPrice || recipe.length === 0) {
      alert("Please fill in all fields and add at least one recipe item");
      return;
    }

    try {
      const finishedGood = createFinishedGood(
        productForm.name,
        productForm.category,
        recipe,
        parseFloat(productForm.sellingPrice)
      );

      addFinishedGood(finishedGood);

      // Reset form
      setProductForm({ name: "", category: "Snacks", sellingPrice: "" });
      setRecipe([]);
      setSelectedMaterialForRecipe("");
      setRecipeMaterialQty("");
      setIsAddingProduct(false);
      loadData();
      alert("Product created successfully!");
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Error creating product. Please try again.");
    }
  };

  const handleProduceProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductForProduction || !productionQuantity) {
      alert("Please select a product and quantity");
      return;
    }

    const quantity = parseInt(productionQuantity);
    const result = produceFinishedGood(selectedProductForProduction, quantity);

    if (!result) {
      alert("Production failed - insufficient raw materials or invalid product");
      return;
    }

    alert(`Successfully produced ${quantity} units!`);
    setSelectedProductForProduction("");
    setProductionQuantity("");
    setIsProducing(false);
    loadData();
  };

  const totalFinishedGoods = finishedGoods.length;
  const totalFinishedValue = finishedGoods.reduce(
    (sum, g) => sum + g.currentStock * g.sellingPrice,
    0
  );
  const lowStockFinished = finishedGoods.filter(
    (g) => g.currentStock <= 5
  ).length;

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Finished Goods & Production
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage recipes, plan production, and track finished goods inventory
            </p>
          </div>
          <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Finished Good</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateFinishedGood} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                      placeholder="e.g., Paneer Tikka"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productCategory">Category *</Label>
                    <Select
                      value={productForm.category}
                      onValueChange={(value) =>
                        setProductForm({ ...productForm, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Main Course">Main Course</SelectItem>
                        <SelectItem value="Snacks">Snacks</SelectItem>
                        <SelectItem value="Desserts">Desserts</SelectItem>
                        <SelectItem value="Beverages">Beverages</SelectItem>
                        <SelectItem value="Sides">Sides</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price per Unit (₹) *</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    value={productForm.sellingPrice}
                    onChange={(e) =>
                      setProductForm({ ...productForm, sellingPrice: e.target.value })
                    }
                    placeholder="250"
                  />
                </div>

                <div className="border-t pt-4">
                  <p className="font-semibold mb-4">Recipe (Raw Materials) *</p>

                  <div className="space-y-4 mb-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="recipeMaterial">Raw Material</Label>
                        <Select
                          value={selectedMaterialForRecipe}
                          onValueChange={setSelectedMaterialForRecipe}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {rawMaterials.map((material) => (
                              <SelectItem key={material.id} value={material.id}>
                                {material.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recipeQty">Quantity</Label>
                        <Input
                          id="recipeQty"
                          type="number"
                          step="0.01"
                          value={recipeMaterialQty}
                          onChange={(e) => setRecipeMaterialQty(e.target.value)}
                          placeholder="0.5"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddRecipeItem}
                        >
                          Add Item
                        </Button>
                      </div>
                    </div>

                    {recipe.length > 0 && (
                      <div className="bg-secondary p-4 rounded-lg space-y-2">
                        {recipe.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-background rounded"
                          >
                            <div>
                              <p className="font-medium">{item.rawMaterialName}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantityRequired} {item.unit}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRecipeItem(idx)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingProduct(false);
                      setProductForm({ name: "", category: "Snacks", sellingPrice: "" });
                      setRecipe([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Product</Button>
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
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold mt-2">{totalFinishedGoods}</p>
                </div>
                <Package className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inventory Value</p>
                  <p className="text-2xl font-bold mt-2">
                    ₹{Math.round(totalFinishedValue).toLocaleString()}
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
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold mt-2 text-amber-600">
                    {lowStockFinished}
                  </p>
                </div>
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Produced</p>
                  <p className="text-2xl font-bold mt-2">
                    {consumptionRecords.reduce((sum, r) => sum + r.quantityProduced, 0)}
                  </p>
                </div>
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inventory">Products & Recipes</TabsTrigger>
            <TabsTrigger value="production">Production & Consumption</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="inventory" className="space-y-4">
            {finishedGoods.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No finished goods created yet. Click "New Product" to get started.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {finishedGoods.map((product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <div>
                          <p className="text-lg">{product.name}</p>
                          <p className="text-sm font-normal text-muted-foreground mt-1">
                            {product.category}
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Stock</p>
                          <p className="text-lg font-semibold">{product.currentStock}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cost</p>
                          <p className="text-lg font-semibold">
                            ₹{product.totalCost.toFixed(0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="text-lg font-semibold">
                            ₹{product.sellingPrice.toFixed(0)}
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <p className="font-semibold mb-2">Recipe:</p>
                        <div className="space-y-1 text-sm">
                          {product.recipe.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-muted-foreground">
                              <span>{item.rawMaterialName}</span>
                              <span className="font-medium">
                                {item.quantityRequired} {item.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Dialog open={isProducing && selectedProductForProduction === product.id} onOpenChange={setIsProducing}>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full gap-2"
                            onClick={() => setSelectedProductForProduction(product.id)}
                          >
                            <Zap className="h-4 w-4" />
                            Produce
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Produce {product.name}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleProduceProduct} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="quantity">Quantity to Produce *</Label>
                              <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={productionQuantity}
                                onChange={(e) => setProductionQuantity(e.target.value)}
                                placeholder="e.g., 10"
                              />
                            </div>

                            <div className="bg-secondary p-4 rounded-lg space-y-2">
                              <p className="font-semibold text-sm">Raw Materials Required:</p>
                              {product.recipe.map((item, idx) => {
                                const requiredQty =
                                  parseFloat(productionQuantity || "0") *
                                  item.quantityRequired;
                                const material = getRawMaterialById(item.rawMaterialId);
                                const isAvailable =
                                  material && material.currentStock >= requiredQty;

                                return (
                                  <div
                                    key={idx}
                                    className={`flex justify-between text-sm p-2 rounded ${
                                      isAvailable
                                        ? "bg-green-50 text-green-900"
                                        : "bg-red-50 text-red-900"
                                    }`}
                                  >
                                    <span>{item.rawMaterialName}</span>
                                    <span className="font-medium">
                                      {requiredQty.toFixed(2)} {item.unit}
                                      {material &&
                                        ` (Available: ${material.currentStock})`}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsProducing(false);
                                  setProductionQuantity("");
                                  setSelectedProductForProduction("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button type="submit">Produce Now</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          if (window.confirm("Delete this product?")) {
                            deleteFinishedGood(product.id);
                            loadData();
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Production Tab */}
          <TabsContent value="production" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Production History</CardTitle>
              </CardHeader>
              <CardContent>
                {consumptionRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No production records yet. Start producing finished goods!
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium">
                            Product
                          </th>
                          <th className="text-right py-3 px-4 font-medium">
                            Quantity
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Raw Materials Used
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...consumptionRecords].reverse().map((record) => (
                          <tr
                            key={record.id}
                            className="border-b border-border hover:bg-secondary/30"
                          >
                            <td className="py-3 px-4 font-medium">
                              {record.finishedGoodName}
                            </td>
                            <td className="text-right py-3 px-4 font-semibold">
                              {record.quantityProduced}
                            </td>
                            <td className="py-3 px-4">
                              {new Date(record.dateProduced).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-xs space-y-1">
                                {record.rawMaterialsUsed.map((item, idx) => (
                                  <div key={idx} className="text-muted-foreground">
                                    • {item.rawMaterialName}: {item.quantityUsed}{" "}
                                    {item.unit}
                                  </div>
                                ))}
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
        </Tabs>
    </div>
  );
}
