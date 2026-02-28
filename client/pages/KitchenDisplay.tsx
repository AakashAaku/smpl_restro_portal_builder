import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, updateOrderStatus, Order } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    CheckCircle,
    ChefHat,
    AlertCircle,
    Play,
    Check,
    Timer,
    RefreshCw,
    Bell,
    Leaf,
    Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function KitchenDisplay() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<string>("active"); // active, completed

    const { data: orders = [], isLoading, refetch } = useQuery({
        queryKey: ["orders", "kitchen"],
        queryFn: getOrders,
        refetchInterval: 10000, // Auto-refresh every 10 seconds for real-time feel
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: any }) => updateOrderStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            toast.success("Order status updated");
            // Play a subtle sound or notify
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
        if (mins > 20) return "text-destructive animate-pulse font-black";
        if (mins > 10) return "text-amber-500 font-bold";
        return "text-muted-foreground";
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <RefreshCw className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#02100a] text-slate-50 p-6 font-sans">
            {/* KDS Header */}
            <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-primary p-3 rounded-2xl shadow-[0_0_20px_rgba(5,150,105,0.3)] organic-glow">
                        <Leaf className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">VenzoSmart Culinary</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tighter uppercase italic text-white">Kitchen <span className="text-primary">Intelligence</span></h1>
                        <p className="text-emerald-500/60 font-medium text-xs tracking-wide">Live Organic Fulfillment Stream • {activeOrders.length} Passive Orders</p>
                    </div>
                </div>

                <div className="flex bg-[#051a11] p-1.5 rounded-2xl border border-emerald-900/30 shadow-2xl">
                    <Button
                        variant={filter === "active" ? "default" : "ghost"}
                        onClick={() => setFilter("active")}
                        className={`rounded-xl px-8 font-black uppercase tracking-wider text-xs h-10 ${filter === 'active' ? 'bg-primary text-white' : 'text-emerald-500/50 hover:text-primary'}`}
                    >
                        ACTIVE BATCHES
                    </Button>
                    <Button
                        variant={filter === "completed" ? "default" : "ghost"}
                        onClick={() => setFilter("completed")}
                        className={`rounded-xl px-8 font-black uppercase tracking-wider text-xs h-10 ${filter === 'completed' ? 'bg-primary text-white' : 'text-emerald-500/50 hover:text-primary'}`}
                    >
                        FINALIZED
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => refetch()} className="ml-2 rounded-xl text-emerald-500/50 hover:text-primary">
                        <RefreshCw className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Order Grid */}
            {activeOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 opacity-20">
                    <Bell className="h-32 w-32 mb-6" />
                    <h2 className="text-3xl font-black uppercase">All clear, Chef!</h2>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activeOrders.map((order) => (
                        <Card key={order.id} className="bg-[#051a11] border-2 border-emerald-900/20 overflow-hidden flex flex-col shadow-2xl premium-card group">
                            <CardHeader className="p-4 border-b border-emerald-900/10 bg-[#062216]/50 flex flex-row justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl font-black text-white tracking-tighter">{order.orderNumber}</span>
                                        <Badge variant="outline" className={`${getStatusColor(order.status)} font-black text-[10px] uppercase tracking-widest px-2 py-0.5`}>{order.status}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500/70 uppercase tracking-tight">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                        <span>Table {order.tableNumber || "POS"}</span>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${getWaitTimeColor(order.createdAt)}`}>
                                    <Clock className="h-3.5 w-3.5" />
                                    {formatDistanceToNow(new Date(order.createdAt))}
                                </div>
                            </CardHeader>

                            <CardContent className="p-4 flex-1 space-y-4">
                                <div className="space-y-3">
                                    {order.orderItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center group/item">
                                            <div className="flex items-center gap-3">
                                                <span className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 group-hover/item:border-primary transition-colors">
                                                    {item.quantity}
                                                </span>
                                                <span className="font-bold text-lg text-emerald-50 group-hover:text-white transition-colors">
                                                    {item.name || item.menuItem?.name}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {order.customerName && (
                                    <div className="pt-4 mt-4 border-t border-slate-800/50">
                                        <p className="text-[10px] uppercase font-black text-slate-500 mb-1 tracking-widest">Customer</p>
                                        <p className="text-sm font-bold text-slate-300">{order.customerName}</p>
                                    </div>
                                )}
                            </CardContent>

                            <div className="p-4 bg-[#062216]/50 border-t border-emerald-900/10 gap-3 grid grid-cols-1">
                                {order.status === "PENDING" || order.status === "CONFIRMED" ? (
                                    <Button
                                        className="w-full h-14 bg-primary hover:bg-emerald-500 text-white font-black uppercase tracking-tighter text-lg rounded-2xl gap-3 shadow-xl transition-all hover:scale-[1.02]"
                                        onClick={() => statusMutation.mutate({ id: order.id, status: "PREPARING" })}
                                        disabled={statusMutation.isPending}
                                    >
                                        <Play className="h-6 w-6 fill-current" />
                                        EXECUTE PREP
                                    </Button>
                                ) : order.status === "PREPARING" ? (
                                    <Button
                                        className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-tighter text-lg rounded-2xl gap-3 shadow-xl transition-all hover:scale-[1.02]"
                                        onClick={() => statusMutation.mutate({ id: order.id, status: "READY" })}
                                        disabled={statusMutation.isPending}
                                    >
                                        <CheckCircle className="h-6 w-6" />
                                        READY FOR PICKUP
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="w-full h-14 border-emerald-900/30 bg-[#051a11]/50 text-emerald-500/40 font-black uppercase rounded-2xl cursor-not-allowed"
                                        disabled
                                    >
                                        <Check className="h-6 w-6" />
                                        COLLECTED
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
