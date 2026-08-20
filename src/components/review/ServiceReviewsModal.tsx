import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInfiniteQuery } from '@tanstack/react-query';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';
import { Brand, Typography, Spacing, Radius } from '@/constants/brand';
import { fetchServiceReviews } from '@/screens/Reviews/services/reviewService';
import type { ServiceReviewModel } from '@/types/review';

const { height: SCREEN_H } = Dimensions.get('window');
const DEFAULT_SERVICE_BANNER = require('@/assets/images/ac-service.webp');

// ─── Icons ────────────────────────────────────────────────────────────────────

function StarFull({ size = 14 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="#FFC107" stroke="#FFC107" strokeWidth="1">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

function StarEmpty({ size = 14 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

function CloseIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={Brand.textPrimary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 6L6 18" />
      <Path d="M6 6l12 12" />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={Brand.textMuted} strokeWidth={1.8} />
      <Polyline points="12,7 12,12 15,15" stroke={Brand.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ShieldCheckIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#2E7D32" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="9 12 11 14 15 10" stroke="#2E7D32" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Component Props ──────────────────────────────────────────────────────────

interface ServiceReviewsModalProps {
  visible: boolean;
  serviceId: string;
  serviceTitle: string;
  rating?: number;
  reviewCount?: number;
  service?: any;
  onClose: () => void;
}

export const ServiceReviewsModal = memo(function ServiceReviewsModal({
  visible,
  serviceId,
  serviceTitle,
  rating = 5.0,
  reviewCount = 0,
  service,
  onClose,
}: ServiceReviewsModalProps) {
  const insets = useSafeAreaInsets();
  const modalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['85%', '94%'], []);

  // Sync Gorhom BottomSheetModal visibility
  useEffect(() => {
    if (visible && serviceId) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible, serviceId]);

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  // High-performance paginated infinite query with React Query memory caching
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['serviceReviewsInfinite', serviceId],
    queryFn: ({ pageParam = 1 }) => fetchServiceReviews(serviceId, pageParam, 10),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    enabled: visible && !!serviceId,
    initialPageParam: 1,
    staleTime: 60 * 1000,
  });

  const allReviews = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.reviews);
  }, [data]);

  const totalReviewsCount = useMemo(() => {
    if (data?.pages?.[0]?.total) return data.pages[0].total;
    return reviewCount || allReviews.length;
  }, [data, reviewCount, allReviews.length]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.65}
        pressBehavior="close"
      />
    ),
    []
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Extracted Database Service Fields
  const bannerSource = useMemo(() => {
    if (service?.image) {
      return typeof service.image === 'string' ? { uri: service.image } : service.image;
    }
    return DEFAULT_SERVICE_BANNER;
  }, [service?.image]);

  const displayPrice = service?.price ?? service?.basePrice ?? service?.discountPrice ?? 549;
  const originalPrice = service?.originalPrice ?? service?.price ?? undefined;
  const discountPct = originalPrice && originalPrice > displayPrice
    ? Math.round((1 - displayPrice / originalPrice) * 100)
    : null;

  const description = service?.description ?? 'Professional verified service by Mubryx certified technicians.';
  const categoryName = service?.categoryName ?? service?.category ?? 'Home Service';
  const duration = service?.duration ?? '45 mins';
  const highlight = service?.successHighlight ?? '30-Day Money Back Guarantee';

  // Modal Header Component (Hero Image + Real DB Details)
  const ListHeaderComponent = useMemo(() => (
    <View style={styles.headerContentWrap}>
      {/* Big Hero Banner Image */}
      <View style={styles.heroBannerWrap}>
        <Image source={bannerSource} style={styles.heroBanner} resizeMode="cover" />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{categoryName}</Text>
        </View>
        <TouchableOpacity style={styles.closeFloatingBtn} onPress={onClose} activeOpacity={0.8} hitSlop={10}>
          <CloseIcon />
        </TouchableOpacity>
      </View>

      {/* Main Service Details from Database */}
      <View style={styles.serviceMetaCard}>
        <View style={styles.titleRow}>
          <Text style={styles.serviceTitle}>{serviceTitle || service?.name || 'Service Details'}</Text>
        </View>

        <View style={styles.priceAndRatingRow}>
          {/* Price Block */}
          <View style={styles.priceBlock}>
            <Text style={styles.displayPrice}>₹{displayPrice}</Text>
            {originalPrice && discountPct !== null && (
              <>
                <Text style={styles.originalPrice}>₹{originalPrice}</Text>
                <View style={styles.offerBadge}>
                  <Text style={styles.offerBadgeText}>{discountPct}% OFF</Text>
                </View>
              </>
            )}
          </View>

          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <StarFull size={14} />
            <Text style={styles.ratingValueText}>{Number(rating).toFixed(1)}</Text>
          </View>
        </View>

        {/* Highlights */}
        <View style={styles.infoPillsRow}>
          <View style={[styles.pill, styles.successPill]}>
            <ShieldCheckIcon />
            <Text style={styles.successPillText}>{highlight}</Text>
          </View>
        </View>

        {/* Database Description */}
        <Text style={styles.dbDescription}>{description}</Text>
      </View>

      {/* Section Divider */}
      <View style={styles.reviewsSectionHeader}>
        <Text style={styles.reviewsSectionTitle}>Customer Reviews</Text>
        <Text style={styles.reviewsCountSub}>
          ({totalReviewsCount} Verified {totalReviewsCount === 1 ? 'Review' : 'Reviews'})
        </Text>
      </View>
    </View>
  ), [bannerSource, categoryName, serviceTitle, service?.name, displayPrice, originalPrice, discountPct, rating, duration, highlight, description, totalReviewsCount, onClose]);

  const renderReviewItem = useCallback(({ item }: { item: ServiceReviewModel }) => (
    <View style={styles.reviewCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>
            {(item.user?.fullName || 'C').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userMeta}>
          <Text style={styles.userName}>{item.user?.fullName || 'Verified Customer'}</Text>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            s <= item.rating ? <StarFull key={s} size={13} /> : <StarEmpty key={s} size={13} />
          ))}
        </View>
      </View>

      {item.comment ? (
        <Text style={styles.commentText}>{item.comment}</Text>
      ) : null}
    </View>
  ), []);

  const ListFooterComponent = useMemo(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={Brand.primary} />
          <Text style={styles.footerLoaderText}>Loading more reviews...</Text>
        </View>
      );
    }
    return <View style={{ height: Math.max(insets.bottom, 24) }} />;
  }, [isFetchingNextPage, insets.bottom]);

  const ListEmptyComponent = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Brand.primary} />
          <Text style={styles.loadingText}>Loading verified customer reviews...</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Reviews Yet</Text>
        <Text style={styles.emptyText}>
          Be the first verified customer to book this service and submit a review!
        </Text>
      </View>
    );
  }, [isLoading]);

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}>
      
      <BottomSheetFlatList
        data={allReviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReviewItem}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Brand.white,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
  },
  handleIndicator: {
    backgroundColor: '#CBD5E1',
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  listContent: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.xl,
  },
  headerContentWrap: {
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  heroBannerWrap: {
    width: '100%',
    height: 180,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Brand.surface,
    position: 'relative',
    marginTop: Spacing.xs,
  },
  heroBanner: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.white,
  },
  closeFloatingBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceMetaCard: {
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceTitle: {
    ...Typography.h3,
    fontSize: 18,
    color: Brand.textPrimary,
    fontWeight: '700',
  },
  priceAndRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  displayPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: Brand.textPrimary,
  },
  originalPrice: {
    fontSize: 14,
    color: Brand.textMuted,
    textDecorationLine: 'line-through',
  },
  offerBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  offerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  ratingValueText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  infoPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Brand.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Brand.textSecondary,
  },
  successPill: {
    borderColor: '#C8E6C9',
    backgroundColor: '#F1F8E9',
  },
  successPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  dbDescription: {
    ...Typography.small,
    color: Brand.textSecondary,
    lineHeight: 18,
  },
  reviewsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Spacing.xs,
  },
  reviewsSectionTitle: {
    ...Typography.h4,
    fontSize: 16,
    color: Brand.textPrimary,
    fontWeight: '700',
  },
  reviewsCountSub: {
    fontSize: 13,
    color: Brand.textMuted,
    fontWeight: '500',
  },
  reviewCard: {
    backgroundColor: Brand.white,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.white,
  },
  userMeta: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: Brand.textPrimary,
  },
  dateText: {
    fontSize: 11,
    color: Brand.textMuted,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 2,
  },
  commentText: {
    ...Typography.small,
    color: Brand.textPrimary,
    lineHeight: 18,
    marginTop: 2,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  footerLoaderText: {
    fontSize: 12,
    color: Brand.textMuted,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.smallMedium,
    color: Brand.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Brand.textPrimary,
    fontWeight: '700',
  },
  emptyText: {
    ...Typography.small,
    color: Brand.textSecondary,
    textAlign: 'center',
  },
});
