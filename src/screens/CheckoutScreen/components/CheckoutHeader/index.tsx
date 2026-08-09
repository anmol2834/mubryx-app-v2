import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

function BackArrow() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M12 5l-7 7 7 7"
        stroke={Brand.textPrimary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface CheckoutHeaderProps {
  onBack: () => void;
}

export const CheckoutHeader = memo(function CheckoutHeader({ onBack }: CheckoutHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
      <View style={styles.backClip}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={onBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          android_ripple={null}>
          <BackArrow />
        </Pressable>
      </View>

      <View style={styles.center}>
        <Text style={styles.brand}>Mubryx</Text>
        <Text style={styles.subtitle}>Checkout</Text>
      </View>

      <View style={styles.spacer} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.md,
    backgroundColor: Brand.white,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#0A1628',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  backClip: { borderRadius: Radius.sm, overflow: 'hidden' },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  center: { flex: 1, alignItems: 'center', gap: 1 },
  brand: {
    ...Typography.h3,
    color: Brand.primary,
    letterSpacing: -0.4,
    fontWeight: '800',
  },
  subtitle: {
    ...Typography.caption,
    color: Brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  spacer: { width: 40 },
});
