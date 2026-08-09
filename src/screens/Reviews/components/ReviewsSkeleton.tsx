import { Brand, Radius, Spacing } from '@/constants/brand';
import { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const SkeletonBox = memo(function SkeletonBox({
  width, height, style,
}: { width?: number | string; height: number; style?: object }) {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[
        { width: width ?? '100%', height, borderRadius: Radius.sm, backgroundColor: Brand.surface },
        { opacity: anim },
        style,
      ]}
    />
  );
});

export const ReviewsSkeleton = memo(function ReviewsSkeleton() {
  return (
    <View style={s.wrap}>
      {/* Personal stats card skeleton */}
      <View style={s.statsCard}>
        <View style={s.statsLeft}>
          <SkeletonBox width={48} height={40} />
          <SkeletonBox width={60} height={10} />
          <SkeletonBox width={44} height={9} />
        </View>
        <View style={s.statsDivider} />
        <View style={s.statsRight}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={s.statItem}>
              <SkeletonBox width={28} height={20} />
              <SkeletonBox width={40} height={9} />
            </View>
          ))}
        </View>
      </View>

      {/* Filter chips skeleton */}
      <View style={s.chipsRow}>
        {[60, 52, 44, 52, 44].map((w, i) => (
          <SkeletonBox key={i} width={w} height={32} style={{ borderRadius: 999 }} />
        ))}
      </View>

      {/* Review card skeletons */}
      {[1, 2, 3].map((i) => (
        <View key={i} style={s.card}>
          {/* Service row */}
          <View style={s.serviceRow}>
            <SkeletonBox width={46} height={46} style={{ borderRadius: Radius.md }} />
            <View style={s.serviceInfo}>
              <SkeletonBox width={140} height={13} />
              <SkeletonBox width={90} height={10} />
            </View>
            <SkeletonBox width={56} height={12} />
          </View>
          {/* Meta */}
          <View style={s.metaRow}>
            <SkeletonBox width={110} height={10} />
            <SkeletonBox width={70} height={10} />
          </View>
          {/* Engineer */}
          <View style={s.engineerRow}>
            <SkeletonBox width={32} height={32} style={{ borderRadius: 16 }} />
            <View style={s.engineerInfo}>
              <SkeletonBox width={100} height={11} />
              <SkeletonBox width={70} height={9} />
            </View>
          </View>
          {/* Text lines */}
          <SkeletonBox height={11} />
          <SkeletonBox width="75%" height={11} />
        </View>
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { gap: Spacing.md, paddingTop: Spacing.base },
  statsCard: {
    marginHorizontal: Spacing.screen,
    backgroundColor: Brand.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  statsLeft: { gap: 6, alignItems: 'center', minWidth: 72 },
  statsDivider: { width: 1, height: 64, backgroundColor: Brand.borderLight },
  statsRight: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 5 },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    backgroundColor: Brand.white,
  },
  card: {
    marginHorizontal: Spacing.screen,
    backgroundColor: Brand.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  serviceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  serviceInfo: { flex: 1, gap: 6 },
  metaRow: { flexDirection: 'row', gap: Spacing.sm },
  engineerRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Brand.offWhite, borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  engineerInfo: { flex: 1, gap: 5 },
});
