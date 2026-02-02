import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  TrendingUp,
  ShoppingCart,
  Users,
  Clock,
  AlertCircle,
} from "lucide-react";

const salesData = [
  { date: "Mon", sales: 2400, orders: 24 },
  { date: "Tue", sales: 1398, orders: 22 },
  { date: "Wed", sales: 9800, orders: 29 },
  { date: "Thu", sales: 3908, orders: 20 },
  { date: "Fri", sales: 4800, orders: 31 },
  { date: "Sat", sales: 3800, orders: 25 },
  { date: "Sun", sales: 4300, orders: 28 },
];

const categoryData = [
  { name: "Main Course", value: 45, color: "#F97316" },
  { name: "Beverages", value: 25, color: "#06B6D4" },
  { name: "Desserts", value: 20, color: "#EC4899" },
  { name: "Appetizers", value: 10, color: "#10B981" },
];

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {trend && <p className="text-xs text-green-600 mt-2">{trend}</p>}
        </div>
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's your restaurant's performance.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Revenue"
            value="₹12,450"
            icon={TrendingUp}
            trend="+12% from yesterday"
          />
          <StatCard
            title="Orders Today"
            value="48"
            icon={ShoppingCart}
            trend="+8 pending"
          />
          <StatCard
            title="Active Customers"
            value="342"
            icon={Users}
            trend="+24 this week"
          />
          <StatCard
            title="Avg. Prep Time"
            value="18 min"
            icon={Clock}
            trend="-2 min from avg"
          />
        </div>

        {/* Alerts */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">
                  Low Stock Alert
                </p>
                <p className="text-sm text-yellow-800 mt-1">
                  Paneer (2 units), Chicken Breast (3 units) are running low
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Orders Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((order) => (
                <div
                  key={order}
                  className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">Order #{10001 + order}</p>
                    <p className="text-sm text-muted-foreground">
                      Table {10 + order} • Placed 10 mins ago
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">₹{450 + order * 50}</span>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                      Preparing
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
