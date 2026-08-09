import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

function SearchIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke={Brand.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="11" cy="11" r="8" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
}

function ClearIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke={Brand.textMuted} strokeWidth="2.5" strokeLinecap="round">
      <Path d="M18 6L6 18M6 6l12 12" />
    </Svg>
  );
}

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const BookingSearchBar = memo(function BookingSearchBar({ value, onChangeText, placeholder }: Props) {
  return (
    <View style={s.container}>
      <View style={s.iconLeft}>
        <SearchIcon />
      </View>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? 'Search by service or booking ID…'}
        placeholderTextColor={Brand.textMuted}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel="Search bookings"
      />
      {value.length > 0 && (
        <Pressable style={s.clearBtn} onPress={() => onChangeText('')} hitSlop={8}>
          <ClearIcon />
        </Pressable>
      )}
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  iconLeft: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    ...Typography.body,
    color: Brand.textPrimary,
    paddingVertical: 0,
  },
  clearBtn: {
    marginLeft: Spacing.sm,
    width: 24, height: 24,
    alignItems: 'center', justifyContent: 'center',
  },
});
