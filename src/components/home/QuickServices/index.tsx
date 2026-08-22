import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { useCategoriesQuery } from '@/hooks/queries/useCategoriesQuery';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { QuickServicesSkeleton } from '../Skeletons/HomeServiceSkeleton';

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
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={handlePress}
        unstable_pressDelay={0}
        android_ripple={{ color: 'rgba(0, 82, 204, 0.08)', foreground: true }}
        accessibilityLabel={item.title}>
        <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
          <SvgXml xml={item.svgType} width="24" height="24" color={item.iconColor} />
        </View>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      </Pressable>
    </View>
  );
});

export const QuickServices = memo(function QuickServices() {
  const router = useRouter();
  const { data: apiCategories = [], isLoading: isQueryLoading } = useCategoriesQuery();
  const [isTimerLoading, setIsTimerLoading] = useState(true);
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimerLoading(false);
    }, 2200);
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

  const serviceRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < displayServices.length; i += 3) {
      rows.push(displayServices.slice(i, i + 3));
    }
    return rows;
  }, [displayServices]);

  const handleCardPress = useCallback((item: any) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    requestAnimationFrame(() => {
      router.push({ pathname: '/service-detail', params: { categoryId: item.id, slug: item.slug } });
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 500);
    });
  }, [router]);

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
      <View style={styles.grid}>
        {serviceRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((item) => (
              <ServiceCard key={item.id} item={item} onPress={handleCardPress} />
            ))}
            {row.length < 3 &&
              Array.from({ length: 3 - row.length }).map((_, idx) => (
                <View key={`empty-${idx}`} style={styles.emptyCardSlot} />
              ))}
          </View>
        ))}
      </View>
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
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cardWrap: {
    flex: 1,
    borderRadius: Radius.lg,
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    overflow: 'hidden',
    ...Shadow.card,
  },
  emptyCardSlot: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: Brand.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  cardPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
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
