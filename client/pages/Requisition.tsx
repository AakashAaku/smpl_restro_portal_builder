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
import { Plus, ClipboardList, Clock, CheckCircle2, X, Leaf, Sparkles, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getIngredients, type Ingredient } from "@/lib/inventory-api";
import { getRequisitions, createRequisition, type Requisition } from "@/lib/requisitions-api";
import { AuthUser } from "@/lib/auth";

export default function Requisition() {
    const [user] = useState<AuthUser | null>(JSON.parse(localStorage.getItem("auth_user") || "null"));
    const [requisitions, setRequisitions] = useState<Requisition[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState<{ ingredientId: string; quantity: string }[]>([]);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [reqData, ingData] = await Promise.all([
                getRequisitions(),
                getIngredients()
            ]);
            setRequisitions(reqData);
            setIngredients(ingData);
        } catch (error) {
            toast.error("Failed to load requisitions");
        } finally {
            setIsLoading(false);
        }
    };

    const addItemRow = () => {
        setItems([...items, { ingredientId: "", quantity: "" }]);
    };

    const removeItemRow = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItemRow = (index: number, field: string, value: string) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        setItems(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (items.length === 0 || items.some(i => !i.ingredientId || !i.quantity)) {
            toast.error("Please add at least one item with quantity");
            return;
        }

        try {
            await createRequisition({
                staffId: parseInt(user.id),
                notes,
                items: items.map(i => ({
                    ingredientId: parseInt(i.ingredientId),
                    quantity: parseFloat(i.quantity)
                }))
            });
            toast.success("Requisition submitted successfully");
            setIsDialogOpen(false);
            setItems([]);
            setNotes("");
            loadData();
        } catch (error) {
            toast.error("Failed to submit requisition");
        }
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
                            Chef's Portal • Internal Logistics
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter text-sidebar-foreground">
                        Staff <span className="text-primary italic">Requisitions</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium italic">
                        Raw material requests for "110% Pure Veg" kitchen operations
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-12 px-8 rounded-xl font-bold border-none shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-[1.02]">
                            <Plus className="h-5 w-5" />
                            NEW KITCHEN REQUEST
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>New Requisition</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="flex gap-3 items-end">
                                        <div className="flex-1 space-y-2">
                                            <Label>Ingredient</Label>
                                            <Select
                                                value={item.ingredientId}
                                                onValueChange={(val) => updateItemRow(index, 'ingredientId', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select ingredient" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ingredients.map(ing => (
                                                        <SelectItem key={ing.id} value={ing.id.toString()}>
                                                            {ing.name} ({ing.unit})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-24 space-y-2">
                                            <Label>Qty</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={(e) => updateItemRow(index, 'quantity', e.target.value)}
                                                placeholder="1.0"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="mb-0.5 text-destructive"
                                            onClick={() => removeItemRow(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full gap-2 border-dashed"
                                    onClick={addItemRow}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Ingredient
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-md text-sm min-h-[80px]"
                                    placeholder="Reason for request..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Submit Request</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {requisitions.length === 0 ? (
                    <Card className="premium-card border-none shadow-xl">
                        <CardContent className="flex flex-col items-center justify-center p-16 text-center">
                            <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                                <ClipboardList className="h-8 w-8 text-emerald-600/50" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-950 mb-1">No Active Requisitions</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                All requests are processed. When you need kitchen supplies, create a new request above.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {requisitions.map((req) => (
                            <Card key={req.id} className="premium-card border-none shadow-lg hover:shadow-xl transition-all overflow-hidden relative group">
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${req.status === 'pending' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-xl font-black tracking-tight text-emerald-950 uppercase">{req.requisitionNo}</CardTitle>
                                            <div className="bg-emerald-50/50 p-1 rounded">
                                                <Sparkles className="h-3 w-3 text-emerald-500" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground/60 tracking-widest uppercase">
                                            {new Date(req.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date(req.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                        {req.status === 'pending' && <Clock className="h-3 w-3" />}
                                        {req.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                                        <span>{req.status}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-6">
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {req.items.map((item, idx) => (
                                                <div key={idx} className="bg-white border border-emerald-100 px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-2 group-hover:scale-105 transition-transform">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    <span className="text-sm font-bold text-emerald-950">{item.ingredient.name}</span>
                                                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 rounded-full">{item.quantity} {item.ingredient.unit}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {req.notes && (
                                            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                                                <div className="absolute -top-3 left-4 bg-white px-2 py-0.5 rounded border border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">Chef's Notes</div>
                                                <p className="text-sm text-slate-600 italic font-medium">
                                                    "{req.notes}"
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex justify-end pt-2">
                                            <Button variant="ghost" size="sm" className="h-9 px-4 rounded-lg font-bold text-emerald-600 gap-2 hover:bg-emerald-50">
                                                <Send className="h-3.5 w-3.5" />
                                                View Transaction Details
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
