import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

function LockIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M7 11V7a5 5 0 0 1 10 0v4"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronUpIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 15l-6-6-6 6"
        stroke={Brand.primary}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface BottomBookingBarProps {
  grandTotal: number;
  itemCount: number;
  couponDiscount: number;
  onConfirm: () => void;
  onOpenBreakdown?: () => void;
}

export const BottomBookingBar = memo(function BottomBookingBar({
  grandTotal,
  itemCount,
  couponDiscount,
  onConfirm,
  onOpenBreakdown,
}: BottomBookingBarProps) {
  const insets = useSafeAreaInsets();
  const hasItems = itemCount > 0;

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 8 }]}>
      {/* Price summary row */}
      <View style={styles.summaryRow}>
        <Pressable
          style={({ pressed }) => [styles.pricePressable, pressed && styles.pricePressed]}
          onPress={hasItems ? onOpenBreakdown : undefined}
          accessibilityLabel="View price breakdown">
          <View style={styles.priceCol}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <View style={styles.priceWithChevron}>
              <Text style={styles.totalPrice}>
                {hasItems ? `₹${grandTotal}` : '—'}
              </Text>
              {hasItems && (
                <View style={styles.chevronWrap}>
                  <ChevronUpIcon />
                </View>
              )}
            </View>
          </View>
        </Pressable>
        {couponDiscount > 0 && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>Saving ₹{couponDiscount}</Text>
          </View>
        )}
      </View>

      {/* CTA */}
      <Pressable
        style={({ pressed }) => [
          styles.confirmBtn,
          !hasItems && styles.confirmBtnDisabled,
          pressed && styles.confirmBtnPressed,
        ]}
        onPress={hasItems ? onConfirm : undefined}
        android_ripple={null}
        accessibilityLabel="Confirm booking"
        accessibilityRole="button"
        accessibilityState={{ disabled: !hasItems }}>
        <LockIcon />
        <Text style={styles.confirmText}>Confirm Booking</Text>
      </Pressable>
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
    gap: Spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#0A1628',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pricePressable: {
    borderRadius: Radius.md,
    paddingVertical: 2,
    paddingRight: Spacing.sm,
  },
  pricePressed: {
    opacity: 0.7,
  },
  priceCol: { gap: 1 },
  priceWithChevron: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chevronWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalLabel: {
    ...Typography.caption,
    color: Brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Brand.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  savingsBadge: {
    backgroundColor: Brand.successSoft,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Brand.success + '44',
  },
  savingsText: {
    ...Typography.smallMedium,
    color: Brand.success,
    fontWeight: '700',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Brand.navy,
    borderRadius: Radius.xl,
    paddingVertical: 16,
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnPressed: { opacity: 0.82 },
  confirmText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Brand.white,
    letterSpacing: -0.2,
  },
});
