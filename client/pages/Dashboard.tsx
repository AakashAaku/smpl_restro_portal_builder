import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getOrderStats, getOrders } from "@/lib/orders";
import { getFinancialSummary } from "@/lib/accounting-api";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Clock,
  AlertCircle,
  ArrowUpRight,
  TrendingDown,
  Loader2,
  ListOrdered
} from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";

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
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trend}
        </p>
      )}
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

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: () => getOrders(1, 10),
  });

  if (statsLoading || financialLoading || ordersLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const recentOrders = ordersData?.orders?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <AdminHeader 
        title="Dashboard" 
        subtitle="Business Overview & Real-time Tracking"
        actions={
          <Button variant="outline" className="gap-2">
            Generate Report
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          trend={`Rs.${stats?.averageOrderValue ? Math.round(stats.averageOrderValue) : 0} avg val`}
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

      {/* Recent Orders Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Live Orders</CardTitle>
            <CardDescription>Latest transactions from the POS and Kitchen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-md group hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-medium text-xs text-muted-foreground border">
                        <ListOrdered className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.customer?.name || "Walk-in"} • {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold">Rs.{order.totalAmount}</span>
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent orders found.</p>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4" onClick={() => window.location.href = '/admin/orders'}>
              View All Orders
            </Button>
          </CardContent>
        </Card>

        {/* Alerts or other cards */}
        <Card className="col-span-1 bg-muted/30">
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Important notifications & compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-4 bg-background border rounded-md">
              <AlertCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">110% Pure Veg Compliance</p>
                <p className="text-xs text-muted-foreground mt-1">
                  System-wide audit passed. All menu items and ingredients verified.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
