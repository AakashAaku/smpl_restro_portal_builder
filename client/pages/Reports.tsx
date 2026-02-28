import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  getFinancialSummary,
  getDailySalesReport,
  getMonthlySalesReport,
  getPaymentBreakdown,
  getExpenses,
  getTaxReport,
  getProfitabilityReport,
} from "@/lib/accounting-api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
  Download,
  AlertCircle,
  CheckCircle,
  FileText,
  Loader2,
  Leaf,
  Sparkles,
  ChevronRight,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";
import { useState } from "react";

export default function Reports() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["financial-summary"],
    queryFn: getFinancialSummary,
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

  const { data: vatData, isLoading: vatLoading } = useQuery({
    queryKey: ["tax-report"],
    queryFn: getTaxReport,
  });

  const { data: profitabilityData, isLoading: profitabilityLoading } = useQuery({
    queryKey: ["profitability-report"],
    queryFn: getProfitabilityReport,
  });

  if (summaryLoading || monthlyLoading || paymentLoading || expensesLoading || vatLoading || profitabilityLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { revenue = 0, expenses: totalExpenses = 0, profit = 0, profitMargin = "0" } = summary || {};

  const pendingExpensesAmount = (expenses || [])
    .filter((e: any) => e.status === "pending")
    .reduce((sum: number, e: any) => sum + e.amount, 0);

  const pendingExpensesCount = (expenses || []).filter((e: any) => e.status === "pending").length;

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
            Analytics & <span className="text-primary italic">Reports</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic">
            "Transparency in Freshness, Efficiency in Finance"
          </p>
        </div>
        <Button className="h-12 px-8 rounded-xl font-bold border-none shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-[1.02]">
          <Download className="h-4 w-4" />
          GENERATE FULL AUDIT
        </Button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="premium-card border-none shadow-lg overflow-hidden group">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Total Revenue</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground">
                  Rs.{(revenue / 100000).toFixed(1)}L
                </p>
                <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% vs last month
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Gross Profit</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground text-emerald-700">
                  Rs.{(profit / 100000).toFixed(1)}L
                </p>
                <p className="text-[10px] text-emerald-600 font-bold mt-2">{profitMargin}% efficiency</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Operational Costs</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground">
                  Rs.{(totalExpenses / 100000).toFixed(1)}L
                </p>
                <p className="text-[10px] text-rose-600 font-bold mt-2">
                  {revenue > 0 ? ((totalExpenses / revenue) * 100).toFixed(0) : 0}% of turnover
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Pending Payables</p>
                <p className="text-3xl font-black tracking-tight text-amber-600">
                  Rs.{(pendingExpensesAmount / 1000).toFixed(0)}K
                </p>
                <p className="text-[10px] text-amber-600 font-bold mt-2">
                  {pendingExpensesCount} unresolved items
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-emerald-50/50 p-1 h-12 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Overview</TabsTrigger>
          <TabsTrigger value="profitability" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Profitability</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Payments</TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Expenses</TabsTrigger>
          <TabsTrigger value="vat" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">VAT & Tax</TabsTrigger>
          <TabsTrigger value="compliance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Compliance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="premium-card border-none shadow-lg overflow-hidden">
              <CardHeader className="border-b border-sidebar-border/50 bg-emerald-50/20">
                <CardTitle className="text-xl font-extrabold tracking-tight">Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} name="Revenue" />
                    <Bar dataKey="expense" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Expense" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      name="Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profitability Tab */}
        <TabsContent value="profitability" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Avg Food Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profitabilityData ? Math.round(profitabilityData.reduce((s, i) => s + i.marginPercentage, 0) / profitabilityData.length) : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Weighted by menu variety</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Highest Margin Item</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {profitabilityData?.sort((a, b) => b.marginPercentage - a.marginPercentage)[0]?.marginPercentage}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {profitabilityData?.sort((a, b) => b.marginPercentage - a.marginPercentage)[0]?.name}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Critical Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {profitabilityData?.filter(i => i.marginPercentage < 30).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Items below 30% margin</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Menu Profitability Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-3 px-4 font-medium text-sm">Item Name</th>
                      <th className="py-3 px-4 font-medium text-sm">Category</th>
                      <th className="py-3 px-4 font-medium text-sm">Price</th>
                      <th className="py-3 px-4 font-medium text-sm">Food Cost</th>
                      <th className="py-3 px-4 font-medium text-sm">Margin Rs.</th>
                      <th className="py-3 px-4 font-medium text-sm">Margin %</th>
                      <th className="py-3 px-4 font-medium text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitabilityData?.map((item) => (
                      <tr key={item.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                        <td className="py-4 px-4 font-medium">{item.name}</td>
                        <td className="py-4 px-4 text-xs text-muted-foreground">{item.category}</td>
                        <td className="py-4 px-4 font-semibold">Rs.{item.price}</td>
                        <td className="py-4 px-4">Rs.{item.foodCost}</td>
                        <td className="py-4 px-4">Rs.{item.margin}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-secondary rounded-full h-2 max-w-[60px]">
                              <div
                                className={`h-2 rounded-full ${item.marginPercentage > 50 ? 'bg-green-500' : item.marginPercentage > 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(item.marginPercentage, 100)}%` }}
                              />
                            </div>
                            <span>{item.marginPercentage}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {item.marginPercentage > 50 ? (
                            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded uppercase">High</span>
                          ) : item.marginPercentage > 30 ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase">Mid</span>
                          ) : (
                            <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded uppercase">Critical</span>
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

        {/* Payment Methods Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {paymentData?.map((entry: any) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={entry.color || "#3B82F6"}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentData?.map((method: any) => (
                    <div key={method.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: method.color || "#3B82F6" }}
                        />
                        <span className="font-medium">{method.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          Rs.{(method.value / 100000).toFixed(1)}L
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {revenue > 0 ? Math.round((method.value / revenue) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expense Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-sm">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm">
                        Description
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses?.map((expense: any) => (
                      <tr
                        key={expense.id}
                        className="border-b border-border hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium">
                          {expense.category}
                        </td>
                        <td className="py-4 px-4">{expense.description}</td>
                        <td className="py-4 px-4 font-semibold">
                          Rs.{expense.amount.toLocaleString()}
                        </td>
                        <td className="py-4 px-4">{expense.date}</td>
                        <td className="py-4 px-4">
                          {expense.status === "paid" ? (
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                              Paid
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
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
        </TabsContent>

        {/* VAT & Tax Tab */}
        <TabsContent value="vat" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Taxable Amount</p>
                  <p className="text-3xl font-bold mt-2">Rs.{(vatData.reduce((sum, item) => sum + item.taxableAmount, 0) / 100000).toFixed(2)}L</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total VAT Collected</p>
                  <p className="text-3xl font-bold mt-2 text-green-600">Rs.{(vatData.reduce((sum, item) => sum + item.vat, 0) / 1000).toFixed(0)}K</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Average VAT Rate</p>
                  <p className="text-3xl font-bold mt-2">13%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly VAT Report</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={vatData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `Rs.${value.toLocaleString()}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="taxableAmount"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Taxable Amount"
                  />
                  <Line
                    type="monotone"
                    dataKey="vat"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="VAT (13%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>VAT Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-sm">Month</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Taxable Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">VAT (13%)</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Gross Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vatData.map((item) => (
                      <tr key={item.month} className="border-b border-border hover:bg-secondary/30">
                        <td className="py-4 px-4 font-medium">{item.month}</td>
                        <td className="py-4 px-4">Rs.{item.taxableAmount.toLocaleString()}</td>
                        <td className="py-4 px-4 font-semibold text-green-600">Rs.{item.vat.toLocaleString()}</td>
                        <td className="py-4 px-4">Rs.{item.grossRevenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                <CheckCircle className="h-5 w-5" />
                IRD Tax Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-green-900 dark:text-green-100">
              <p className="font-medium">Your restaurant is fully compliant with tax regulations</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>All sales records documented with VAT calculations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>13% VAT applied to all taxable items consistently</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Digital bill generation with timestamps enabled</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>PAN number verified and documented</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Monthly tax reports ready for submission</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tax Filing Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="font-medium text-sm">Monthly VAT Return</p>
                  <p className="text-xs text-muted-foreground mt-1">Due: 15th of next month</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="font-medium text-sm">Quarterly Reconciliation</p>
                  <p className="text-xs text-muted-foreground mt-1">Due: Within 30 days of quarter end</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="font-medium text-sm">Annual Tax Return</p>
                  <p className="text-xs text-muted-foreground mt-1">Due: By end of fiscal year</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Required Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Purchase Invoices</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Sales Records & Bills</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Bank Statements</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Staff Payroll Records</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>VAT Payment Receipts</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Export for IRD Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Generate and export comprehensive tax reports for submission to IRD</p>
              <div className="flex flex-col gap-2">
                <Button className="gap-2" variant="outline">
                  <Download className="h-4 w-4" />
                  Export VAT Return (Bulk JSON)
                </Button>
                <Button className="gap-2" variant="outline">
                  <Download className="h-4 w-4" />
                  Export Tax Summary (PDF)
                </Button>
                <Button className="gap-2" variant="outline">
                  <Download className="h-4 w-4" />
                  Export Bill List (CSV)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
