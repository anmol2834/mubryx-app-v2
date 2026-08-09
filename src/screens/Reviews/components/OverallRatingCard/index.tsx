import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { PersonalStats } from '../../mock/types';

function StarFilled() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="#FFC107">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

interface StatItemProps {
  value: string;
  label: string;
  accent?: string;
}

const StatItem = memo(function StatItem({ value, label, accent }: StatItemProps) {
  return (
    <View style={s.statItem}>
      <Text style={[s.statValue, accent ? { color: accent } : undefined]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
});

interface Props {
  stats: PersonalStats;
}

export const PersonalStatsCard = memo(function PersonalStatsCard({ stats }: Props) {
  const avgDisplay = stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : '—';

  return (
    <View style={s.card}>
      {/* Avg rating — prominent left section */}
      <View style={s.ratingSection}>
        <Text style={s.bigRating}>{avgDisplay}</Text>
        <View style={s.starsRow}>
          {Array.from({ length: 5 }).map((_, i) => <StarFilled key={i} />)}
        </View>
        <Text style={s.ratingLabel}>Avg. Rating</Text>
      </View>

      <View style={s.divider} />

      {/* Right: 3 personal stats */}
      <View style={s.statsGrid}>
        <StatItem value={String(stats.totalReviews)} label="Reviews" accent={Brand.primary} />
        <StatItem value={String(stats.completedServices)} label="Services" />
        <StatItem value={String(stats.photosUploaded)} label="Photos" />
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
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    ...Shadow.card,
  },
  ratingSection: {
    alignItems: 'center',
    gap: 5,
    minWidth: 72,
  },
  bigRating: {
    fontSize: 40,
    fontWeight: '800' as const,
    color: Brand.textPrimary,
    letterSpacing: -1.5,
    lineHeight: 44,
  },
  starsRow: { flexDirection: 'row', gap: 2 },
  ratingLabel: { ...Typography.caption, color: Brand.textMuted },
  divider: { width: 1, height: 64, backgroundColor: Brand.borderLight },
  statsGrid: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Brand.textPrimary,
    letterSpacing: -0.5,
  },
  statLabel: { ...Typography.caption, color: Brand.textMuted },
});
