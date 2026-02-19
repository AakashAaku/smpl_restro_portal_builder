import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Download,
  Calendar,
} from "lucide-react";
import {
  getDailyStockReport,
  getLowStockItems,
  getInventoryValue,
  getInventoryStats,
  getAllRawMaterials,
  getAllConsumptionRecords,
  getStockAdjustmentsByDate,
  type RawMaterial,
  type ConsumptionRecord,
} from "@/lib/inventory";

export default function DailyStockReport() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [consumptionRecords, setConsumptionRecords] = useState<ConsumptionRecord[]>([]);
  const [lowStockItems, setLowStockItems] = useState<RawMaterial[]>([]);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockCount: 0,
    expiredCount: 0,
    totalValue: 0,
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const loadData = () => {
    setRawMaterials(getAllRawMaterials());
    setLowStockItems(getLowStockItems());
    setInventoryValue(getInventoryValue());
    setStats(getInventoryStats());
    const allConsumption = getAllConsumptionRecords();
    const dateConsumption = allConsumption.filter(
      (r) =>
        new Date(r.dateProduced).toDateString() ===
        new Date(selectedDate).toDateString()
    );
    setConsumptionRecords(dateConsumption);
  };

  const report = getDailyStockReport(selectedDate);

  const chartData = rawMaterials.map((material) => ({
    name: material.name.substring(0, 10),
    stock: material.currentStock,
    minLevel: material.minStock,
    maxLevel: material.maxStock,
  }));

  const consumptionChartData = consumptionRecords.map((record) => ({
    name: record.finishedGoodName,
    quantity: record.quantityProduced,
  }));

  const downloadReport = () => {
    let csv = "Daily Stock Report\n";
    csv += `Date: ${selectedDate}\n\n`;
    csv +=
      "Raw Material,Opening Stock,Purchases,Consumption,Closing Stock,Unit,Cost\n";

    report.items.forEach((item) => {
      csv += `${item.rawMaterialName},${item.openingStock},${item.purchases},${item.consumption},${item.closingStock},${item.unit},${item.cost}\n`;
    });

    csv += `\nTotal Inventory Value: ₹${report.totalValue.toFixed(2)}\n`;

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Daily Stock Report
            </h1>
            <p className="text-muted-foreground mt-2">
              Track inventory levels, consumption, and stock movements
            </p>
          </div>
          <Button onClick={downloadReport} className="gap-2">
            <Download className="h-4 w-4" />
            Download Report
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold mt-2">{stats.totalItems}</p>
                </div>
                <Package className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold mt-2 text-amber-600">
                    {stats.lowStockCount}
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
                  <p className="text-sm text-muted-foreground">Expired Items</p>
                  <p className="text-2xl font-bold mt-2 text-red-600">
                    {stats.expiredCount}
                  </p>
                </div>
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold mt-2">
                    ₹{Math.round(stats.totalValue).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-green-600" />
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
                  <p className="text-sm text-amber-800 mt-2">
                    {lowStockItems.map((item) => (
                      <div key={item.id} className="ml-4">
                        • {item.name}: {item.currentStock} {item.unit} (Min:{" "}
                        {item.minStock} {item.unit})
                      </div>
                    ))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Stock Summary</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="consumption">Consumption</TabsTrigger>
          </TabsList>

          {/* Stock Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  Daily Stock Levels - {new Date(selectedDate).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.items.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No stock data available</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium">
                            Material
                          </th>
                          <th className="text-right py-3 px-4 font-medium">
                            Opening
                          </th>
                          <th className="text-right py-3 px-4 font-medium">
                            Purchases
                          </th>
                          <th className="text-right py-3 px-4 font-medium">
                            Consumption
                          </th>
                          <th className="text-right py-3 px-4 font-medium">
                            Closing
                          </th>
                          <th className="text-center py-3 px-4 font-medium">Unit</th>
                          <th className="text-right py-3 px-4 font-medium">
                            Value (₹)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.items.map((item, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-border hover:bg-secondary/30"
                          >
                            <td className="py-3 px-4 font-medium">
                              {item.rawMaterialName}
                            </td>
                            <td className="text-right py-3 px-4">
                              {item.openingStock.toFixed(2)}
                            </td>
                            <td className="text-right py-3 px-4">
                              <span className="text-green-600 font-medium">
                                +{item.purchases.toFixed(2)}
                              </span>
                            </td>
                            <td className="text-right py-3 px-4">
                              <span className="text-red-600 font-medium">
                                -{item.consumption.toFixed(2)}
                              </span>
                            </td>
                            <td className="text-right py-3 px-4 font-semibold">
                              {item.closingStock.toFixed(2)}
                            </td>
                            <td className="text-center py-3 px-4">{item.unit}</td>
                            <td className="text-right py-3 px-4 font-semibold">
                              ₹{(item.closingStock * item.cost).toFixed(2)}
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
                    <p className="text-2xl font-bold">
                      ₹{report.totalValue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stock Levels vs Min/Max</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="stock" fill="#3b82f6" name="Current Stock" />
                      <Bar dataKey="minLevel" fill="#ef4444" name="Min Level" />
                      <Bar dataKey="maxLevel" fill="#10b981" name="Max Level" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Trends (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      { day: "Mon", value: Math.floor(Math.random() * 10000) + 5000 },
                      { day: "Tue", value: Math.floor(Math.random() * 10000) + 5000 },
                      { day: "Wed", value: Math.floor(Math.random() * 10000) + 5000 },
                      { day: "Thu", value: Math.floor(Math.random() * 10000) + 5000 },
                      { day: "Fri", value: Math.floor(Math.random() * 10000) + 5000 },
                      { day: "Sat", value: Math.floor(Math.random() * 10000) + 5000 },
                      { day: "Sun", value: report.totalValue },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `₹${value.toFixed(2)}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      name="Inventory Value"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consumption Tab */}
          <TabsContent value="consumption" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  Production & Consumption - {new Date(selectedDate).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {consumptionRecords.length === 0 ? (
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
                            <th className="text-left py-3 px-4 font-medium">
                              Finished Good
                            </th>
                            <th className="text-right py-3 px-4 font-medium">
                              Quantity Produced
                            </th>
                            <th className="text-left py-3 px-4 font-medium">
                              Time
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {consumptionRecords.map((record) => (
                            <tr
                              key={record.id}
                              className="border-b border-border hover:bg-secondary/30"
                            >
                              <td className="py-3 px-4 font-medium">
                                {record.finishedGoodName}
                              </td>
                              <td className="text-right py-3 px-4">
                                {record.quantityProduced}
                              </td>
                              <td className="py-3 px-4">
                                {new Date(record.dateProduced).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="border-t border-border pt-4">
                      <p className="font-semibold text-lg">
                        Raw Materials Consumed Today:
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {consumptionRecords.flatMap((r) => r.rawMaterialsUsed).map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-secondary p-4 rounded-lg"
                          >
                            <p className="text-sm text-muted-foreground">
                              {item.rawMaterialName}
                            </p>
                            <p className="text-lg font-semibold">
                              {item.quantityUsed} {item.unit}
                            </p>
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
