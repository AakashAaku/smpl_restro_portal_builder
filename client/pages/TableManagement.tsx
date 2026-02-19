import { useState } from "react";
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
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Phone,
} from "lucide-react";

interface Table {
  id: number;
  number: string;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  customerName?: string;
  customerPhone?: string;
  partySize?: number;
  checkedInTime?: string;
  estimatedEndTime?: string;
  notes?: string;
}

const mockTables: Table[] = [
  {
    id: 1,
    number: "A1",
    capacity: 2,
    status: "occupied",
    customerName: "Rajesh Kumar",
    customerPhone: "9841234567",
    partySize: 2,
    checkedInTime: "12:30",
    estimatedEndTime: "13:30",
  },
  {
    id: 2,
    number: "A2",
    capacity: 2,
    status: "occupied",
    customerName: "Priya Sharma",
    customerPhone: "9845678901",
    partySize: 1,
    checkedInTime: "12:45",
    estimatedEndTime: "13:45",
  },
  {
    id: 3,
    number: "A3",
    capacity: 4,
    status: "available",
  },
  {
    id: 4,
    number: "B1",
    capacity: 4,
    status: "reserved",
    customerName: "Amit Patel",
    customerPhone: "9834567890",
    partySize: 4,
    estimatedEndTime: "14:00",
    notes: "Birthday celebration",
  },
  {
    id: 5,
    number: "B2",
    capacity: 6,
    status: "available",
  },
  {
    id: 6,
    number: "B3",
    capacity: 6,
    status: "occupied",
    customerName: "Group Meeting",
    partySize: 5,
    checkedInTime: "13:00",
    estimatedEndTime: "14:30",
  },
  {
    id: 7,
    number: "C1",
    capacity: 8,
    status: "cleaning",
  },
  {
    id: 8,
    number: "C2",
    capacity: 8,
    status: "available",
  },
];

export default function TableManagement() {
  const [tables, setTables] = useState<Table[]>(mockTables);
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
      alert("Please enter table number");
      return;
    }

    if (editingTable) {
      setTables(
        tables.map((t) =>
          t.id === editingTable.id
            ? {
                ...t,
                number: formData.number,
                capacity: parseInt(formData.capacity),
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                partySize: formData.partySize ? parseInt(formData.partySize) : undefined,
                notes: formData.notes,
              }
            : t
        )
      );
    } else {
      const newTable: Table = {
        id: Math.max(...tables.map((t) => t.id), 0) + 1,
        number: formData.number,
        capacity: parseInt(formData.capacity),
        status: "available",
        customerName: formData.customerName || undefined,
        customerPhone: formData.customerPhone || undefined,
        partySize: formData.partySize ? parseInt(formData.partySize) : undefined,
        notes: formData.notes || undefined,
      };
      setTables([...tables, newTable]);
    }

    setShowDialog(false);
  };

  const handleDeleteTable = (id: number) => {
    if (confirm("Are you sure you want to delete this table?")) {
      setTables(tables.filter((t) => t.id !== id));
    }
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    setTables(
      tables.map((t) =>
        t.id === id ? { ...t, status: newStatus as any } : t
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "occupied":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "reserved":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
      case "cleaning":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
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
    <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Table Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage dining tables and reservations
            </p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={handleAddTable} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Table
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
                    <Label htmlFor="number">Table Number</Label>
                    <Input
                      id="number"
                      placeholder="e.g., A1, B2"
                      value={formData.number}
                      onChange={(e) =>
                        setFormData({ ...formData, number: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
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
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input
                        id="customerName"
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
                      <Label htmlFor="customerPhone">Customer Phone</Label>
                      <Input
                        id="customerPhone"
                        placeholder="Phone number"
                        value={formData.customerPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerPhone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partySize">Party Size</Label>
                      <Input
                        id="partySize"
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
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
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
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold">{availableCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Occupied</p>
                  <p className="text-2xl font-bold">{occupiedCount}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reserved</p>
                  <p className="text-2xl font-bold">{reservedCount}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cleaning</p>
                  <p className="text-2xl font-bold">{cleaningCount}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-purple-500 opacity-20" />
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTable?.id === table.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-center mb-2">
                    <p className="text-xl font-bold">{table.number}</p>
                    <p className="text-xs text-muted-foreground">
                      Capacity: {table.capacity}
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
