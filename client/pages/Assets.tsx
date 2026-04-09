import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Edit2, Trash2, Layout, Calendar, Leaf, Sparkles, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getAssets, createAsset, updateAsset, deleteAsset, Asset } from "@/lib/assets-api";

export default function Assets() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formState, setFormState] = useState<Partial<Asset>>({
        name: "",
        category: "Equipment",
        value: 0,
        status: "active",
        purchaseDate: new Date().toISOString().split("T")[0]
    });

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        setIsLoading(true);
        try {
            const data = await getAssets();
            setAssets(data);
        } catch (error) {
            toast.error("Failed to load assets");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateAsset(editingId, formState);
                toast.success("Asset updated successfully");
            } else {
                await createAsset(formState);
                toast.success("Asset added successfully");
            }
            setIsDialogOpen(false);
            resetForm();
            fetchAssets();
        } catch (error) {
            toast.error("Failed to save asset");
        }
    };

    const handleEdit = (asset: Asset) => {
        setEditingId(asset.id);
        setFormState({
            name: asset.name,
            category: asset.category,
            value: asset.value,
            status: asset.status,
            purchaseDate: new Date(asset.purchaseDate).toISOString().split("T")[0]
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this asset?")) return;
        try {
            await deleteAsset(id);
            toast.success("Asset deleted successfully");
            fetchAssets();
        } catch (error) {
            toast.error("Failed to delete asset");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormState({
            name: "",
            category: "Equipment",
            value: 0,
            status: "active",
            purchaseDate: new Date().toISOString().split("T")[0]
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-primary/10 p-1.5 rounded-lg">
                            <Leaf className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                            VenzoSmart • Enterprise Resource Planning
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter text-sidebar-foreground">
                        Physical <span className="text-primary italic">Assets</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium italic">
                        "Securing Kitchen Infrastructure & Hardware"
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="h-12 px-8 rounded-xl font-bold border-none shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-[1.02]" onClick={resetForm}>
                            <Plus className="h-5 w-5" />
                            REGISTER NEW ASSET
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Asset" : "Add New Asset"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Asset Name *</Label>
                                <Input
                                    id="name"
                                    required
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    placeholder="e.g., Gas Burner"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={formState.category}
                                        onValueChange={(val) => setFormState({ ...formState, category: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Equipment">Equipment</SelectItem>
                                            <SelectItem value="Furniture">Furniture</SelectItem>
                                            <SelectItem value="Electronics">Electronics</SelectItem>
                                            <SelectItem value="Utensils">Utensils</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="value">Purchase Value (Rs.) *</Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        required
                                        value={formState.value}
                                        onChange={(e) => setFormState({ ...formState, value: parseFloat(e.target.value) })}
                                        placeholder="5000"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formState.status}
                                        onValueChange={(val) => setFormState({ ...formState, status: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="disposed">Disposed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                                    <Input
                                        id="purchaseDate"
                                        type="date"
                                        value={formState.purchaseDate}
                                        onChange={(e) => setFormState({ ...formState, purchaseDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">{editingId ? "Update Asset" : "Add Asset"}</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <p>Loading assets...</p>
                ) : assets.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center py-12">No assets found. Add your first asset to track it.</p>
                ) : (
                    assets.map((asset) => (
                        <Card key={asset.id} className="premium-card border-none shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                            <CardHeader className="bg-emerald-50/20 pb-6 border-b border-sidebar-border/30">
                                <div className="flex justify-between items-start">
                                    <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Layout className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-emerald-50 text-emerald-600" onClick={() => handleEdit(asset)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-rose-50 text-rose-600" onClick={() => handleDelete(asset.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-xl font-black tracking-tight text-emerald-950 uppercase">{asset.name}</CardTitle>
                                        <Sparkles className="h-3.5 w-3.5 text-emerald-500/50" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">{asset.category}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-5">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Book Value</span>
                                    </div>
                                    <span className="text-xl font-black text-emerald-950">Rs.{asset.value.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4 opacity-40" />
                                        <span className="font-medium">Acquisition Date</span>
                                    </div>
                                    <span className="font-bold text-slate-600">{new Date(asset.purchaseDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div className="pt-2 flex items-center justify-between">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${asset.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                        asset.status === 'maintenance' ? 'bg-amber-100 text-amber-700' :
                                            'bg-rose-100 text-rose-700'
                                        }`}>
                                        {asset.status}
                                    </span>
                                    {asset.status === 'active' && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                            <ShieldCheck className="h-3 w-3" />
                                            VERIFIED
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
