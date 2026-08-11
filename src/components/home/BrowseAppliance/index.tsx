import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { useCategoriesQuery } from '@/hooks/queries/useCategoriesQuery';
import { getCategoryAssetSource } from '@/utils/categoryImages';
import { useRouter } from 'expo-router';
import { memo, useCallback, useMemo } from 'react';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrowseApplianceSkeleton } from '../Skeletons/HomeServiceSkeleton';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W * 0.44;

// router is passed as a prop — keeps useRouter at the top level of the parent
// component, not recreated inside every card render
const ApplianceCard = memo(function ApplianceCard({
  item,
  onPress,
}: {
  item: any;
  onPress: (item: any) => void;
}) {
  const handlePress = useCallback(() => onPress(item), [item, onPress]);
  const imageSource = useMemo(
    () => getCategoryAssetSource(item.image, item.slug, item.name),
    [item.image, item.slug, item.name]
  );

  return (
    <View style={styles.cardWrap}>
      <View style={styles.cardClip}>
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={handlePress}
          android_ripple={null}
          accessibilityLabel={`${item.name} service`}>
          <View style={[styles.imageArea, { backgroundColor: item.bgColor }]}>
            <Image source={imageSource} style={styles.image} resizeMode="cover" />
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          </View>
          <View style={styles.arrowBtn}>
            <Text style={styles.arrow}>›</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
});

export const BrowseAppliance = memo(function BrowseAppliance() {
  const router = useRouter();
  const { data: apiCategories = [], isLoading } = useCategoriesQuery();

  const appliancesList = useMemo(() => {
    if (!apiCategories || apiCategories.length === 0) {
      return [];
    }
    return apiCategories
      .filter((cat: any) => cat.placement === 'APPLIANCE')
      .sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        bgColor: cat.bgColor ?? '#F5F5F5',
        image: cat.image,
        slug: cat.slug,
      }));
  }, [apiCategories]);

  const handleCardPress = useCallback((item: any) => {
    router.push({ pathname: '/service-detail', params: { categoryId: item.id, slug: item.slug } });
  }, [router]);

  if (isLoading) {
    return <BrowseApplianceSkeleton />;
  }
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Browse by Appliance</Text>
        <View style={styles.seeAllClip}>
          <Pressable
            style={({ pressed }) => [styles.seeAllBtn, pressed && styles.seeAllPressed]}
            android_ripple={null}
            accessibilityLabel="View all appliances">
            <Text style={styles.seeAll}>See All →</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={CARD_W + Spacing.md}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum>
        {appliancesList.map((item: any) => (
          <ApplianceCard key={item.id} item={item} onPress={handleCardPress} />
        ))}
      </ScrollView>
    </View>
  );
});
const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Spacing.xl,
    backgroundColor: Brand.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
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
  listContent: {
    paddingHorizontal: Spacing.screen,
    gap: Spacing.md,
    paddingVertical: Spacing.md,
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
  },
  cardPressed: {
    opacity: 0.6,
  },
  imageArea: {
    height: 110,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  info: {
    padding: Spacing.md,
    gap: 4,
  },
  name: {
    ...Typography.h4,
    color: Brand.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    fontSize: 11,
  },
  rating: {
    ...Typography.caption,
    color: Brand.textPrimary,
    fontWeight: '600',
  },
  reviews: {
    ...Typography.caption,
    color: Brand.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  priceLabel: {
    ...Typography.caption,
    color: Brand.textMuted,
  },
  price: {
    ...Typography.smallMedium,
    color: Brand.primary,
    fontWeight: '700',
  },
  arrowBtn: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 16,
    color: Brand.primary,
    fontWeight: '700',
    marginTop: -1,
  },
});
