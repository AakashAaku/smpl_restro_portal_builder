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
import { Plus, Trash2, AlertTriangle, Package, TrendingUp, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getFinishedGoods,
  createFinishedGood,
  produceFinishedGood,
  getProductionRecords,
  deleteFinishedGood,
  type FinishedGood,
  type RecipeItem,
  type ProductionRecord,
} from "@/lib/finished-goods-api";
import {
  getIngredients,
  type Ingredient,
} from "@/lib/inventory-api";

export default function FinishedGoods() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [finishedGoods, setFinishedGoods] = useState<FinishedGood[]>([]);
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [selectedIngredientForRecipe, setSelectedIngredientForRecipe] = useState("");
  const [recipeIngredientQty, setRecipeIngredientQty] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ingData, fgData, recordsData] = await Promise.all([
        getIngredients(),
        getFinishedGoods(),
        getProductionRecords()
      ]);
      setIngredients(ingData);
      setFinishedGoods(fgData);
      setProductionRecords(recordsData);
    } catch (error) {
      toast.error("Failed to load production data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecipeItem = () => {
    if (!selectedIngredientForRecipe || !recipeIngredientQty) {
      toast.error("Please select an ingredient and quantity");
      return;
    }

    const ingredient = ingredients.find((i) => i.id.toString() === selectedIngredientForRecipe);
    if (!ingredient) return;

    const newItem: RecipeItem = {
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      quantityRequired: parseFloat(recipeIngredientQty),
      unit: ingredient.unit,
    };

    setRecipe([...recipe, newItem]);
    setSelectedIngredientForRecipe("");
    setRecipeIngredientQty("");
  };

  const handleRemoveRecipeItem = (index: number) => {
    setRecipe(recipe.filter((_, i) => i !== index));
  };

  const handleCreateFinishedGood = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productForm.name || !productForm.sellingPrice || recipe.length === 0) {
      toast.error("Please fill in all fields and add at least one recipe item");
      return;
    }

    try {
      await createFinishedGood({
        name: productForm.name,
        category: productForm.category,
        recipe,
        sellingPrice: parseFloat(productForm.sellingPrice),
      });

      toast.success("Product created successfully");
      setProductForm({ name: "", category: "Snacks", sellingPrice: "" });
      setRecipe([]);
      setIsAddingProduct(false);
      loadData();
    } catch (error) {
      toast.error("Failed to create product");
    }
  };

  const handleProduceProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductForProduction || !productionQuantity) {
      toast.error("Please select a product and quantity");
      return;
    }

    const quantity = parseInt(productionQuantity);
    try {
      await produceFinishedGood(selectedProductForProduction, quantity);
      toast.success(`Successfully produced ${quantity} units`);
      setSelectedProductForProduction("");
      setProductionQuantity("");
      setIsProducing(false);
      loadData();
    } catch (error) {
      toast.error("Production failed - check raw material availability");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                        value={selectedIngredientForRecipe}
                        onValueChange={setSelectedIngredientForRecipe}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients.map((ingredient) => (
                            <SelectItem key={ingredient.id} value={ingredient.id.toString()}>
                              {ingredient.name}
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
                        value={recipeIngredientQty}
                        onChange={(e) => setRecipeIngredientQty(e.target.value)}
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
                            <p className="font-medium">{item.ingredientName}</p>
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
                  {productionRecords.reduce((sum, r) => sum + r.quantityProduced, 0)}
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
          <TabsTrigger value="production">Production & History</TabsTrigger>
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
                            <span>{item.ingredientName}</span>
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
                              const ingredient = ingredients.find(i => i.id === item.ingredientId);
                              const isAvailable =
                                ingredient && ingredient.currentStock >= requiredQty;

                              return (
                                <div
                                  key={idx}
                                  className={`flex justify-between text-sm p-2 rounded ${isAvailable
                                      ? "bg-green-50 text-green-900"
                                      : "bg-red-50 text-red-900"
                                    }`}
                                >
                                  <span>{item.ingredientName}</span>
                                  <span className="font-medium">
                                    {requiredQty.toFixed(2)} {item.unit}
                                    {ingredient &&
                                      ` (Available: ${ingredient.currentStock})`}
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
                      onClick={async () => {
                        if (window.confirm("Delete this product?")) {
                          try {
                            await deleteFinishedGood(product.id);
                            toast.success("Product deleted");
                            loadData();
                          } catch (error) {
                            toast.error("Failed to delete product");
                          }
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
              {productionRecords.length === 0 ? (
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
                      {[...productionRecords].reverse().map((record) => (
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
                                  • {item.ingredientName}: {item.quantityUsed}{" "}
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
