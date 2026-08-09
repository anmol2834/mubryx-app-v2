import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

function EmptyIllustration() {
  return (
    <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke={Brand.border} strokeWidth="1" strokeLinejoin="round"
      />
      <Path d="M12 8v4M12 16h.01" stroke={Brand.textMuted} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export const EmptyReviews = memo(function EmptyReviews() {
  return (
    <View style={s.wrap}>
      <View style={s.iconWrap}>
        <EmptyIllustration />
      </View>
      <Text style={s.title}>No Reviews Yet</Text>
      <Text style={s.subtitle}>
        Complete a service and share your{'\n'}experience with Mubryx.
      </Text>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    gap: Spacing.base,
    paddingTop: Spacing.xxxl,
    paddingBottom: 80,
  },
  iconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Brand.surface,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h3,
    color: Brand.textPrimary,
    textAlign: 'center',
    fontWeight: '700' as const,
  },
  subtitle: {
    ...Typography.body,
    color: Brand.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
