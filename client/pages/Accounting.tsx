import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  CreditCard,
  Banknote,
  PieChart as PieChartIcon,
  Calendar,
  AlertCircle,
} from "lucide-react";

// Daily Revenue Data
const dailyRevenueData = [
  { date: "Jan 1", revenue: 18000, expense: 8000, profit: 10000 },
  { date: "Jan 2", revenue: 22000, expense: 8500, profit: 13500 },
  { date: "Jan 3", revenue: 19000, expense: 7800, profit: 11200 },
  { date: "Jan 4", revenue: 24000, expense: 9200, profit: 14800 },
  { date: "Jan 5", revenue: 28000, expense: 10000, profit: 18000 },
  { date: "Jan 6", revenue: 26000, expense: 9800, profit: 16200 },
  { date: "Jan 7", revenue: 32000, expense: 11000, profit: 21000 },
];

// Monthly Revenue
const monthlyRevenueData = [
  { month: "Jan", revenue: 580000, expense: 290000, profit: 290000 },
  { month: "Feb", revenue: 620000, expense: 310000, profit: 310000 },
  { month: "Mar", revenue: 680000, expense: 340000, profit: 340000 },
  { month: "Apr", revenue: 720000, expense: 360000, profit: 360000 },
  { month: "May", revenue: 750000, expense: 375000, profit: 375000 },
  { month: "Jun", revenue: 820000, expense: 410000, profit: 410000 },
];

// Payment Methods
const paymentMethodsData = [
  { name: "Cash", value: 420000, color: "#10B981" },
  { name: "Card", value: 350000, color: "#3B82F6" },
  { name: "UPI", value: 380000, color: "#F59E0B" },
  { name: "Wallet", value: 120000, color: "#8B5CF6" },
];

// Expense Categories
const expenseData = [
  { category: "Food Cost", amount: 1450000, percent: 45 },
  { category: "Salary", amount: 800000, percent: 25 },
  { category: "Rent", amount: 300000, percent: 10 },
  { category: "Utilities", amount: 180000, percent: 6 },
  { category: "Marketing", amount: 120000, percent: 4 },
  { category: "Other", amount: 150000, percent: 10 },
];

export default function Accounting() {
  const [timeRange, setTimeRange] = useState("monthly");

  // Calculate Key Metrics
  const totalRevenue = monthlyRevenueData.reduce(
    (sum, item) => sum + item.revenue,
    0
  );
  const totalExpense = monthlyRevenueData.reduce(
    (sum, item) => sum + item.expense,
    0
  );
  const totalProfit = totalRevenue - totalExpense;
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);
  const avgDailyRevenue = (totalRevenue / 180).toFixed(0); // assuming 6 months * 30 days

  // Current Month Metrics
  const currentMonth = monthlyRevenueData[monthlyRevenueData.length - 1];
  const previousMonth = monthlyRevenueData[monthlyRevenueData.length - 2];
  const monthlyGrowth = (
    ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Accounting Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Financial analysis and business metrics
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold mt-1">
                    ₹{(totalRevenue / 100000).toFixed(2)}L
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    +{monthlyGrowth}% vs last month
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Expense</p>
                  <p className="text-2xl font-bold mt-1">
                    ₹{(totalExpense / 100000).toFixed(2)}L
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {((totalExpense / totalRevenue) * 100).toFixed(1)}% of revenue
                  </p>
                </div>
                <TrendingDown className="h-10 w-10 text-red-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className="text-2xl font-bold mt-1">
                    ₹{(totalProfit / 100000).toFixed(2)}L
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    {profitMargin}% profit margin
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Daily Revenue</p>
                  <p className="text-2xl font-bold mt-1">
                    ₹{(parseInt(avgDailyRevenue) / 1000).toFixed(1)}K
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Across 6 months
                  </p>
                </div>
                <Banknote className="h-10 w-10 text-purple-500 opacity-20" />
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
                  <LineChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#EF4444"
                      strokeWidth={2}
                      name="Expense"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Profit"
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
                <CardTitle>Daily Revenue & Profit (Jan 1-7)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dailyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
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
                        data={paymentMethodsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) =>
                          `${name}: ₹${(value / 100000).toFixed(1)}L`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentMethodsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
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
                  {paymentMethodsData.map((method) => (
                    <div
                      key={method.name}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: method.color }}
                        />
                        <span className="font-medium">{method.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{(method.value / 100000).toFixed(2)}L</p>
                        <p className="text-xs text-muted-foreground">
                          {((method.value / totalRevenue) * 100).toFixed(1)}%
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
                    data={expenseData}
                    layout="vertical"
                    margin={{ left: 150, right: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={140} />
                    <Tooltip
                      formatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                    />
                    <Bar dataKey="amount" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  <p className="font-bold">Expense Summary</p>
                  {expenseData.map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.category}</span>
                        <span className="font-bold">
                          ₹{(item.amount / 100000).toFixed(2)}L ({item.percent}%)
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500"
                          style={{ width: `${item.percent * 10}%` }}
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
                      style={{ width: `${parseFloat(profitMargin)}%` }}
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
                      {((totalExpense / totalRevenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${Math.min((totalExpense / totalRevenue) * 100, 100)}%`,
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
                      +{monthlyGrowth}%
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400"
                      style={{
                        width: `${Math.min(parseFloat(monthlyGrowth) * 5, 100)}%`,
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
              {[
                {
                  type: "Revenue",
                  desc: "Daily Sales - Jan 7",
                  amount: 32000,
                  color: "text-green-600",
                },
                {
                  type: "Expense",
                  desc: "Salary Payment",
                  amount: -11000,
                  color: "text-red-600",
                },
                {
                  type: "Revenue",
                  desc: "Daily Sales - Jan 6",
                  amount: 26000,
                  color: "text-green-600",
                },
                {
                  type: "Expense",
                  desc: "Food Supplies",
                  amount: -8500,
                  color: "text-red-600",
                },
                {
                  type: "Revenue",
                  desc: "Daily Sales - Jan 5",
                  amount: 28000,
                  color: "text-green-600",
                },
              ].map((txn, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{txn.type}</p>
                    <p className="text-xs text-muted-foreground">{txn.desc}</p>
                  </div>
                  <span className={`font-bold ${txn.color}`}>
                    {txn.amount > 0 ? "+" : ""}₹{Math.abs(txn.amount).toFixed(0)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
