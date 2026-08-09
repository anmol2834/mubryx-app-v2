import { Brand, Radius, Spacing } from '@/constants/brand';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Path } from 'react-native-svg';

function CartIllustration() {
  return (
    <Svg width={52} height={52} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
        stroke={Brand.textMuted}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="3" y1="6" x2="21" y2="6"
        stroke={Brand.textMuted}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <Path
        d="M16 10a4 4 0 0 1-8 0"
        stroke={Brand.textMuted}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface EmptyCartProps {
  onExplore: () => void;
}

export const EmptyCart = memo(function EmptyCart({ onExplore }: EmptyCartProps) {
  const insets = useSafeAreaInsets();

  // Pad so content doesn't overlap the sticky checkout bar
  const BOTTOM_BAR = 88 + insets.bottom;

  return (
    <View style={[styles.root, { paddingBottom: BOTTOM_BAR + Spacing.xxl }]}>
      {/* Illustration circle */}
      <View style={styles.iconCircle}>
        <CartIllustration />
      </View>

      <Text style={styles.headline}>Your cart is empty</Text>
      <Text style={styles.subline}>
        Browse our services and add what you need.
      </Text>

      {/* CTA */}
      <View style={styles.ctaClip}>
        <Pressable
          style={({ pressed }) => [styles.ctaBtn, pressed && styles.ctaBtnPressed]}
          onPress={onExplore}
          accessibilityLabel="Explore services"
          accessibilityRole="button"
          android_ripple={null}>
          <Text style={styles.ctaText}>Explore Services</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    backgroundColor: Brand.offWhite,
    gap: Spacing.md,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  headline: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Brand.textPrimary,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subline: {
    fontSize: 14,
    color: Brand.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  ctaClip: {
    marginTop: Spacing.base,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    width: '100%',
  },
  ctaBtn: {
    backgroundColor: Brand.navy,
    paddingVertical: 16,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnPressed: {
    opacity: 0.75,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Brand.white,
    letterSpacing: -0.1,
  },
});
