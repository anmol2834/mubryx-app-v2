import { Brand, Radius } from '@/constants/brand';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  progress: number; // 0–1 fraction
}

export const ProgressBar = memo(function ProgressBar({ progress }: Props) {
  const widthPct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View style={s.track}>
      <View style={[s.fill, { width: `${widthPct}%` }]} />
    </View>
  );
});

const s = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Brand.borderLight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Brand.primary,
  },
});
