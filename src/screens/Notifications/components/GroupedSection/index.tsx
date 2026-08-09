import { Brand, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Notification, NotificationGroup } from '../../types';
import { NotificationCard } from '../NotificationCard';

interface Props {
  group: NotificationGroup;
  onPress:    (notification: Notification) => void;
  onMarkRead: (id: string) => void;
  onDelete:   (id: string) => void;
}

export const GroupedSection = memo(function GroupedSection({
  group,
  onPress,
  onMarkRead,
  onDelete,
}: Props) {
  return (
    <View style={s.section}>
      {/* Group label */}
      <View style={s.labelRow}>
        <Text style={s.label}>{group.label}</Text>
        <View style={s.labelLine} />
        <Text style={s.count}>{group.data.length}</Text>
      </View>

      {/* Cards */}
      <View style={s.cards}>
        {group.data.map((notification, index) => (
          <View key={notification.id}>
            <NotificationCard
              notification={notification}
              onPress={onPress}
              onMarkRead={onMarkRead}
              onDelete={onDelete}
            />
            {index < group.data.length - 1 && <View style={s.separator} />}
          </View>
        ))}
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  section: {
    marginBottom: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  label: {
    ...Typography.label,
    color: Brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    flexShrink: 0,
  },
  labelLine: {
    flex: 1,
    height: 1,
    backgroundColor: Brand.borderLight,
  },
  count: {
    ...Typography.caption,
    color: Brand.textMuted,
    flexShrink: 0,
  },
  cards: {
    backgroundColor: Brand.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Brand.borderLight,
  },
  separator: {
    height: 1,
    backgroundColor: Brand.divider,
    marginLeft: Spacing.screen + 44 + Spacing.md, // indent past icon
  },
});
