import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Alert, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import type { CompletedBooking } from '../mockData';

function CheckCircleIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none"
      stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <Polyline points="22 4 12 14.01 9 11.01" />
    </Svg>
  );
}

// LocationIcon removed

function UserIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none"
      stroke={Brand.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Path d="M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </Svg>
  );
}

interface Props {
  item: CompletedBooking;
}

export const CompletedCard = memo(function CompletedCard({ item }: Props) {
  return (
    <View style={s.card}>
      {/* Top section */}
      <View style={s.top}>
        <Image source={item.image} style={s.image} resizeMode="cover" />
        <View style={s.info}>
          <View style={s.statusRow}>
            <View style={s.statusBadge}>
              <CheckCircleIcon />
              <Text style={s.statusText}>Service Completed</Text>
            </View>
            <Text style={s.bookingId}>{item.bookingId}</Text>
          </View>
          <Text style={s.service} numberOfLines={2}>{item.service}</Text>
          <Text style={s.category}>{item.category}</Text>
        </View>
      </View>

      {/* Meta rows */}
      <View style={s.divider} />
      <View style={s.metaSection}>
        <View style={s.metaRow}>
          <UserIcon />
          <Text style={s.metaText}>{item.technician}</Text>
          <View style={s.dot} />
          <Text style={s.date}>{item.date}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={s.divider} />
      <View style={s.footer}>
        <Text style={s.amount}>{item.amount}</Text>
        <View style={s.actions}>
          <Pressable
            style={s.btnOutline}
            onPress={() => Alert.alert('View Details', `Booking: ${item.bookingId}`)}
            android_ripple={{ color: Brand.primarySoft }}>
            <Text style={s.btnOutlineText}>Details</Text>
          </Pressable>
          <Pressable
            style={s.btnOutline}
            onPress={() => {
              if (item.invoiceUrl) {
                Linking.openURL(item.invoiceUrl).catch(() =>
                  Alert.alert('Error', 'Could not open invoice URL'),
                );
              } else {
                Alert.alert('Invoice Pending', 'Your tax invoice is being processed and will be available shortly.');
              }
            }}
            android_ripple={{ color: Brand.primarySoft }}>
            <Text style={s.btnOutlineText}>Invoice</Text>
          </Pressable>
          <Pressable
            style={s.btnPrimary}
            onPress={() => Alert.alert('Rebook', `Rebooking: ${item.service}`)}
            android_ripple={{ color: Brand.primaryDark }}>
            <Text style={s.btnPrimaryText}>Rebook</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  card: {
    backgroundColor: Brand.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    overflow: 'hidden',
    ...Shadow.card,
  },
  top: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  image: {
    width: 68, height: 68,
    borderRadius: Radius.sm,
    backgroundColor: Brand.surface,
    flexShrink: 0,
  },
  info: { flex: 1, gap: 4 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusText: { fontSize: 10, fontWeight: '700', color: '#2E7D32' },
  bookingId: { ...Typography.caption, color: Brand.textMuted },
  service: { ...Typography.h4, color: Brand.textPrimary, lineHeight: 20 },
  category: { ...Typography.caption, color: Brand.textSecondary },

  divider: { height: 1, backgroundColor: Brand.divider, marginHorizontal: Spacing.md },

  metaSection: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { ...Typography.caption, color: Brand.textSecondary, flex: 1 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Brand.textMuted },
  date: { ...Typography.caption, color: Brand.textMuted },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  amount: { ...Typography.h4, color: Brand.primary, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: Spacing.xs },
  btnOutline: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  btnOutlineText: { ...Typography.caption, color: Brand.textSecondary, fontWeight: '600' },
  btnPrimary: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Brand.primary,
  },
  btnPrimaryText: { ...Typography.caption, color: Brand.white, fontWeight: '700' },
});
