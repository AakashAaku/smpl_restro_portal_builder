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
import { useNavigate } from "react-router-dom";
import { Calendar, Users, DollarSign, CheckCircle, Clock, LogOut } from "lucide-react";
import { logout } from "@/lib/auth";
import {
  getAllEventTypes,
  createEventBooking,
  saveEventBooking,
  getEventBookingsByCustomer,
  type EventType,
  type EventBooking,
} from "@/lib/events";

export default function EventBooking() {
  const navigate = useNavigate();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [myBookings, setMyBookings] = useState<EventBooking[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [bookingForm, setBookingForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    eventDate: "",
    attendees: "20",
    requirements: "",
  });

  useEffect(() => {
    loadData();
    window.addEventListener("eventTypeAdded", loadData);
    window.addEventListener("eventTypeUpdated", loadData);
    window.addEventListener("eventBookingCreated", loadData);

    return () => {
      window.removeEventListener("eventTypeAdded", loadData);
      window.removeEventListener("eventTypeUpdated", loadData);
      window.removeEventListener("eventBookingCreated", loadData);
    };
  }, []);

  const loadData = () => {
    setEventTypes(getAllEventTypes());
    // Load bookings for current customer (for demo, use dummy phone)
    const bookings = getEventBookingsByCustomer("9876543210");
    setMyBookings(bookings);
  };

  const calculatePrice = (basePrice: number, attendees: number): number => {
    return basePrice + attendees * 500; // 500 per person additional
  };

  const handleBookEvent = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !bookingForm.customerName ||
      !bookingForm.customerPhone ||
      !bookingForm.eventDate ||
      !selectedEventType
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const attendees = parseInt(bookingForm.attendees);
    if (
      attendees < selectedEventType.minAttendees ||
      attendees > selectedEventType.maxAttendees
    ) {
      alert(
        `Attendees must be between ${selectedEventType.minAttendees} and ${selectedEventType.maxAttendees}`
      );
      return;
    }

    const totalPrice = calculatePrice(selectedEventType.basePrice, attendees);

    const booking = createEventBooking(
      selectedEventType.id,
      selectedEventType.name,
      bookingForm.customerName,
      bookingForm.customerPhone,
      bookingForm.eventDate,
      attendees,
      totalPrice,
      bookingForm.requirements || undefined,
      bookingForm.customerEmail || undefined
    );

    saveEventBooking(booking);

    // Reset form
    setBookingForm({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      eventDate: "",
      attendees: "20",
      requirements: "",
    });
    setSelectedEventType(null);
    setIsBookingOpen(false);
    alert("Booking request submitted successfully! We will contact you soon.");
    loadData();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold">Event Booking</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/customer/home")}
              className="gap-2"
            >
              🍽️ Menu
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/customer/orders")}
              className="gap-2"
            >
              📦 My Orders
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/customer/events")}
              className="gap-2"
            >
              🎉 Book Event
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Tabs */}
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Events</TabsTrigger>
            <TabsTrigger value="myBookings">My Bookings</TabsTrigger>
          </TabsList>

          {/* Browse Events Tab */}
          <TabsContent value="browse" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventTypes.map((eventType) => (
                <Card key={eventType.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{eventType.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      {eventType.description}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Users className="h-4 w-4" />
                          <span>Capacity</span>
                        </div>
                        <p className="font-semibold">
                          {eventType.minAttendees}-{eventType.maxAttendees}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span>Base Price</span>
                        </div>
                        <p className="font-semibold">
                          ₹{eventType.basePrice.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="font-semibold text-sm mb-3">Inclusions:</p>
                      <ul className="space-y-2 text-sm">
                        {eventType.inclusions.map((inclusion) => (
                          <li key={inclusion.id} className="flex items-start gap-2">
                            <span className="text-primary mt-1">✓</span>
                            <div>
                              <p className="font-medium">{inclusion.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {inclusion.description}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Dialog open={isBookingOpen && selectedEventType?.id === eventType.id} onOpenChange={setIsBookingOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full"
                          onClick={() => setSelectedEventType(eventType)}
                        >
                          Book Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Book {eventType.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleBookEvent} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Your Name *</Label>
                            <Input
                              id="name"
                              value={bookingForm.customerName}
                              onChange={(e) =>
                                setBookingForm({
                                  ...bookingForm,
                                  customerName: e.target.value,
                                })
                              }
                              placeholder="John Doe"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                              id="phone"
                              value={bookingForm.customerPhone}
                              onChange={(e) =>
                                setBookingForm({
                                  ...bookingForm,
                                  customerPhone: e.target.value,
                                })
                              }
                              placeholder="9876543210"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={bookingForm.customerEmail}
                              onChange={(e) =>
                                setBookingForm({
                                  ...bookingForm,
                                  customerEmail: e.target.value,
                                })
                              }
                              placeholder="john@example.com"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="date">Event Date *</Label>
                            <Input
                              id="date"
                              type="date"
                              value={bookingForm.eventDate}
                              onChange={(e) =>
                                setBookingForm({
                                  ...bookingForm,
                                  eventDate: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="attendees">
                              Estimated Attendees ({eventType.minAttendees}-
                              {eventType.maxAttendees}) *
                            </Label>
                            <Input
                              id="attendees"
                              type="number"
                              min={eventType.minAttendees}
                              max={eventType.maxAttendees}
                              value={bookingForm.attendees}
                              onChange={(e) =>
                                setBookingForm({
                                  ...bookingForm,
                                  attendees: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="requirements">
                              Special Requirements
                            </Label>
                            <Textarea
                              id="requirements"
                              value={bookingForm.requirements}
                              onChange={(e) =>
                                setBookingForm({
                                  ...bookingForm,
                                  requirements: e.target.value,
                                })
                              }
                              placeholder="Any special requests or dietary requirements?"
                              className="resize-none h-20"
                            />
                          </div>

                          <div className="bg-secondary p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              Estimated Price
                            </p>
                            <p className="text-2xl font-bold">
                              ₹
                              {calculatePrice(
                                eventType.basePrice,
                                parseInt(bookingForm.attendees) || eventType.minAttendees
                              ).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Base: ₹{eventType.basePrice.toLocaleString()} +
                              ₹500/person
                            </p>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setIsBookingOpen(false);
                                setSelectedEventType(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" className="flex-1">
                              Submit Booking
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Bookings Tab */}
          <TabsContent value="myBookings" className="space-y-4">
            {myBookings.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No bookings yet</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-lg">
                            {booking.eventTypeName}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {booking.id}
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Event Date
                              </p>
                              <p className="font-semibold">
                                {new Date(booking.eventDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Attendees
                              </p>
                              <p className="font-semibold">
                                {booking.estimatedAttendees}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Total Price
                              </p>
                              <p className="font-semibold">
                                ₹{booking.totalPrice.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Booked On
                              </p>
                              <p className="font-semibold">
                                {new Date(booking.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {booking.status === "confirmed" && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Confirmed
                              </span>
                            )}
                            {booking.status === "pending" && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Pending Review
                              </span>
                            )}
                            {booking.status === "completed" && "Completed"}
                            {booking.status === "cancelled" && "Cancelled"}
                          </span>
                        </div>
                      </div>

                      {booking.specialRequirements && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground">
                            Special Requirements
                          </p>
                          <p className="text-sm mt-1">
                            {booking.specialRequirements}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
