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
import { useState, useEffect } from "react";
import { Plus, Clock, TrendingUp, AlertCircle, Loader2, Leaf, Sparkles, ChefHat, Timer, Zap, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import {
  getPrepLists,
  createPrepList,
  updatePrepItemStatus,
  getForecast,
  type PrepList,
  type PrepItem
} from "@/lib/production-api";

export default function Production() {
  const [prepLists, setPrepLists] = useState<PrepList[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [selectedShift, setSelectedShift] = useState("all");
  const [isAddingPrepList, setIsAddingPrepList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [listData, forecastData] = await Promise.all([
        getPrepLists(),
        getForecast()
      ]);
      setPrepLists(listData);
      setForecast(forecastData);
    } catch (error) {
      toast.error("Failed to load production planning data");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleAddPrepList = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app, we'd collect form data here
      // For now, this is a placeholder for the API call
      toast.info("Create Prep List functionality will be fully implemented with form fields");
      setIsAddingPrepList(false);
    } catch (error) {
      toast.error("Failed to create prep list");
    }
  };

  const handleStatusUpdate = async (prepListId: number, itemId: number, newStatus: string) => {
    try {
      await updatePrepItemStatus(prepListId, itemId, newStatus);
      toast.success("Status updated");
      loadData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              VenzoSmart • Culinary Operations
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-sidebar-foreground">
            Production <span className="text-primary italic">Planning</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic">
            "Precision Preparation for 110% Pure Veg Excellence"
          </p>
        </div>
        <Dialog open={isAddingPrepList} onOpenChange={setIsAddingPrepList}>
          <DialogTrigger asChild>
            <Button className="h-12 px-8 rounded-xl font-bold border-none shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-[1.02]">
              <Plus className="h-5 w-5" />
              GENERATE PREP LIST
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="premium-card border-none shadow-lg overflow-hidden group">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Queue Density</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground">{totalPrepItems}</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-2">{completedItems} finalized cycles</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <ClipboardList className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Active Prep</p>
                <p className="text-3xl font-black tracking-tight text-amber-600">{inProgressItems}</p>
                <p className="text-[10px] text-amber-600 font-bold mt-2">Current kitchen activity</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                <Timer className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Labor Commitment</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground">
                  {Math.round(totalPrepTime / 60)}<span className="text-sm text-muted-foreground">h</span>
                </p>
                <p className="text-[10px] text-blue-600 font-bold mt-2">Allocated preparation time</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Efficiency</p>
                <p className="text-3xl font-black tracking-tight text-emerald-700">
                  {totalPrepItems > 0 ? Math.round((completedItems / totalPrepItems) * 100) : 0}%
                </p>
                <p className="text-[10px] text-emerald-600 font-bold mt-2">Plan adherence rate</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <Zap className="h-6 w-6" />
              </div>
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

          {filteredPrepLists.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No prep lists found for the selected shift.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredPrepLists.map((prepList) => (
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
                      className={`px-3 py-1 rounded-full text-xs font-medium ${prepList.status === "completed"
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
                            key={item.id}
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
                              <Select
                                value={item.status}
                                onValueChange={(val) => handleStatusUpdate(prepList.id, item.id, val)}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>7-Day Demand Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecast.map((data) => (
                  <div key={data.day} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                    <div className="w-16 font-medium">{data.day}</div>
                    <div className="flex-1 max-w-sm">
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <div className="h-8 bg-secondary rounded overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${(data.expected / 100) * 100}%` }}
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
            {prepLists.some(p => p.items.some(i => i.category === "Main Course")) && (
              <Card>
                <CardHeader>
                  <CardTitle>Main Course Station</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prepLists.flatMap(p => p.items)
                      .filter(i => i.category === "Main Course")
                      .map(item => (
                        <div key={item.id} className={`p-3 border-l-4 rounded ${item.status === 'completed' ? 'border-green-500 bg-green-50' :
                          item.status === 'in-progress' ? 'border-amber-500 bg-amber-50' :
                            'border-gray-400 bg-gray-50'
                          }`}>
                          <p className="font-medium">{item.itemName}</p>
                          <p className="text-sm text-muted-foreground">
                            Prep Time: {item.prepTime} min | Qty: {item.prepQuantity}
                          </p>
                          <p className={`text-xs font-semibold mt-1 ${item.status === 'completed' ? 'text-green-700' :
                            item.status === 'in-progress' ? 'text-amber-700' :
                              'text-gray-700'
                            }`}>
                            {item.status === 'completed' ? '✓ Completed' :
                              item.status === 'in-progress' ? 'In Progress' :
                                'Pending'}
                          </p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {prepLists.some(p => p.items.some(i => i.category === "Breads")) && (
              <Card>
                <CardHeader>
                  <CardTitle>Breads Station</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prepLists.flatMap(p => p.items)
                      .filter(i => i.category === "Breads")
                      .map(item => (
                        <div key={item.id} className={`p-3 border-l-4 rounded ${item.status === 'completed' ? 'border-green-500 bg-green-50' :
                          item.status === 'in-progress' ? 'border-amber-500 bg-amber-50' :
                            'border-gray-400 bg-gray-50'
                          }`}>
                          <p className="font-medium">{item.itemName}</p>
                          <p className="text-sm text-muted-foreground">
                            Prep Time: {item.prepTime} min | Qty: {item.prepQuantity}
                          </p>
                          <p className={`text-xs font-semibold mt-1 ${item.status === 'completed' ? 'text-green-700' :
                            item.status === 'in-progress' ? 'text-amber-700' :
                              'text-gray-700'
                            }`}>
                            {item.status === 'completed' ? '✓ Completed' :
                              item.status === 'in-progress' ? 'In Progress' :
                                'Pending'}
                          </p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
