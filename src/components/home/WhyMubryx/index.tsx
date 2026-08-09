import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { WHY_MUBRYX } from '@/constants/homeData';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

type WhySvgType = (typeof WHY_MUBRYX)[number]['svgType'];

function WhyIcon({ type, color }: { type: WhySvgType; color: string }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none' as const, stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (type) {
    // Shield with checkmark — Verified Technicians
    case 'shield-check':
      return (
        <Svg {...p}>
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <Polyline points="9 12 11 14 15 10" />
        </Svg>
      );
    // Lightning bolt — Fast Service
    case 'zap':
      return (
        <Svg {...p}>
          <Polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </Svg>
      );
    // Award ribbon — 90-Day Warranty
    case 'award':
      return (
        <Svg {...p}>
          <Circle cx="12" cy="8" r="6" />
          <Path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
        </Svg>
      );
    // Price tag — Best Pricing
    case 'tag':
      return (
        <Svg {...p}>
          <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <Line x1="7" y1="7" x2="7.01" y2="7" strokeWidth={2.5} />
        </Svg>
      );
    // Settings gear — Genuine Parts
    case 'settings':
      return (
        <Svg {...p}>
          <Circle cx="12" cy="12" r="3" />
          <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </Svg>
      );
    // Headphones — 24×7 Support
    case 'headphones':
      return (
        <Svg {...p}>
          <Path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </Svg>
      );
    default:
      return (
        <Svg {...p}>
          <Circle cx="12" cy="12" r="9" />
        </Svg>
      );
  }
}

const FeatureCard = memo(function FeatureCard({
  item,
}: {
  item: (typeof WHY_MUBRYX)[number];
}) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
        <WhyIcon type={item.svgType} color={item.iconColor} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.desc}</Text>
    </View>
  );
});

export const WhyMubryx = memo(function WhyMubryx() {
  const rows = [WHY_MUBRYX.slice(0, 3), WHY_MUBRYX.slice(3, 6)];

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Why Mubryx?</Text>
        <Text style={styles.sectionSub}>Trusted by 50,000+ customers</Text>
      </View>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((item) => (
            <FeatureCard key={item.id} item={item} />
          ))}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Brand.white,
  },
  header: {
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Brand.textPrimary,
  },
  sectionSub: {
    ...Typography.small,
    color: Brand.textSecondary,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: Brand.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    ...Shadow.card,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.caption,
    color: Brand.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  desc: {
    fontSize: 10,
    color: Brand.textMuted,
    textAlign: 'center',
    lineHeight: 14,
  },
});
