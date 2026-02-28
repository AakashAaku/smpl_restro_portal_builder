import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  getFinancialSummary,
  getDailySalesReport,
  getMonthlySalesReport,
  getPaymentBreakdown,
  getExpenses,
} from "@/lib/accounting-api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Banknote,
  AlertCircle,
  Loader2,
  Leaf,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  Waves
} from "lucide-react";

export default function Accounting() {
  const [timeRange, setTimeRange] = useState("monthly");

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["financial-summary"],
    queryFn: getFinancialSummary,
  });

  const { data: dailyData, isLoading: dailyLoading } = useQuery({
    queryKey: ["daily-sales"],
    queryFn: getDailySalesReport,
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ["monthly-sales"],
    queryFn: getMonthlySalesReport,
  });

  const { data: paymentData, isLoading: paymentLoading } = useQuery({
    queryKey: ["payment-breakdown"],
    queryFn: getPaymentBreakdown,
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: getExpenses,
  });

  if (summaryLoading || dailyLoading || monthlyLoading || paymentLoading || expensesLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { revenue = 0, expenses: totalExpense = 0, profit = 0, profitMargin = "0", growth = "0" } = summary || {};

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
              VenzoSmart • Financial Intelligence
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-sidebar-foreground">
            Treasury <span className="text-primary italic">Analysis</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic">
            "Sustaining Organic Growth through Precision Accounting"
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="premium-card border-none shadow-lg overflow-hidden group">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Total Inflow</p>
                <p className="text-3xl font-black tracking-tight text-emerald-700">
                  Rs.{(revenue / 100000).toFixed(2)}L
                </p>
                <p className="text-[10px] text-emerald-600 font-bold mt-2">
                  +{growth}% vs last cycle
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden group">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Total Burn</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground">
                  Rs.{(totalExpense / 100000).toFixed(2)}L
                </p>
                <p className="text-[10px] text-muted-foreground/60 font-bold mt-2">
                  {revenue > 0 ? ((totalExpense / revenue) * 100).toFixed(1) : 0}% of revenue
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shadow-sm">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden group">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Net Yield</p>
                <p className="text-3xl font-black tracking-tight text-primary">
                  Rs.{(profit / 100000).toFixed(2)}L
                </p>
                <p className="text-[10px] text-primary font-bold mt-2">
                  {profitMargin}% efficiency
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden group">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Daily Rolling</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground">
                  Rs.{(revenue / 180 / 1000).toFixed(1)}K
                </p>
                <p className="text-[10px] text-muted-foreground/60 font-bold mt-2">
                  6-month aggregate
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
                <Banknote className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Expense Comparison */}
      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="expenses">Expense Breakdown</TabsTrigger>
        </TabsList>

        {/* Monthly Revenue/Expense Chart */}
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Expense Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => `Rs.${(value / 1000).toFixed(0)}K`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#059669"
                    strokeWidth={4}
                    dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#ca8a04"
                    strokeWidth={4}
                    dot={{ fill: '#ca8a04', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Expense"
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#10b981"
                    strokeWidth={4}
                    strokeDasharray="5 5"
                    name="Net Yield"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Revenue Chart */}
        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue & Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => `Rs.${(value / 1000).toFixed(0)}K`}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                  <Bar dataKey="expense" fill="#EF4444" name="Expense" />
                  <Bar dataKey="profit" fill="#3B82F6" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods */}
        <TabsContent value="payments">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) =>
                        `${name}: Rs.${(value / 100000).toFixed(1)}L`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentData?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color || "#3B82F6"} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => `Rs.${(value / 1000).toFixed(0)}K`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentData?.map((method: any) => (
                  <div
                    key={method.name}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: method.color || "#3B82F6" }}
                      />
                      <span className="font-medium">{method.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Rs.{(method.value / 100000).toFixed(2)}L</p>
                      <p className="text-xs text-muted-foreground">
                        {revenue > 0 ? ((method.value / revenue) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expense Breakdown */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={expenses}
                  layout="vertical"
                  margin={{ left: 150, right: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={140} />
                  <Tooltip
                    formatter={(value: any) => `Rs.${(value / 1000).toFixed(0)}K`}
                  />
                  <Bar dataKey="amount" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                <p className="font-bold">Expense Summary</p>
                {expenses?.map((item: any) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.category}</span>
                      <span className="font-bold">
                        Rs.{(item.amount / 100000).toFixed(2)}L ({item.percent || 0}%)
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${(item.percent || 0) * 1}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Financial Health and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Financial Health Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Profit Margin</span>
                  <span className="text-sm font-bold">{profitMargin}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${Math.min(parseFloat(profitMargin), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Healthy profit margin (Target: 35-40%)
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Cost Ratio</span>
                  <span className="text-sm font-bold">
                    {revenue > 0 ? ((totalExpense / revenue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${Math.min(revenue > 0 ? (totalExpense / revenue) * 100 : 0, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Operating efficiently
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Revenue Growth</span>
                  <span className="text-sm font-bold text-green-600">
                    +{growth}%
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-400"
                    style={{
                      width: `${Math.min(parseFloat(growth) * 5, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Month over month growth
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Typically would come from a transactions API */}
            <p className="text-sm text-muted-foreground italic">
              Transaction history is being synchronized...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
