import { useState } from "react";
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
} from "lucide-react";

interface Promotion {
  id: number;
  name: string;
  type: "percentage" | "fixed" | "bogo"; // Buy One Get One
  value: number;
  applicableOn: string; // specific item, category, or all
  minOrderValue?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  active: boolean;
  usageCount: number;
}

interface Coupon {
  id: number;
  code: string;
  discount: number;
  discountType: "percentage" | "fixed";
  expiryDate: string;
  maxUses: number;
  currentUses: number;
  minimumOrderValue: number;
  active: boolean;
}

const mockPromotions: Promotion[] = [
  {
    id: 1,
    name: "Happy Hour Discount",
    type: "percentage",
    value: 20,
    applicableOn: "all",
    minOrderValue: 200,
    maxDiscount: 500,
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    active: true,
    usageCount: 45,
  },
  {
    id: 2,
    name: "Butter Chicken Combo Offer",
    type: "fixed",
    value: 100,
    applicableOn: "Butter Chicken",
    minOrderValue: 300,
    startDate: "2024-01-05",
    endDate: "2024-01-31",
    active: true,
    usageCount: 28,
  },
  {
    id: 3,
    name: "Buy 1 Get 1 - Bread Items",
    type: "bogo",
    value: 50,
    applicableOn: "Breads",
    startDate: "2024-01-10",
    endDate: "2024-02-10",
    active: true,
    usageCount: 12,
  },
];

const mockCoupons: Coupon[] = [
  {
    id: 1,
    code: "WELCOME20",
    discount: 20,
    discountType: "percentage",
    expiryDate: "2024-02-28",
    maxUses: 100,
    currentUses: 35,
    minimumOrderValue: 300,
    active: true,
  },
  {
    id: 2,
    code: "FESTIVAL50",
    discount: 50,
    discountType: "fixed",
    expiryDate: "2024-01-25",
    maxUses: 50,
    currentUses: 48,
    minimumOrderValue: 500,
    active: true,
  },
  {
    id: 3,
    code: "MONSOON10",
    discount: 10,
    discountType: "percentage",
    expiryDate: "2024-02-15",
    maxUses: 200,
    currentUses: 62,
    minimumOrderValue: 250,
    active: false,
  },
];

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [showCouponDialog, setShowCouponDialog] = useState(false);

  const totalRevenueFromPromos = promotions.reduce(
    (sum, p) => sum + (p.value * p.usageCount),
    0
  );

  const handleDeletePromotion = (id: number) => {
    if (confirm("Are you sure you want to delete this promotion?")) {
      setPromotions(promotions.filter((p) => p.id !== id));
    }
  };

  const handleDeleteCoupon = (id: number) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      setCoupons(coupons.filter((c) => c.id !== id));
    }
  };

  const handleTogglePromotion = (id: number) => {
    setPromotions(
      promotions.map((p) =>
        p.id === id ? { ...p, active: !p.active } : p
      )
    );
  };

  const handleToggleCoupon = (id: number) => {
    setCoupons(
      coupons.map((c) =>
        c.id === id ? { ...c, active: !c.active } : c
      )
    );
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "percentage":
        return "%";
      case "fixed":
        return "₹";
      case "bogo":
        return "BOGO";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Promotions & Discounts</h1>
            <p className="text-muted-foreground mt-1">
              Manage offers, coupons, and promotional campaigns
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Promotions</p>
                  <p className="text-3xl font-bold mt-1">
                    {promotions.filter((p) => p.active).length}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Coupons</p>
                  <p className="text-3xl font-bold mt-1">
                    {coupons.filter((c) => c.active).length}
                  </p>
                </div>
                <Gift className="h-10 w-10 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Discount Given</p>
                  <p className="text-3xl font-bold mt-1">
                    ₹{(totalRevenueFromPromos / 1000).toFixed(0)}K
                  </p>
                </div>
                <AlertCircle className="h-10 w-10 text-amber-500 opacity-20" />
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
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                promo.active
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                              }`}
                            >
                              {promo.active ? "Active" : "Inactive"}
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
                            onClick={() => handleTogglePromotion(promo.id)}
                          >
                            {promo.active ? "Deactivate" : "Activate"}
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
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                coupon.active
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                              }`}
                            >
                              {coupon.active ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <div className="grid grid-cols-5 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Discount</p>
                              <p className="font-bold">
                                {coupon.discount}
                                {coupon.discountType === "percentage" ? "%" : "₹"}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Min Order</p>
                              <p className="font-medium">₹{coupon.minimumOrderValue}</p>
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
                            onClick={() => handleToggleCoupon(coupon.id)}
                          >
                            {coupon.active ? "Deactivate" : "Activate"}
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
