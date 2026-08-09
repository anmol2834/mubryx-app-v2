import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { useLocation } from '@/context/LocationContext';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';

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

function LocationPinIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        stroke={Brand.primary}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="9" r="2.5" stroke={Brand.primary} strokeWidth={1.8} />
    </Svg>
  );
}

function ChevronDownIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="6 9 12 15 18 9"
        stroke={Brand.primary}
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
  const { address, openLocationSelector } = useLocation();
  const locationLabel = address?.shortLabel || address?.area || address?.city || 'Set Location';

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
        <Text style={styles.brand}>Checkout</Text>
        <Pressable
          style={styles.locationRow}
          onPress={openLocationSelector}
          hitSlop={6}
          accessibilityLabel="Change location">
          <LocationPinIcon />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationLabel}
          </Text>
          <ChevronDownIcon />
        </Pressable>
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
  center: { flex: 1, alignItems: 'center', gap: 2 },
  brand: {
    ...Typography.h3,
    color: Brand.textPrimary,
    letterSpacing: -0.4,
    fontWeight: '800',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    ...Typography.caption,
    color: Brand.textSecondary,
    fontWeight: '600',
    maxWidth: 160,
  },
  spacer: { width: 40 },
});
