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

// Mock filter: "recent" = last 30 days, "this_month" = Jul 2025, "last_month" = Jun 2025
function applyFilter<T extends { timestamp: number }>(items: T[], filter: FilterOption): T[] {
  if (filter === 'all') return items;
  const now = 1753920000; // ~Aug 2025 reference
  if (filter === 'recent')     return items.filter(i => now - i.timestamp < 30 * 86400);
  if (filter === 'this_month') return items.filter(i => {
    const d = new Date(i.timestamp * 1000);
    return d.getMonth() === 6 && d.getFullYear() === 2025; // July = 6
  });
  if (filter === 'last_month') return items.filter(i => {
    const d = new Date(i.timestamp * 1000);
    return d.getMonth() === 5 && d.getFullYear() === 2025; // June = 5
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
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setSearch('');
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate network refresh
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const handleRetry = useCallback(() => {
    setError(false);
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  }, []);

  const filteredCompleted = useMemo(() => {
    const searched = searchCompleted(COMPLETED_BOOKINGS, search);
    const filtered = applyFilter(searched, filter);
    return applySort(filtered, sort);
  }, [search, filter, sort]);

  const filteredUpcoming = useMemo(() => {
    const searched = searchUpcoming(UPCOMING_BOOKINGS, search);
    const filtered = applyFilter(searched, filter);
    return applySort(filtered, sort);
  }, [search, filter, sort]);

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
        completedCount={COMPLETED_BOOKINGS.length}
        upcomingCount={UPCOMING_BOOKINGS.length}
        onChange={handleTabChange}
      />

      <BookingFilterBar
        filter={filter}
        sort={sort}
        onFilterChange={setFilter}
        onSortChange={setSort}
      />

      {/* Content */}
      {loading ? (
        <SkeletonList />
      ) : error ? (
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
              refreshing={refreshing}
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
