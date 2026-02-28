import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  Promotion,
  Coupon
} from "@/lib/promotions-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Gift,
  Leaf,
  Sparkles,
  Ticket,
  Zap,
  Megaphone
} from "lucide-react";
import { toast } from "sonner";

export default function Promotions() {
  const queryClient = useQueryClient();
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [showCouponDialog, setShowCouponDialog] = useState(false);

  // Queries
  const { data: promotions = [], isLoading: loadingPromos } = useQuery({
    queryKey: ["promotions"],
    queryFn: getPromotions
  });

  const { data: coupons = [], isLoading: loadingCoupons } = useQuery({
    queryKey: ["coupons"],
    queryFn: getCoupons
  });

  // Mutations
  const promoMutation = useMutation({
    mutationFn: (id: number) => deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Promotion deleted");
    }
  });

  const couponMutation = useMutation({
    mutationFn: (id: number) => deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon deleted");
    }
  });

  const togglePromoMutation = useMutation({
    mutationFn: ({ id, active }: { id: number, active: boolean }) => updatePromotion(id, { isActive: active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["promotions"] })
  });

  const toggleCouponMutation = useMutation({
    mutationFn: ({ id, active }: { id: number, active: boolean }) => updateCoupon(id, { isActive: active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] })
  });

  const totalRevenueFromPromos = promotions.reduce(
    (sum, p) => sum + (p.value * p.usageCount),
    0
  );

  const handleDeletePromotion = (id: number) => {
    if (confirm("Are you sure you want to delete this promotion?")) {
      promoMutation.mutate(id);
    }
  };

  const handleDeleteCoupon = (id: number) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      couponMutation.mutate(id);
    }
  };

  const handleTogglePromotion = (id: number, currentStatus: boolean) => {
    togglePromoMutation.mutate({ id, active: !currentStatus });
  };

  const handleToggleCoupon = (id: number, currentStatus: boolean) => {
    toggleCouponMutation.mutate({ id, active: !currentStatus });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "percentage":
        return "%";
      case "fixed":
        return "Rs.";
      case "bogo":
        return "BOGO";
      default:
        return type;
    }
  };

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
              VenzoSmart • Growth & Loyalty
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-sidebar-foreground">
            Promotions & <span className="text-primary italic">Incentives</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic">
            "Cultivating organic community through strategic rewards"
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="premium-card border-none shadow-lg overflow-hidden group">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Live Campaigns</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground">
                  {promotions.filter((p) => p.isActive).length}
                </p>
                <p className="text-[10px] text-emerald-600 font-bold mt-2 italic">Active organic offers</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <Megaphone className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden group">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Coupon Inventory</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground">
                  {coupons.filter((c) => c.isActive).length}
                </p>
                <p className="text-[10px] text-primary font-bold mt-2 italic">Redeemable artifacts</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                <Ticket className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden group">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Discount Yield</p>
                <p className="text-3xl font-black tracking-tight text-amber-700">
                  Rs.{(totalRevenueFromPromos / 1000).toFixed(0)}K
                </p>
                <p className="text-[10px] text-amber-600 font-bold mt-2 italic">Total loyalty investment</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                <Gift className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="promotions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Promotion
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Promotion</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Promotion Name</Label>
                    <Input id="name" placeholder="e.g., Summer Sale" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Discount Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="bogo">Buy One Get One</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Discount Value</Label>
                    <Input id="value" type="number" placeholder="10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applicableOn">Applicable On</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="Main Course">Main Course</SelectItem>
                        <SelectItem value="Breads">Breads</SelectItem>
                        <SelectItem value="Desserts">Desserts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Create Promotion</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {promotions.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center">
                <p className="text-muted-foreground">No promotions created yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {promotions.map((promo) => (
                <Card key={promo.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold">{promo.name}</h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${promo.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                              }`}
                          >
                            {promo.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Discount</p>
                            <p className="font-bold">
                              {promo.value}
                              {getTypeLabel(promo.type)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Applicable On</p>
                            <p className="font-medium">{promo.applicableOn}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Valid Till</p>
                            <p className="font-medium">{promo.endDate}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Usage</p>
                            <p className="font-bold">{promo.usageCount}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePromotion(promo.id, promo.isActive)}
                        >
                          {promo.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePromotion(promo.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Coupons Tab */}
        <TabsContent value="coupons" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Coupon
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Coupon</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="couponCode">Coupon Code</Label>
                    <Input
                      id="couponCode"
                      placeholder="e.g., SUMMER20"
                      maxLength={20}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Discount Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="couponValue">Discount Value</Label>
                    <Input id="couponValue" type="number" placeholder="10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxUses">Max Uses</Label>
                    <Input id="maxUses" type="number" placeholder="100" />
                  </div>
                  <Button className="w-full">Create Coupon</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {coupons.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center">
                <p className="text-muted-foreground">No coupons created yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <p className="font-bold text-lg text-primary">
                              {coupon.code}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${coupon.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                              }`}
                          >
                            {coupon.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="grid grid-cols-5 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Discount</p>
                            <p className="font-bold">
                              {coupon.discount}
                              {coupon.discountType === "percentage" ? "%" : "Rs."}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Min Order</p>
                            <p className="font-medium">Rs.{coupon.minimumOrderValue}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Expires</p>
                            <p className="font-medium">{coupon.expiryDate}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Uses</p>
                            <p className="font-medium">
                              {coupon.currentUses}/{coupon.maxUses}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Usage Rate</p>
                            <p className="font-bold">
                              {((coupon.currentUses / coupon.maxUses) * 100).toFixed(0)}%
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.code);
                          }}
                          className="gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleCoupon(coupon.id, coupon.isActive)}
                        >
                          {coupon.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
