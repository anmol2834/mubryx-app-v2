import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { POPULAR_SEARCHES } from '@/constants/homeData';
import { memo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';

function SearchIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1="16.5" y1="16.5" x2="22" y2="22" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function TrendingIcon({ color }: { color: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path d="M22 7L13.5 15.5L8.5 10.5L2 17" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 7h6v6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export const SearchBar = memo(function SearchBar() {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.spring(borderAnim, { toValue: 1, useNativeDriver: false, speed: 20 }).start();
  };
  const onBlur = () => {
    setFocused(false);
    Animated.spring(borderAnim, { toValue: 0, useNativeDriver: false, speed: 20 }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Brand.border, Brand.primary],
  });
  const shadowOpacity = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.searchContainer, { borderColor, shadowOpacity }]}>
        <SearchIcon color={focused ? Brand.primary : Brand.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Search AC Repair, Refrigerator..."
          placeholderTextColor={Brand.textMuted}
          onFocus={onFocus}
          onBlur={onBlur}
          returnKeyType="search"
          accessibilityLabel="Search services"
        />
      </Animated.View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}>
        {POPULAR_SEARCHES.map((chip) => (
          <View key={chip} style={styles.chipClip}>
            <Pressable
              style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
              android_ripple={null}>
              <TrendingIcon color={Brand.primary} />
              <Animated.Text style={styles.chipText}>{chip}</Animated.Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    backgroundColor: Brand.white,
    gap: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.base,
    paddingVertical: 2,
    gap: Spacing.sm,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Brand.textPrimary,
    paddingVertical: 10,
  },
  chipsContainer: {
    gap: Spacing.sm,
    paddingRight: Spacing.screen,
  },
  chipClip: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Brand.surface,
  },
  chipPressed: {
    backgroundColor: Brand.primarySoft,
  },
  chipText: {
    ...Typography.smallMedium,
    color: Brand.textSecondary,
  },
});
