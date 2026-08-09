/**
 * TrackDetails — dynamically renders booking data by bookingId.
 * The UI is 100% preserved from the existing TrackServiceScreen.
 * Only the data source changes: it now loads by bookingId param.
 */

import { Brand, Spacing, Typography } from '@/constants/brand';
import { memo, useCallback } from 'react';
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Re-use every existing TrackService component unchanged
import { BookingStatusCard } from '../../TrackService/components/BookingStatusCard';
import { EngineerCard } from '../../TrackService/components/EngineerCard';
import { ServiceDetailsCard } from '../../TrackService/components/ServiceDetailsCard';
import { TrackBottomActions } from '../../TrackService/components/TrackActions';
import { TrackHeader } from '../../TrackService/components/TrackHeader';
import { TrackTimeline } from '../../TrackService/components/TrackTimeline';

import { useTrackDetail } from '../hooks/useTrackDetail';
import type { ActiveBooking } from '../types';

const Divider = memo(function Divider() {
  return <View style={s.divider} />;
});

// ─── Skeleton while loading ───────────────────────────────────────────────────

const DetailSkeleton = memo(function DetailSkeleton() {
  return (
    <View style={s.skeletonPage}>
      {[180, 12, 300, 12, 120, 12, 180].map((h, i) => (
        <View key={i} style={[s.skeletonBlock, { height: h }]} />
      ))}
    </View>
  );
});

// ─── Error state ──────────────────────────────────────────────────────────────

const DetailError = memo(function DetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={s.errorState}>
      <Text style={s.errorEmoji}>📡</Text>
      <Text style={s.errorTitle}>Couldn't load booking</Text>
      <Text style={s.errorSub}>Check your connection and try again.</Text>
      <Pressable onPress={onRetry}><Text style={s.errorRetry}>Retry</Text></Pressable>
    </View>
  );
});

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  bookingId: string;
  /** Booking already in memory (from list) — avoids a redundant service call */
  prefetchedBooking: ActiveBooking | null;
  onBack: () => void;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export const TrackDetails = memo(function TrackDetails({
  bookingId,
  prefetchedBooking,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets();
  const { booking, isLoading, hasError, retry } = useTrackDetail(bookingId, prefetchedBooking);

  const handleLiveLocation = useCallback(() => {
    Alert.alert('Live Location', 'Live map integration coming soon.');
  }, []);

  const handleCall = useCallback(() => {
    Alert.alert('Call Engineer', `Calling ${booking?.engineer?.name ?? 'engineer'}...`);
  }, [booking?.engineer]);

  const handleChat    = useCallback(() => Alert.alert('Chat', 'Chat feature coming soon.'), []);
  const handleHelp    = useCallback(() => Alert.alert('Help', 'Support team will contact you shortly.'), []);
  const handleCancel  = useCallback(() => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => {} },
    ]);
  }, []);
  const handleInvoice   = useCallback(() => Alert.alert('Invoice', 'Downloading invoice...'), []);
  const handleBookAgain = useCallback(() => Alert.alert('Book Again', 'Redirecting to booking...'), []);
  const handleRate      = useCallback(() => Alert.alert('Rate Service', 'Rating screen coming soon.'), []);

  const showEngineer =
    booking?.engineer !== null &&
    booking?.currentStage !== 'confirmed';

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Brand.white} translucent={false} />

      <TrackHeader
        bookingId={isLoading ? '...' : (booking?.bookingId ?? bookingId)}
        onBack={onBack}
      />

      {isLoading && <DetailSkeleton />}
      {!isLoading && hasError && <DetailError onRetry={retry} />}

      {!isLoading && !hasError && booking && (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={[s.content, { paddingBottom: 48 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}>

          <BookingStatusCard booking={booking} />
          <Divider />
          <TrackTimeline stages={booking.stages} onLiveLocation={handleLiveLocation} />

          {showEngineer && booking.engineer && (
            <>
              <Divider />
              <EngineerCard engineer={booking.engineer} onCall={handleCall} onChat={handleChat} />
            </>
          )}

          <Divider />
          <ServiceDetailsCard booking={booking} />
          <Divider />

          <TrackBottomActions
            currentStage={booking.currentStage}
            onHelp={handleHelp}
            onCancel={handleCancel}
            onInvoice={handleInvoice}
            onBookAgain={handleBookAgain}
            onRate={handleRate}
          />
        </ScrollView>
      )}
    </View>
  );
});

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.offWhite,
  },
  scroll:  { flex: 1 },
  content: { backgroundColor: Brand.offWhite },
  divider: {
    height: 8,
    backgroundColor: Brand.offWhite,
  },
  skeletonPage: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.base,
    gap: 0,
  },
  skeletonBlock: {
    backgroundColor: Brand.borderLight,
    borderRadius: 4,
    opacity: 0.6,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xxl,
  },
  errorEmoji: { fontSize: 40 },
  errorTitle: {
    ...Typography.h4,
    color: Brand.textPrimary,
    textAlign: 'center',
  },
  errorSub: {
    ...Typography.small,
    color: Brand.textMuted,
    textAlign: 'center',
  },
  errorRetry: {
    ...Typography.bodyMedium,
    color: Brand.primary,
    fontWeight: '700' as const,
    marginTop: Spacing.sm,
  },
});
