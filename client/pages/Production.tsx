import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useState } from "react";
import { Plus, Clock, TrendingUp, AlertCircle } from "lucide-react";

interface PrepList {
  id: number;
  date: string;
  shift: "morning" | "afternoon" | "evening";
  items: PrepItem[];
  status: "pending" | "in-progress" | "completed";
}

interface PrepItem {
  itemId: number;
  itemName: string;
  category: string;
  expectedOrders: number;
  prepQuantity: number;
  prepTime: number;
  assignedTo?: string;
  status: "pending" | "in-progress" | "completed";
}

const mockPrepLists: PrepList[] = [
  {
    id: 1,
    date: "2024-01-26",
    shift: "morning",
    status: "in-progress",
    items: [
      {
        itemId: 1,
        itemName: "Butter Chicken",
        category: "Main Course",
        expectedOrders: 12,
        prepQuantity: 15,
        prepTime: 90,
        assignedTo: "Arjun",
        status: "in-progress",
      },
      {
        itemId: 2,
        itemName: "Paneer Tikka Masala",
        category: "Main Course",
        expectedOrders: 10,
        prepQuantity: 12,
        prepTime: 75,
        assignedTo: "Vikram",
        status: "completed",
      },
      {
        itemId: 3,
        itemName: "Garlic Naan",
        category: "Breads",
        expectedOrders: 30,
        prepQuantity: 40,
        prepTime: 120,
        assignedTo: "Ravi",
        status: "pending",
      },
    ],
  },
  {
    id: 2,
    date: "2024-01-26",
    shift: "afternoon",
    status: "pending",
    items: [
      {
        itemId: 4,
        itemName: "Biryani",
        category: "Main Course",
        expectedOrders: 8,
        prepQuantity: 10,
        prepTime: 180,
        status: "pending",
      },
      {
        itemId: 5,
        itemName: "Gulab Jamun",
        category: "Desserts",
        expectedOrders: 15,
        prepQuantity: 20,
        prepTime: 45,
        status: "pending",
      },
    ],
  },
];

const forecastData = [
  { day: "Mon", expected: 35, avg: 32 },
  { day: "Tue", expected: 38, avg: 30 },
  { day: "Wed", expected: 42, avg: 35 },
  { day: "Thu", expected: 28, avg: 25 },
  { day: "Fri", expected: 52, avg: 48 },
  { day: "Sat", expected: 68, avg: 62 },
  { day: "Sun", expected: 45, avg: 40 },
];

