import { Brand, Radius, Spacing } from '@/constants/brand';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

function ChevronRight() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke={Brand.white}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface StickyCheckoutBarProps {
  total: number;
  itemCount: number;
  onCheckout: () => void;
  disabled?: boolean;
}

export const StickyCheckoutBar = memo(function StickyCheckoutBar({
  total,
  itemCount,
  onCheckout,
  disabled,
}: StickyCheckoutBarProps) {
  const insets = useSafeAreaInsets();
  const hasItems = itemCount > 0 && !disabled;

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.row}>
        {/* Left: Total label + price */}
        <View style={styles.totalCol}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>
            {hasItems ? `₹${total}` : '—'}
          </Text>
        </View>

        {/* Right: Proceed to Checkout CTA */}
        <View style={styles.btnClip}>
          <Pressable
            style={({ pressed }) => [
              styles.checkoutBtn,
              !hasItems && styles.checkoutBtnDisabled,
              pressed && styles.checkoutBtnPressed,
            ]}
            onPress={hasItems ? onCheckout : undefined}
            accessibilityLabel="Proceed to checkout"
            accessibilityRole="button"
            accessibilityState={{ disabled: !hasItems }}
            android_ripple={null}>
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            <ChevronRight />
          </Pressable>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Brand.white,
    paddingTop: Spacing.base,
    paddingHorizontal: Spacing.screen,
    borderTopWidth: 1,
    borderTopColor: Brand.borderLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#0A1628',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.base,
  },
  totalCol: {
    gap: 1,
  },
  totalLabel: {
    fontSize: 11,
    color: Brand.textMuted,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Brand.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  btnClip: {
    flex: 1,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Brand.navy,
    paddingVertical: 15,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.xl,
  },
  checkoutBtnDisabled: {
    opacity: 0.4,
  },
  checkoutBtnPressed: {
    opacity: 0.8,
  },
  checkoutText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Brand.white,
    letterSpacing: -0.1,
  },
});
