/**
 * TrackingService — data layer for the Track module.
 * Currently backed by mock data.
 *
 * To integrate a real API / Firebase / WebSocket:
 *   → Replace ONLY the functions below.
 *   → Hooks and UI require zero changes.
 */

import { MOCK_ACTIVE_BOOKINGS } from '../mock';
import type { ActiveBooking } from '../types';
import { isLiveBooking, sortBookingsByProgress } from '../utils';

const DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Fetch all live bookings for a user ───────────────────────────────────────

export async function getActiveBookings(_userId: string): Promise<ActiveBooking[]> {
  await delay(DELAY_MS);
  const live = MOCK_ACTIVE_BOOKINGS.filter(isLiveBooking);
  return sortBookingsByProgress(live);
}

// ─── Fetch a single booking by ID ────────────────────────────────────────────

export async function getTrackingByBookingId(bookingId: string): Promise<ActiveBooking | null> {
  await delay(200);
  return MOCK_ACTIVE_BOOKINGS.find((b) => b.bookingId === bookingId) ?? null;
}
