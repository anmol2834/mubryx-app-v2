import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { useCategoriesQuery } from '@/hooks/queries/useCategoriesQuery';
import { useRouter } from 'expo-router';
import { memo, useCallback, useMemo } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polyline, Rect, SvgXml } from 'react-native-svg';
import { QuickServicesSkeleton } from '../Skeletons/HomeServiceSkeleton';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - Spacing.screen * 2 - Spacing.md * 2) / 3;

const ServiceCard = memo(function ServiceCard({
  item,
  onPress,
}: {
  item: any;
  onPress: (item: any) => void;
}) {
  const handlePress = useCallback(() => onPress(item), [item, onPress]);
  return (
    <View style={styles.cardWrap}>
      <View style={styles.cardClip}>
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={handlePress}
          android_ripple={null}
          accessibilityLabel={item.title}>
          <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
            <SvgXml xml={item.svgType} width="24" height="24" color={item.iconColor} />
          </View>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        </Pressable>
      </View>
    </View>
  );
});

import { useEffect, useState } from 'react';

export const QuickServices = memo(function QuickServices() {
  const router = useRouter();
  const { data: apiCategories = [], isLoading: isQueryLoading } = useCategoriesQuery();
  const [isTimerLoading, setIsTimerLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimerLoading(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = isQueryLoading || isTimerLoading;

  const displayServices = useMemo(() => {
    if (!apiCategories || apiCategories.length === 0) {
      return [];
    }
    return [...apiCategories]
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((cat) => ({
        id: cat.id,
        title: cat.name,
        svgType: cat.icon,
        iconBg: cat.iconBg ?? '#EEF6FF',
        iconColor: cat.iconColor ?? '#0052CC',
        slug: cat.slug,
      }));
  }, [apiCategories]);

  const handleCardPress = useCallback((item: any) => {
    router.push({ pathname: '/service-detail', params: { categoryId: item.id, slug: item.slug } });
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <ServiceCard item={item} onPress={handleCardPress} />
    ),
    [handleCardPress]
  );

  if (isLoading) {
    return <QuickServicesSkeleton />;
  }
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        <View style={styles.seeAllClip}>
          <Pressable
            style={({ pressed }) => [styles.seeAllBtn, pressed && styles.seeAllPressed]}
            android_ripple={null}
            accessibilityLabel="View all services">
            <Text style={styles.seeAll}>See All →</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        key="services-3col"
        data={displayServices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={3}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        removeClippedSubviews={false}
      />
    </View>
  );
});
const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Brand.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Brand.textPrimary,
  },
  seeAllClip: {
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  seeAllBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  seeAllPressed: {
    opacity: 0.5,
  },
  seeAll: {
    ...Typography.smallMedium,
    color: Brand.primary,
    fontWeight: '600',
  },
  grid: {
    paddingBottom: Spacing.md,
  },
  row: {
    gap: Spacing.md,
  },
  cardWrap: {
    width: CARD_W,
    borderRadius: Radius.lg,
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    ...Shadow.card,
  },
  cardClip: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: Brand.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardPressed: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.caption,
    color: Brand.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
  },
});
