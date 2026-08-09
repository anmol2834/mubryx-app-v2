import { TOTAL_LIVE_STAGES } from '../constants';
import type { ActiveBooking, LiveStageId } from '../types';
import { LIVE_STAGE_IDS, STAGE_PRIORITY } from '../types';

// ─── Live check ───────────────────────────────────────────────────────────────

/** Returns true if the booking is currently active/live (not completed/cancelled). */
export function isLiveBooking(booking: ActiveBooking): boolean {
  return (LIVE_STAGE_IDS as readonly string[]).includes(booking.currentStage);
}

// ─── Sort by progress ─────────────────────────────────────────────────────────

/**
 * Sorts active bookings so the one closest to completion appears first.
 * Pure function — no side effects. Safe to call in useMemo.
 */
export function sortBookingsByProgress(bookings: ActiveBooking[]): ActiveBooking[] {
  return [...bookings].sort((a, b) => {
    const pa = STAGE_PRIORITY[a.currentStage as LiveStageId] ?? 0;
    const pb = STAGE_PRIORITY[b.currentStage as LiveStageId] ?? 0;
    return pb - pa; // descending: highest priority first
  });
}

// ─── Progress fraction ────────────────────────────────────────────────────────

/**
 * Returns a 0–1 progress value for the booking's current stage.
 * Used for the progress bar in LiveTrackingList cards.
 */
export function getProgressFraction(stageId: string): number {
  const priority = STAGE_PRIORITY[stageId as LiveStageId] ?? 0;
  return priority / TOTAL_LIVE_STAGES;
}

// ─── Stage index for stepper ──────────────────────────────────────────────────

/**
 * Returns 0-based index of the current live stage (0 = confirmed, 5 = started).
 */
export function getLiveStageIndex(stageId: string): number {
  const idx = (LIVE_STAGE_IDS as readonly string[]).indexOf(stageId);
  return idx >= 0 ? idx : 0;
}
