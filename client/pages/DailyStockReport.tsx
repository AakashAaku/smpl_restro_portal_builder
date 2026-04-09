import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getIngredients,
  type Ingredient,
} from "@/lib/inventory-api";
import {
  getPurchases,
} from "@/lib/purchase-api";
import {
  getProductionRecords,
} from "@/lib/finished-goods-api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  TrendingUp,
  Package,
  DollarSign,
  Download,
  Loader2,
  Leaf,
  Sparkles,
  ChevronRight,
  ClipboardCheck,
  CalendarDays,
  History as HistoryIcon
} from "lucide-react";

export default function DailyStockReport() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Queries
  const { data: ingredients = [], isLoading: loadingIngs } = useQuery({
    queryKey: ["ingredients"],
    queryFn: getIngredients,
    refetchInterval: 5000,
  });

  const { data: productionRecords = [], isLoading: loadingRecords } = useQuery({
    queryKey: ["production-records"],
    queryFn: getProductionRecords,
  });

  const { data: purchases = [], isLoading: loadingPurchases } = useQuery({
    queryKey: ["purchases"],
    queryFn: getPurchases,
  });

  const isLoading = loadingIngs || loadingRecords || loadingPurchases;

  const lowStockItems = ingredients.filter(i => i.currentStock <= (i.minStock || 0));
  const totalValue = ingredients.reduce((sum, i) => sum + (i.currentStock * (i.unitPrice || 0)), 0);

  const dailyConsumption = productionRecords.filter(r =>
    new Date(r.dateProduced).toISOString().split("T")[0] === selectedDate
  );

  const dailyPurchases = purchases.filter(p =>
    new Date(p.purchaseDate).toISOString().split("T")[0] === selectedDate
  );

  const dailyInflowItems = dailyPurchases.flatMap(p => 
    (p.items || []).map((item: any) => ({
      ...item,
      supplier: p.supplier,
      requisitionNo: p.requisitionNo,
      purchaseId: p.id
    }))
  );

  const totalInflowValue = dailyPurchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const chartData = ingredients.map((item) => ({
    name: item.name.substring(0, 10),
    stock: item.currentStock,
    minLevel: item.minStock || 0,
    maxLevel: (item.minStock || 0) * 5 || 50,
  }));

  const consumptionChartData = dailyConsumption.map((record) => ({
    name: record.finishedGoodName,
    quantity: record.quantityProduced,
  }));

  const downloadReport = () => {
    let csv = "Daily Stock Report\n";
    csv += `Date: ${selectedDate}\n\n`;
    csv += "Material,Current Stock,Unit,Last Purchase Price,Value\n";

    ingredients.forEach((item) => {
      const price = item.unitPrice || 0;
      csv += `${item.name},${item.currentStock},${item.unit},${price},${(item.currentStock * price).toFixed(2)}\n`;
    });

    csv += `\nTotal Inventory Value: Rs.${totalValue.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-report-${selectedDate}.csv`;
    a.click();
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
              VenzoSmart • Stock Auditing
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-sidebar-foreground">
            Daily Stock <span className="text-primary italic">Intelligence</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic">
            "Batch Verification & Resource Analytics"
          </p>
        </div>
        <Button onClick={downloadReport} className="h-12 px-8 rounded-xl font-bold border-none shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-[1.02]">
          <Download className="h-4 w-4" />
          EXPORT MASTER SHEET
        </Button>
      </div>

      {/* Date Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="reportDate">Select Date</Label>
              <Input
                id="reportDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
            >
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="premium-card border-none shadow-lg overflow-hidden group">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Catalog Size</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground">{ingredients.length}</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-2">Tracked raw materials</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Low Reserves</p>
                <p className="text-3xl font-black tracking-tight text-amber-600">
                  {lowStockItems.length}
                </p>
                <p className="text-[10px] text-amber-600 font-bold mt-2">Procurement required</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Batch Cycles</p>
                <p className="text-3xl font-black tracking-tight text-blue-600">
                  {dailyConsumption.length}
                </p>
                <p className="text-[10px] text-blue-600 font-bold mt-2">Active production runs</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Net Valuation</p>
                <p className="text-3xl font-black tracking-tight text-emerald-700">
                  Rs.{Math.round(totalValue).toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-600 font-bold mt-2">Liquid asset value</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">
                  {lowStockItems.length} items running low on stock
                </p>
                <div className="text-sm text-amber-800 mt-2 space-y-1">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="ml-4">
                      • {item.name}: {item.currentStock} {item.unit} (Min:{" "}
                      {item.minStock || 0} {item.unit})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Stock Summary</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="inflow">Stock Inflow</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
        </TabsList>

        {/* Stock Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory Levels</CardTitle>
            </CardHeader>
            <CardContent>
              {ingredients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No stock data available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">Material</th>
                        <th className="text-right py-3 px-4 font-medium">Current Stock</th>
                        <th className="text-right py-3 px-4 font-medium">Min Stock</th>
                        <th className="text-center py-3 px-4 font-medium">Unit</th>
                        <th className="text-right py-3 px-4 font-medium">Unit Cost (₹)</th>
                        <th className="text-right py-3 px-4 font-medium">Total Value (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingredients.map((item) => (
                        <tr key={item.id} className="border-b border-border hover:bg-secondary/30">
                          <td className="py-3 px-4 font-medium">{item.name}</td>
                          <td className={`text-right py-3 px-4 font-semibold ${item.currentStock <= (item.minStock || 0) ? "text-red-600" : ""}`}>
                            {item.currentStock}
                          </td>
                          <td className="text-right py-3 px-4 text-muted-foreground">{item.minStock || 0}</td>
                          <td className="text-center py-3 px-4">{item.unit}</td>
                          <td className="text-right py-3 px-4 font-medium text-muted-foreground">
                            ₹{(item.unitPrice || 0).toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-4 font-semibold">
                            ₹{(item.currentStock * (item.unitPrice || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex justify-between">
                  <p className="font-semibold">Total Inventory Value</p>
                  <p className="text-2xl font-bold">₹{totalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Levels vs Min Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stock" fill="#3b82f6" name="Current Stock" />
                    <Bar dataKey="minLevel" fill="#ef4444" name="Min Level" />
                    <Bar dataKey="maxLevel" fill="#10b981" name="Max Capacity Est." />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Inflow Tab */}
        <TabsContent value="inflow" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Inventory Restock Inflow - {new Date(selectedDate).toLocaleDateString()}</CardTitle>
              <div className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-emerald-600" />
                <span className="text-[10px] font-black text-emerald-700 uppercase">Total Inflow: Rs.{totalInflowValue.toLocaleString()}</span>
              </div>
            </CardHeader>
            <CardContent>
              {dailyPurchases.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HistoryIcon className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-muted-foreground font-medium">No stock inflows recorded for this date</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                        <th className="text-left py-4 px-4">Material</th>
                        <th className="text-left py-4 px-4">Supplier</th>
                        <th className="text-right py-4 px-4">Quantity</th>
                        <th className="text-right py-4 px-4">Unit Price</th>
                        <th className="text-right py-4 px-4">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyInflowItems.map((item, idx) => (
                        <tr key={`${item.purchaseId}-${idx}`} className="border-b border-border/50 hover:bg-emerald-50/30 transition-colors group">
                          <td className="py-4 px-4 font-bold text-emerald-950">
                            <div className="flex flex-col">
                              <span>{item.ingredientName}</span>
                              {item.requisitionNo && (
                                <span className="text-[8px] text-blue-500 font-black tracking-widest uppercase">Ref: {item.requisitionNo}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-600 italic">{item.supplier}</td>
                          <td className="text-right py-4 px-4">
                             <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-black text-[10px]">+{item.quantity} {item.unit}</span>
                          </td>
                          <td className="text-right py-4 px-4 text-slate-500 font-medium">Rs.{(item.unitPrice || 0).toFixed(2)}</td>
                          <td className="text-right py-4 px-4 font-bold text-emerald-700">Rs.{(item.totalCost || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-6 p-4 bg-emerald-900 rounded-xl text-white flex justify-between items-center shadow-xl shadow-emerald-900/20">
                    <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-emerald-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-200">Daily Procurement total</span>
                    </div>
                    <span className="text-xl font-black">Rs.{totalInflowValue.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="consumption" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Production & Consumption - {new Date(selectedDate).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyConsumption.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No production/consumption records for this date
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {consumptionChartData.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={consumptionChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="quantity" fill="#8b5cf6" name="Quantity Produced" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium">Finished Good</th>
                          <th className="text-right py-3 px-4 font-medium">Quantity Produced</th>
                          <th className="text-left py-3 px-4 font-medium">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyConsumption.map((record) => (
                          <tr key={record.id} className="border-b border-border hover:bg-secondary/30">
                            <td className="py-3 px-4 font-medium">{record.finishedGoodName}</td>
                            <td className="text-right py-3 px-4 font-semibold">{record.quantityProduced}</td>
                            <td className="py-3 px-4">{new Date(record.dateProduced).toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="font-semibold text-lg">Raw Materials Consumed in Production:</p>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {dailyConsumption.flatMap((r) => r.rawMaterialsUsed || []).map((item, idx) => (
                        <div key={idx} className="bg-secondary p-4 rounded-lg">
                          <p className="text-xs text-muted-foreground">{item.ingredientName}</p>
                          <p className="text-lg font-semibold">{item.quantityUsed} {item.unit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
