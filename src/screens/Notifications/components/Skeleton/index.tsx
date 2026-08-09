/**
 * NotificationSkeleton — loading placeholder.
 * Uses React Native's Animated API with a looping opacity pulse.
 * No Lottie, no heavy animation — pure lightweight approach.
 */
import { Brand, Radius, Spacing } from '@/constants/brand';
import { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

// ─── Shimmer atom ─────────────────────────────────────────────────────────────

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
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: Brand.borderLight },
        { opacity },
        style,
      ]}
    />
  );
}

// ─── Header Skeleton ──────────────────────────────────────────────────────────

export const HeaderSkeleton = memo(function HeaderSkeleton() {
  return (
    <View style={s.headerSkeleton}>
      <SkeletonBox width={38} height={38} borderRadius={Radius.sm} />
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonBox width="60%" height={18} borderRadius={Radius.xs} />
        <SkeletonBox width="40%" height={12} borderRadius={Radius.xs} />
      </View>
      <SkeletonBox width={72} height={32} borderRadius={Radius.full} />
    </View>
  );
});

// ─── Summary Skeleton ─────────────────────────────────────────────────────────

export const SummarySkeleton = memo(function SummarySkeleton() {
  return (
    <View style={s.summarySkeleton}>
      <View style={s.summaryTop}>
        <View style={{ gap: 8 }}>
          <SkeletonBox width={60} height={40} borderRadius={Radius.md} />
          <SkeletonBox width={100} height={14} borderRadius={Radius.xs} />
        </View>
        <SkeletonBox width={52} height={52} borderRadius={26} />
      </View>
      <SkeletonBox width="100%" height={1} borderRadius={0} />
      <View style={s.summaryPills}>
        {[0, 1, 2, 3].map((i) => (
          <SkeletonBox key={i} width={72} height={56} borderRadius={Radius.md} />
        ))}
      </View>
    </View>
  );
});

// ─── Card Skeleton ────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <View style={s.cardSkeleton}>
      <SkeletonBox width={44} height={44} borderRadius={Radius.md} />
      <View style={{ flex: 1, gap: 8 }}>
        <SkeletonBox width="70%" height={14} borderRadius={Radius.xs} />
        <SkeletonBox width="90%" height={12} borderRadius={Radius.xs} />
        <SkeletonBox width="40%" height={11} borderRadius={Radius.xs} />
      </View>
    </View>
  );
}

// ─── Full-page Skeleton ───────────────────────────────────────────────────────

export const NotificationSkeleton = memo(function NotificationSkeleton() {
  return (
    <View style={s.page}>
      <SummarySkeleton />

      {/* Chips row */}
      <View style={s.chipsRow}>
        {[80, 64, 88, 72, 68].map((w, i) => (
          <SkeletonBox key={i} width={w} height={32} borderRadius={Radius.full} />
        ))}
      </View>

      {/* Group label */}
      <View style={s.groupLabel}>
        <SkeletonBox width={48} height={12} borderRadius={Radius.xs} />
        <SkeletonBox width="70%" height={1} borderRadius={0} />
      </View>

      {/* Card skeletons */}
      <View style={s.cardGroup}>
        {[0, 1, 2].map((i) => (
          <View key={i}>
            <CardSkeleton />
            {i < 2 && <View style={s.sep} />}
          </View>
        ))}
      </View>

      {/* Second group label */}
      <View style={s.groupLabel}>
        <SkeletonBox width={72} height={12} borderRadius={Radius.xs} />
        <SkeletonBox width="65%" height={1} borderRadius={0} />
      </View>

      {/* More card skeletons */}
      <View style={s.cardGroup}>
        {[0, 1].map((i) => (
          <View key={i}>
            <CardSkeleton />
            {i < 1 && <View style={s.sep} />}
          </View>
        ))}
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Brand.offWhite,
  },
  headerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    backgroundColor: Brand.white,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
    gap: Spacing.md,
  },
  summarySkeleton: {
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.base,
    backgroundColor: Brand.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    gap: Spacing.md,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryPills: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Brand.white,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
    marginTop: Spacing.base,
  },
  groupLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  cardGroup: {
    backgroundColor: Brand.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Brand.borderLight,
  },
  cardSkeleton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  sep: {
    height: 1,
    backgroundColor: Brand.divider,
    marginLeft: Spacing.screen + 44 + Spacing.md,
  },
});