export default function Production() {
  const [prepLists, setPrepLists] = useState<PrepList[]>(mockPrepLists);
  const [selectedShift, setSelectedShift] = useState("all");
  const [isAddingPrepList, setIsAddingPrepList] = useState(false);

  const filteredPrepLists =
    selectedShift === "all"
      ? prepLists
      : prepLists.filter((p) => p.shift === selectedShift);

  const totalPrepItems = prepLists.reduce((sum, p) => sum + p.items.length, 0);
  const completedItems = prepLists.reduce(
    (sum, p) =>
      sum + p.items.filter((i) => i.status === "completed").length,
    0
  );
  const inProgressItems = prepLists.reduce(
    (sum, p) =>
      sum + p.items.filter((i) => i.status === "in-progress").length,
    0
  );

  const totalPrepTime = prepLists.reduce(
    (sum, p) => sum + p.items.reduce((itemSum, i) => itemSum + i.prepTime, 0),
    0
  );

  const handleAddPrepList = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingPrepList(false);
  };

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Production Planning
            </h1>
            <p className="text-muted-foreground mt-2">
              Kitchen forecasting, prep lists, and production schedules
            </p>
          </div>
          <Dialog open={isAddingPrepList} onOpenChange={setIsAddingPrepList}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Prep List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Prep List</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPrepList} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prep-date">Date</Label>
                  <Input
                    id="prep-date"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prep-shift">Shift</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (6 AM - 12 PM)</SelectItem>
                      <SelectItem value="afternoon">
                        Afternoon (12 PM - 6 PM)
                      </SelectItem>
                      <SelectItem value="evening">
                        Evening (6 PM - 12 AM)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prep-forecast">Expected Orders</Label>
                  <Input
                    id="prep-forecast"
                    type="number"
                    placeholder="50"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingPrepList(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Prep List</Button>
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
                  <p className="text-sm text-muted-foreground">Total Prep Items</p>
                  <p className="text-2xl font-bold mt-2">{totalPrepItems}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {completedItems} completed
                  </p>
                </div>
                <Clock className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold mt-2">{inProgressItems}</p>
                  <p className="text-xs text-amber-600 mt-2">Being prepared</p>
                </div>
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Prep Time
                  </p>
                  <p className="text-2xl font-bold mt-2">
                    {Math.round(totalPrepTime / 60)} hrs
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    All items
                  </p>
                </div>
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Completion Rate
                  </p>
                  <p className="text-2xl font-bold mt-2">
                    {totalPrepItems > 0
                      ? Math.round((completedItems / totalPrepItems) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-green-600 mt-2">On track</p>
                </div>
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="prep-lists" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prep-lists">Prep Lists</TabsTrigger>
            <TabsTrigger value="forecast">Demand Forecast</TabsTrigger>
            <TabsTrigger value="kitchen">Kitchen Station</TabsTrigger>
          </TabsList>

          {/* Prep Lists Tab */}
          <TabsContent value="prep-lists" className="space-y-6">
            <div className="flex gap-4 items-center">
              <Label>Filter by Shift:</Label>
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shifts</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredPrepLists.map((prepList) => (
              <Card key={prepList.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-lg capitalize">
                        {prepList.shift} Shift - {prepList.date}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {prepList.items.length} items to prepare
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        prepList.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : prepList.status === "in-progress"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {prepList.status === "completed"
                        ? "Completed"
                        : prepList.status === "in-progress"
                          ? "In Progress"
                          : "Pending"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-sm">
                            Item
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-sm">
                            Category
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-sm">
                            Expected Orders
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-sm">
                            Prep Quantity
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-sm">
                            Prep Time
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-sm">
                            Assigned To
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-sm">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {prepList.items.map((item) => (
                          <tr
                            key={item.itemId}
                            className="border-b border-border hover:bg-secondary/30"
                          >
                            <td className="py-4 px-4 font-medium">
                              {item.itemName}
                            </td>
                            <td className="py-4 px-4">{item.category}</td>
                            <td className="py-4 px-4">{item.expectedOrders}</td>
                            <td className="py-4 px-4">{item.prepQuantity}</td>
                            <td className="py-4 px-4">{item.prepTime} min</td>
                            <td className="py-4 px-4">
                              {item.assignedTo || "—"}
                            </td>
                            <td className="py-4 px-4">
                              {item.status === "completed" ? (
                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                                  Done
                                </span>
                              ) : item.status === "in-progress" ? (
                                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                                  In Progress
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
                                  Pending
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
            ))}
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast">
            <Card>
              <CardHeader>
                <CardTitle>7-Day Demand Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecastData.map((data) => (
                    <div key={data.day} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                      <div className="w-16 font-medium">{data.day}</div>
                      <div className="flex-1 max-w-sm">
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            <div className="h-8 bg-secondary rounded overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${(data.expected / 70) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right min-w-24">
                            <p className="font-semibold">{data.expected} orders</p>
                            <p className="text-xs text-muted-foreground">
                              vs {data.avg} avg
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kitchen Station Tab */}
          <TabsContent value="kitchen">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Main Course Station</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border-l-4 border-amber-500 bg-amber-50 rounded">
                      <p className="font-medium">Butter Chicken</p>
                      <p className="text-sm text-muted-foreground">
                        Prep Time: 90 min | Qty: 15
                      </p>
                      <p className="text-xs font-semibold text-amber-700 mt-1">
                        In Progress - 45 min remaining
                      </p>
                    </div>
                    <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded">
                      <p className="font-medium">Paneer Tikka Masala</p>
                      <p className="text-sm text-muted-foreground">
                        Prep Time: 75 min | Qty: 12
                      </p>
                      <p className="text-xs font-semibold text-green-700 mt-1">
                        ✓ Completed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Breads Station</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border-l-4 border-gray-400 bg-gray-50 rounded">
                      <p className="font-medium">Garlic Naan</p>
                      <p className="text-sm text-muted-foreground">
                        Prep Time: 120 min | Qty: 40
                      </p>
                      <p className="text-xs font-semibold text-gray-700 mt-1">
                        Pending - Not started
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
}
