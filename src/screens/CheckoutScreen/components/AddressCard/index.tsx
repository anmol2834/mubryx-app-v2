import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import type { LocationAddress } from '@/services/locationService';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

function PinIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
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

function EditIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke={Brand.primary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke={Brand.primary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface AddressCardProps {
  address: LocationAddress | null;
  onChangeAddress: () => void;
}

export const AddressCard = memo(function AddressCard({
  address,
  onChangeAddress,
}: AddressCardProps) {
  const areaLabel = address?.area || address?.city || 'Your Location';
  const fullAddress = address?.formatted ?? 'No address selected';
  const landmark = address?.landmark || null;

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <PinIcon />
        </View>
        <View style={styles.headerTexts}>
          <View style={styles.labelRow}>
            <Text style={styles.defaultLabel}>Service Address</Text>
            <View style={styles.homeBadge}>
              <Text style={styles.homeBadgeText}>Home</Text>
            </View>
          </View>
          <Text style={styles.areaLabel} numberOfLines={1}>{areaLabel}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.changeBtn, pressed && styles.changeBtnPressed]}
          onPress={onChangeAddress}
          accessibilityLabel="Change address"
          accessibilityRole="button"
          hitSlop={8}>
          <EditIcon />
          <Text style={styles.changeBtnText}>Change</Text>
        </Pressable>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Full address */}
      <Text style={styles.fullAddress} numberOfLines={2}>{fullAddress}</Text>
      {landmark ? (
        <Text style={styles.landmark} numberOfLines={1}>Near: {landmark}</Text>
      ) : null}
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
    gap: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTexts: { flex: 1, gap: 2 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  defaultLabel: {
    ...Typography.caption,
    color: Brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  homeBadge: {
    backgroundColor: Brand.primarySoft,
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  homeBadgeText: {
    ...Typography.caption,
    color: Brand.primary,
    fontWeight: '700',
  },
  areaLabel: {
    ...Typography.h4,
    color: Brand.textPrimary,
    letterSpacing: -0.2,
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Brand.primary,
    backgroundColor: Brand.primarySoft,
  },
  changeBtnPressed: { opacity: 0.65 },
  changeBtnText: {
    ...Typography.smallMedium,
    color: Brand.primary,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Brand.borderLight,
    marginVertical: Spacing.md,
  },
  fullAddress: {
    ...Typography.small,
    color: Brand.textSecondary,
    lineHeight: 18,
  },
  landmark: {
    ...Typography.caption,
    color: Brand.textMuted,
    marginTop: 4,
  },
});
