import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { useCartItemCount } from '@/hooks/queries/useCartQuery';
import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Path } from 'react-native-svg';

function CartIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
        stroke={Brand.textPrimary} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round"
      />
      <Line x1="3" y1="6" x2="21" y2="6"
        stroke={Brand.textPrimary} strokeWidth={1.8} strokeLinecap="round"
      />
      <Path d="M16 10a4 4 0 0 1-8 0"
        stroke={Brand.textPrimary} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function MenuIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Line x1="3" y1="6" x2="21" y2="6"
        stroke={Brand.textPrimary} strokeWidth={2} strokeLinecap="round"
      />
      <Line x1="3" y1="12" x2="21" y2="12"
        stroke={Brand.textPrimary} strokeWidth={2} strokeLinecap="round"
      />
      <Line x1="3" y1="18" x2="21" y2="18"
        stroke={Brand.textPrimary} strokeWidth={2} strokeLinecap="round"
      />
    </Svg>
  );
}

interface ServiceHeaderProps {
  onBack: () => void;
  cartCount?: number;
}

export const ServiceHeader = memo(function ServiceHeader({
  onBack,
}: ServiceHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const itemCount = useCartItemCount();

  const handleCartPress = useCallback(() => {
    router.push('/cart');
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Brand name acts as back button */}
      <Pressable onPress={onBack} style={styles.brandWrap} accessibilityLabel="Go back">
        <View style={styles.brandBox}>
          <Text style={styles.brandText}>Mubryx</Text>
        </View>
      </Pressable>

      <View style={styles.actions}>
        {/* Cart — shows real item count, navigates instantly */}
        <View style={styles.iconBtnWrap}>
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
        <View style={styles.iconBtnWrap}>
          <Pressable
            style={styles.iconBtn}
            accessibilityLabel="Menu"
            android_ripple={{ color: Brand.primarySoft, borderless: false }}>
            <MenuIcon />
          </Pressable>
        </View>
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
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandBox: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.white,
  },
  brandText: {
    ...Typography.smallMedium,
    color: Brand.textPrimary,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtnWrap: {
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Brand.primary,
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
