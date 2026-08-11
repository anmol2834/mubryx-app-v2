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

export const CartSkeleton = memo(function CartSkeleton() {
  return (
    <View style={s.container}>
      {/* Order Summary Skeleton Card */}
      <View style={s.summaryCard}>
        <SkeletonBlock width={140} height={20} borderRadius={Radius.sm} />
        <View style={s.row}>
          <SkeletonBlock width="40%" height={14} borderRadius={Radius.sm} />
          <SkeletonBlock width="25%" height={14} borderRadius={Radius.sm} />
        </View>
        <View style={s.row}>
          <SkeletonBlock width="50%" height={14} borderRadius={Radius.sm} />
          <SkeletonBlock width="20%" height={14} borderRadius={Radius.sm} />
        </View>
        <View style={s.divider} />
        <View style={s.row}>
          <SkeletonBlock width="35%" height={18} borderRadius={Radius.sm} />
          <SkeletonBlock width="30%" height={18} borderRadius={Radius.sm} />
        </View>
      </View>

      {/* Cart Item Cards Skeletons */}
      <View style={s.itemList}>
        {[0, 1].map((i) => (
          <View key={i} style={s.itemCard}>
            <View style={s.itemHeader}>
              <SkeletonBlock width={56} height={56} borderRadius={Radius.md} />
              <View style={{ flex: 1, gap: 8 }}>
                <SkeletonBlock width="80%" height={16} borderRadius={Radius.sm} />
                <SkeletonBlock width="50%" height={14} borderRadius={Radius.sm} />
              </View>
            </View>
            <View style={s.itemFooter}>
              <SkeletonBlock width={80} height={18} borderRadius={Radius.sm} />
              <SkeletonBlock width={90} height={32} borderRadius={Radius.full} />
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
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.base,
    gap: Spacing.md,
  },
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Brand.borderLight,
    marginVertical: 4,
  },
  itemList: {
    gap: Spacing.sm,
  },
  itemCard: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    gap: Spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
  },
});
