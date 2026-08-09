import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

function RadarIllustration() {
  return (
    <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
      <Circle cx="40" cy="40" r="38" fill={Brand.primarySoft} opacity={0.6} />
      {/* Outer ring */}
      <Circle cx="40" cy="40" r="26" stroke={Brand.primary} strokeWidth="1.5" opacity={0.3} />
      {/* Middle ring */}
      <Circle cx="40" cy="40" r="17" stroke={Brand.primary} strokeWidth="1.5" opacity={0.5} />
      {/* Inner dot */}
      <Circle cx="40" cy="40" r="6" fill={Brand.primarySoft} stroke={Brand.primary} strokeWidth="1.8" />
      {/* Sweep line */}
      <Path d="M40 40L58 26" stroke={Brand.primary} strokeWidth="1.8" strokeLinecap="round" opacity={0.6} />
    </Svg>
  );
}

interface Props {
  onBookService?: () => void;
}

export const TrackEmptyState = memo(function TrackEmptyState({ onBookService }: Props) {
  return (
    <View style={s.container}>
      <View style={s.illustrationWrap}>
        <RadarIllustration />
      </View>
      <Text style={s.title}>No Live Services</Text>
      <Text style={s.subtitle}>
        You don't have any ongoing bookings right now.{'\n'}Book a service to track it here.
      </Text>
      {onBookService && (
        <Pressable
          onPress={onBookService}
          style={({ pressed }) => [s.cta, pressed && s.ctaPressed]}>
          <Text style={s.ctaText}>Book a Service</Text>
        </Pressable>
      )}
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  illustrationWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h3,
    color: Brand.textPrimary,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Brand.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  cta: {
    marginTop: Spacing.base,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Brand.primary,
    borderRadius: Radius.full,
  },
  ctaPressed: { opacity: 0.85 },
  ctaText: {
    ...Typography.bodyMedium,
    color: Brand.white,
    fontWeight: '600' as const,
  },
});
