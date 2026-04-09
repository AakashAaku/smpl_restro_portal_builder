// Event Booking & Configuration System

export type EventStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface EventType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  minAttendees: number;
  maxAttendees: number;
  inclusions: EventInclusion[];
  createdAt: string;
  updatedAt: string;
}

export interface EventInclusion {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
}

export interface EventBooking {
  id: string;
  eventTypeId: string;
  eventTypeName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  eventDate: string;
  estimatedAttendees: number;
  specialRequirements?: string;
  totalPrice: number;
  status: EventStatus;
  paymentStatus: "pending" | "completed";
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

// Default Event Types - can be customized from admin
const DEFAULT_EVENT_TYPES: EventType[] = [
  {
    id: "event_birthday",
    name: "Birthday Party",
    description: "Celebrate your special day with us",
    basePrice: 10000,
    minAttendees: 10,
    maxAttendees: 100,
    inclusions: [
      {
        id: "incl_1",
        name: "Welcome Drinks",
        description: "Soft drinks and lassi",
        quantity: 1,
        unit: "per person",
      },
      {
        id: "incl_2",
        name: "Main Course",
        description: "Buffet style main course",
        quantity: 1,
        unit: "per person",
      },
      {
        id: "incl_3",
        name: "Desserts",
        description: "Traditional sweets and cakes",
        quantity: 1,
        unit: "per person",
      },
      {
        id: "incl_4",
        name: "Decorations",
        description: "Basic table decorations",
        quantity: 1,
        unit: "flat",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "event_wedding",
    name: "Wedding Reception",
    description: "Host your wedding reception with us",
    basePrice: 50000,
    minAttendees: 50,
    maxAttendees: 500,
    inclusions: [
      {
        id: "incl_5",
        name: "Welcome Drinks",
        description: "Cocktails and soft drinks",
        quantity: 1,
        unit: "per person",
      },
      {
        id: "incl_6",
        name: "Multi-Course Meal",
        description: "5-course gourmet menu",
        quantity: 1,
        unit: "per person",
      },
      {
        id: "incl_7",
        name: "Premium Desserts",
        description: "Wedding cake and delicacies",
        quantity: 1,
        unit: "per person",
      },
      {
        id: "incl_8",
        name: "Professional Decorations",
        description: "Themed decorations and setup",
        quantity: 1,
        unit: "flat",
      },
      {
        id: "incl_9",
        name: "Sound System",
        description: "Professional audio setup",
        quantity: 1,
        unit: "flat",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "event_corporate",
    name: "Corporate Event",
    description: "Professional gatherings and conferences",
    basePrice: 25000,
    minAttendees: 20,
    maxAttendees: 200,
    inclusions: [
      {
        id: "incl_10",
        name: "Tea & Coffee",
        description: "Complimentary beverages",
        quantity: 1,
        unit: "per person",
      },
      {
        id: "incl_11",
        name: "Lunch/Dinner",
        description: "Business meal options",
        quantity: 1,
        unit: "per person",
      },
      {
        id: "incl_12",
        name: "Projection Setup",
        description: "AV equipment for presentations",
        quantity: 1,
        unit: "flat",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ===== EVENT TYPES MANAGEMENT =====

export function getAllEventTypes(): EventType[] {
  const types = localStorage.getItem("event_types");
  if (!types) {
    // Initialize with defaults if not exists
    localStorage.setItem("event_types", JSON.stringify(DEFAULT_EVENT_TYPES));
    return DEFAULT_EVENT_TYPES;
  }
  return JSON.parse(types);
}

export function getEventTypeById(id: string): EventType | undefined {
  const types = getAllEventTypes();
  return types.find((t) => t.id === id);
}

export function createEventType(
  name: string,
  description: string,
  basePrice: number,
  minAttendees: number,
  maxAttendees: number,
  inclusions: EventInclusion[]
): EventType {
  return {
    id: `evt_type_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    basePrice,
    minAttendees,
    maxAttendees,
    inclusions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function addEventType(eventType: EventType): void {
  const types = getAllEventTypes();
  types.push(eventType);
  localStorage.setItem("event_types", JSON.stringify(types));
  window.dispatchEvent(
    new CustomEvent("eventTypeAdded", { detail: eventType })
  );
}

export function updateEventType(eventType: EventType): void {
  const types = getAllEventTypes();
  const index = types.findIndex((t) => t.id === eventType.id);
  if (index !== -1) {
    types[index] = { ...eventType, updatedAt: new Date().toISOString() };
    localStorage.setItem("event_types", JSON.stringify(types));
    window.dispatchEvent(
      new CustomEvent("eventTypeUpdated", { detail: eventType })
    );
  }
}

export function deleteEventType(id: string): boolean {
  const types = getAllEventTypes();
  const filtered = types.filter((t) => t.id !== id);
  localStorage.setItem("event_types", JSON.stringify(filtered));
  return types.length !== filtered.length;
}

// ===== EVENT BOOKINGS MANAGEMENT =====

export function createEventBooking(
  eventTypeId: string,
  eventTypeName: string,
  customerName: string,
  customerPhone: string,
  eventDate: string,
  estimatedAttendees: number,
  totalPrice: number,
  specialRequirements?: string,
  customerEmail?: string
): EventBooking {
  return {
    id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    eventTypeId,
    eventTypeName,
    customerName,
    customerPhone,
    customerEmail,
    eventDate,
    estimatedAttendees,
    specialRequirements,
    totalPrice,
    status: "pending",
    paymentStatus: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function saveEventBooking(booking: EventBooking): void {
  const bookings = getAllEventBookings();
  bookings.push(booking);
  localStorage.setItem("event_bookings", JSON.stringify(bookings));
  window.dispatchEvent(
    new CustomEvent("eventBookingCreated", { detail: booking })
  );
}

export function getAllEventBookings(): EventBooking[] {
  const bookings = localStorage.getItem("event_bookings");
  return bookings ? JSON.parse(bookings) : [];
}

export function getEventBookingById(id: string): EventBooking | undefined {
  const bookings = getAllEventBookings();
  return bookings.find((b) => b.id === id);
}

export function updateEventBooking(booking: EventBooking): void {
  const bookings = getAllEventBookings();
  const index = bookings.findIndex((b) => b.id === booking.id);
  if (index !== -1) {
    bookings[index] = { ...booking, updatedAt: new Date().toISOString() };
    localStorage.setItem("event_bookings", JSON.stringify(bookings));
    window.dispatchEvent(
      new CustomEvent("eventBookingUpdated", { detail: booking })
    );
  }
}

export function getEventBookingsByCustomer(phone: string): EventBooking[] {
  const bookings = getAllEventBookings();
  return bookings.filter((b) => b.customerPhone === phone);
}

export function getEventBookingsByStatus(status: EventStatus): EventBooking[] {
  const bookings = getAllEventBookings();
  return bookings.filter((b) => b.status === status);
}

export function getEventBookingStats() {
  const bookings = getAllEventBookings();
  const today = new Date().toDateString();

  return {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    confirmedBookings: bookings.filter((b) => b.status === "confirmed").length,
    totalRevenue: bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + b.totalPrice, 0),
    todayBookings: bookings.filter(
      (b) => new Date(b.createdAt).toDateString() === today
    ).length,
  };
}
