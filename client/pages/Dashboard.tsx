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
  Leaf,
  ArrowUpRight,
  TrendingDown,
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
  { name: "Snacks", value: 35, color: "#059669" },
  { name: "Beverages", value: 25, color: "#10B981" },
  { name: "Desserts", value: 20, color: "#34D399" },
  { name: "Main Course", value: 20, color: "#6EE7B7" },
];

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp = true,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
}) => (
  <Card className="premium-card border-none shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300">
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">{title}</p>
          <p className="text-3xl font-black tracking-tight text-sidebar-foreground">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-3 px-2 py-0.5 rounded-full w-fit ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span className="text-[10px] font-bold">{trend}</span>
            </div>
          )}
        </div>
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-7 w-7" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Leaf className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
              VenzoSmart Admin • 110% Pure Veg & Eggless
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-sidebar-foreground">
            Business <span className="text-primary italic">Overview</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Bhaktapur, Nepal HQ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="rounded-xl font-bold shadow-lg shadow-primary/20 h-11 px-6">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Daily Revenue"
          value="Rs.12,450"
          icon={TrendingUp}
          trend="+12% vs last Mon"
        />
        <StatCard
          title="Daily Orders"
          value="48"
          icon={ShoppingCart}
          trend="+5.2% growth"
        />
        <StatCard
          title="Patron Count"
          value="342"
          icon={Users}
          trend="+24 this week"
        />
        <StatCard
          title="Prep Efficiency"
          value="18 min"
          icon={Clock}
          trend="-2 min improvement"
        />
      </div>

      {/* Alerts */}
      <Card className="premium-card border-none bg-amber-50/50 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-amber-900 leading-none mb-1">
                Low Inventory Level
              </p>
              <p className="text-sm text-amber-800/70 font-medium">
                Essential ingredients like <span className="font-bold text-amber-900">Paneer</span> and <span className="font-bold text-amber-900">Fresh Milk</span> are below threshold. Reorder advised.
              </p>
            </div>
            <Button variant="ghost" className="ml-auto text-amber-700 font-bold hover:bg-amber-100/50 rounded-lg">
              Manage Stock
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 premium-card border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold tracking-tight">Revenue Analytics</CardTitle>
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

        <Card className="premium-card border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold tracking-tight">Sales Distribution</CardTitle>
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
      <Card className="premium-card border-none shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-extrabold tracking-tight">Recent Live Orders</CardTitle>
            <p className="text-xs text-muted-foreground font-medium mt-1">Real-time status tracking</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            Live Updates
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((order) => (
              <div
                key={order}
                className="flex items-center justify-between py-4 border-b border-sidebar-border/50 last:border-b-0 group hover:bg-emerald-50/30 -mx-4 px-4 transition-colors rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-black text-xs text-muted-foreground border-2 border-white shadow-sm">
                    #{1000 + order}
                  </div>
                  <div>
                    <p className="font-bold text-emerald-900">Order #{10001 + order}</p>
                    <p className="text-xs text-muted-foreground font-medium">
                      Table {10 + order} • Today, 12:4{order} PM
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-lg font-black text-emerald-950">Rs.{450 + order * 50}</span>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${order % 2 === 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {order % 2 === 0 ? 'Preparing' : 'Ready'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-6 font-bold text-primary hover:bg-primary/5 rounded-xl border-t border-sidebar-border pt-6">
            Explore All Transaction Records
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
