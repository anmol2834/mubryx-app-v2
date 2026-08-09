import React, { memo, useCallback, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions, ViewToken,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
} from 'react-native-reanimated';
import { Brand, Spacing, Typography, Radius, Shadow } from '@/constants/brand';
import { REVIEWS } from '@/constants/homeData';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - Spacing.screen * 2;

const StarRow = memo(function StarRow({ count }: { count: number }) {
  return (
    <View style={styles.stars}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Text key={i} style={[styles.star, i < count && styles.starFilled]}>★</Text>
      ))}
    </View>
  );
});

const ReviewCard = memo(function ReviewCard({
  item,
}: {
  item: (typeof REVIEWS)[number];
}) {
  return (
    <View style={styles.card}>
      {/* Quote mark */}
      <Text style={styles.quote}>"</Text>

      <Text style={styles.review}>{item.review}</Text>

      <StarRow count={item.rating} />

      <View style={styles.userRow}>
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.service}>{item.service} • {item.date}</Text>
        </View>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ Verified</Text>
        </View>
      </View>
    </View>
  );
});

const DotIndicator = memo(function DotIndicator({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 20 : 6);
  const opacity = useSharedValue(active ? 1 : 0.3);

  React.useEffect(() => {
    width.value = withTiming(active ? 20 : 6, { duration: 250 });
    opacity.value = withTiming(active ? 1 : 0.3, { duration: 250 });
  }, [active]);

  const style = useAnimatedStyle(() => ({ width: width.value, opacity: opacity.value }));
  return <Animated.View style={[styles.dot, style]} />;
});

export const CustomerReviews = memo(function CustomerReviews() {
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) setActiveIndex(viewableItems[0].index);
    }
  ).current;

  const renderItem = useCallback(
    ({ item }: { item: (typeof REVIEWS)[number] }) => <ReviewCard item={item} />,
    []
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>What Customers Say</Text>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingBadgeStar}>⭐</Text>
          <Text style={styles.ratingBadgeText}>4.9 / 5</Text>
        </View>
      </View>

      <FlatList
        data={REVIEWS as unknown as typeof REVIEWS[number][]}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({
          length: CARD_W + Spacing.md,
          offset: (CARD_W + Spacing.md) * index,
          index,
        })}
      />

      <View style={styles.dots}>
        {REVIEWS.map((_, i) => (
          <DotIndicator key={i} active={i === activeIndex} />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Spacing.xl,
    backgroundColor: Brand.offWhite,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Brand.textPrimary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Brand.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Brand.border,
    ...Shadow.sm,
  },
  ratingBadgeStar: {
    fontSize: 12,
  },
  ratingBadgeText: {
    ...Typography.caption,
    color: Brand.textPrimary,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: Spacing.screen,
    gap: Spacing.md,
  },
  card: {
    width: CARD_W,
    backgroundColor: Brand.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    ...Shadow.card,
  },
  quote: {
    fontSize: 48,
    color: Brand.primarySoft,
    fontWeight: '900',
    lineHeight: 40,
    marginBottom: -8,
  },
  review: {
    ...Typography.body,
    color: Brand.textSecondary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 16,
    color: Brand.border,
  },
  starFilled: {
    color: '#FFC107',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Brand.white,
    fontSize: 14,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...Typography.smallMedium,
    color: Brand.textPrimary,
    fontWeight: '600',
  },
  service: {
    ...Typography.caption,
    color: Brand.textMuted,
  },
  verifiedBadge: {
    backgroundColor: Brand.successSoft,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  verifiedText: {
    fontSize: 10,
    color: Brand.success,
    fontWeight: '600',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.base,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.primary,
  },
});
