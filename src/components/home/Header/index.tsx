import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { useCartQuery } from '@/hooks/queries/useCartQuery';
import { useLocation } from '@/context/LocationContext';
import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

function LocationPinIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        stroke={Brand.primary} strokeWidth={1.8} strokeLinejoin="round"
      />
      <Circle cx="12" cy="9" r="2.5" stroke={Brand.primary} strokeWidth={1.8} />
    </Svg>
  );
}

function ChevronDownIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="6 9 12 15 18 9"
        stroke={Brand.primary} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function BellIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke={Brand.textPrimary} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke={Brand.textPrimary} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function CartIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
        stroke={Brand.textPrimary} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round"
      />
      <Line
        x1="3" y1="6" x2="21" y2="6"
        stroke={Brand.textPrimary} strokeWidth={1.8} strokeLinecap="round"
      />
      <Path
        d="M16 10a4 4 0 0 1-8 0"
        stroke={Brand.textPrimary} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

export const HomeHeader = memo(function HomeHeader({ onNotifPress }: { onNotifPress?: () => void }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: cart } = useCartQuery();
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const { address, openLocationSelector } = useLocation();

  const handleCartPress = useCallback(() => {
    router.push('/cart');
  }, [router]);

  const locationLabel = address?.shortLabel ?? 'Set Location';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Left: Logo + Location */}
      <View style={styles.left}>
        <View style={styles.logoRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>M</Text>
          </View>
          <Text style={styles.logoText}>mubryx</Text>
        </View>
        <View style={styles.locationClip}>
          <Pressable
            style={styles.locationRow}
            onPress={openLocationSelector}
            android_ripple={{ color: Brand.primarySoft, borderless: false }}
            accessibilityLabel="Change location">
            <LocationPinIcon />
            <Text style={styles.locationText} numberOfLines={1}>{locationLabel}</Text>
            <ChevronDownIcon />
          </Pressable>
        </View>
      </View>

      {/* Right: Bell + Cart */}
      <View style={styles.actions}>
        <Pressable
          style={styles.iconBtn}
          onPress={onNotifPress}
          accessibilityLabel="Notifications"
          android_ripple={{ color: Brand.primarySoft, borderless: false }}>
          <BellIcon />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.iconBtn}
          onPress={handleCartPress}
          accessibilityLabel={`Cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
          android_ripple={{ color: Brand.primarySoft, borderless: false }}>
          <CartIcon />
          {itemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount > 9 ? '9+' : itemCount}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  left: {
    flex: 1,
    gap: 2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  logoLetter: {
    color: Brand.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoText: {
    ...Typography.h3,
    color: Brand.textPrimary,
    letterSpacing: -0.5,
  },
  locationClip: {
    borderRadius: Radius.sm,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.sm,
  },
  locationText: {
    ...Typography.smallMedium,
    color: Brand.textSecondary,
    maxWidth: 160,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    overflow: 'hidden',
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Brand.white,
  },
  badgeText: {
    color: Brand.white,
    fontSize: 8,
    fontWeight: '700',
  },
});
