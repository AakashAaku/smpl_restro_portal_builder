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
import { Plus, AlertTriangle, TrendingDown, Package, Clock, Trash2 } from "lucide-react";

interface Ingredient {
  id: number;
  name: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  costPerUnit: number;
  isLowStock?: boolean;
  expiryDate?: string;
  batchNumber?: string;
}

interface Supplier {
  id: number;
  name: string;
  contact: string;
  email: string;
  address: string;
}

interface WasteRecord {
  id: number;
  ingredientName: string;
  quantity: number;
  unit: string;
  reason: "Expired" | "Damaged" | "Spoiled" | "Returned" | "Other";
  date: string;
  cost: number;
}

const mockIngredients: Ingredient[] = [
  {
    id: 1,
    name: "Paneer",
    unit: "kg",
    currentStock: 5.5,
    reorderLevel: 3,
    costPerUnit: 280,
    isLowStock: false,
    expiryDate: "2024-02-15",
    batchNumber: "B001",
  },
  {
    id: 2,
    name: "Chicken Breast",
    unit: "kg",
    currentStock: 8.2,
    reorderLevel: 5,
    costPerUnit: 180,
    isLowStock: false,
    expiryDate: "2024-02-05",
    batchNumber: "B002",
  },
  {
    id: 3,
    name: "Butter",
    unit: "kg",
    currentStock: 2.1,
    reorderLevel: 2,
    costPerUnit: 420,
    isLowStock: true,
    expiryDate: "2024-03-10",
    batchNumber: "B003",
  },
  {
    id: 4,
    name: "Tomato Sauce",
    unit: "liters",
    currentStock: 1.2,
    reorderLevel: 3,
    costPerUnit: 150,
    isLowStock: true,
    expiryDate: "2024-02-08",
    batchNumber: "B004",
  },
];

const mockWasteRecords: WasteRecord[] = [
  {
    id: 1,
    ingredientName: "Paneer",
    quantity: 0.5,
    unit: "kg",
    reason: "Expired",
    date: "2024-01-18",
    cost: 140,
  },
  {
    id: 2,
    ingredientName: "Chicken",
    quantity: 1.2,
    unit: "kg",
    reason: "Spoiled",
    date: "2024-01-15",
    cost: 216,
  },
  {
    id: 3,
    ingredientName: "Milk",
    quantity: 2,
    unit: "liters",
    reason: "Damaged",
    date: "2024-01-12",
    cost: 80,
  },
];

const mockSuppliers: Supplier[] = [
  {
    id: 1,
    name: "Fresh Foods Co",
    contact: "9876543210",
    email: "sales@freshfoods.com",
    address: "123 Market Street, Mumbai",
  },
  {
    id: 2,
    name: "Dairy Essentials",
    contact: "9876543211",
    email: "orders@dairyess.com",
    address: "456 Dairy Road, Pune",
  },
];

