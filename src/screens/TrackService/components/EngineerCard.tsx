import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import type { Engineer } from '../../Profile/constants';

function PhoneIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.89-1.89a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
        stroke={Brand.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChatIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke={Brand.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function StarFill({ color }: { color: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

function VerifiedBadge() {
  return (
    <View style={s.verifiedBadge}>
      <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
        <Polyline points="20 6 9 17 4 12" stroke={Brand.white} strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

interface Props {
  engineer: Engineer;
  onCall: () => void;
  onChat: () => void;
}

export const EngineerCard = memo(function EngineerCard({ engineer, onCall, onChat }: Props) {
  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>Your Engineer</Text>
      <View style={s.card}>
        {/* Left: avatar + info */}
        <View style={s.left}>
          <View style={s.avatarWrap}>
            <View style={[s.avatar, { backgroundColor: engineer.avatarColor }]}>
              <Text style={s.avatarText}>{engineer.avatarInitials}</Text>
            </View>
            {engineer.isVerified && <VerifiedBadge />}
          </View>
          <View style={s.info}>
            <Text style={s.name}>{engineer.name}</Text>
            <View style={s.ratingRow}>
              <StarFill color="#F9A825" />
              <Text style={s.rating}>{engineer.rating}</Text>
              <Text style={s.dot}>·</Text>
              <Text style={s.exp}>{engineer.experience}</Text>
            </View>
          </View>
        </View>

        {/* Right: action buttons */}
        <View style={s.actions}>
          <Pressable style={s.actionBtn} onPress={onCall}
            android_ripple={{ color: Brand.primarySoft, borderless: false }}>
            <PhoneIcon />
          </Pressable>
          <Pressable style={s.actionBtn} onPress={onChat}
            android_ripple={{ color: Brand.primarySoft, borderless: false }}>
            <ChatIcon />
          </Pressable>
        </View>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    backgroundColor: Brand.white,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Brand.textPrimary,
    marginBottom: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    ...Shadow.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Brand.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Brand.white,
  },
  info: { flex: 1, gap: 4 },
  name: {
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.textPrimary,
  },
  dot: {
    fontSize: 12,
    color: Brand.textMuted,
  },
  exp: {
    ...Typography.caption,
    color: Brand.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
