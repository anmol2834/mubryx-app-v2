import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W * 0.72;
type ProblemSvgType = string;
function ProblemIcon({ type, color }: { type: ProblemSvgType; color: string }) {
  const p = {
    width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' as const,
    stroke: color, strokeWidth: 1.8,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  switch (type) {
    case 'thermometer':
      return <Svg {...p}><Path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></Svg>;
    case 'droplets':
      return <Svg {...p}><Path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" /><Path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" /></Svg>;
    case 'snowflake':
      return <Svg {...p}><Line x1="2" y1="12" x2="22" y2="12" /><Line x1="12" y1="2" x2="12" y2="22" /><Path d="m20 16-4-4 4-4" /><Path d="m4 8 4 4-4 4" /><Path d="m16 4-4 4-4-4" /><Path d="m8 20 4-4 4 4" /></Svg>;
    case 'flame':
      return <Svg {...p}><Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></Svg>;
    default:
      return <Svg {...p}><Circle cx="12" cy="12" r="9" /></Svg>;
  }
}
function StarIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="#F9A825" stroke="#F9A825" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}
const ProblemCard = memo(function ProblemCard({
  item,
  onPress,
}: {
  item: any;
  onPress: (item: any) => void;
}) {
  const handlePress = useCallback(() => onPress(item), [item, onPress]);
  return (
    // Outer: border + shadow, no overflow so shadow isn't clipped
    <View style={styles.cardWrap}>
      {/* Inner: clips press highlight to rounded corners */}
      <View style={styles.cardClip}>
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={handlePress}
          unstable_pressDelay={0}
          android_ripple={{ color: 'rgba(0, 82, 204, 0.08)', foreground: true }}
          accessibilityLabel={item.title}>
          <View style={styles.topRow}>
            <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
              <ProblemIcon type={item.svgType} color={item.iconColor} />
            </View>
            <View style={[styles.tag, { backgroundColor: item.tagBg }]}>
              <Text style={[styles.tagText, { color: item.tagColor }]}>{item.tag}</Text>
            </View>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.bottomRow}>
            <View style={styles.ratingPriceCol}>
              <View style={styles.ratingRow}>
                <StarIcon />
                <Text style={styles.rating}>{item.rating}</Text>
              </View>
              <Text style={styles.price}>₹{item.price}</Text>
            </View>
            {/* Book Now button — outer for shadow, inner clips press effect */}
            <View style={styles.bookBtnWrap}>
              <View style={styles.bookBtnClip}>
                <Pressable
                  style={({ pressed }) => [styles.bookBtn, pressed && styles.bookBtnPressed]}
                  onPress={handlePress}
                  unstable_pressDelay={0}
                  android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', foreground: true }}
                  accessibilityLabel={`Book ${item.title}`}>
                  <Text style={styles.bookText}>Book Now</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
});

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useServicesQuery } from '@/hooks/queries/useServicesQuery';
import { PopularProblemsSkeleton } from '../Skeletons/HomeServiceSkeleton';

export const PopularProblems = memo(function PopularProblems() {
  const router = useRouter();
  const { data: popularServices = [], isLoading: isQueryLoading } = useServicesQuery({ isPopular: true });
  const [isTimerLoading, setIsTimerLoading] = useState(true);
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimerLoading(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  const handleCardPress = useCallback((item: any) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    requestAnimationFrame(() => {
      const categoryId = item.categoryId || item.id;
      router.push({ pathname: '/service-detail', params: { categoryId, slug: item.slug || 'service' } });
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 500);
    });
  }, [router]);

  const isLoading = isQueryLoading || isTimerLoading;

  if (isLoading) {
    return <PopularProblemsSkeleton />;
  }

  if (!popularServices || popularServices.length === 0) {
    return null; // Do not render if there are no popular services
  }
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Popular Problems</Text>
        <View style={styles.seeAllClip}>
          <Pressable
            style={({ pressed }) => [styles.seeAllBtn, pressed && styles.seeAllPressed]}
            android_ripple={null}
            accessibilityLabel="View all problems">
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
        disableIntervalMomentum
      >
        {popularServices.map((item) => (
          <ProblemCard key={item.id} item={item} onPress={handleCardPress} />
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
    borderRadius: Radius.xl,
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    ...Shadow.card,
  },
  cardClip: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: Brand.white,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  cardPressed: {
    opacity: 0.6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  tagText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  title: {
    ...Typography.h4,
    color: Brand.textPrimary,
  },
  desc: {
    ...Typography.small,
    color: Brand.textSecondary,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingPriceCol: {
    gap: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    ...Typography.caption,
    color: Brand.textPrimary,
    fontWeight: '600',
  },
  price: {
    ...Typography.h4,
    color: Brand.primary,
    fontWeight: '700',
  },
  bookBtnWrap: {
    borderRadius: Radius.full,
    ...Shadow.sm,
  },
  bookBtnClip: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  bookBtn: {
    backgroundColor: Brand.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  bookBtnPressed: {
    opacity: 0.7,
  },
  bookText: {
    ...Typography.smallMedium,
    color: Brand.white,
    fontWeight: '700',
  },
});
