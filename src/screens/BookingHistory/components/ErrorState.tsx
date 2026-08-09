import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

function ErrorIcon() {
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none"
      stroke={Brand.error} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <Path d="M12 9v4M12 17h.01" />
    </Svg>
  );
}

interface Props {
  onRetry: () => void;
}

export const ErrorState = memo(function ErrorState({ onRetry }: Props) {
  return (
    <View style={s.container}>
      <View style={s.iconWrap}>
        <ErrorIcon />
      </View>
      <Text style={s.title}>Something went wrong</Text>
      <Text style={s.sub}>We couldn't load your bookings. Please try again.</Text>
      <Pressable style={s.btn} onPress={onRetry}>
        <Text style={s.btnText}>Retry</Text>
      </Pressable>
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 80, height: 80,
    borderRadius: Radius.full,
    backgroundColor: Brand.errorSoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: { ...Typography.h4, color: Brand.textPrimary, textAlign: 'center' },
  sub: { ...Typography.small, color: Brand.textMuted, textAlign: 'center', lineHeight: 20 },
  btn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: Brand.primary,
  },
  btnText: { ...Typography.smallMedium, color: Brand.white, fontWeight: '700' },
});
