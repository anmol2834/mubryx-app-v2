import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  totalReviews: number;
}

export const ReviewHeader = memo(function ReviewHeader({ totalReviews }: Props) {
  return (
    <View style={s.container}>
      <View style={s.left}>
        <Text style={s.title}>My Reviews</Text>
        <Text style={s.subtitle}>Your feedback and service experiences</Text>
      </View>
      {totalReviews > 0 && (
        <View style={s.badge}>
          <Text style={s.badgeText}>{totalReviews}</Text>
          <Text style={s.badgeLabel}> review{totalReviews !== 1 ? 's' : ''}</Text>
        </View>
      )}
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Brand.white,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
  },
  left: { gap: 2, flex: 1 },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Brand.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    ...Typography.caption,
    color: Brand.textMuted,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: Brand.primarySoft,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Brand.primary + '30',
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Brand.primary,
    letterSpacing: -0.3,
  },
  badgeLabel: {
    ...Typography.caption,
    color: Brand.primary,
    fontWeight: '600' as const,
  },
});
