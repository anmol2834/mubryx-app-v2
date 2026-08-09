import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NotificationSummaryStats } from '../../types';

interface StatPillProps {
  emoji: string;
  value: number;
  label: string;
  accent: string;
  bg: string;
}

const StatPill = memo(function StatPill({ emoji, value, label, accent, bg }: StatPillProps) {
  return (
    <View style={[s.pill, { backgroundColor: bg }]}>
      <Text style={s.pillEmoji}>{emoji}</Text>
      <Text style={[s.pillValue, { color: accent }]}>{value}</Text>
      <Text style={s.pillLabel}>{label}</Text>
    </View>
  );
});

interface Props {
  stats: NotificationSummaryStats;
}

export const NotificationSummary = memo(function NotificationSummary({ stats }: Props) {
  return (
    <View style={s.card}>
      {/* Top row: unread hero */}
      <View style={s.heroRow}>
        <View style={s.heroLeft}>
          <Text style={s.heroValue}>{stats.unread}</Text>
          <View>
            <Text style={s.heroLabel}>Unread</Text>
            <Text style={s.heroSub}>{stats.total} total notifications</Text>
          </View>
        </View>
        <View style={s.heroDot}>
          <Text style={s.heroDotText}>🔔</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={s.divider} />

      {/* Stats pills */}
      <View style={s.pillsRow}>
        <StatPill emoji="📅" value={stats.todayCount}      label="Today"    accent="#1565C0" bg="#E3F2FD" />
        <StatPill emoji="📦" value={stats.bookingUpdates}  label="Bookings" accent="#00695C" bg="#E0F2F1" />
        <StatPill emoji="🎁" value={stats.offerCount}      label="Offers"   accent="#E65100" bg="#FFF3E0" />
        <StatPill emoji="🎧" value={stats.supportMessages} label="Support"  accent="#0277BD" bg="#E1F5FE" />
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.base,
    backgroundColor: Brand.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    gap: Spacing.md,
    ...Shadow.card,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  heroValue: {
    fontSize: 40,
    fontWeight: '800' as const,
    color: Brand.primary,
    letterSpacing: -1,
    lineHeight: 44,
  },
  heroLabel: {
    ...Typography.h4,
    color: Brand.textPrimary,
    fontWeight: '700' as const,
  },
  heroSub: { ...Typography.caption, color: Brand.textMuted },
  heroDot: {
    width: 52, height: 52,
    borderRadius: 26,
    backgroundColor: Brand.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  heroDotText: { fontSize: 24 },
  divider: { height: 1, backgroundColor: Brand.borderLight },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    marginHorizontal: 3,
  },
  pillEmoji: { fontSize: 16 },
  pillValue: { fontSize: 16, fontWeight: '800' as const, letterSpacing: -0.3 },
  pillLabel: { ...Typography.caption, color: Brand.textSecondary, fontWeight: '600' as const },
});
