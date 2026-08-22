import { Brand, Radius, Spacing } from '@/constants/brand';
import { memo, useEffect } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');
const PROBLEM_CARD_W = SCREEN_W * 0.72;

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
  const skeletonRows = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ];

  return (
    <View style={s.wrapper}>
      {/* Header skeleton */}
      <View style={s.header}>
        <SkeletonBlock width={140} height={22} borderRadius={Radius.sm} />
        <SkeletonBlock width={60} height={16} borderRadius={Radius.sm} />
      </View>

      {/* Grid skeleton — 3x3 layout covering all phone screen sizes */}
      <View style={s.grid}>
        {skeletonRows.map((row, rowIndex) => (
          <View key={rowIndex} style={s.row}>
            {row.map((i) => (
              <View key={i} style={s.cardWrap}>
                <View style={s.card}>
                  <SkeletonBlock width={48} height={48} borderRadius={Radius.md} />
                  <SkeletonBlock width="75%" height={12} borderRadius={Radius.sm} />
                </View>
              </View>
            ))}
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

      {/* List skeleton — horizontal ScrollView for all screens */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalRow}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={s.applianceCard}>
            <SkeletonBlock width="100%" height={110} borderRadius={Radius.md} />
            <View style={{ gap: 6, width: '100%', marginTop: 8 }}>
              <SkeletonBlock width="80%" height={14} borderRadius={Radius.sm} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

export const PopularProblemsSkeleton = memo(function PopularProblemsSkeleton() {
  return (
    <View style={s.wrapper}>
      {/* Header skeleton */}
      <View style={s.header}>
        <SkeletonBlock width={160} height={22} borderRadius={Radius.sm} />
        <SkeletonBlock width={60} height={16} borderRadius={Radius.sm} />
      </View>

      {/* List skeleton — horizontal ScrollView for problem cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={s.problemCard}>
            <View style={s.problemTopRow}>
              <SkeletonBlock width={48} height={48} borderRadius={Radius.md} />
              <SkeletonBlock width={64} height={22} borderRadius={Radius.full} />
            </View>
            <SkeletonBlock width="75%" height={18} borderRadius={Radius.sm} />
            <SkeletonBlock width="90%" height={12} borderRadius={Radius.sm} />
            <View style={s.problemBottomRow}>
              <SkeletonBlock width={70} height={16} borderRadius={Radius.sm} />
              <SkeletonBlock width={90} height={32} borderRadius={Radius.full} />
            </View>
          </View>
        ))}
      </ScrollView>
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
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cardWrap: {
    flex: 1,
    borderRadius: Radius.lg,
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  horizontalRow: {
    gap: Spacing.md,
  },
  applianceCard: {
    width: SCREEN_W * 0.44,
    borderRadius: Radius.lg,
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  problemCard: {
    width: PROBLEM_CARD_W,
    borderRadius: Radius.xl,
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  problemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  problemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
});
