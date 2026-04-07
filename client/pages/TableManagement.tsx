import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  Table
} from "@/lib/tables-api";
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
import {
  Download,
  Printer,
  QrCode,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Loader2,
  Leaf,
  Sparkles,
  LayoutGrid,
  MapPin,
  CalendarCheck,
  Scan
} from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/layout/AdminHeader";

// Table interface is now imported from tables-api

function generateQRCodeDataURL(tableNumber: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    `${window.location.origin}/table-order?table=${tableNumber}`
  )}`;
}

export default function TableManagement() {
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const [formData, setFormData] = useState({
    number: "",
    capacity: "2",
    customerName: "",
    customerPhone: "",
    partySize: "",
    notes: "",
  });
  // Queries
  const { data: tables = [], isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Table created successfully");
      setShowDialog(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create table");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Table> }) => updateTable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Table updated successfully");
      setShowDialog(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Table deleted successfully");
      setSelectedTable(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateTableStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Table status updated");
    },
  });

  const availableCount = tables.filter((t) => t.status === "available").length;
  const occupiedCount = tables.filter((t) => t.status === "occupied").length;
  const reservedCount = tables.filter((t) => t.status === "reserved").length;
  const cleaningCount = tables.filter((t) => t.status === "cleaning").length;
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);

  const handleAddTable = () => {
    setEditingTable(null);
    setFormData({
      number: "",
      capacity: "2",
      customerName: "",
      customerPhone: "",
      partySize: "",
      notes: "",
    });
    setShowDialog(true);
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setFormData({
      number: table.number,
      capacity: table.capacity.toString(),
      customerName: table.customerName || "",
      customerPhone: table.customerPhone || "",
      partySize: table.partySize?.toString() || "",
      notes: table.notes || "",
    });
    setShowDialog(true);
  };

  const handleSaveTable = () => {
    if (!formData.number.trim()) {
      toast.error("Please enter table number");
      return;
    }

    const tableData = {
      number: formData.number,
      capacity: parseInt(formData.capacity),
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      partySize: formData.partySize ? parseInt(formData.partySize) : undefined,
      notes: formData.notes,
    };

    if (editingTable) {
      updateMutation.mutate({
        id: editingTable.id,
        data: tableData,
      });
    } else {
      createMutation.mutate(tableData);
    }
  };

  const handleDeleteTable = (id: number) => {
    if (confirm("Are you sure you want to delete this table?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    statusMutation.mutate({ id, status: newStatus });
    if (selectedTable && selectedTable.id === id) {
      setSelectedTable({ ...selectedTable, status: newStatus as any });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "occupied":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "reserved":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "cleaning":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4" />;
      case "occupied":
        return <Users className="h-4 w-4" />;
      case "reserved":
        return <Clock className="h-4 w-4" />;
      case "cleaning":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader 
        title="Table Architecture" 
        subtitle="Manage restaurant floor layout and table availability"
        actions={
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={handleAddTable} className="font-bold gap-2">
                <Plus className="h-4 w-4" />
                CONSTRUCT NEW TABLE
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTable ? "Edit Table" : "Add New Table"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Table Number</Label>
                    <Input
                      placeholder="e.g., A1, B2"
                      value={formData.number}
                      onChange={(e) =>
                        setFormData({ ...formData, number: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Select
                      value={formData.capacity}
                      onValueChange={(value) =>
                        setFormData({ ...formData, capacity: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Persons</SelectItem>
                        <SelectItem value="4">4 Persons</SelectItem>
                        <SelectItem value="6">6 Persons</SelectItem>
                        <SelectItem value="8">8 Persons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {editingTable?.status === "occupied" ||
                  editingTable?.status === "reserved" ? (
                  <>
                    <div className="space-y-2">
                      <Label>Customer Name</Label>
                      <Input
                        placeholder="Customer name"
                        value={formData.customerName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Party Size</Label>
                      <Input
                        type="number"
                        placeholder="Number of persons"
                        value={formData.partySize}
                        onChange={(e) =>
                          setFormData({ ...formData, partySize: e.target.value })
                        }
                      />
                    </div>
                  </>
                ) : null}

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    placeholder="Special requests, allergies, etc."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <Button onClick={handleSaveTable} className="w-full">
                  {editingTable ? "Update Table" : "Add Table"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Available</p>
                <p className="text-2xl font-bold text-emerald-600">{availableCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Occupied</p>
                <p className="text-2xl font-bold text-blue-600">{occupiedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Booked</p>
                <p className="text-2xl font-bold text-amber-600">{reservedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Sanitizing</p>
                <p className="text-2xl font-bold text-purple-600">{cleaningCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table View */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Restaurant Tables Layout</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total Capacity: {totalCapacity} seats
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tables.map((table) => (
              <div
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedTable?.id === table.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
                  }`}
              >
                <div className="text-center mb-2">
                  <p className="text-xl font-bold">{table.number}</p>
                  <div className="my-2 bg-white p-1 rounded border border-slate-100 shadow-inner flex justify-center">
                    <img 
                      src={generateQRCodeDataURL(table.number)} 
                      alt="QR" 
                      className="h-16 w-16 opacity-80 group-hover:opacity-100 transition-opacity" 
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Seats: {table.capacity}
                  </p>
                </div>

                <div className={`rounded-full py-1 px-2 text-center text-xs font-medium flex items-center justify-center gap-1 ${getStatusColor(table.status)}`}>
                  {getStatusIcon(table.status)}
                  <span className="capitalize">{table.status}</span>
                </div>

                {table.status === "occupied" && (
                  <div className="mt-3 text-xs space-y-1">
                    <p className="font-medium truncate">{table.customerName}</p>
                    <p className="text-muted-foreground">
                      {table.partySize} guest{table.partySize !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table Details */}
      {selectedTable && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Table {selectedTable.number} Details</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditTable(selectedTable)}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  handleDeleteTable(selectedTable.id);
                  setSelectedTable(null);
                }}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="text-lg font-bold">{selectedTable.capacity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`text-lg font-bold capitalize`}>
                  {selectedTable.status}
                </p>
              </div>
              {selectedTable.partySize && (
                <div>
                  <p className="text-sm text-muted-foreground">Party Size</p>
                  <p className="text-lg font-bold">{selectedTable.partySize}</p>
                </div>
              )}
              {selectedTable.checkedInTime && (
                <div>
                  <p className="text-sm text-muted-foreground">Checked In</p>
                  <p className="text-lg font-bold">{selectedTable.checkedInTime}</p>
                </div>
              )}
            </div>

            {selectedTable.customerName && (
              <div className="bg-secondary rounded-lg p-4 space-y-3">
                <p className="font-bold">Customer Information</p>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">
                      {selectedTable.customerName}
                    </span>
                  </p>
                  {selectedTable.customerPhone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {selectedTable.customerPhone}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {selectedTable.notes && (
              <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4">
                <p className="font-bold text-sm mb-2">Notes</p>
                <p className="text-sm">{selectedTable.notes}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="font-bold text-sm mb-3">Change Status</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  "available",
                  "occupied",
                  "reserved",
                  "cleaning",
                ].map((status) => (
                  <Button
                    key={status}
                    variant={
                      selectedTable.status === status ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      handleStatusChange(selectedTable.id, status);
                      setSelectedTable({
                        ...selectedTable,
                        status: status as any,
                      });
                    }}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