export default function Inventory() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(mockIngredients);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>(mockWasteRecords);
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [isAddingWaste, setIsAddingWaste] = useState(false);

  const lowStockCount = ingredients.filter((i) => i.isLowStock).length;
  const totalValue = ingredients.reduce(
    (sum, i) => sum + i.currentStock * i.costPerUnit,
    0
  );

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingIngredient(false);
  };

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Inventory Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Track ingredients, suppliers, and stock levels
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold mt-2">{ingredients.length}</p>
                </div>
                <Package className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Low Stock Items
                  </p>
                  <p className="text-2xl font-bold mt-2">{lowStockCount}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Inventory Value
                  </p>
                  <p className="text-2xl font-bold mt-2">
                    ₹{Math.round(totalValue).toLocaleString()}
                  </p>
                </div>
                <TrendingDown className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Suppliers</p>
                  <p className="text-2xl font-bold mt-2">{suppliers.length}</p>
                </div>
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockCount > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">
                    {lowStockCount} items running low
                  </p>
                  <p className="text-sm text-amber-800 mt-1">
                    {ingredients
                      .filter((i) => i.isLowStock)
                      .map((i) => i.name)
                      .join(", ")}{" "}
                    need reordering
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="expiry">Expiry Tracking</TabsTrigger>
            <TabsTrigger value="waste">Waste Management</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>

          {/* Ingredients Tab */}
          <TabsContent value="ingredients" className="space-y-4">
            <div className="flex justify-end">
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
                  <form onSubmit={handleAddIngredient} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="ing-name">Ingredient Name</Label>
                      <Input
                        id="ing-name"
                        placeholder="e.g., Paneer"
                        className="col-span-3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ing-unit">Unit of Measurement</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="liters">Liters</SelectItem>
                          <SelectItem value="pieces">Pieces</SelectItem>
                          <SelectItem value="dozen">Dozen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ing-stock">Current Stock</Label>
                      <Input
                        id="ing-stock"
                        type="number"
                        step="0.1"
                        placeholder="5.5"
                        className="col-span-3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ing-reorder">Reorder Level</Label>
                      <Input
                        id="ing-reorder"
                        type="number"
                        step="0.1"
                        placeholder="3"
                        className="col-span-3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ing-cost">Cost Per Unit (₹)</Label>
                      <Input
                        id="ing-cost"
                        type="number"
                        step="0.01"
                        placeholder="280"
                        className="col-span-3"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddingIngredient(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Add Ingredient</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ingredients ({ingredients.length})</CardTitle>
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
                          Unit
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Current Stock
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Reorder Level
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Cost/Unit
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Total Value
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingredients.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-border hover:bg-secondary/30 transition-colors"
                        >
                          <td className="py-4 px-4 font-medium">{item.name}</td>
                          <td className="py-4 px-4">{item.unit}</td>
                          <td className="py-4 px-4">
                            {item.currentStock} {item.unit}
                          </td>
                          <td className="py-4 px-4">
                            {item.reorderLevel} {item.unit}
                          </td>
                          <td className="py-4 px-4">₹{item.costPerUnit}</td>
                          <td className="py-4 px-4 font-semibold">
                            ₹
                            {Math.round(
                              item.currentStock * item.costPerUnit
                            ).toLocaleString()}
                          </td>
                          <td className="py-4 px-4">
                            {item.isLowStock ? (
                              <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                                Low Stock
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                                In Stock
                              </span>
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

          {/* Expiry Tracking Tab */}
          <TabsContent value="expiry" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Expiry Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Ingredient
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Batch Number
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Current Stock
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Expiry Date
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Days Left
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingredients
                        .filter((item) => item.expiryDate)
                        .map((item) => {
                          const daysLeft = item.expiryDate
                            ? Math.ceil(
                                (new Date(item.expiryDate).getTime() -
                                  new Date().getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            : 0;
                          let statusColor = "bg-green-100 text-green-800";
                          let statusText = "Good";
                          if (daysLeft <= 0) {
                            statusColor = "bg-red-100 text-red-800";
                            statusText = "Expired";
                          } else if (daysLeft <= 7) {
                            statusColor = "bg-amber-100 text-amber-800";
                            statusText = "Expiring Soon";
                          }
                          return (
                            <tr
                              key={item.id}
                              className="border-b border-border hover:bg-secondary/30 transition-colors"
                            >
                              <td className="py-4 px-4 font-medium">
                                {item.name}
                              </td>
                              <td className="py-4 px-4">
                                {item.batchNumber}
                              </td>
                              <td className="py-4 px-4">
                                {item.currentStock} {item.unit}
                              </td>
                              <td className="py-4 px-4">
                                {item.expiryDate}
                              </td>
                              <td className="py-4 px-4 font-semibold">
                                {daysLeft > 0 ? `${daysLeft} days` : "Expired"}
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
                                >
                                  {statusText}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Waste Management Tab */}
          <TabsContent value="waste" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isAddingWaste} onOpenChange={setIsAddingWaste}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Record Waste
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Waste</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setIsAddingWaste(false);
                    }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="waste-ingredient">Ingredient</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ingredient" />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients.map((item) => (
                            <SelectItem key={item.id} value={item.name}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="waste-quantity">Quantity Wasted</Label>
                      <Input
                        id="waste-quantity"
                        type="number"
                        step="0.1"
                        placeholder="0.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="waste-reason">Reason</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Expired">Expired</SelectItem>
                          <SelectItem value="Damaged">Damaged</SelectItem>
                          <SelectItem value="Spoiled">Spoiled</SelectItem>
                          <SelectItem value="Returned">Returned</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddingWaste(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Record Waste</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Waste Records
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      {wasteRecords.length}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="text-3xl font-bold mt-1">
                      ₹
                      {wasteRecords
                        .reduce((sum, record) => sum + record.cost, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-3xl font-bold mt-1">
                      ₹{Math.round(wasteRecords.reduce((sum, record) => sum + record.cost, 0) / wasteRecords.length).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Waste Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Ingredient
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Quantity
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Reason
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Cost Loss
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {wasteRecords.map((record) => (
                        <tr
                          key={record.id}
                          className="border-b border-border hover:bg-secondary/30 transition-colors"
                        >
                          <td className="py-4 px-4 font-medium">
                            {record.ingredientName}
                          </td>
                          <td className="py-4 px-4">
                            {record.quantity} {record.unit}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                record.reason === "Expired"
                                  ? "bg-red-100 text-red-800"
                                  : record.reason === "Spoiled"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {record.reason}
                            </span>
                          </td>
                          <td className="py-4 px-4">{record.date}</td>
                          <td className="py-4 px-4 font-semibold text-red-600">
                            ₹{record.cost}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isAddingSupplier} onOpenChange={setIsAddingSupplier}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Supplier
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Supplier</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddIngredient} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="sup-name">Supplier Name</Label>
                      <Input id="sup-name" placeholder="Fresh Foods Co" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sup-contact">Contact Number</Label>
                      <Input
                        id="sup-contact"
                        placeholder="9876543210"
                        type="tel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sup-email">Email</Label>
                      <Input
                        id="sup-email"
                        placeholder="sales@supplier.com"
                        type="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sup-address">Address</Label>
                      <Input
                        id="sup-address"
                        placeholder="123 Market Street"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddingSupplier(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Add Supplier</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliers.map((supplier) => (
                <Card key={supplier.id}>
                  <CardContent className="pt-6">
                    <p className="font-semibold text-lg">{supplier.name}</p>
                    <div className="space-y-2 mt-4 text-sm">
                      <p>
                        <span className="text-muted-foreground">Phone:</span>{" "}
                        {supplier.contact}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        {supplier.email}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Address:</span>{" "}
                        {supplier.address}
                      </p>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Create PO
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
