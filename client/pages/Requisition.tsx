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
import { useNavigate } from "react-router-dom";
import { Plus, ClipboardList, Clock, CheckCircle2, X, Leaf, Sparkles, Send, ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { getIngredients, type Ingredient } from "@/lib/inventory-api";
import { getRequisitions, createRequisition, updateRequisitionStatus, type Requisition } from "@/lib/requisitions-api";
import { AuthUser } from "@/lib/auth";

export default function Requisition() {
    const navigate = useNavigate();
    const [user] = useState<AuthUser | null>(JSON.parse(localStorage.getItem("auth_user") || "null"));
    const [requisitions, setRequisitions] = useState<Requisition[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState<{ ingredientId: string; quantity: string }[]>([]);
    const [notes, setNotes] = useState("");
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

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
                staffId: user.id,
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

    const toggleRow = (id: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
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
                                ></textarea>
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
                    <Card>
                        <CardContent className="pt-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-sidebar-border/30 text-emerald-950 font-bold uppercase tracking-wider text-xs">
                                            <th className="py-4 px-4">Req No</th>
                                            <th className="py-4 px-4">Date</th>
                                            <th className="py-4 px-4">Author</th>
                                            <th className="py-4 px-4">Status</th>
                                            <th className="py-4 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {requisitions.map((req) => (
                                            <React.Fragment key={req.id}>
                                                <tr 
                                                    className={`border-b border-sidebar-border/30 hover:bg-emerald-50/30 transition-colors group cursor-pointer ${expandedRows.has(req.id) ? 'bg-emerald-50/20' : ''}`}
                                                    onClick={() => toggleRow(req.id)}
                                                >
                                                    <td className="py-4 px-4 font-black flex items-center gap-2 text-emerald-900">
                                                        {expandedRows.has(req.id) ? <ChevronUp className="h-4 w-4 text-emerald-600" /> : <ChevronDown className="h-4 w-4 text-emerald-600" />}
                                                        {req.requisitionNo}
                                                    </td>
                                                    <td className="py-4 px-4 font-medium text-muted-foreground whitespace-nowrap">
                                                        {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </td>
                                                    <td className="py-4 px-4 font-semibold text-slate-700">
                                                        {req.author?.name || `Staff ID: ${req.staffId}`}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                            req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                            req.status === 'ordered' ? 'bg-blue-100 text-blue-700' :
                                                            req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }`}>
                                                            {req.status === 'ordered' ? 'purchased' : req.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                        {req.status === 'approved' && (
                                                            <Button 
                                                                onClick={() => navigate(`/purchases?requisitionId=${req.id}`)}
                                                                size="sm"
                                                                className="h-8 px-3 rounded-md font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                                                            >
                                                                <Send className="h-3 w-3" />
                                                                Process
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                                {/* Expandable Child Row */}
                                                {expandedRows.has(req.id) && (
                                                    <tr className="bg-slate-50/50 border-b border-sidebar-border/30">
                                                        <td colSpan={5} className="p-0">
                                                            <div className="p-6 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                    <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                                                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 mb-3 flex items-center gap-1.5">
                                                                            <Leaf className="h-3 w-3" /> Required Raw Materials
                                                                        </p>
                                                                        <div className="space-y-2">
                                                                            {req.items.map((item, idx) => (
                                                                                <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                                                                    <span className="font-bold text-slate-700">{item.ingredient.name}</span>
                                                                                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-black text-xs">
                                                                                        {item.quantity} {item.ingredient.unit}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    {req.notes && (
                                                                        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                                                                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/70 mb-3">Chef's Notes</p>
                                                                            <p className="text-sm text-slate-600 italic font-medium leading-relaxed">
                                                                                "{req.notes}"
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            {selectedRequisition?.requisitionNo} Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedRequisition && (
                        <div className="space-y-6 pt-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Requisition Items</p>
                                <div className="space-y-3">
                                    {selectedRequisition.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                            <span className="font-bold text-slate-700">{item.ingredient.name}</span>
                                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-black text-xs">
                                                {item.quantity} {item.ingredient.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedRequisition.notes && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chef's Notes</p>
                                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 italic text-slate-600 text-sm">
                                        "{selectedRequisition.notes}"
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-[10px] items-center pt-2 border-t">
                                <div>
                                    <p className="font-black text-slate-400 uppercase tracking-widest">Submitted By</p>
                                    <p className="font-bold text-slate-600">{selectedRequisition.author?.name || `Staff ID: ${selectedRequisition.staffId}`}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-400 uppercase tracking-widest">Status</p>
                                    <p className="font-bold text-emerald-600 uppercase italic">{selectedRequisition.status}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
                                {selectedRequisition.status === 'approved' && (
                                    <Button 
                                        onClick={() => navigate(`/purchases?requisitionId=${selectedRequisition.id}`)}
                                        className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                                    >
                                        Process Purchase
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
