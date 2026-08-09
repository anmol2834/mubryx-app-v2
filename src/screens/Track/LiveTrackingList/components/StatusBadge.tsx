import { Radius, Typography } from '@/constants/brand';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { STAGE_BADGE_COLORS, STAGE_LABELS } from '../../constants';

interface Props {
  stageId: string;
}

export const StatusBadge = memo(function StatusBadge({ stageId }: Props) {
  const colors = STAGE_BADGE_COLORS[stageId] ?? { bg: '#F5F5F5', text: '#546E7A', dot: '#90A4AE' };
  const label  = STAGE_LABELS[stageId] ?? stageId;

  return (
    <View style={[s.badge, { backgroundColor: colors.bg }]}>
      <View style={[s.dot, { backgroundColor: colors.dot }]} />
      <Text style={[s.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
});

const s = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    ...Typography.caption,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
});
