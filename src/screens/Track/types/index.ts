// ─── Track Module — Type Definitions ─────────────────────────────────────────
// Re-exports shared types from Profile/constants and adds Track-specific types.
// When a dedicated backend is introduced, only the service layer changes.

export type {
    ActiveBooking,
    Engineer,
    TrackStage,
    TrackStageId,
    TrackStageStatus
} from '../../Profile/constants';

// ─── Live stages ──────────────────────────────────────────────────────────────
// A booking is "live" (trackable) if it is in one of these stages.
// Completed / cancelled / refunded / rejected / expired are NOT live.

export const LIVE_STAGE_IDS = [
  'confirmed',
  'assigned',
  'journey',
  'nearby',
  'arrived',
  'started',
] as const;

export type LiveStageId = typeof LIVE_STAGE_IDS[number];

// ─── Stage priority map ───────────────────────────────────────────────────────
// Higher value = closer to completion = should appear first in sorted list.
// service_started (6) → engineer_arrived (5) → ... → booking_confirmed (1)

export const STAGE_PRIORITY: Record<LiveStageId, number> = {
  started:   6,
  arrived:   5,
  nearby:    4,
  journey:   3,
  assigned:  2,
  confirmed: 1,
};

// ─── Track view state (drives the TrackRouter) ────────────────────────────────

export type TrackView =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'detail'; bookingId: string }
  | { kind: 'list' };
