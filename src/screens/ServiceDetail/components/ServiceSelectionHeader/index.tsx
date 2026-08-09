// No Reanimated — plain View, no entrance animation, no withSpring badge pulse.

import { Brand, Radius, Spacing } from '@/constants/brand';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ServiceSelectionHeaderProps {
  serviceTitle: string;
  selectedCount: number;
}

export const ServiceSelectionHeader = memo(function ServiceSelectionHeader({
  serviceTitle,
  selectedCount,
}: ServiceSelectionHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.textCol}>
        <Text style={styles.title}>Select {serviceTitle}</Text>
        <Text style={styles.subtitle}>
          Choose one or more services based on your requirement.
        </Text>
      </View>

      {selectedCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            ✓ {selectedCount} {selectedCount === 1 ? 'service' : 'services'} selected
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
    backgroundColor: Brand.white,
  },
  textCol: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Brand.textPrimary,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: Brand.textSecondary,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  badge: {
    backgroundColor: Brand.navy,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    flexShrink: 0,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 12,
    color: Brand.white,
    fontWeight: '700' as const,
    letterSpacing: 0.1,
  },
});
