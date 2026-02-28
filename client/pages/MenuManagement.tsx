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
import { Plus, Edit2, Trash2, Search, ChefHat, X, Leaf, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import {
  MenuItem,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemRecipe,
  updateMenuItemRecipe,
  Recipe
} from "@/lib/menu";
import { getIngredients, Ingredient } from "@/lib/inventory-api";
import { toast } from "sonner";

const categories = [
  "Breakfast",
  "Snacks",
  "Main Course",
  "Desserts",
  "Beverages",
  "Special Combos",
];

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Recipe State
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState<MenuItem | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<{ ingredientId: number, quantity: number }[]>([]);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);

  // Form state
  const [formState, setFormState] = useState<Omit<MenuItem, "id">>({
    name: "",
    category: "Main Course",
    price: 0,
    prepTime: 0,
    description: "",
    status: "available",
  });

  useEffect(() => {
    fetchItems();
    fetchIngredients(); // Added
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await getMenuItems();
      setItems(data);
    } catch (error) {
      toast.error("Failed to load menu items");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      const data = await getIngredients();
      setAllIngredients(data);
    } catch (error) {
      console.error("Failed to load ingredients");
    }
  };

  const handleOpenRecipe = async (item: MenuItem) => {
    setActiveMenuItem(item);
    setIsRecipeDialogOpen(true);
    try {
      const recipeData = await getMenuItemRecipe(item.id);
      setCurrentRecipe(recipeData.map(r => ({
        ingredientId: r.ingredientId,
        quantity: r.quantity
      })));
    } catch (error) {
      toast.error("Failed to load recipe");
      setCurrentRecipe([]);
    }
  };

  const handleSaveRecipe = async () => {
    if (!activeMenuItem) return;
    setIsSavingRecipe(true);
    try {
      await updateMenuItemRecipe(activeMenuItem.id, currentRecipe);
      toast.success("Recipe updated successfully");
      setIsRecipeDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save recipe");
    } finally {
      setIsSavingRecipe(false);
    }
  };

  const addRecipeRow = () => {
    if (allIngredients.length === 0) return;
    setCurrentRecipe([...currentRecipe, { ingredientId: allIngredients[0].id, quantity: 0 }]);
  };

  const removeRecipeRow = (index: number) => {
    setCurrentRecipe(currentRecipe.filter((_, i) => i !== index));
  };

  const updateRecipeRow = (index: number, field: string, value: any) => {
    const updated = [...currentRecipe];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentRecipe(updated);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteMenuItem(id);
      setItems(items.filter((item) => item.id !== id));
      toast.success("Item deleted successfully");
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setFormState({
      name: item.name,
      category: item.category,
      price: item.price,
      prepTime: item.prepTime,
      description: item.description,
      status: item.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await updateMenuItem(editingId, formState);
        setItems(items.map((i) => (i.id === editingId ? updated : i)));
        toast.success("Item updated successfully");
      } else {
        const created = await createMenuItem(formState);
        setItems([...items, created]);
        toast.success("Item added successfully");
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(editingId ? "Failed to update item" : "Failed to add item");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormState({
      name: "",
      category: "Main Course",
      price: 0,
      prepTime: 0,
      description: "",
      status: "available",
    });
  };

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
              VenzoSmart • Culinary Database
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-sidebar-foreground">
            Menu <span className="text-primary italic">Catalogue</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic">
            "110% Pure Veg & Eggless Excellence"
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="h-12 px-8 rounded-xl font-bold border-none shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-[1.02]">
              <Plus className="h-5 w-5" />
              CRAFT NEW ITEM
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Menu Item" : "Add New Menu Item"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="e.g., Butter Chicken"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formState.category}
                    onValueChange={(val) => setFormState({ ...formState, category: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formState.status}
                    onValueChange={(val: any) => setFormState({ ...formState, status: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (Rs.)</Label>
                  <Input
                    id="price"
                    type="number"
                    required
                    value={formState.price}
                    onChange={(e) => setFormState({ ...formState, price: parseFloat(e.target.value) })}
                    placeholder="250"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preptime">Prep Time (min)</Label>
                  <Input
                    id="preptime"
                    type="number"
                    required
                    value={formState.prepTime}
                    onChange={(e) => setFormState({ ...formState, prepTime: parseInt(e.target.value) })}
                    placeholder="20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  placeholder="Item description"
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingId ? "Update Item" : "Add Item"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end flex-wrap">
        <div className="flex-1 max-w-sm">
          <Label htmlFor="search" className="mb-2 block">
            Search Items
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-48">
          <Label htmlFor="category-filter" className="mb-2 block">
            Filter by Category
          </Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items Table */}
      <Card className="premium-card border-none shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-sidebar-border/50 bg-emerald-50/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-extrabold tracking-tight">Active Menu Items ({filteredItems.length})</CardTitle>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-white px-3 py-1 rounded-full shadow-sm border border-emerald-100">
              <Sparkles className="h-3 w-3" />
              ALL ITEMS ARE VEG
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">Loading menu items...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-sm">
                      Item Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm">
                      Price
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm">
                      Prep Time
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-sidebar-border/50 hover:bg-emerald-50/30 transition-colors group"
                    >
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center font-black text-xs text-muted-foreground border-2 border-white shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                            {item.name.charAt(0)}
                          </div>
                          <span className="font-bold text-emerald-950">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-5 px-4 font-black text-lg text-emerald-900 border-none">Rs.{item.price}</td>
                      <td className="py-5 px-4 text-muted-foreground font-medium">{item.prepTime} min</td>
                      <td className="py-5 px-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${item.status === "available"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                            }`}
                        >
                          {item.status === "available"
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-xl"
                            onClick={() => handleOpenRecipe(item)}
                            title="Manage Recipe"
                          >
                            <ChefHat className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Recipe Management Dialog */}
      <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Recipe Management: {activeMenuItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Define the ingredients and quantities required for one serving of this item.
              Inventory will be automatically deducted when orders are prepared.
            </p>

            <div className="space-y-3">
              {currentRecipe.length === 0 ? (
                <div className="text-center py-6 bg-secondary/20 rounded-lg border-2 border-dashed">
                  <p className="text-sm text-muted-foreground">No ingredients added yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-3 items-center font-medium text-sm px-2">
                  <div className="col-span-6">Ingredient</div>
                  <div className="col-span-4">Quantity</div>
                  <div className="col-span-2"></div>
                </div>
              )}

              {currentRecipe.map((row, index) => {
                const ingredient = allIngredients.find(i => i.id === row.ingredientId);
                return (
                  <div key={index} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-6">
                      <Select
                        value={row.ingredientId.toString()}
                        onValueChange={(val) => updateRecipeRow(index, 'ingredientId', parseInt(val))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allIngredients.map(ing => (
                            <SelectItem key={ing.id} value={ing.id.toString()}>
                              {ing.name} ({ing.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-4 relative">
                      <Input
                        type="number"
                        step="0.001"
                        value={row.quantity}
                        onChange={(e) => updateRecipeRow(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        {ingredient?.unit || ''}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive h-8 w-8 p-0"
                        onClick={() => removeRecipeRow(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-2 border-dashed"
              onClick={addRecipeRow}
            >
              <Plus className="h-4 w-4" />
              Add Ingredient
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsRecipeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveRecipe}
              disabled={isSavingRecipe}
            >
              {isSavingRecipe ? "Saving..." : "Save Recipe"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
