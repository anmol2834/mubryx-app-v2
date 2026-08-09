import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';

function TagIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
        stroke={Brand.primary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M7 7h.01" stroke={Brand.primary} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="20,6 9,17 4,12"
        stroke={Brand.success}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function XIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={Brand.textMuted}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

interface OffersCouponsProps {
  couponInput: string;
  couponApplied: string | null;
  couponDiscount: number;
  couponError: string | null;
  couponLoading: boolean;
  onCouponChange: (text: string) => void;
  onApply: () => void;
  onRemove: () => void;
}

export const OffersCoupons = memo(function OffersCoupons({
  couponInput,
  couponApplied,
  couponDiscount,
  couponError,
  couponLoading,
  onCouponChange,
  onApply,
  onRemove,
}: OffersCouponsProps) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TagIcon />
        <Text style={styles.heading}>Offers & Coupons</Text>
      </View>

      {/* Best offer hint */}
      <View style={styles.bestOffer}>
        <Text style={styles.bestOfferEmoji}>🎉</Text>
        <View style={styles.bestOfferTexts}>
          <Text style={styles.bestOfferTitle}>Use code MUBRYX10</Text>
          <Text style={styles.bestOfferSub}>Get 10% off on your first booking</Text>
        </View>
      </View>

      {/* Applied state */}
      {couponApplied ? (
        <View style={styles.appliedRow}>
          <View style={styles.appliedLeft}>
            <CheckIcon />
            <View>
              <Text style={styles.appliedCode}>{couponApplied} applied</Text>
              <Text style={styles.appliedSaving}>You save ₹{couponDiscount}</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.removeBtn, pressed && styles.removeBtnPressed]}
            onPress={onRemove}
            hitSlop={8}>
            <XIcon />
            <Text style={styles.removeBtnText}>Remove</Text>
          </Pressable>
        </View>
      ) : (
        /* Input row */
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter coupon code"
            placeholderTextColor={Brand.textMuted}
            value={couponInput}
            onChangeText={onCouponChange}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={onApply}
          />
          <Pressable
            style={({ pressed }) => [
              styles.applyBtn,
              !couponInput.trim() && styles.applyBtnDisabled,
              pressed && styles.applyBtnPressed,
            ]}
            onPress={onApply}
            disabled={!couponInput.trim() || couponLoading}>
            {couponLoading ? (
              <ActivityIndicator size="small" color={Brand.white} />
            ) : (
              <Text style={styles.applyBtnText}>Apply</Text>
            )}
          </Pressable>
        </View>
      )}

      {/* Error */}
      {couponError && !couponApplied && (
        <Text style={styles.errorText}>{couponError}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.screen,
    backgroundColor: Brand.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  heading: {
    ...Typography.h4,
    color: Brand.textPrimary,
    letterSpacing: -0.2,
  },
  bestOffer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Brand.warningSoft,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Brand.warning + '33',
  },
  bestOfferEmoji: { fontSize: 20 },
  bestOfferTexts: { flex: 1, gap: 2 },
  bestOfferTitle: {
    ...Typography.smallMedium,
    color: Brand.warning,
    fontWeight: '700',
  },
  bestOfferSub: { ...Typography.caption, color: Brand.textSecondary },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    borderWidth: 1.5,
    borderColor: Brand.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    backgroundColor: Brand.offWhite,
    letterSpacing: 1,
  },
  applyBtn: {
    backgroundColor: Brand.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  applyBtnDisabled: { opacity: 0.4 },
  applyBtnPressed: { opacity: 0.8 },
  applyBtnText: {
    ...Typography.smallMedium,
    color: Brand.white,
    fontWeight: '700',
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Brand.successSoft,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Brand.success + '44',
  },
  appliedLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  appliedCode: {
    ...Typography.smallMedium,
    color: '#2E7D32',
    fontWeight: '700',
  },
  appliedSaving: { ...Typography.caption, color: '#2E7D32' },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  removeBtnPressed: { opacity: 0.6 },
  removeBtnText: { ...Typography.caption, color: Brand.textMuted, fontWeight: '600' },
  errorText: {
    ...Typography.caption,
    color: Brand.error,
    marginTop: Spacing.sm,
  },
});
