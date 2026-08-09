/**
 * NotificationsScreen
 *
 * Navigation pattern: mounted inside index.tsx tab container using
 * display: 'none' toggle — identical to Profile, Track, Reviews.
 * This gives instant, zero-remount switching with preserved scroll state.
 *
 * Architecture:
 *  - useNotifications hook owns all state and business logic
 *  - All sub-components are pure display components
 *  - Service layer is the only thing that changes when backend goes live
 */

import { Brand, Spacing } from '@/constants/brand';
import { memo, useCallback } from 'react';
import {
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from './components/EmptyState';
import { FilterChips } from './components/FilterChips';
import { GroupedSection } from './components/GroupedSection';
import { NotificationHeader } from './components/NotificationHeader';
import { NotificationSkeleton } from './components/Skeleton';
import { useNotifications } from './hooks/useNotifications';
import type { NotificationCategory } from './types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  isActive: boolean;
  onBack: () => void;
  onNavigateToTrack: () => void;
  onNavigateToReview: () => void;
}

// ─── Error state ──────────────────────────────────────────────────────────────

const ErrorState = memo(function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={es.container}>
      <Text style={es.emoji}>📡</Text>
      <Text style={es.title}>Couldn't load notifications</Text>
      <Text style={es.subtitle}>Check your connection and try again.</Text>
      <Text onPress={onRetry} style={es.retry}>Retry</Text>
    </View>
  );
});

const es = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  emoji: { fontSize: 40, marginBottom: Spacing.sm },
  title: { fontSize: 17, fontWeight: '600' as const, color: Brand.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Brand.textMuted, textAlign: 'center', lineHeight: 22 },
  retry: {
    marginTop: Spacing.base,
    fontSize: 15,
    fontWeight: '700' as const,
    color: Brand.primary,
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export const NotificationsScreen = memo(function NotificationsScreen({
  isActive,
  onBack,
  onNavigateToTrack,
  onNavigateToReview,
}: Props) {
  const insets = useSafeAreaInsets();

  const handlers = { onOpenTrack: onNavigateToTrack, onOpenReview: onNavigateToReview };

  const {
    groups,
    unreadCount,
    isLoading,
    hasError,
    activeFilter,
    setActiveFilter,
    handleMarkRead,
    handleMarkAllRead,
    handleDelete,
    handleAction,
    retry,
  } = useNotifications(isActive, handlers);

  const handleFilterChange = useCallback(
    (category: NotificationCategory) => setActiveFilter(category),
    [setActiveFilter],
  );

  const handleExplore = useCallback(() => {
    onBack();
  }, [onBack]);

  const isEmpty = !isLoading && !hasError && groups.length === 0;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Brand.white} translucent={false} />

      {/* Header — always visible */}
      <NotificationHeader
        unreadCount={unreadCount}
        onBack={onBack}
        onMarkAllRead={handleMarkAllRead}
      />

      {/* Loading skeleton */}
      {isLoading && <NotificationSkeleton />}

      {/* Error */}
      {!isLoading && hasError && <ErrorState onRetry={retry} />}

      {/* Content */}
      {!isLoading && !hasError && (
        <>
          {/* Filter chips — sticky below header */}
          <FilterChips
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />

          <ScrollView
            style={s.scroll}
            contentContainerStyle={[
              s.scrollContent,
              { paddingBottom: insets.bottom + 24 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}>

            {/* Notification groups */}

            {/* Empty state */}
            {isEmpty ? (
              <EmptyState onExplore={handleExplore} />
            ) : (
              <View style={s.listContainer}>
                {groups.map((group) => (
                  <GroupedSection
                    key={group.label}
                    group={group}
                    onPress={handleAction}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
});

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.offWhite,
    ...Platform.select({
      android: { paddingTop: 0 }, // StatusBar handled by StatusBar component on Android
    }),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  listContainer: {
    flex: 1,
  },
});
