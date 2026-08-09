import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path, Polyline } from 'react-native-svg';
import { Brand, Spacing, Typography, Radius } from '@/constants/brand';

function ShieldCheckIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <Polyline points="9 12 11 14 15 10" />
    </Svg>
  );
}

export const WarrantyBanner = memo(function WarrantyBanner() {
  return (
    <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.wrapper}>
      <View style={styles.iconWrap}>
        <ShieldCheckIcon />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title}>30-Day Service Warranty</Text>
        <Text style={styles.subtitle}>All repairs include free revisit within 30 days if the issue recurs.</Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.base,
    backgroundColor: '#F0FAF0',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    gap: 3,
  },
  title: {
    ...Typography.smallMedium,
    color: '#1B5E20',
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.caption,
    color: '#388E3C',
    lineHeight: 16,
  },
});
