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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  DollarSign,
} from "lucide-react";
import {
  getAllEventTypes,
  getAllEventBookings,
  getEventBookingStats,
  createEventType,
  addEventType,
  updateEventType,
  deleteEventType,
  updateEventBooking,
  type EventType,
  type EventBooking,
  type EventInclusion,
} from "@/lib/events";

export default function EventConfiguration() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    todayBookings: 0,
  });

  const [isAddingEventType, setIsAddingEventType] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<EventBooking | null>(null);
  const [isViewingBooking, setIsViewingBooking] = useState(false);

  // Event Type form
  const [eventTypeForm, setEventTypeForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    minAttendees: "",
    maxAttendees: "",
  });
  const [inclusions, setInclusions] = useState<EventInclusion[]>([]);
  const [newInclusion, setNewInclusion] = useState({
    name: "",
    description: "",
    quantity: "",
    unit: "per person",
  });

  useEffect(() => {
    loadData();
    window.addEventListener("eventTypeAdded", loadData);
    window.addEventListener("eventTypeUpdated", loadData);
    window.addEventListener("eventBookingCreated", loadData);
    window.addEventListener("eventBookingUpdated", loadData);

    return () => {
      window.removeEventListener("eventTypeAdded", loadData);
      window.removeEventListener("eventTypeUpdated", loadData);
      window.removeEventListener("eventBookingCreated", loadData);
      window.removeEventListener("eventBookingUpdated", loadData);
    };
  }, []);

  const loadData = () => {
    setEventTypes(getAllEventTypes());
    setBookings(getAllEventBookings());
    setStats(getEventBookingStats());
  };

  const handleAddInclusion = () => {
    if (!newInclusion.name || !newInclusion.description) {
      alert("Please fill in all inclusion fields");
      return;
    }

    const inclusion: EventInclusion = {
      id: `incl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newInclusion.name,
      description: newInclusion.description,
      quantity: parseInt(newInclusion.quantity) || 1,
      unit: newInclusion.unit,
    };

    setInclusions([...inclusions, inclusion]);
    setNewInclusion({
      name: "",
      description: "",
      quantity: "",
      unit: "per person",
    });
  };

  const handleRemoveInclusion = (id: string) => {
    setInclusions(inclusions.filter((i) => i.id !== id));
  };

  const handleCreateEventType = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !eventTypeForm.name ||
      !eventTypeForm.description ||
      !eventTypeForm.basePrice ||
      !eventTypeForm.minAttendees ||
      !eventTypeForm.maxAttendees ||
      inclusions.length === 0
    ) {
      alert("Please fill in all fields and add at least one inclusion");
      return;
    }

    try {
      if (selectedEventType) {
        // Update existing
        const updatedType: any = {
          ...selectedEventType,
          name: eventTypeForm.name,
          description: eventTypeForm.description,
          basePrice: parseFloat(eventTypeForm.basePrice),
          minAttendees: parseInt(eventTypeForm.minAttendees),
          maxAttendees: parseInt(eventTypeForm.maxAttendees),
          inclusions: inclusions,
          updatedAt: new Date().toISOString(),
        };
        updateEventType(updatedType);
        alert("Event type updated successfully!");
      } else {
        // Add new
        const eventType = createEventType(
          eventTypeForm.name,
          eventTypeForm.description,
          parseFloat(eventTypeForm.basePrice),
          parseInt(eventTypeForm.minAttendees),
          parseInt(eventTypeForm.maxAttendees),
          inclusions
        );
        addEventType(eventType);
        alert("Event type created successfully!");
      }

      // Reset form
      setEventTypeForm({
        name: "",
        description: "",
        basePrice: "",
        minAttendees: "",
        maxAttendees: "",
      });
      setInclusions([]);
      setSelectedEventType(null);
      setIsAddingEventType(false);
      loadData();
    } catch (error) {
      console.error("Error creating/updating event type:", error);
      alert("Error processing event type. Please try again.");
    }
  };

  const handleEditEventType = (eventType: EventType) => {
    setEventTypeForm({
      name: eventType.name,
      description: eventType.description,
      basePrice: eventType.basePrice.toString(),
      minAttendees: eventType.minAttendees.toString(),
      maxAttendees: eventType.maxAttendees.toString(),
    });
    setInclusions(eventType.inclusions);
    setSelectedEventType(eventType);
    setIsAddingEventType(true);
  };

  const handleBookingAction = (booking: EventBooking, action: "confirm" | "cancel") => {
    const updatedBooking = {
      ...booking,
      status: action === "confirm" ? "confirmed" : "cancelled" as any,
    };
    updateEventBooking(updatedBooking);
    alert(`Booking ${action === "confirm" ? "confirmed" : "cancelled"} successfully!`);
    loadData();
  };

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Event Configuration
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage event types, inclusions, and bookings
            </p>
          </div>
          <Dialog open={isAddingEventType} onOpenChange={setIsAddingEventType}>
            <DialogTrigger asChild>
              <Button
                className="gap-2"
                onClick={() => {
                  setSelectedEventType(null);
                  setEventTypeForm({
                    name: "",
                    description: "",
                    basePrice: "",
                    minAttendees: "",
                    maxAttendees: "",
                  });
                  setInclusions([]);
                }}
              >
                <Plus className="h-4 w-4" />
                New Event Type
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedEventType ? "Edit Event Type" : "Create Event Type"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEventType} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Event Type Name *</Label>
                    <Input
                      id="name"
                      value={eventTypeForm.name}
                      onChange={(e) =>
                        setEventTypeForm({
                          ...eventTypeForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="Birthday Party"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Base Price (₹) *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      value={eventTypeForm.basePrice}
                      onChange={(e) =>
                        setEventTypeForm({
                          ...eventTypeForm,
                          basePrice: e.target.value,
                        })
                      }
                      placeholder="10000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={eventTypeForm.description}
                    onChange={(e) =>
                      setEventTypeForm({
                        ...eventTypeForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Event description"
                    className="resize-none h-16"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minAttendees">Min Attendees *</Label>
                    <Input
                      id="minAttendees"
                      type="number"
                      value={eventTypeForm.minAttendees}
                      onChange={(e) =>
                        setEventTypeForm({
                          ...eventTypeForm,
                          minAttendees: e.target.value,
                        })
                      }
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAttendees">Max Attendees *</Label>
                    <Input
                      id="maxAttendees"
                      type="number"
                      value={eventTypeForm.maxAttendees}
                      onChange={(e) =>
                        setEventTypeForm({
                          ...eventTypeForm,
                          maxAttendees: e.target.value,
                        })
                      }
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-semibold mb-4">Inclusions (What's included) *</p>

                  <div className="space-y-4 mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="incl-name">Item Name</Label>
                        <Input
                          id="incl-name"
                          value={newInclusion.name}
                          onChange={(e) =>
                            setNewInclusion({
                              ...newInclusion,
                              name: e.target.value,
                            })
                          }
                          placeholder="e.g., Welcome Drinks"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incl-description">Description</Label>
                        <Input
                          id="incl-description"
                          value={newInclusion.description}
                          onChange={(e) =>
                            setNewInclusion({
                              ...newInclusion,
                              description: e.target.value,
                            })
                          }
                          placeholder="Soft drinks and lassi"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddInclusion}
                    >
                      Add Inclusion
                    </Button>

                    {inclusions.length > 0 && (
                      <div className="bg-secondary p-4 rounded-lg space-y-2">
                        {inclusions.map((inclusion) => (
                          <div
                            key={inclusion.id}
                            className="flex items-center justify-between p-2 bg-background rounded"
                          >
                            <div>
                              <p className="font-medium">{inclusion.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {inclusion.description}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveInclusion(inclusion.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingEventType(false);
                      setSelectedEventType(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedEventType ? "Update Type" : "Create Type"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold mt-2">{stats.totalBookings}</p>
                </div>
                <Users className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold mt-2 text-amber-600">
                    {stats.pendingBookings}
                  </p>
                </div>
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold mt-2 text-green-600">
                    {stats.confirmedBookings}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold mt-2">
                    ₹{Math.round(stats.totalRevenue).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold mt-2">{stats.todayBookings}</p>
                </div>
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="types" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="types">Event Types</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          {/* Event Types Tab */}
          <TabsContent value="types" className="space-y-4">
            {eventTypes.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No event types created</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventTypes.map((eventType) => (
                  <Card key={eventType.id}>
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <div>
                          <p className="text-lg">{eventType.name}</p>
                          <p className="text-sm font-normal text-muted-foreground mt-1">
                            {eventType.description.substring(0, 60)}...
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Base Price</p>
                          <p className="font-semibold">
                            ₹{eventType.basePrice.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Capacity</p>
                          <p className="font-semibold">
                            {eventType.minAttendees}-{eventType.maxAttendees}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold mb-2">Inclusions:</p>
                        <ul className="text-xs space-y-1">
                          {eventType.inclusions.map((inc) => (
                            <li key={inc.id} className="text-muted-foreground">
                              • {inc.name}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditEventType(eventType)}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Delete this event type?"
                              )
                            ) {
                              deleteEventType(eventType.id);
                              loadData();
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No bookings yet</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Event Type
                      </th>
                      <th className="text-right py-3 px-4 font-medium">
                        Attendees
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Event Date
                      </th>
                      <th className="text-right py-3 px-4 font-medium">Price</th>
                      <th className="text-center py-3 px-4 font-medium">Status</th>
                      <th className="text-center py-3 px-4 font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...bookings].reverse().map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-border hover:bg-secondary/30"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{booking.customerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {booking.customerPhone}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{booking.eventTypeName}</td>
                        <td className="text-right py-3 px-4">
                          {booking.estimatedAttendees}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(booking.eventDate).toLocaleDateString()}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          ₹{booking.totalPrice.toLocaleString()}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          {booking.status === "pending" && (
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleBookingAction(booking, "confirm")
                                }
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleBookingAction(booking, "cancel")
                                }
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {booking.status === "confirmed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsViewingBooking(true);
                              }}
                            >
                              Details
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Booking Details Dialog */}
        <Dialog open={isViewingBooking} onOpenChange={setIsViewingBooking}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-semibold">{selectedBooking.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold">{selectedBooking.customerPhone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Event Type</p>
                    <p className="font-semibold">{selectedBooking.eventTypeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Event Date</p>
                    <p className="font-semibold">
                      {new Date(selectedBooking.eventDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Attendees</p>
                    <p className="font-semibold">{selectedBooking.estimatedAttendees}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Price</p>
                    <p className="font-semibold">
                      ₹{selectedBooking.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedBooking.specialRequirements && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Special Requirements
                    </p>
                    <p className="mt-1">{selectedBooking.specialRequirements}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
    </div>
  );
}
