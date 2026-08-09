// No Reanimated — plain View, no FadeInDown entrance animation.

import { Brand, Spacing } from '@/constants/brand';
import { TRUST_INDICATORS } from '@/constants/serviceDetail';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

type TrustSvgType = (typeof TRUST_INDICATORS)[number]['svgType'];

// Stroke props on every child element — RN SVG does not inherit from <Svg>
function TrustIcon({ type, color }: { type: TrustSvgType; color: string }) {
  const s = color;
  const sw = 1.8;
  const lc = 'round' as const;
  const lj = 'round' as const;

  switch (type) {
    case 'shield':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke={s} strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj} />
          <Polyline points="9,12 11,14 15,10"
            stroke={s} strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj} />
        </Svg>
      );
    case 'clock':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={s} strokeWidth={sw} />
          <Polyline points="12,7 12,12 15,15"
            stroke={s} strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj} />
        </Svg>
      );
    case 'award':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="8" r="6" stroke={s} strokeWidth={sw} />
          <Path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"
            stroke={s} strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj} />
        </Svg>
      );
    case 'tag':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
            stroke={s} strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj} />
          <Line x1="7" y1="7" x2="7.01" y2="7"
            stroke={s} strokeWidth={2.5} strokeLinecap={lc} />
        </Svg>
      );
    default:
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={s} strokeWidth={sw} />
        </Svg>
      );
  }
}

const VISIBLE = TRUST_INDICATORS.slice(0, 3);

export const TrustIndicators = memo(function TrustIndicators() {
  return (
    <View style={styles.wrapper}>
      {VISIBLE.map((item) => (
        <View key={item.id} style={styles.item}>
          <View style={[styles.iconCircle, { borderColor: item.color }]}>
            <TrustIcon type={item.svgType} color={item.color} />
          </View>
          <Text style={styles.label}>{item.title}</Text>
          <Text style={styles.sub}>{item.subtitle}</Text>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.base,
    paddingVertical: Spacing.base,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.white,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Brand.textPrimary,
    textAlign: 'center',
  },
  sub: {
    fontSize: 10,
    color: Brand.textMuted,
    textAlign: 'center',
    lineHeight: 13,
    fontWeight: '400' as const,
  },
});
