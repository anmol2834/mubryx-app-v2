import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { STATUS_COLORS, type BookingRecord } from '../constants';

interface BookingCardProps {
  booking: BookingRecord;
  onPress: (b: BookingRecord) => void;
}

const BookingCard = memo(function BookingCard({ booking, onPress }: BookingCardProps) {
  const sc = STATUS_COLORS[booking.status];
  const statusLabel = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);

  return (
    <Pressable
      style={styles.card}
      onPress={() => onPress(booking)}
      android_ripple={{ color: Brand.surface, borderless: false }}>
      {/* Top row */}
      <View style={styles.cardTop}>
        <View style={styles.serviceIconWrap}>
          <Text style={styles.serviceEmoji}>{booking.serviceIcon}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.serviceName} numberOfLines={1}>{booking.serviceName}</Text>
          <Text style={styles.techName}>by {booking.technicianName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: sc.dot }]} />
          <Text style={[styles.statusText, { color: sc.text }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom row */}
      <View style={styles.cardBottom}>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>📅 {booking.date}</Text>
          <Text style={styles.metaLabel}>🕐 {booking.time}</Text>
        </View>
        <Text style={styles.price}>₹{booking.price}</Text>
      </View>

      {/* Action buttons for upcoming/completed */}
      {booking.status === 'upcoming' && (
        <Pressable style={styles.trackBtn} android_ripple={{ color: Brand.primarySoft, borderless: false }}>
          <Text style={styles.trackBtnText}>Track Technician →</Text>
        </Pressable>
      )}
      {booking.status === 'completed' && (
        <Pressable style={styles.bookAgainBtn} android_ripple={{ color: Brand.primarySoft, borderless: false }}>
          <Text style={styles.bookAgainText}>Book Again</Text>
        </Pressable>
      )}
    </Pressable>
  );
});

interface Props {
  bookings: BookingRecord[];
  onBookingPress: (b: BookingRecord) => void;
}

export const BookingsSection = memo(function BookingsSection({ bookings, onBookingPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>My Bookings</Text>
        <Pressable hitSlop={8}>
          <Text style={styles.viewAll}>View All →</Text>
        </Pressable>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptySubtitle}>Your service history will appear here</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} onPress={onBookingPress} />
          ))}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Brand.white,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Brand.textPrimary,
  },
  viewAll: {
    ...Typography.smallMedium,
    color: Brand.primary,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: Spacing.screen,
    gap: Spacing.sm,
  },
  card: {
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  serviceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceEmoji: { fontSize: 22 },
  cardInfo: { flex: 1 },
  serviceName: {
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    fontWeight: '600',
  },
  techName: {
    ...Typography.caption,
    color: Brand.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    backgroundColor: Brand.borderLight,
    marginBottom: Spacing.md,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaCol: { gap: 3 },
  metaLabel: {
    ...Typography.caption,
    color: Brand.textSecondary,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: Brand.textPrimary,
    letterSpacing: -0.3,
  },
  trackBtn: {
    marginTop: Spacing.md,
    backgroundColor: Brand.primary,
    borderRadius: Radius.full,
    paddingVertical: 10,
    alignItems: 'center',
    overflow: 'hidden',
  },
  trackBtnText: {
    ...Typography.smallMedium,
    color: Brand.white,
    fontWeight: '700',
  },
  bookAgainBtn: {
    marginTop: Spacing.md,
    borderRadius: Radius.full,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Brand.primary,
    overflow: 'hidden',
  },
  bookAgainText: {
    ...Typography.smallMedium,
    color: Brand.primary,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.screen,
  },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: {
    ...Typography.h4,
    color: Brand.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    ...Typography.small,
    color: Brand.textMuted,
    textAlign: 'center',
  },
});
