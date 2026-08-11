import { Brand, Spacing } from '@/constants/brand';
import { memo, useCallback } from 'react';
import { FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { EmptyReviews } from './components/EmptyReviews';
import { PersonalStatsCard } from './components/OverallRatingCard';
import { ReviewCard } from './components/ReviewCard';
import { ReviewHeader } from './components/ReviewHeader';
import { ReviewsSkeleton } from './components/ReviewsSkeleton';
import { WriteReviewSheet } from './components/WriteReviewSheet';
import { useReviews } from './hooks/useReviews';
import type { MyReview, PersonalStats } from './mock/types';

function PlusIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={Brand.white} strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const ItemSeparator = memo(function ItemSeparator() {
  return <View style={{ height: Spacing.md }} />;
});

function makeListHeader(stats: PersonalStats | null) {
  return function ListHeader() {
    return (
      <View>
        {stats && <PersonalStatsCard stats={stats} />}
        <View style={{ height: Spacing.md }} />
      </View>
    );
  };
}

interface Props {
  isActive: boolean;
}

export const ReviewsScreen = memo(function ReviewsScreen({ isActive }: Props) {
  const insets = useSafeAreaInsets();
  const r = useReviews(isActive);

  const renderItem = useCallback(
    ({ item }: { item: MyReview }) => <ReviewCard review={item} />,
    []
  );

  const keyExtractor = useCallback((item: MyReview) => item.id, []);

  const ListHeader = makeListHeader(r.personalStats);

  const ListEmpty = useCallback(() => <EmptyReviews />, []);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ReviewHeader totalReviews={r.myReviews.length} />

      {r.isLoading ? (
        <ReviewsSkeleton />
      ) : (
        <FlatList
          data={r.myReviews}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={[s.listContent, { paddingBottom: 100 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          removeClippedSubviews={Platform.OS === 'android'}
          refreshControl={
            <RefreshControl
              refreshing={r.isRefreshing}
              onRefresh={r.onRefresh}
              colors={[Brand.primary]}
              tintColor={Brand.primary}
            />
          }
        />
      )}

      {/* FAB — only shown after load */}
      {!r.isLoading && (
        <Pressable
          style={[s.fab, { bottom: 80 + insets.bottom }]}
          onPress={r.openWriteSheet}
          android_ripple={null}>
          <PlusIcon />
          <Text style={s.fabText}>Write Review</Text>
        </Pressable>
      )}

      {/*
        CRITICAL: only render Modal when tab is active.
        A Modal with visible=true intercepts ALL touches app-wide.
      */}
      {isActive && (
        <WriteReviewSheet
          visible={r.sheetVisible}
          mode={r.sheetMode}
          service={r.pendingService}
          selectedRating={r.selectedRating}
          reviewText={r.reviewText}
          selectedTags={r.selectedTags}
          isSubmitting={r.isSubmitting}
          onRatingChange={r.setSelectedRating}
          onTextChange={r.setReviewText}
          onToggleTag={r.toggleTag}
          onSubmit={r.handleSubmit}
          onDismiss={r.sheetMode === 'write' ? r.dismissPendingReview : r.closeSheet}
        />
      )}
    </View>
  );
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.offWhite },
  listContent: { backgroundColor: Brand.offWhite },
  fab: {
    position: 'absolute',
    right: Spacing.screen,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Brand.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 13,
    borderRadius: 999,
    ...Platform.select({
      ios: { shadowColor: Brand.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  fabText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Brand.white,
    letterSpacing: -0.2,
  },
});
