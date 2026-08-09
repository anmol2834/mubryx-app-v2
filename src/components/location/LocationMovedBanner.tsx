import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { useLocation } from '@/context/LocationContext';
import { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

const AUTO_DISMISS_MS = 6000;

export const LocationMovedBanner = memo(function LocationMovedBanner() {
  const { showMovedBanner, pendingAddress, acceptMovedLocation, dismissMovedBanner } = useLocation();

  useEffect(() => {
    if (!showMovedBanner) return;
    const timer = setTimeout(dismissMovedBanner, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [showMovedBanner, dismissMovedBanner]);

  if (!showMovedBanner || !pendingAddress) return null;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(16)}
      exiting={FadeOutUp.duration(200)}
      style={styles.banner}>
      <View style={styles.textCol}>
        <Text style={styles.title}>📍 New location detected</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {pendingAddress.shortLabel}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.updateBtn} onPress={acceptMovedLocation}>
          <Text style={styles.updateText}>Update</Text>
        </Pressable>
        <Pressable style={styles.dismissBtn} onPress={dismissMovedBanner} hitSlop={8}>
          <Text style={styles.dismissText}>✕</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.base,
    right: Spacing.base,
    backgroundColor: Brand.white,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    zIndex: 999,
    ...Shadow.md,
  },
  textCol: { flex: 1, gap: 2 },
  title: {
    ...Typography.smallMedium,
    color: Brand.textPrimary,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.caption,
    color: Brand.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  updateBtn: {
    backgroundColor: Brand.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  updateText: {
    ...Typography.caption,
    color: Brand.white,
    fontWeight: '700',
  },
  dismissBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: 11,
    color: Brand.textMuted,
    fontWeight: '700',
  },
});
