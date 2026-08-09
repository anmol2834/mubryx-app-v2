import { Brand, Radius, Spacing } from '@/constants/brand';
import { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

function SkeletonBox({ width, height, style }: { width?: number | string; height: number; style?: object }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width: width ?? '100%', height, borderRadius: Radius.sm, backgroundColor: Brand.border },
        { opacity },
        style,
      ]}
    />
  );
}

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <View style={s.card}>
      <View style={s.top}>
        <SkeletonBox width={68} height={68} style={{ borderRadius: Radius.sm }} />
        <View style={s.info}>
          <SkeletonBox width={80} height={16} />
          <SkeletonBox width="90%" height={14} />
          <SkeletonBox width={60} height={12} />
        </View>
      </View>
      <View style={s.divider} />
      <View style={s.meta}>
        <SkeletonBox width="60%" height={12} />
        <SkeletonBox width="40%" height={12} />
      </View>
      <View style={s.divider} />
      <View style={s.footer}>
        <SkeletonBox width={60} height={18} />
        <View style={s.btnRow}>
          <SkeletonBox width={56} height={28} />
          <SkeletonBox width={56} height={28} />
          <SkeletonBox width={56} height={28} />
        </View>
      </View>
    </View>
  );
});

export function SkeletonList() {
  return (
    <View style={s.list}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
}

const s = StyleSheet.create({
  list: { gap: Spacing.md, padding: Spacing.screen },
  card: {
    backgroundColor: Brand.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    overflow: 'hidden',
  },
  top: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.md },
  info: { flex: 1, gap: 8, justifyContent: 'center' },
  divider: { height: 1, backgroundColor: Brand.divider, marginHorizontal: Spacing.md },
  meta: { padding: Spacing.md, gap: 8 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  btnRow: { flexDirection: 'row', gap: Spacing.xs },
});
