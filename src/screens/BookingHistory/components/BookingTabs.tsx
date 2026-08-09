import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type TabKey = 'completed' | 'upcoming';

interface Props {
  active: TabKey;
  completedCount: number;
  upcomingCount: number;
  onChange: (tab: TabKey) => void;
}

export const BookingTabs = memo(function BookingTabs({ active, completedCount, upcomingCount, onChange }: Props) {
  return (
    <View style={s.container}>
      <View style={s.track}>
        <Pressable
          style={[s.tab, active === 'completed' && s.tabActive]}
          onPress={() => onChange('completed')}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === 'completed' }}>
          <Text style={[s.label, active === 'completed' && s.labelActive]}>
            Service Complete
          </Text>
          {completedCount > 0 && (
            <View style={[s.badge, active === 'completed' ? s.badgeActive : s.badgeInactive]}>
              <Text style={[s.badgeText, active === 'completed' && s.badgeTextActive]}>
                {completedCount}
              </Text>
            </View>
          )}
        </Pressable>

        <Pressable
          style={[s.tab, active === 'upcoming' && s.tabActive]}
          onPress={() => onChange('upcoming')}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === 'upcoming' }}>
          <Text style={[s.label, active === 'upcoming' && s.labelActive]}>
            Upcoming Service
          </Text>
          {upcomingCount > 0 && (
            <View style={[s.badge, active === 'upcoming' ? s.badgeActive : s.badgeInactive]}>
              <Text style={[s.badgeText, active === 'upcoming' && s.badgeTextActive]}>
                {upcomingCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    backgroundColor: Brand.white,
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
  },
  track: {
    flexDirection: 'row',
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: Radius.sm,
  },
  tabActive: {
    backgroundColor: Brand.white,
    shadowColor: '#0A1628',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  label: { ...Typography.smallMedium, color: Brand.textMuted, fontWeight: '500' },
  labelActive: { color: Brand.primary, fontWeight: '700' },
  badge: {
    minWidth: 18, height: 18,
    borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeActive: { backgroundColor: Brand.primary },
  badgeInactive: { backgroundColor: Brand.border },
  badgeText: { fontSize: 10, fontWeight: '700', color: Brand.textMuted },
  badgeTextActive: { color: Brand.white },
});
