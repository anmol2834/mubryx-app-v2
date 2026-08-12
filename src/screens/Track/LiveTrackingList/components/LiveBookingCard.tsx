import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import type { ActiveBooking } from '../../types';
import { getProgressFraction } from '../../utils';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M12 5l7 7-7 7" stroke={Brand.white} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={Brand.textMuted} strokeWidth="1.8" />
      <Polyline points="12,7 12,12 15,14" stroke={Brand.textMuted} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PersonIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={Brand.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="7" r="4" stroke={Brand.textMuted} strokeWidth="1.8" />
    </Svg>
  );
}

function ETAIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        stroke={Brand.primary} strokeWidth="1.8" strokeLinejoin="round" />
      <Circle cx="12" cy="9" r="2.5" stroke={Brand.primary} strokeWidth="1.8" />
    </Svg>
  );
}

// ─── Appliance emoji → label (for icon background color coding) ──────────────

const APPLIANCE_COLORS: Record<string, { bg: string }> = {
  '❄️': { bg: '#E3F2FD' },
  '🧊': { bg: '#E0F7FA' },
  '🫧': { bg: '#E8F5E9' },
};

// ─── Card ─────────────────────────────────────────────────────────────────────

interface Props {
  booking: ActiveBooking;
  rank: number;            // 1-based. rank === 1 = closest to completion
  onPress: (bookingId: string) => void;
}

export const LiveBookingCard = memo(function LiveBookingCard({ booking, rank, onPress }: Props) {
  const progress     = getProgressFraction(booking.currentStage);
  const applianceBg  = APPLIANCE_COLORS[booking.serviceIcon]?.bg ?? Brand.surface;
  const isTopRanked  = rank === 1;

  const handlePress = useCallback(() => onPress(booking.id), [booking.id, onPress]);

  return (
    <Pressable
      style={({ pressed }) => [s.card, isTopRanked && s.cardTop, pressed && s.cardPressed]}
      onPress={handlePress}
      android_ripple={{ color: Brand.primarySoft, borderless: false }}>

      {/* Priority badge — only on rank 1 */}
      {isTopRanked && (
        <View style={s.priorityBadge}>
          <Text style={s.priorityText}>● Nearest Completion</Text>
        </View>
      )}

      {/* Top section: icon + main info */}
      <View style={s.topRow}>
        {/* Appliance icon bubble */}
        <View style={[s.iconBubble, { backgroundColor: applianceBg }]}>
          <Text style={s.iconEmoji}>{booking.serviceIcon}</Text>
        </View>

        {/* Service name + booking ID */}
        <View style={s.titleBlock}>
          <Text style={s.serviceName} numberOfLines={1}>{booking.serviceName}</Text>
          <Text style={s.bookingId}>{booking.bookingId}</Text>
        </View>

        {/* Status badge */}
        <StatusBadge stageId={booking.currentStage} />
      </View>

      {/* Progress bar */}
      <View style={s.progressSection}>
        <ProgressBar progress={progress} />
        <View style={s.progressLabels}>
          <Text style={s.progressStart}>Started</Text>
          <Text style={s.progressPct}>{Math.round(progress * 100)}%</Text>
          <Text style={s.progressEnd}>Done</Text>
        </View>
      </View>

      {/* Meta row: engineer + schedule + ETA */}
      <View style={s.metaRow}>
        {booking.engineer && (
          <View style={s.metaItem}>
            <PersonIcon />
            <Text style={s.metaText} numberOfLines={1}>{booking.engineer.name}</Text>
          </View>
        )}
        <View style={s.metaItem}>
          <ClockIcon />
          <Text style={s.metaText}>{booking.scheduledTime}</Text>
        </View>
        {booking.currentStage !== 'confirmed' && booking.eta && (
          <View style={s.metaItem}>
            <ETAIcon />
            <Text style={[s.metaText, s.etaText]}>{booking.eta}</Text>
          </View>
        )}
      </View>

      {/* Track button */}
      <View style={s.trackBtn}>
        <Text style={s.trackBtnText}>Track Service</Text>
        <ArrowIcon />
      </View>
    </Pressable>
  );
});

const s = StyleSheet.create({
  card: {
    backgroundColor: Brand.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    gap: Spacing.md,
    ...Shadow.card,
  },
  cardTop: {
    borderColor: Brand.primary + '40',
    borderWidth: 1.5,
  },
  cardPressed: {
    opacity: 0.92,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Brand.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: -Spacing.xs,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Brand.primary,
    letterSpacing: 0.3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: { fontSize: 22 },
  titleBlock: { flex: 1 },
  serviceName: {
    ...Typography.h4,
    color: Brand.textPrimary,
    fontWeight: '700' as const,
  },
  bookingId: {
    ...Typography.caption,
    color: Brand.textMuted,
    marginTop: 2,
  },
  progressSection: {
    gap: 5,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStart: {
    ...Typography.caption,
    color: Brand.textMuted,
  },
  progressPct: {
    ...Typography.caption,
    color: Brand.primary,
    fontWeight: '700' as const,
  },
  progressEnd: {
    ...Typography.caption,
    color: Brand.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.caption,
    color: Brand.textSecondary,
  },
  etaText: {
    color: Brand.primary,
    fontWeight: '700' as const,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Brand.primary,
    borderRadius: Radius.full,
    paddingVertical: 11,
  },
  trackBtnText: {
    ...Typography.smallMedium,
    color: Brand.white,
    fontWeight: '700' as const,
  },
});
