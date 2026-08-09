import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';
import { type QuickAction } from '../constants';

function ActionIcon({ type, color }: { type: string; color: string }) {
  const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none' as const, stroke: color, strokeWidth: '2', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (type) {
    case 'repeat':
      return <Svg {...base}><Polyline points="17 1 21 5 17 9" /><Path d="M3 11V9a4 4 0 0 1 4-4h14" /><Polyline points="7 23 3 19 7 15" /><Path d="M21 13v2a4 4 0 0 1-4 4H3" /></Svg>;
    case 'track':
      return <Svg {...base}><Circle cx="12" cy="12" r="10" /><Circle cx="12" cy="12" r="3" /></Svg>;
    case 'gift':
      return <Svg {...base}><Polyline points="20 12 20 22 4 22 4 12" /><Rect x="2" y="7" width="20" height="5" /><Path d="M12 22V7" /><Path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><Path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></Svg>;
    case 'wallet':
      return <Svg {...base}><Rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><Path d="M1 10h22" /></Svg>;
    case 'headset':
      return <Svg {...base}><Path d="M3 18v-6a9 9 0 0 1 18 0v6" /><Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></Svg>;
    default:
      return <Svg {...base}><Circle cx="12" cy="12" r="10" /></Svg>;
  }
}

interface Props {
  actions: QuickAction[];
  onPress: (id: string) => void;
}

export const QuickActions = memo(function QuickActions({ actions, onPress }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            style={styles.chip}
            onPress={() => onPress(action.id)}
            android_ripple={{ color: action.iconBg, borderless: false }}>
            <View style={[styles.iconWrap, { backgroundColor: action.iconBg }]}>
              <ActionIcon type={action.iconType} color={action.iconColor} />
            </View>
            <Text style={styles.label}>{action.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Brand.white,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Brand.textPrimary,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.screen,
  },
  scroll: {
    paddingHorizontal: Spacing.screen,
    gap: Spacing.sm,
  },
  chip: {
    alignItems: 'center',
    gap: 8,
    width: 72,
    overflow: 'hidden',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  label: {
    ...Typography.caption,
    color: Brand.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
