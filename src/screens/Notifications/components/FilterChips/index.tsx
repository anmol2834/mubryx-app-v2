import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FILTER_CHIPS } from '../../constants';
import type { FilterChip, NotificationCategory } from '../../types';

interface ChipProps {
  chip: FilterChip;
  active: boolean;
  onPress: () => void;
}

const Chip = memo(function Chip({ chip, active, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.chip,
        active && s.chipActive,
        pressed && s.chipPressed,
      ]}
      android_ripple={{ color: Brand.primarySoft, borderless: false }}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={chip.label}>
      <Text style={[s.chipText, active && s.chipTextActive]}>
        {chip.label}
      </Text>
    </Pressable>
  );
});

interface Props {
  activeFilter: NotificationCategory;
  onFilterChange: (category: NotificationCategory) => void;
}

export const FilterChips = memo(function FilterChips({ activeFilter, onFilterChange }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  return (
    <View style={s.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.content}
        decelerationRate="fast"
        keyboardShouldPersistTaps="handled">
        {FILTER_CHIPS.map((chip) => (
          <Chip
            key={chip.id}
            chip={chip}
            active={activeFilter === chip.id}
            onPress={() => onFilterChange(chip.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
});

const s = StyleSheet.create({
  wrapper: {
    backgroundColor: Brand.white,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
  },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  chipActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  chipPressed: { opacity: 0.75 },
  chipText: {
    ...Typography.smallMedium,
    color: Brand.textSecondary,
    fontWeight: '500' as const,
  },
  chipTextActive: {
    color: Brand.white,
    fontWeight: '600' as const,
  },
});
