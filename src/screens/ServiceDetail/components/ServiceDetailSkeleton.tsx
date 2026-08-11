import { Brand, Radius, Spacing } from '@/constants/brand';
import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

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

export const ServiceDetailSkeleton = memo(function ServiceDetailSkeleton() {
  return (
    <View style={s.container}>
      {/* Banner / Header Skeleton */}
      <View style={s.bannerSkeleton}>
        <SkeletonBlock width="100%" height={180} borderRadius={Radius.lg} />
      </View>

      {/* Trust Badges Skeleton */}
      <View style={s.trustRow}>
        <SkeletonBlock width="30%" height={36} borderRadius={Radius.full} />
        <SkeletonBlock width="30%" height={36} borderRadius={Radius.full} />
        <SkeletonBlock width="30%" height={36} borderRadius={Radius.full} />
      </View>

      {/* Title & Count Skeleton */}
      <View style={s.sectionHeader}>
        <SkeletonBlock width={180} height={22} borderRadius={Radius.sm} />
        <SkeletonBlock width={80} height={16} borderRadius={Radius.sm} />
      </View>

      {/* Service Card Skeletons */}
      <View style={s.cardList}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={s.card}>
            <View style={s.cardHeader}>
              <View style={{ flex: 1, gap: 8 }}>
                <SkeletonBlock width="80%" height={18} borderRadius={Radius.sm} />
                <SkeletonBlock width="60%" height={14} borderRadius={Radius.sm} />
              </View>
              <SkeletonBlock width={70} height={70} borderRadius={Radius.md} />
            </View>
            <View style={s.cardFooter}>
              <SkeletonBlock width={90} height={20} borderRadius={Radius.sm} />
              <SkeletonBlock width={100} height={36} borderRadius={Radius.full} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.white,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.md,
  },
  bannerSkeleton: {
    marginBottom: Spacing.base,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  cardList: {
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
  },
});
