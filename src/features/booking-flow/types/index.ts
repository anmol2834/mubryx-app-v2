// ─── Booking Flow — Type Definitions ─────────────────────────────────────────
// These types drive the booking animation UI (FindingTechnicianSheet, TechnicianAssignedSheet).
// The service layer maps between CreateBookingResponse and these UI types.

import type { Engineer, TrackStage } from '@/screens/Profile/constants';

export type BookingFlowStatus =
  | 'idle'
  | 'searching'
  | 'assigned'
  | 'cancelled'
  | 'failed';

export type MatchingStepId =
  | 'finding_nearby'
  | 'matching_expertise'
  | 'checking_availability'
  | 'selecting_best'
  | 'confirming';

export type MatchingStepStatus = 'pending' | 'active' | 'done';

export interface MatchingStep {
  id: MatchingStepId;
  label: string;
  status: MatchingStepStatus;
}

export interface MatchingMetrics {
  searchRadius: string;
  nearbyEngineers: number;
  bestMatchRating: string;
  estimatedArrival: string;
}

export interface BookingFlowEngineer extends Engineer {
  completedJobs: number;
  distance: string;
  isTopRated: boolean;
}

export interface BookingResult {
  bookingId: string;
  bookingNumber: string;
  otp: string;
  status: BookingFlowStatus;
  engineer: BookingFlowEngineer | null;
  estimatedArrival: string;
  stages: TrackStage[];
  serviceName: string;
  serviceIcon: string;
  scheduledDate: string;
  scheduledTime: string;
  price: number;
  paymentMethod: string;
  address: string;
}

/**
 * Payload sent to confirmBooking() in useBookingFlow.
 * This is the REAL API request payload — no client-calculated prices.
 */
export interface CreateBookingPayload {
  // Real booking fields (sent to API)
  addressId: string;
  bookingType: 'ASAP' | 'SCHEDULED';
  scheduledAt?: string | null;
  paymentMethod: 'CASH_ON_SERVICE';
  notes: string;
  couponCode?: string;
  idempotencyKey: string;
  customerCurrentLocation?: { latitude: number; longitude: number };

  // UI-only display fields (not sent to API, used by assigned sheet)
  displayAddress: string;
  displayScheduledDate?: string | null;
  displayScheduledTime?: string | null;
}
