import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { ActiveBooking } from '../constants';

function TrackArrow() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M12 5l7 7-7 7" stroke={Brand.white} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function EmptyIllustration() {
  return (
    <View style={e.wrap}>
      <Text style={e.emoji}>📋</Text>
      <Text style={e.title}>No Active Service</Text>
      <Text style={e.sub}>Your active booking will appear here</Text>
      <Pressable style={e.cta}>
        <Text style={e.ctaText}>Explore Services →</Text>
      </Pressable>
    </View>
  );
}

const e = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.screen,
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Brand.borderLight,
    borderStyle: 'dashed',
    gap: 6,
  },
  emoji: { fontSize: 36, marginBottom: 4 },
  title: { ...Typography.h4, color: Brand.textPrimary },
  sub: { ...Typography.small, color: Brand.textMuted, textAlign: 'center' },
  cta: {
    marginTop: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 9,
    backgroundColor: Brand.primarySoft,
    borderRadius: Radius.full,
  },
  ctaText: { ...Typography.smallMedium, color: Brand.primary, fontWeight: '700' },
});

interface Props {
  booking: ActiveBooking | null;
  onTrack: () => void;
}

export const UpcomingBookingCard = memo(function UpcomingBookingCard({ booking, onTrack }: Props) {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.sectionTitle}>Active Service</Text>
        {booking && (
          <View style={s.liveBadge}>
            <View style={s.liveDot} />
            <Text style={s.liveText}>Live</Text>
          </View>
        )}
      </View>

      {!booking ? (
        <EmptyIllustration />
      ) : (
        <LinearGradient
          colors={Brand.gradientPrimary}
          style={s.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>

          {/* Top: icon + booking ID */}
          <View style={s.cardTop}>
            <View style={s.iconWrap}>
              <Text style={s.icon}>{booking.serviceIcon}</Text>
            </View>
            <View style={s.bookingIdWrap}>
              <Text style={s.bookingIdLabel}>Booking ID</Text>
              <Text style={s.bookingId}>{booking.bookingId}</Text>
            </View>
          </View>

          {/* Service name */}
          <Text style={s.serviceName}>{booking.serviceName}</Text>

          {/* Engineer row */}
          {booking.engineer && (
            <View style={s.engineerRow}>
              <View style={[s.engAvatar, { backgroundColor: booking.engineer.avatarColor }]}>
                <Text style={s.engAvatarText}>{booking.engineer.avatarInitials}</Text>
              </View>
              <View style={s.engInfo}>
                <Text style={s.engName}>{booking.engineer.name}</Text>
                <Text style={s.engSub}>Your Engineer</Text>
              </View>
            </View>
          )}

          {/* Track button */}
          <Pressable style={s.trackBtn} onPress={onTrack}
            android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}>
            <Text style={s.trackBtnText}>Track Technician</Text>
            <TrackArrow />
          </Pressable>
        </LinearGradient>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.h4, color: Brand.textPrimary },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Brand.success,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: 10,
    ...Shadow.lg,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 26 },
  bookingIdWrap: { alignItems: 'flex-end', gap: 2 },
  bookingIdLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  bookingId: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.white,
    letterSpacing: 0.2,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: '700',
    color: Brand.white,
    letterSpacing: -0.3,
  },
  engineerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.md,
    padding: 10,
  },
  engAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  engAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.white,
  },
  engInfo: { flex: 1, gap: 2 },
  engName: {
    fontSize: 13,
    fontWeight: '700',
    color: Brand.white,
  },
  engSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingVertical: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  trackBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.white,
  },
});
