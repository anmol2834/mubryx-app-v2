import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import { TIER_COLORS, type UserProfile } from '../constants';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// Icons removed

interface Props {
  user: UserProfile;
  onEditProfile: () => void;
  onNotifications: () => void;
}

export const ProfileHero = memo(function ProfileHero({ user, onEditProfile, onNotifications }: Props) {
  const tier = TIER_COLORS[user.loyaltyTier];
  const greeting = getGreeting();

  return (
    <View style={s.container}>
      {/* Top bar: greeting + icons */}
      <View style={s.topBar}>
        <View style={s.greetingCol}>
          <Text style={s.greeting}>{greeting} 👋</Text>
          <Text style={s.greetingName}>{user.name.split(' ')[0]}</Text>
        </View>
      </View>

      {/* User card */}
      <View style={s.userCard}>
        {/* Avatar */}
        <View style={s.avatarSection}>
          <View style={s.avatarWrap}>
            <View style={[s.avatar, { backgroundColor: user.avatarColor }]}>
              <Text style={s.avatarText}>{user.avatarInitials}</Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={s.infoSection}>
          <View style={s.nameRow}>
            <Text style={s.name} numberOfLines={1}>{user.name}</Text>
          </View>
          <Text style={s.phone}>{user.phone}</Text>
          <Text style={s.email} numberOfLines={1}>{user.email || 'Add email address'}</Text>
        </View>
      </View>

      {/* Profile completion */}
      <View style={s.completionWrap}>
        <View style={s.completionHeader}>
          <Text style={s.completionLabel}>Profile Completion</Text>
          <Text style={s.completionPct}>{user.profileCompletion}%</Text>
        </View>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${user.profileCompletion}%` as any }]} />
        </View>
        {user.profileCompletion < 100 && (
          <Text style={s.completionHint}>Add your email to complete your profile</Text>
        )}
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    backgroundColor: Brand.white,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  greetingCol: { gap: 2 },
  greeting: {
    ...Typography.small,
    color: Brand.textSecondary,
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 22,
    fontWeight: '700',
    color: Brand.textPrimary,
    letterSpacing: -0.4,
  },
  userCard: {
    flexDirection: 'row',
    gap: Spacing.base,
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
  },
  avatarSection: {},
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: Brand.white,
    letterSpacing: -0.5,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Brand.white,
  },
  infoSection: { flex: 1, gap: 3, paddingTop: 4 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: Brand.textPrimary,
    letterSpacing: -0.3,
    flex: 1,
  },
  phone: {
    ...Typography.small,
    color: Brand.textSecondary,
    fontWeight: '500',
  },
  email: {
    ...Typography.caption,
    color: Brand.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  memberSince: {
    ...Typography.caption,
    color: Brand.textMuted,
  },
  completionWrap: {
    marginBottom: Spacing.base,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  completionLabel: {
    ...Typography.caption,
    color: Brand.textSecondary,
    fontWeight: '600',
  },
  completionPct: {
    ...Typography.caption,
    color: Brand.primary,
    fontWeight: '700',
  },
  progressTrack: {
    height: 5,
    backgroundColor: Brand.surface,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Brand.primary,
    borderRadius: Radius.full,
  },
  completionHint: {
    ...Typography.caption,
    color: Brand.textMuted,
    marginTop: 4,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Brand.primary,
    overflow: 'hidden',
  },
  editBtnText: {
    ...Typography.smallMedium,
    color: Brand.primary,
    fontWeight: '700',
  },
});
