// No Reanimated — plain View, no FadeInDown entrance animation.

import { Brand, Radius, Spacing } from '@/constants/brand';
import { ServiceDetailData } from '@/constants/serviceDetail';
import { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface ServiceOverviewProps {
  data: ServiceDetailData;
}

export const ServiceOverview = memo(function ServiceOverview({ data }: ServiceOverviewProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.content}>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.description} numberOfLines={3}>{data.description}</Text>
      </View>
      <View style={[styles.imageBox, { backgroundColor: data.bgColor }]}>
        <Image 
          source={typeof data.image === 'string' ? { uri: data.image } : data.image} 
          style={styles.image} 
          resizeMode="cover" 
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.base,
    backgroundColor: Brand.white,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    gap: Spacing.base,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Brand.textPrimary,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  description: {
    fontSize: 13,
    color: Brand.textSecondary,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    overflow: 'hidden',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
