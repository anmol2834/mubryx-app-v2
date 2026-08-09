import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { ActiveBooking } from '../../Profile/constants';

// ─── Address & contact icons (SVG, no emoji) ─────────────────────────────────

function PinIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        stroke={Brand.primary} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx="12" cy="9" r="2.5" stroke={Brand.primary} strokeWidth={1.8} />
    </Svg>
  );
}

function PersonIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={Brand.textSecondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="7" r="4"
        stroke={Brand.textSecondary} strokeWidth={1.8} />
    </Svg>
  );
}

interface ServiceProps {
  booking: ActiveBooking;
}

export const ServiceDetailsCard = memo(function ServiceDetailsCard({ booking }: ServiceProps) {
  const rows = [
    { label: 'Service', value: booking.serviceName },
    { label: 'Duration', value: booking.estimatedDuration },
    { label: 'Warranty', value: booking.warranty },
    { label: 'Amount', value: `₹${booking.price}` },
    { label: 'Payment', value: booking.paymentMethod },
  ];

  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>Service Details</Text>
      <View style={s.card}>
        {rows.map((row, idx) => (
          <View key={row.label}>
            <View style={s.row}>
              <Text style={s.label}>{row.label}</Text>
              <Text style={[s.value, row.label === 'Amount' && s.amountValue]}>{row.value}</Text>
            </View>
            {idx < rows.length - 1 && <View style={s.divider} />}
          </View>
        ))}
      </View>
    </View>
  );
});

interface AddressProps {
  booking: ActiveBooking;
}

export const TrackAddressCard = memo(function TrackAddressCard({ booking }: AddressProps) {
  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>Service Address</Text>
      <View style={s.card}>
        <View style={s.addrRow}>
          <View style={s.addrIconWrap}>
            <PinIcon />
          </View>
          <View style={s.addrTexts}>
            <Text style={s.addrMain}>{booking.address}</Text>
            {booking.landmark ? (
              <Text style={s.addrSub}>Near {booking.landmark}</Text>
            ) : null}
          </View>
        </View>
        <View style={s.divider} />
        <View style={s.addrRow}>
          <View style={s.addrIconWrap}>
            <PersonIcon />
          </View>
          <View style={s.addrTexts}>
            <Text style={s.addrMain}>{booking.contactPerson}</Text>
            <Text style={s.addrSub}>{booking.contactPhone}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    backgroundColor: Brand.white,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Brand.textPrimary,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
  },
  label: {
    ...Typography.small,
    color: Brand.textSecondary,
  },
  value: {
    ...Typography.smallMedium,
    color: Brand.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: Spacing.base,
  },
  amountValue: {
    color: Brand.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Brand.borderLight,
    marginHorizontal: Spacing.base,
  },
  addrRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  addrIconWrap: {
    width: 28,
    alignItems: 'center',
    paddingTop: 1,
  },
  addrTexts: { flex: 1, gap: 3 },
  addrMain: {
    ...Typography.smallMedium,
    color: Brand.textPrimary,
    fontWeight: '500',
    lineHeight: 18,
  },
  addrSub: {
    ...Typography.caption,
    color: Brand.textMuted,
  },
});
