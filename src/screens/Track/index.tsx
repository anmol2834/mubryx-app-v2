/**
 * TrackScreen — smart router for the Track tab.
 *
 * Decision tree (handled by useTrackRouter):
 *   loading              → skeleton inside LiveTrackingList
 *   0 active bookings    → TrackEmptyState
 *   1 active booking     → TrackDetails directly (no intermediate screen)
 *   2+ active bookings   → LiveTrackingList → user picks → TrackDetails
 *
 * Navigation uses the same display: 'none' pattern as every other tab.
 * All state is preserved between tab switches.
 */

import { memo, useCallback, useMemo } from 'react';
import { useTrackRouter } from './hooks/useTrackRouter';
import { LiveTrackingList } from './LiveTrackingList';
import { TrackDetails } from './TrackDetails';
import type { ActiveBooking } from './types';

interface Props {
  isActive: boolean;
  /** Called when back is pressed from single-booking detail view (returns to prev tab) */
  onBack: () => void;
  /** Called when user taps "Book a Service" in empty state */
  onBookService: () => void;
}

export const TrackScreen = memo(function TrackScreen({
  isActive,
  onBack,
  onBookService,
}: Props) {
  const { view, bookings, isRefreshing, onRefresh, openDetail, backFromDetail } = useTrackRouter(isActive);

  // Find the prefetched booking from the in-memory list to avoid a redundant
  // service call when navigating from list → detail.
  const prefetchedBooking = useMemo<ActiveBooking | null>(() => {
    if (view.kind !== 'detail') return null;
    return bookings.find((b) => b.bookingId === view.bookingId) ?? null;
  }, [view, bookings]);

  // Back handler for detail view:
  //   - came from list → go back to list
  //   - direct (single booking) → go back to previous tab
  const handleDetailBack = useCallback(() => {
    if (bookings.length >= 2) {
      backFromDetail();
    } else {
      onBack();
    }
  }, [bookings.length, backFromDetail, onBack]);

  // ── Detail view ────────────────────────────────────────────────────────────
  if (view.kind === 'detail') {
    return (
      <TrackDetails
        bookingId={view.bookingId}
        prefetchedBooking={prefetchedBooking}
        onBack={handleDetailBack}
      />
    );
  }

  // ── List / Empty / Loading ─────────────────────────────────────────────────
  // LiveTrackingList handles all three cases (passes isLoading down)
  return (
    <LiveTrackingList
      bookings={bookings}
      isLoading={view.kind === 'loading'}
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
      onSelect={openDetail}
      onBookService={onBookService}
    />
  );
});
