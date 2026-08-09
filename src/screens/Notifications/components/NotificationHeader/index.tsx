import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M12 5l-7 7 7 7"
        stroke={Brand.textPrimary} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckAllIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="2 12 7 17 22 7"
        stroke={Brand.primary} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

interface Props {
  unreadCount: number;
  onBack: () => void;
  onMarkAllRead: () => void;
}

export const NotificationHeader = memo(function NotificationHeader({
  unreadCount,
  onBack,
  onMarkAllRead,
}: Props) {
  return (
    <View style={s.container}>
      <Pressable
        style={({ pressed }) => [s.backBtn, pressed && s.pressed]}
        onPress={onBack}
        hitSlop={8}
        android_ripple={{ color: Brand.primarySoft, borderless: true, radius: 20 }}>
        <BackIcon />
      </Pressable>

      <View style={s.titleBlock}>
        <View style={s.titleRow}>
          <Text style={s.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={s.subtitle}>Stay updated with your services</Text>
      </View>

      {unreadCount > 0 ? (
        <Pressable
          style={({ pressed }) => [s.markAllBtn, pressed && s.pressed]}
          onPress={onMarkAllRead}
          hitSlop={8}
          android_ripple={{ color: Brand.primarySoft, borderless: false }}>
          <CheckAllIcon />
          <Text style={s.markAllText}>Read all</Text>
        </Pressable>
      ) : (
        <View style={s.markAllPlaceholder} />
      )}
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    backgroundColor: Brand.white,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
    gap: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#0A1628', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  backBtn: {
    width: 38, height: 38,
    borderRadius: Radius.sm,
    backgroundColor: Brand.surface,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  titleBlock: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Brand.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: { ...Typography.caption, color: Brand.textMuted },
  badge: {
    backgroundColor: '#E53935',
    borderRadius: Radius.full,
    minWidth: 20, height: 20,
    paddingHorizontal: 5,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: Brand.white, fontSize: 10, fontWeight: '700' as const },
  markAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Brand.primarySoft,
    borderWidth: 1, borderColor: Brand.primary + '30',
    flexShrink: 0,
  },
  markAllText: { ...Typography.caption, color: Brand.primary, fontWeight: '700' as const },
  markAllPlaceholder: { width: 80 },
  pressed: { opacity: 0.7 },
});
