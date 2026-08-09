// No Reanimated — always visible static bar, no slide-up animation.
// Only interaction feedback is a light opacity on press.

import { Brand, Radius, Spacing } from '@/constants/brand';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

function ArrowIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14"
        stroke={Brand.navy} strokeWidth={2.4}
        strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 5l7 7-7 7"
        stroke={Brand.navy} strokeWidth={2.4}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

interface BottomBookingBarProps {
  selectedCount: number;
  totalPrice: number;
  onContinue: () => void;
}

export const BottomBookingBar = memo(function BottomBookingBar({
  selectedCount,
  totalPrice,
  onContinue,
}: BottomBookingBarProps) {
  const insets = useSafeAreaInsets();

  return (
    // Always rendered, always visible — no slide animation
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 6 }]}>
      <View style={styles.row}>
        {/* Left: count label + price */}
        <View style={styles.infoCol}>
          <Text style={styles.countLabel}>
            {selectedCount > 0
              ? `${selectedCount} ${selectedCount === 1 ? 'service' : 'services'} selected`
              : 'No service selected'}
          </Text>
          <Text style={styles.price}>
            {selectedCount > 0 ? `₹${totalPrice}` : '—'}
          </Text>
        </View>

        {/* Right: Continue button — only light opacity on press */}
        <View style={styles.btnClip}>
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              !selectedCount && styles.btnDisabled,
              pressed && styles.btnPressed,
            ]}
            onPress={selectedCount > 0 ? onContinue : undefined}
            android_ripple={null}
            accessibilityLabel="Continue to booking"
            accessibilityRole="button"
            accessibilityState={{ disabled: selectedCount === 0 }}>
            <Text style={styles.btnText}>Continue</Text>
            <View style={[styles.arrowCircle, !selectedCount && styles.arrowCircleDisabled]}>
              <ArrowIcon />
            </View>
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
    backgroundColor: Brand.navy,
    paddingTop: Spacing.base,
    paddingHorizontal: Spacing.screen,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.28,
        shadowRadius: 16,
      },
      android: { elevation: 24 },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCol: {
    gap: 2,
  },
  countLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },
  price: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Brand.white,
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  btnClip: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.xl,
    paddingRight: 6,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnPressed: {
    opacity: 0.75,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Brand.white,
    letterSpacing: -0.2,
  },
  arrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircleDisabled: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
});
