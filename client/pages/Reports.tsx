import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { useState } from "react";

const monthlySalesData = [
  { month: "Jan", revenue: 450000, profit: 180000, expenses: 270000 },
  { month: "Feb", revenue: 480000, profit: 192000, expenses: 288000 },
  { month: "Mar", revenue: 520000, profit: 208000, expenses: 312000 },
  { month: "Apr", revenue: 490000, profit: 196000, expenses: 294000 },
  { month: "May", revenue: 560000, profit: 224000, expenses: 336000 },
  { month: "Jun", revenue: 580000, profit: 232000, expenses: 348000 },
];

const paymentBreakdownData = [
  { name: "Cash", value: 450000, color: "#10B981" },
  { name: "Card", value: 380000, color: "#3B82F6" },
  { name: "UPI", value: 420000, color: "#F59E0B" },
  { name: "Wallet", value: 150000, color: "#8B5CF6" },
];

interface Expense {
  id: number;
  category: string;
  amount: number;
  date: string;
  description: string;
  status: "pending" | "paid";
}

const mockExpenses: Expense[] = [
  {
    id: 1,
    category: "Salary",
    amount: 50000,
    date: "2024-01-01",
    description: "Monthly staff salary",
    status: "paid",
  },
  {
    id: 2,
    category: "Utilities",
    amount: 8000,
    date: "2024-01-15",
    description: "Electricity and water bill",
    status: "paid",
  },
  {
    id: 3,
    category: "Marketing",
    amount: 5000,
    date: "2024-01-20",
    description: "Social media marketing",
    status: "pending",
  },
  {
    id: 4,
    category: "Supplies",
    amount: 12000,
    date: "2024-01-22",
    description: "Kitchen equipment",
    status: "pending",
  },
];

// VAT and Tax Data
const vatData = [
  { month: "Jan", taxableAmount: 450000, vat: 58500, grossRevenue: 508500 },
  { month: "Feb", taxableAmount: 480000, vat: 62400, grossRevenue: 542400 },
  { month: "Mar", taxableAmount: 520000, vat: 67600, grossRevenue: 587600 },
  { month: "Apr", taxableAmount: 490000, vat: 63700, grossRevenue: 553700 },
  { month: "May", taxableAmount: 560000, vat: 72800, grossRevenue: 632800 },
  { month: "Jun", taxableAmount: 580000, vat: 75400, grossRevenue: 655400 },
];

export default function Reports() {
  const [expenses] = useState<Expense[]>(mockExpenses);

  const totalRevenue = 3080000;
  const totalProfit = 1232000;
  const profitMargin = 40;
  const totalExpenses = 1848000;

  const paidExpenses = expenses
    .filter((e) => e.status === "paid")
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses
    .filter((e) => e.status === "pending")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Accounting & Reports
            </h1>
            <p className="text-muted-foreground mt-2">
              Financial analytics and reporting
            </p>
          </div>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold mt-2">
                    ₹{(totalRevenue / 100000).toFixed(1)}L
                  </p>
                  <p className="text-xs text-green-600 mt-2">+12% vs last month</p>
                </div>
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Profit</p>
                  <p className="text-2xl font-bold mt-2">
                    ₹{(totalProfit / 100000).toFixed(1)}L
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    {profitMargin}% margin
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
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold mt-2">
                    ₹{(totalExpenses / 100000).toFixed(1)}L
                  </p>
                  <p className="text-xs text-red-600 mt-2">60% of revenue</p>
                </div>
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pending Expenses
                  </p>
                  <p className="text-2xl font-bold mt-2">
                    ₹{(pendingExpenses / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-amber-600 mt-2">
                    {expenses.filter((e) => e.status === "pending").length}{" "}
                    items
                  </p>
                </div>
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payment Methods</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="vat">VAT & Tax</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlySalesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                      <Bar dataKey="expenses" fill="hsl(var(--destructive))" />
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
                    <LineChart data={monthlySalesData}>
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
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
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
                        data={paymentBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {paymentBreakdownData.map((entry) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={entry.color}
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
                    {paymentBreakdownData.map((method) => (
                      <div key={method.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: method.color }}
                          />
                          <span className="font-medium">{method.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ₹{(method.value / 100000).toFixed(1)}L
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round((method.value / 1400000) * 100)}%
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
                      {expenses.map((expense) => (
                        <tr
                          key={expense.id}
                          className="border-b border-border hover:bg-secondary/30 transition-colors"
                        >
                          <td className="py-4 px-4 font-medium">
                            {expense.category}
                          </td>
                          <td className="py-4 px-4">{expense.description}</td>
                          <td className="py-4 px-4 font-semibold">
                            ₹{expense.amount.toLocaleString()}
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
                    <p className="text-3xl font-bold mt-2">₹{(vatData.reduce((sum, item) => sum + item.taxableAmount, 0) / 100000).toFixed(2)}L</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Total VAT Collected</p>
                    <p className="text-3xl font-bold mt-2 text-green-600">₹{(vatData.reduce((sum, item) => sum + item.vat, 0) / 1000).toFixed(0)}K</p>
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
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
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
                          <td className="py-4 px-4">₹{item.taxableAmount.toLocaleString()}</td>
                          <td className="py-4 px-4 font-semibold text-green-600">₹{item.vat.toLocaleString()}</td>
                          <td className="py-4 px-4">₹{item.grossRevenue.toLocaleString()}</td>
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
    </MainLayout>
  );
}
