import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';
import { STATUS_CONFIG, type UpcomingBooking } from '../mockData';

function CalIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none"
      stroke={Brand.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="4" width="18" height="18" rx="2" />
      <Path d="M16 2v4M8 2v4M3 10h18" />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none"
      stroke={Brand.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v5l3 3" />
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
  item: UpcomingBooking;
}

export const UpcomingCard = memo(function UpcomingCard({ item }: Props) {
  const statusCfg = STATUS_CONFIG[item.status];

  return (
    <View style={s.card}>
      {/* Top section */}
      <View style={s.top}>
        <Image source={item.image} style={s.image} resizeMode="cover" />
        <View style={s.info}>
          <View style={s.statusRow}>
            <View style={[s.statusBadge, { backgroundColor: statusCfg.bg }]}>
              <View style={[s.statusDot, { backgroundColor: statusCfg.color }]} />
              <Text style={[s.statusText, { color: statusCfg.color }]}>{item.status}</Text>
            </View>
            <Text style={s.bookingId}>{item.bookingId}</Text>
          </View>
          <Text style={s.service} numberOfLines={2}>{item.service}</Text>
          <Text style={s.category}>{item.category}</Text>
        </View>
      </View>

      {/* Meta grid */}
      <View style={s.divider} />
      <View style={s.metaGrid}>
        <View style={s.metaItem}>
          <CalIcon />
          <Text style={s.metaText}>{item.scheduledDate}</Text>
        </View>
        <View style={s.metaItem}>
          <ClockIcon />
          <Text style={s.metaText}>{item.scheduledTime}</Text>
        </View>
        {item.technician && (
          <View style={[s.metaItem, s.metaFull]}>
            <UserIcon />
            <Text style={s.metaText}>{item.technician}</Text>
            <View style={s.assignedBadge}>
              <Text style={s.assignedText}>Assigned</Text>
            </View>
          </View>
        )}
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
            style={s.btnDanger}
            onPress={() =>
              Alert.alert('Cancel Booking', 'Are you sure?', [
                { text: 'No', style: 'cancel' },
                { text: 'Yes, Cancel', style: 'destructive', onPress: () => {} },
              ])
            }
            android_ripple={{ color: '#FFCDD2' }}>
            <Text style={s.btnDangerText}>Cancel</Text>
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
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  bookingId: { ...Typography.caption, color: Brand.textMuted },
  service: { ...Typography.h4, color: Brand.textPrimary, lineHeight: 20 },
  category: { ...Typography.caption, color: Brand.textSecondary },

  divider: { height: 1, backgroundColor: Brand.divider, marginHorizontal: Spacing.md },

  metaGrid: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '47%',
  },
  metaFull: { width: '100%' },
  metaText: { ...Typography.caption, color: Brand.textSecondary, flex: 1 },
  assignedBadge: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  assignedText: { fontSize: 9, fontWeight: '700', color: '#00695C' },

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
  btnDanger: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  btnDangerText: { ...Typography.caption, color: '#C62828', fontWeight: '700' },
});
