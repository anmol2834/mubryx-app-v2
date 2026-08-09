import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

function EmptyIcon({ type }: { type: 'completed' | 'upcoming' | 'search' }) {
  const color = Brand.textMuted;
  if (type === 'search') {
    return (
      <Svg width={48} height={48} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="11" cy="11" r="8" />
        <Path d="M21 21l-4.35-4.35" />
        <Path d="M8 11h6M11 8v6" />
      </Svg>
    );
  }
  if (type === 'upcoming') {
    return (
      <Svg width={48} height={48} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M8 2v4M16 2v4M3 10h18" />
        <Path d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <Path d="M12 12v4M10 14h4" />
      </Svg>
    );
  }
  return (
    <Svg width={48} height={48} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <Path d="M14 2v6h6M9 13h6M9 17h4" />
    </Svg>
  );
}

interface Props {
  type: 'completed' | 'upcoming' | 'search';
  onRetry?: () => void;
}

const MESSAGES = {
  completed: { title: 'No completed services yet', sub: 'Your completed bookings will appear here once a service is done.' },
  upcoming:  { title: 'No upcoming services', sub: 'Book a service and your upcoming appointments will show up here.' },
  search:    { title: 'No results found', sub: 'Try a different service name or booking ID.' },
};

export const EmptyState = memo(function EmptyState({ type, onRetry }: Props) {
  const msg = MESSAGES[type];
  return (
    <View style={s.container}>
      <View style={s.iconWrap}>
        <EmptyIcon type={type} />
      </View>
      <Text style={s.title}>{msg.title}</Text>
      <Text style={s.sub}>{msg.sub}</Text>
      {onRetry && (
        <Pressable style={s.btn} onPress={onRetry}>
          <Text style={s.btnText}>Clear Search</Text>
        </Pressable>
      )}
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
    width: 88, height: 88,
    borderRadius: Radius.full,
    backgroundColor: Brand.offWhite,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: { ...Typography.h4, color: Brand.textPrimary, textAlign: 'center' },
  sub: { ...Typography.small, color: Brand.textMuted, textAlign: 'center', lineHeight: 20 },
  btn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 9,
    borderRadius: Radius.full,
    backgroundColor: Brand.primarySoft,
  },
  btnText: { ...Typography.smallMedium, color: Brand.primary, fontWeight: '700' },
});
