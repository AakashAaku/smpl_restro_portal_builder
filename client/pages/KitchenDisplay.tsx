import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, updateOrderStatus } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    CheckCircle,
    Play,
    Check,
    RefreshCw,
    Bell,
    ChefHat
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function KitchenDisplay() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<string>("active");

    const { data: ordersData, isLoading, refetch } = useQuery({
        queryKey: ["orders", "kitchen"],
        queryFn: () => getOrders(1, 100),
        refetchInterval: 10000, 
    });

    const orders = ordersData?.orders || [];

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: any }) => updateOrderStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            toast.success("Order status updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update status");
        }
    });

    const activeOrders = orders.filter(order =>
        filter === "active"
            ? ["PENDING", "CONFIRMED", "PREPARING"].includes(order.status)
            : ["READY", "SERVED", "CANCELLED"].includes(order.status)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "CONFIRMED": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "PREPARING": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "READY": return "bg-emerald-600 text-white border-none";
            default: return "bg-slate-500/10 text-slate-500";
        }
    };

    const getWaitTimeColor = (createdAt: string) => {
        const mins = (Date.now() - new Date(createdAt).getTime()) / 60000;
        if (mins > 20) return "text-red-500 font-bold animate-pulse";
        if (mins > 10) return "text-amber-500 font-semibold";
        return "text-slate-400";
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-slate-400 font-medium">Connecting to kitchen ticker...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-800 p-2.5 rounded-md border border-slate-700">
                        <ChefHat className="h-6 w-6 text-slate-300" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-50">Kitchen Display System</h1>
                        <p className="text-slate-400 text-sm mt-0.5">{activeOrders.length} {filter} orders</p>
                    </div>
                </div>

                <div className="flex items-center bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                    <Button
                        variant={filter === "active" ? "default" : "ghost"}
                        onClick={() => setFilter("active")}
                        className={`text-sm h-9 px-6 ${filter === 'active' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Active Queue
                    </Button>
                    <Button
                        variant={filter === "completed" ? "default" : "ghost"}
                        onClick={() => setFilter("completed")}
                        className={`text-sm h-9 px-6 ${filter === 'completed' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Completed
                    </Button>
                </div>
            </header>

            {/* Orders */}
            {activeOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-500">
                    <Bell className="h-16 w-16 mb-4 opacity-50" />
                    <h2 className="text-xl font-medium">No active orders</h2>
                    <p className="text-sm mt-2">Kitchen queue is clear</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activeOrders.map((order) => (
                        <Card key={order.id} className="bg-slate-900 border border-slate-800 flex flex-col shadow-lg rounded-lg overflow-hidden">
                            <CardHeader className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-row items-center justify-between pb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-lg font-bold text-slate-50">#{order.orderNumber}</span>
                                        <Badge variant="outline" className={`text-[10px] font-semibold uppercase px-2 py-0.5 ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs font-medium text-slate-400">
                                        {order.tableNumber ? `Table ${order.tableNumber}` : "Takeaway / POS"}
                                    </p>
                                </div>
                                <div className={`flex flex-col items-end gap-1 text-xs font-medium ${getWaitTimeColor(order.createdAt)}`}>
                                    <Clock className="h-4 w-4 mb-0.5" />
                                    {formatDistanceToNow(new Date(order.createdAt))}
                                </div>
                            </CardHeader>

                            <CardContent className="p-5 flex-1">
                                <div className="space-y-4">
                                    {order.orderItems?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start">
                                            <div className="flex items-start gap-3">
                                                <span className="h-6 w-6 rounded bg-slate-800 flex items-center justify-center text-sm font-semibold text-slate-300 border border-slate-700 shrink-0 mt-0.5">
                                                    {item.quantity}
                                                </span>
                                                <span className="text-base font-medium text-slate-200 leading-tight">
                                                    {item.name || item.menuItem?.name}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {order.customerName && (
                                    <div className="mt-6 pt-4 border-t border-slate-800">
                                        <p className="text-xs text-slate-400">Customer: <span className="text-slate-200 font-medium">{order.customerName}</span></p>
                                    </div>
                                )}
                            </CardContent>

                            <div className="p-4 bg-slate-900/80 border-t border-slate-800">
                                {order.status === "PENDING" || order.status === "CONFIRMED" ? (
                                    <Button
                                        className="w-full text-sm font-semibold"
                                        onClick={() => statusMutation.mutate({ id: order.id, status: "PREPARING" })}
                                        disabled={statusMutation.isPending}
                                    >
                                        <Play className="h-4 w-4 mr-2" />
                                        Start Preparing
                                    </Button>
                                ) : order.status === "PREPARING" ? (
                                    <Button
                                        variant="default"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
                                        onClick={() => statusMutation.mutate({ id: order.id, status: "READY" })}
                                        disabled={statusMutation.isPending}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Mark as Ready
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="w-full text-sm font-semibold bg-slate-800/50 border-slate-700 text-slate-400 cursor-not-allowed"
                                        disabled
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Completed
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
