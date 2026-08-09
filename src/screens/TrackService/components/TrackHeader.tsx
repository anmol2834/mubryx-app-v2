import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Polyline points="15 18 9 12 15 6" stroke={Brand.textPrimary} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

interface Props {
  bookingId: string;
  onBack: () => void;
}

export const TrackHeader = memo(function TrackHeader({ bookingId, onBack }: Props) {
  return (
    <View style={s.container}>
      <Pressable style={s.backBtn} onPress={onBack} hitSlop={12}
        android_ripple={{ color: Brand.surface, borderless: true, radius: 20 }}>
        <BackIcon />
      </Pressable>
      <View style={s.center}>
        <Text style={s.title}>Track Service</Text>
        <Text style={s.bookingId}>{bookingId}</Text>
      </View>
      <View style={s.placeholder} />
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    backgroundColor: Brand.white,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', gap: 2 },
  title: { ...Typography.h4, color: Brand.textPrimary },
  bookingId: { ...Typography.caption, color: Brand.textMuted },
  placeholder: { width: 36 },
});
