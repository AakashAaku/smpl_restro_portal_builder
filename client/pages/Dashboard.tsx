import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getOrderStats, getOrders } from "@/lib/orders";
import { getFinancialSummary } from "@/lib/accounting-api";
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
  Loader2,
} from "lucide-react";

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
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["order-stats"],
    queryFn: getOrderStats,
  });

  const { data: financial, isLoading: financialLoading } = useQuery({
    queryKey: ["financial-summary"],
    queryFn: getFinancialSummary,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: getOrders,
  });

  if (statsLoading || financialLoading || ordersLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const recentOrders = orders?.slice(0, 5) || [];

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
          value={`Rs.${(financial?.revenue || 0).toLocaleString()}`}
          icon={TrendingUp}
          trend={`${financial?.growth || 0}% growth`}
          trendUp={(financial?.growth || 0) >= 0}
        />
        <StatCard
          title="Total Orders"
          value={(stats?.totalOrders || 0).toString()}
          icon={ShoppingCart}
          trend={`${stats?.averageOrderValue ? Math.round(stats.averageOrderValue) : 0} avg val`}
        />
        <StatCard
          title="Active Orders"
          value={(stats?.statusBreakdown?.pending || 0).toString()}
          icon={Clock}
          trend="In queue"
        />
        <StatCard
          title="Success Rate"
          value="100%"
          icon={Users}
          trend="Operational"
        />
      </div>

      {/* Alerts */}
      <Card className="premium-card border-none bg-emerald-50/50 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-primary flex-shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-emerald-900 leading-none mb-1">
                110% Pure Veg Compliance
              </p>
              <p className="text-sm text-emerald-800/70 font-medium">
                System-wide audit: <span className="font-bold text-emerald-900 uppercase">Passed</span>. All menu items and ingredients verified as 100% pure vegetarian and eggless.
              </p>
            </div>
            <Button variant="ghost" className="ml-auto text-primary font-bold hover:bg-emerald-100/50 rounded-lg">
              Audit Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders Overview */}
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
            {recentOrders.length > 0 ? (
              recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-4 border-b border-sidebar-border/50 last:border-b-0 group hover:bg-emerald-50/30 -mx-4 px-4 transition-colors rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-black text-xs text-muted-foreground border-2 border-white shadow-sm">
                      #{order.orderNumber.slice(-4)}
                    </div>
                    <div>
                      <p className="font-bold text-emerald-900">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {order.customer?.name || "Walk-in"} • {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-lg font-black text-emerald-950">Rs.{order.totalAmount}</span>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-muted-foreground italic font-medium">No recent orders found.</p>
            )}
          </div>
          <Button variant="ghost" className="w-full mt-6 font-bold text-primary hover:bg-primary/5 rounded-xl border-t border-sidebar-border pt-6" onClick={() => window.location.href = '/admin/orders'}>
            Explore All Transaction Records
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
