// ─── Booking Flow — Type Definitions ─────────────────────────────────────────
// Designed to map 1:1 with future backend API responses.
// Only the service layer changes when backend goes live.

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
  otp: string;
  status: BookingFlowStatus;
  engineer: BookingFlowEngineer;
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

// Input payload sent to the booking service
export interface CreateBookingPayload {
  userId: string;
  items: Array<{ id: string; name: string; price: number }>;
  address: string;
  scheduleMode: 'asap' | 'scheduled';
  scheduledDate: string | null;
  scheduledTime: string | null;
  paymentMethod: string;
  notes: string;
  grandTotal: number;
}
