import { Brand, Radius, Spacing } from '@/constants/brand';
import { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

function SkeletonBox({
  width,
  height,
  borderRadius = Radius.sm,
  style,
}: {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1,   duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: Brand.borderLight }, { opacity }, style]}
    />
  );
}

function CardSkeleton() {
  return (
    <View style={s.card}>
      <View style={s.topRow}>
        <SkeletonBox width={48} height={48} borderRadius={Radius.md} />
        <View style={{ flex: 1, gap: 8 }}>
          <SkeletonBox width="65%" height={14} />
          <SkeletonBox width="40%" height={11} />
        </View>
        <SkeletonBox width={88} height={26} borderRadius={Radius.full} />
      </View>
      <SkeletonBox width="100%" height={4} borderRadius={Radius.full} />
      <View style={s.metaRow}>
        <SkeletonBox width={90} height={11} />
        <SkeletonBox width={60} height={11} />
        <SkeletonBox width={50} height={11} />
      </View>
      <SkeletonBox width="100%" height={40} borderRadius={Radius.full} />
    </View>
  );
}

export const TrackListSkeleton = memo(function TrackListSkeleton() {
  return (
    <View style={s.page}>
      {/* Header skeleton */}
      <View style={s.header}>
        <View style={{ flex: 1, gap: 8 }}>
          <SkeletonBox width="40%" height={18} borderRadius={Radius.xs} />
          <SkeletonBox width="55%" height={12} borderRadius={Radius.xs} />
        </View>
        <SkeletonBox width={72} height={28} borderRadius={Radius.full} />
      </View>
      {/* Card skeletons */}
      <CardSkeleton />
      <CardSkeleton />
    </View>
  );
});

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: Brand.offWhite },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.base,
    backgroundColor: Brand.white,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  card: {
    backgroundColor: Brand.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    gap: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
