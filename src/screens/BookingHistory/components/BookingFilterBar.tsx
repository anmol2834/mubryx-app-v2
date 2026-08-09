import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import {
  FILTER_OPTIONS,
  SORT_OPTIONS,
  type FilterOption,
  type SortOption,
} from '../mockData';

function SortIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke={Brand.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 6h18M7 12h10M11 18h2" />
    </Svg>
  );
}

function ChevronDown() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none"
      stroke={Brand.textSecondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="6 9 12 15 18 9" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke={Brand.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

interface Props {
  filter: FilterOption;
  sort: SortOption;
  onFilterChange: (f: FilterOption) => void;
  onSortChange: (s: SortOption) => void;
}

export const BookingFilterBar = memo(function BookingFilterBar({ filter, sort, onFilterChange, onSortChange }: Props) {
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const activeSort = SORT_OPTIONS.find(o => o.key === sort)!;

  return (
    <View style={s.container}>
      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
        {FILTER_OPTIONS.map(opt => (
          <Pressable
            key={opt.key}
            style={[s.chip, filter === opt.key && s.chipActive]}
            onPress={() => onFilterChange(opt.key)}>
            <Text style={[s.chipText, filter === opt.key && s.chipTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Sort button */}
      <Pressable style={s.sortBtn} onPress={() => setSortModalVisible(true)}>
        <SortIcon />
        <Text style={s.sortText} numberOfLines={1}>{activeSort.label}</Text>
        <ChevronDown />
      </Pressable>

      {/* Sort modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}>
        <Pressable style={s.overlay} onPress={() => setSortModalVisible(false)}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Sort By</Text>
            {SORT_OPTIONS.map(opt => (
              <Pressable
                key={opt.key}
                style={s.sheetRow}
                onPress={() => { onSortChange(opt.key); setSortModalVisible(false); }}>
                <Text style={[s.sheetRowText, sort === opt.key && s.sheetRowTextActive]}>
                  {opt.label}
                </Text>
                {sort === opt.key && <CheckIcon />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.white,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
    gap: Spacing.sm,
  },
  chips: {
    paddingHorizontal: Spacing.screen,
    gap: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Brand.offWhite,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  chipActive: {
    backgroundColor: Brand.primarySoft,
    borderColor: Brand.primary,
  },
  chipText: { ...Typography.caption, color: Brand.textSecondary, fontWeight: '600' },
  chipTextActive: { color: Brand.primary },

  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Brand.offWhite,
    borderWidth: 1,
    borderColor: Brand.border,
    marginRight: Spacing.screen,
    flexShrink: 0,
  },
  sortText: { ...Typography.caption, color: Brand.textSecondary, fontWeight: '600', maxWidth: 80 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,22,40,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Brand.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: 4,
  },
  sheetTitle: { ...Typography.h4, color: Brand.textPrimary, marginBottom: Spacing.sm },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Brand.divider,
  },
  sheetRowText: { ...Typography.body, color: Brand.textSecondary },
  sheetRowTextActive: { color: Brand.primary, fontWeight: '600' },
});
