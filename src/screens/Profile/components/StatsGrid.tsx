import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { type StatCard } from '../constants';

function StatIcon({ type, color }: { type: string; color: string }) {
  const p = {
    width: 16, height: 16, viewBox: '0 0 24 24',
    fill: 'none' as const, stroke: color,
    strokeWidth: '2', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  switch (type) {
    case 'check':
      return <Svg {...p}><Polyline points="20 6 9 17 4 12" /></Svg>;
    case 'star':
      return <Svg {...p}><Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></Svg>;
    case 'tag':
      return (
        <Svg {...p}>
          <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <Line x1="7" y1="7" x2="7.01" y2="7" stroke={color} strokeWidth="2" />
        </Svg>
      );
    case 'coupon':
      return (
        <Svg {...p}>
          <Rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <Path d="M1 10h22" />
        </Svg>
      );
    default:
      return <Svg {...p}><Circle cx="12" cy="12" r="10" /></Svg>;
  }
}

interface Props { stats: StatCard[] }

export const StatsGrid = memo(function StatsGrid({ stats }: Props) {
  // Split into rows of 2 for a tight 2×2 grid
  const rows = [stats.slice(0, 2), stats.slice(2, 4)];

  return (
    <View style={s.wrap}>
      {/* Section header */}
      <View style={s.header}>
        <Text style={s.title}>My Overview</Text>
      </View>

      {rows.map((row, ri) => (
        <View key={ri} style={[s.row, ri > 0 && s.rowGap]}>
          {row.map((stat) => (
            <View key={stat.id} style={s.card}>
              {/* Left: icon pill */}
              <View style={[s.iconPill, { backgroundColor: stat.iconBg }]}>
                <StatIcon type={stat.iconType} color={stat.iconColor} />
              </View>

              {/* Right: value + label stacked */}
              <View style={s.textCol}>
                <Text style={s.value}>{stat.value}</Text>
                <Text style={s.label} numberOfLines={1}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  wrap: {
    backgroundColor: Brand.white,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.smallMedium,
    color: Brand.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  rowGap: {
    marginTop: Spacing.sm,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.lg,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textCol: {
    flex: 1,
    gap: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Brand.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  label: {
    fontSize: 11,
    color: Brand.textMuted,
    fontWeight: '500' as const,
    lineHeight: 14,
  },
});
