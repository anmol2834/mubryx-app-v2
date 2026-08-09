// ─── Booking Domain Types ─────────────────────────────────────────────────────
// Mirrors the backend API response contract exactly.

export type BookingStatus =
  | 'PENDING_MATCHING'
  | 'TECHNICIAN_SEARCHING'
  | 'TECHNICIAN_ASSIGNED'
  | 'TECHNICIAN_ACCEPTED'
  | 'TECHNICIAN_ON_THE_WAY'
  | 'TECHNICIAN_ARRIVED'
  | 'SERVICE_STARTED'
  | 'SERVICE_COMPLETED'
  | 'PAYMENT_PENDING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

export type BookingType = 'ASAP' | 'SCHEDULED';

export type PaymentMethod = 'CASH_ON_SERVICE' | 'UPI' | 'CARD' | 'WALLET' | 'ONLINE';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export interface BookingAddress {
  label: string;
  completeAddress: string;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface BookingItem {
  id: string;
  serviceId: string;
  title: string;
  category?: string | null;
  duration?: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
}

export interface BookingPricing {
  subtotal: number;
  discount: number;
  tax: number;
  platformFee: number;
  total: number;
}

export interface BookingStatusHistoryEntry {
  fromStatus?: BookingStatus | null;
  toStatus: BookingStatus;
  reason?: string | null;
  createdAt: string;
}

export interface Booking {
  bookingId: string;
  bookingNumber: string;
  status: BookingStatus;
  bookingType: BookingType;
  scheduledAt?: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  serviceAddress: BookingAddress;
  items: BookingItem[];
  pricing: BookingPricing;
  customerNotes?: string | null;
  technicianId?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
  // Only present in getBookingById
  statusHistory?: BookingStatusHistoryEntry[];
}

// ─── API Request / Response ───────────────────────────────────────────────────

export interface CreateBookingRequest {
  addressId: string;
  bookingType?: BookingType;
  /** ISO-8601 string — required for SCHEDULED bookings */
  scheduledAt?: string | null;
  paymentMethod: 'CASH_ON_SERVICE';
  notes?: string;
  couponCode?: string;
  /** UUID generated per booking attempt for idempotency */
  idempotencyKey: string;
  customerCurrentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface CreateBookingResponse extends Booking {
  /** True when the same idempotencyKey was already processed */
  alreadyCreated?: boolean;
}

export interface CancelBookingRequest {
  reason?: string;
}

/** Human-readable labels for UI */
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING_MATCHING: 'Pending',
  TECHNICIAN_SEARCHING: 'Finding Technician',
  TECHNICIAN_ASSIGNED: 'Technician Assigned',
  TECHNICIAN_ACCEPTED: 'Technician Accepted',
  TECHNICIAN_ON_THE_WAY: 'On the Way',
  TECHNICIAN_ARRIVED: 'Arrived',
  SERVICE_STARTED: 'Service Started',
  SERVICE_COMPLETED: 'Service Completed',
  PAYMENT_PENDING: 'Payment Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

/** Active/in-progress booking statuses (for "Upcoming" tab) */
export const UPCOMING_STATUSES: BookingStatus[] = [
  'PENDING_MATCHING',
  'TECHNICIAN_SEARCHING',
  'TECHNICIAN_ASSIGNED',
  'TECHNICIAN_ACCEPTED',
  'TECHNICIAN_ON_THE_WAY',
  'TECHNICIAN_ARRIVED',
  'SERVICE_STARTED',
  'SERVICE_COMPLETED',
  'PAYMENT_PENDING',
];

/** Terminal statuses (for "Completed/History" tab) */
export const COMPLETED_STATUSES: BookingStatus[] = [
  'COMPLETED',
  'CANCELLED',
  'FAILED',
];
