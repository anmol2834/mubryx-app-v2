import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';
import type { ActiveBooking } from '../../Profile/constants';

// ─── Inline meta icons (SVG, no emoji) ───────────────────────────────────────

function CalIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function ClockMetaIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" />
      <Polyline points="12,7 12,12 15,15" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function RupeeIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3h12M6 8h12M6 13l6 8M6 8c0 3.314 2.686 5 6 5s6-1.686 6-5" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Service type icon — rendered inside the gradient card top-left
function ServiceTypeIcon({ serviceIcon }: { serviceIcon: string }) {
  // Map emoji serviceIcon string to a proper SVG
  const iconMap: Record<string, React.ReactElement> = {
    '❄️': (
      <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round" />
      </Svg>
    ),
    '🧊': (
      <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
        <Rect x="2" y="3" width="20" height="18" rx="2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" />
        <Path d="M2 9h20" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round" />
        <Path d="M9 3v6M15 3v6" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round" />
      </Svg>
    ),
    '🫧': (
      <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
        <Rect x="2" y="3" width="20" height="18" rx="2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" />
        <Circle cx="12" cy="13" r="4" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" />
        <Circle cx="7" cy="7" r="1" fill="rgba(255,255,255,0.9)" />
      </Svg>
    ),
  };
  return iconMap[serviceIcon] ?? (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
        stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Stage config ─────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  confirmed: 'Booking Confirmed',
  assigned: 'Engineer Assigned',
  journey: 'On the Way',
  nearby: 'Engineer Nearby',
  arrived: 'Engineer Arrived',
  started: 'Service In Progress',
  completed: 'Service Completed',
};

const STAGE_COLORS: Record<string, { gradient: readonly [string, string] }> = {
  confirmed: { gradient: ['#1565C0', '#1E88E5'] },
  assigned:  { gradient: ['#00695C', '#00897B'] },
  journey:   { gradient: ['#1565C0', '#0288D1'] },
  nearby:    { gradient: ['#E65100', '#F57C00'] },
  arrived:   { gradient: ['#2E7D32', '#43A047'] },
  started:   { gradient: ['#6A1B9A', '#8E24AA'] },
  completed: { gradient: ['#1B5E20', '#2E7D32'] },
};

interface Props { booking: ActiveBooking }

export const BookingStatusCard = memo(function BookingStatusCard({ booking }: Props) {
  const colors = STAGE_COLORS[booking.currentStage] ?? STAGE_COLORS.confirmed;
  const stageLabel = STAGE_LABELS[booking.currentStage] ?? 'In Progress';

  return (
    <View style={s.wrapper}>
      <LinearGradient colors={colors.gradient} style={s.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        {/* Top row: appliance icon + status badge */}
        <View style={s.topRow}>
          <View style={s.iconWrap}>
            <ServiceTypeIcon serviceIcon={booking.serviceIcon} />
          </View>
          <View style={s.statusBadge}>
            <View style={s.pulseDot} />
            <Text style={s.statusBadgeText}>{stageLabel}</Text>
          </View>
        </View>

        {/* Service name + appliance */}
        <Text style={s.serviceName}>{booking.serviceName}</Text>
        <Text style={s.applianceName}>{booking.applianceName}</Text>

        {/* ETA */}
        {booking.currentStage !== 'completed' && booking.currentStage !== 'confirmed' && (
          <View style={s.etaRow}>
            <Text style={s.etaLabel}>ETA</Text>
            <Text style={s.etaValue}>{booking.eta}</Text>
          </View>
        )}

        {/* Meta row — SVG icons instead of emoji */}
        <View style={s.metaRow}>
          <View style={s.metaItem}>
            <CalIcon />
            <Text style={s.metaValue}>{booking.scheduledDate}</Text>
          </View>
          <View style={s.metaDivider} />
          <View style={s.metaItem}>
            <ClockMetaIcon />
            <Text style={s.metaValue}>{booking.scheduledTime}</Text>
          </View>
          <View style={s.metaDivider} />
          <View style={s.metaItem}>
            <RupeeIcon />
            <Text style={s.metaValue}>₹{booking.price}</Text>
          </View>
        </View>
        {/* OTP / Happy Code Display */}
        {booking.currentStage !== 'completed' && (
          <View style={s.codeRow}>
            {booking.currentStage === 'started' ? (
              <>
                <Text style={s.codeLabel}>Happy Code</Text>
                <Text style={s.codeValue}>{booking.happyCode || '----'}</Text>
              </>
            ) : (
              <>
                <Text style={s.codeLabel}>Booking OTP</Text>
                <Text style={s.codeValue}>{booking.otp || '----'}</Text>
              </>
            )}
          </View>
        )}
      </LinearGradient>
    </View>
  );
});

const s = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: 6,
    ...Shadow.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  iconWrap: {
    width: 48, height: 48,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  pulseDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#69F0AE' },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: Brand.white, letterSpacing: 0.2 },
  serviceName: { fontSize: 20, fontWeight: '700', color: Brand.white, letterSpacing: -0.3, lineHeight: 26 },
  applianceName: { ...Typography.small, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  etaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, marginBottom: 4,
  },
  etaLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 },
  etaValue: { fontSize: 13, fontWeight: '700', color: Brand.white },
  metaRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.md, paddingVertical: 10, paddingHorizontal: Spacing.md, marginTop: 4,
  },
  metaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5, justifyContent: 'center' },
  metaDivider: { width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.25)' },
  metaValue: { fontSize: 12, fontWeight: '600', color: Brand.white },
  codeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: Radius.md, paddingVertical: 12, paddingHorizontal: Spacing.md, marginTop: 8,
  },
  codeLabel: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  codeValue: { fontSize: 20, fontWeight: '800', color: Brand.white, letterSpacing: 6 },
});
