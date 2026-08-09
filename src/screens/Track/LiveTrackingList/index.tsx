import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo, useCallback } from 'react';
import { FlatList, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ActiveBooking } from '../types';
import { LiveBookingCard } from './components/LiveBookingCard';
import { TrackEmptyState } from './components/TrackEmptyState';
import { TrackListSkeleton } from './components/TrackListSkeleton';

// ─── Header ───────────────────────────────────────────────────────────────────

const ListHeader = memo(function ListHeader({ count }: { count: number }) {
  return (
    <View style={s.listHeader}>
      <View style={s.listHeaderText}>
        <Text style={s.listTitle}>Live Services</Text>
        <Text style={s.listSubtitle}>Track your ongoing bookings</Text>
      </View>
      <View style={s.countBadge}>
        <View style={s.countDot} />
        <Text style={s.countText}>{count} Active</Text>
      </View>
    </View>
  );
});

const ListFooter = memo(function ListFooter() {
  return <View style={{ height: Spacing.xxl }} />;
});

// ─── Main screen ──────────────────────────────────────────────────────────────

interface Props {
  bookings: ActiveBooking[];
  isLoading: boolean;
  onSelect: (bookingId: string) => void;
  onBookService: () => void;
}

export const LiveTrackingList = memo(function LiveTrackingList({
  bookings,
  isLoading,
  onSelect,
  onBookService,
}: Props) {
  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item, index }: { item: ActiveBooking; index: number }) => (
      <LiveBookingCard booking={item} rank={index + 1} onPress={onSelect} />
    ),
    [onSelect],
  );

  const keyExtractor = useCallback((item: ActiveBooking) => item.bookingId, []);

  if (isLoading) {
    return (
      <View style={[s.root, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={Brand.white} translucent={false} />
        <TrackListSkeleton />
      </View>
    );
  }

  if (bookings.length === 0) {
    return (
      <View style={[s.root, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={Brand.white} translucent={false} />
        <TrackEmptyState onBookService={onBookService} />
      </View>
    );
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Brand.white} translucent={false} />
      <FlatList
        data={bookings}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={<ListHeader count={bookings.length} />}
        ListFooterComponent={<ListFooter />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
      />
    </View>
  );
});

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.offWhite,
    ...Platform.select({
      android: { paddingTop: 0 },
    }),
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.lg,
    backgroundColor: Brand.white,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
    marginBottom: Spacing.base,
  },
  listHeaderText: { gap: 3 },
  listTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Brand.textPrimary,
    letterSpacing: -0.4,
  },
  listSubtitle: {
    ...Typography.small,
    color: Brand.textMuted,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Brand.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Brand.primary + '30',
  },
  countDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#00C853',
  },
  countText: {
    ...Typography.smallMedium,
    color: Brand.primary,
    fontWeight: '700' as const,
  },
});
