import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

function BellIllustration() {
  return (
    <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
      {/* Outer soft ring */}
      <Circle cx="40" cy="40" r="38" fill={Brand.primarySoft} opacity={0.6} />
      {/* Bell body */}
      <Path
        d="M40 14c-9 0-16 7-16 16 0 14-6 18-6 18h44s-6-4-6-18c0-9-7-16-16-16z"
        fill={Brand.primarySoft}
        stroke={Brand.primary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bell clapper */}
      <Path
        d="M44.24 58a4 4 0 0 1-8.48 0"
        stroke={Brand.primary}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Sparkles */}
      <Path d="M60 18l1.5-3 1.5 3-3 0z" fill={Brand.accentLight} />
      <Path d="M20 22l1-2 1 2-2 0z" fill={Brand.accentLight} />
      <Circle cx="62" cy="28" r="2" fill={Brand.primarySoft} stroke={Brand.primary} strokeWidth="1.5" />
    </Svg>
  );
}

interface Props {
  onExplore?: () => void;
}

export const EmptyState = memo(function EmptyState({ onExplore }: Props) {
  return (
    <View style={s.container}>
      <View style={s.illustrationWrap}>
        <BellIllustration />
      </View>

      <Text style={s.title}>You're all caught up!</Text>
      <Text style={s.subtitle}>
        We'll notify you whenever something{'\n'}important happens.
      </Text>

      {onExplore && (
        <Pressable
          onPress={onExplore}
          style={({ pressed }) => [s.cta, pressed && s.ctaPressed]}
          android_ripple={{ color: Brand.primarySoft, borderless: false }}>
          <Text style={s.ctaText}>Explore Services</Text>
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
    marginBottom: Spacing.base,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
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
