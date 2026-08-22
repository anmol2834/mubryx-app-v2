import { Brand, Radius, Spacing } from '@/constants/brand';
import { useCartItemCount } from '@/hooks/queries/useCartQuery';
import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Path } from 'react-native-svg';

function BackArrowIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke={Brand.textPrimary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CartIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
        stroke={Brand.textPrimary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="3"
        y1="6"
        x2="21"
        y2="6"
        stroke={Brand.textPrimary}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M16 10a4 4 0 0 1-8 0"
        stroke={Brand.textPrimary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
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
      {/* Back Button */}
      <View style={styles.iconBtnWrap}>
        <Pressable
          style={styles.iconBtn}
          onPress={onBack}
          unstable_pressDelay={0}
          accessibilityLabel="Go back"
          android_ripple={{ color: Brand.primarySoft, borderless: false }}>
          <BackArrowIcon />
        </Pressable>
      </View>

      <View style={styles.actions}>
        {/* Cart — shows real item count, navigates instantly */}
        <View style={styles.iconBtnWrap}>
          <Pressable
            style={styles.iconBtn}
            onPress={handleCartPress}
            unstable_pressDelay={0}
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
