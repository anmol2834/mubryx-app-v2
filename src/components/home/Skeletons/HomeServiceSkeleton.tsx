import { Brand, Radius, Spacing } from '@/constants/brand';
import { memo, useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - Spacing.screen * 2 - Spacing.md * 2) / 3;

const SkeletonBlock = memo(function SkeletonBlock({
  width,
  height,
  borderRadius = Radius.md,
  style,
}: {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: any;
}) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 800 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: Brand.borderLight,
        },
        animatedStyle,
        style,
      ]}
    />
  );
});

export const QuickServicesSkeleton = memo(function QuickServicesSkeleton() {
  return (
    <View style={s.wrapper}>
      {/* Header skeleton */}
      <View style={s.header}>
        <SkeletonBlock width={140} height={22} borderRadius={Radius.sm} />
        <SkeletonBlock width={60} height={16} borderRadius={Radius.sm} />
      </View>

      {/* Grid skeleton */}
      <View style={s.grid}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={s.cardWrap}>
            <View style={s.card}>
              <SkeletonBlock width={52} height={52} borderRadius={Radius.md} />
              <SkeletonBlock width="70%" height={12} borderRadius={Radius.sm} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});

export const BrowseApplianceSkeleton = memo(function BrowseApplianceSkeleton() {
  return (
    <View style={s.wrapper}>
      {/* Header skeleton */}
      <View style={s.header}>
        <SkeletonBlock width={160} height={22} borderRadius={Radius.sm} />
        <SkeletonBlock width={60} height={16} borderRadius={Radius.sm} />
      </View>

      {/* List skeleton */}
      <View style={s.horizontalRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={s.applianceCard}>
            <SkeletonBlock width={64} height={64} borderRadius={Radius.md} />
            <SkeletonBlock width="80%" height={14} borderRadius={Radius.sm} />
          </View>
        ))}
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Brand.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  cardWrap: {
    width: CARD_W,
    borderRadius: Radius.lg,
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    padding: Spacing.sm,
  },
  card: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  horizontalRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  applianceCard: {
    width: 120,
    borderRadius: Radius.lg,
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
