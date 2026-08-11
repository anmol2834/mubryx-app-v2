import { Brand, Spacing } from '@/constants/brand';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookingFilterBar } from './components/BookingFilterBar';
import { BookingHeader } from './components/BookingHeader';
import { BookingTabs, type TabKey } from './components/BookingTabs';
import { CompletedCard } from './components/CompletedCard';
import { EmptyState } from './components/EmptyState';
import { ErrorState } from './components/ErrorState';
import { SkeletonList } from './components/SkeletonList';
import { UpcomingCard } from './components/UpcomingCard';
import {
  COMPLETED_BOOKINGS,
  UPCOMING_BOOKINGS,
  type CompletedBooking,
  type FilterOption,
  type SortOption,
  type UpcomingBooking,
} from './mockData';

import { useBookingsQuery } from '@/hooks/queries/useBookingsQuery';
import { mapBookingToCompleted, mapBookingToUpcoming } from './mapper';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applySort<T extends { timestamp: number; amountRaw: number }>(
  items: T[],
  sort: SortOption
): T[] {
  const arr = [...items];
  switch (sort) {
    case 'latest':     return arr.sort((a, b) => b.timestamp - a.timestamp);
    case 'oldest':     return arr.sort((a, b) => a.timestamp - b.timestamp);
    case 'price_high': return arr.sort((a, b) => b.amountRaw - a.amountRaw);
    case 'price_low':  return arr.sort((a, b) => a.amountRaw - b.amountRaw);
    default:           return arr;
  }
}

function applyFilter<T extends { timestamp: number }>(items: T[], filter: FilterOption): T[] {
  if (filter === 'all') return items;
  const now = Math.floor(Date.now() / 1000);
  if (filter === 'recent')     return items.filter(i => now - i.timestamp < 30 * 86400);
  if (filter === 'this_month') return items.filter(i => {
    const d = new Date(i.timestamp * 1000);
    const nowD = new Date();
    return d.getMonth() === nowD.getMonth() && d.getFullYear() === nowD.getFullYear();
  });
  if (filter === 'last_month') return items.filter(i => {
    const d = new Date(i.timestamp * 1000);
    const lastM = new Date();
    lastM.setMonth(lastM.getMonth() - 1);
    return d.getMonth() === lastM.getMonth() && d.getFullYear() === lastM.getFullYear();
  });
  return items;
}

function searchCompleted(items: CompletedBooking[], q: string): CompletedBooking[] {
  if (!q.trim()) return items;
  const lower = q.toLowerCase();
  return items.filter(
    i => i.service.toLowerCase().includes(lower) || i.bookingId.toLowerCase().includes(lower)
  );
}

function searchUpcoming(items: UpcomingBooking[], q: string): UpcomingBooking[] {
  if (!q.trim()) return items;
  const lower = q.toLowerCase();
  return items.filter(
    i => i.service.toLowerCase().includes(lower) || i.bookingId.toLowerCase().includes(lower)
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export const BookingHistoryScreen = memo(function BookingHistoryScreen() {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab]   = useState<TabKey>('completed');
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState<FilterOption>('all');
  const [sort, setSort]             = useState<SortOption>('latest');

  const scrollRef = useRef<ScrollView>(null);

  // Real backend queries for upcoming and completed bookings
  const upcomingQuery = useBookingsQuery('upcoming');
  const completedQuery = useBookingsQuery('completed');

  const isLoading = upcomingQuery.isLoading || completedQuery.isLoading;
  const isError = upcomingQuery.isError || completedQuery.isError;
  const isRefreshing = upcomingQuery.isRefetching || completedQuery.isRefetching;

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setSearch('');
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const handleRefresh = useCallback(() => {
    upcomingQuery.refetch();
    completedQuery.refetch();
  }, [upcomingQuery, completedQuery]);

  const handleRetry = useCallback(() => {
    upcomingQuery.refetch();
    completedQuery.refetch();
  }, [upcomingQuery, completedQuery]);

  const completedList = useMemo<CompletedBooking[]>(() => {
    const raw = completedQuery.data || [];
    return raw.map(mapBookingToCompleted);
  }, [completedQuery.data]);

  const upcomingList = useMemo<UpcomingBooking[]>(() => {
    const raw = upcomingQuery.data || [];
    return raw.map(mapBookingToUpcoming);
  }, [upcomingQuery.data]);

  const filteredCompleted = useMemo(() => {
    const searched = searchCompleted(completedList, search);
    const filtered = applyFilter(searched, filter);
    return applySort(filtered, sort);
  }, [completedList, search, filter, sort]);

  const filteredUpcoming = useMemo(() => {
    const searched = searchUpcoming(upcomingList, search);
    const filtered = applyFilter(searched, filter);
    return applySort(filtered, sort);
  }, [upcomingList, search, filter, sort]);

  const isSearchEmpty =
    activeTab === 'completed'
      ? filteredCompleted.length === 0
      : filteredUpcoming.length === 0;

  const emptyType = search.trim() ? 'search' : activeTab;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Brand.white} translucent={false} />

      <BookingHeader />

      <BookingTabs
        active={activeTab}
        completedCount={completedList.length}
        upcomingCount={upcomingList.length}
        onChange={handleTabChange}
      />

      <BookingFilterBar
        filter={filter}
        sort={sort}
        onFilterChange={setFilter}
        onSortChange={setSort}
      />

      {/* Content */}
      {isLoading ? (
        <SkeletonList />
      ) : isError ? (
        <ErrorState onRetry={handleRetry} />
      ) : (
        <ScrollView
          ref={scrollRef}
          style={s.scroll}
          contentContainerStyle={[s.list, { paddingBottom: 100 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Brand.primary}
              colors={[Brand.primary]}
            />
          }>

          {isSearchEmpty ? (
            <EmptyState
              type={emptyType}
              onRetry={search.trim() ? () => setSearch('') : undefined}
            />
          ) : activeTab === 'completed' ? (
            filteredCompleted.map(item => (
              <CompletedCard key={item.id} item={item} />
            ))
          ) : (
            filteredUpcoming.map(item => (
              <UpcomingCard key={item.id} item={item} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.offWhite },
  scroll: { flex: 1 },
  list: {
    padding: Spacing.screen,
    gap: Spacing.md,
  },
});
