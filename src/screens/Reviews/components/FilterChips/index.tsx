import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { FilterOption } from '../../mock/types';

const FILTERS: { id: FilterOption; label: string }[] = [
  { id: 'all',        label: 'All'        },
  { id: 'recent',     label: 'Recent'     },
  { id: '5star',      label: '5 ★'        },
  { id: '4star',      label: '4 ★'        },
  { id: '3star',      label: '3 ★'        },
  { id: '2star',      label: '2 ★'        },
  { id: '1star',      label: '1 ★'        },
  { id: 'oldest',     label: 'Oldest'     },
  { id: 'with_photos',label: 'With Photos'},
];

interface Props {
  active: FilterOption;
  onSelect: (f: FilterOption) => void;
}

export const FilterChips = memo(function FilterChips({ active, onSelect }: Props) {
  const handlePress = useCallback((id: FilterOption) => onSelect(id), [onSelect]);

  return (
    <View style={s.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.row}
        keyboardShouldPersistTaps="handled">
        {FILTERS.map((f) => {
          const isActive = active === f.id;
          return (
            <Pressable
              key={f.id}
              style={({ pressed }) => [s.chip, isActive && s.chipActive, pressed && s.chipPressed]}
              onPress={() => handlePress(f.id)}
              android_ripple={null}>
              <Text style={[s.chipText, isActive && s.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
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
  row: {
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Brand.border,
    backgroundColor: Brand.white,
  },
  chipActive: {
    borderColor: Brand.primary,
    backgroundColor: Brand.primarySoft,
  },
  chipPressed: { opacity: 0.7 },
  chipText: {
    ...Typography.smallMedium,
    color: Brand.textSecondary,
    fontWeight: '500' as const,
  },
  chipTextActive: {
    color: Brand.primary,
    fontWeight: '700' as const,
  },
});
