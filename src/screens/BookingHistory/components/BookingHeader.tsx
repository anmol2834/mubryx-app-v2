import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

function CalendarIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke={Brand.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M8 2v4M16 2v4M3 10h18" stroke={Brand.primary} strokeWidth="1.8" strokeLinecap="round" />
        <Path d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
          stroke={Brand.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Svg>
  );
}

export const BookingHeader = memo(function BookingHeader() {
  return (
    <View style={s.container}>
      <View style={s.titleRow}>
        <View>
          <Text style={s.title}>Booking & History</Text>
          <Text style={s.subtitle}>Manage all your service appointments</Text>
        </View>
        <View style={s.iconBadge}>
          <CalendarIcon />
        </View>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    backgroundColor: Brand.white,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
    gap: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...Typography.h2, color: Brand.textPrimary },
  subtitle: { ...Typography.small, color: Brand.textMuted, marginTop: 2 },
  iconBadge: {
    width: 44, height: 44,
    borderRadius: Radius.md,
    backgroundColor: Brand.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
});
