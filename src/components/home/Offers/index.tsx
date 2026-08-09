import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { SPECIAL_OFFERS } from '@/constants/homeData';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W * 0.75;

const OfferCard = memo(function OfferCard({
  item,
}: {
  item: (typeof SPECIAL_OFFERS)[number];
}) {
  return (
    // Outer: shadow, no overflow so shadow isn't clipped on Android
    <View style={styles.cardWrap}>
      {/* Inner: clips gradient corners and press highlight */}
      <View style={styles.cardClip}>
        <Pressable
          style={({ pressed }) => [styles.pressable, pressed && styles.pressablePressed]}
          android_ripple={null}
          accessibilityLabel={item.title}>
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount}</Text>
            </View>
            <View style={styles.expiresRow}>
              <Text style={styles.clockIcon}>⏰</Text>
              <Text style={styles.expiresText}>{item.expires}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.originalPrice}>{item.original}</Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>
            {/* CTA — outer for shadow, inner clips press effect */}
            <View style={styles.ctaBtnWrap}>
              <View style={styles.ctaBtnClip}>
                <Pressable
                  style={({ pressed }) => [styles.ctaBtn, pressed && styles.ctaBtnPressed]}
                  android_ripple={null}
                  accessibilityLabel={`Book ${item.title}`}>
                  <Text style={styles.ctaText}>Book Service</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.circle1} />
            <View style={styles.circle2} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
});

export const SpecialOffers = memo(function SpecialOffers() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>Special Offers</Text>
          <Text style={styles.sectionSub}>Limited time deals for you</Text>
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
        {SPECIAL_OFFERS.map((item) => (
          <OfferCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Spacing.xl,
    backgroundColor: Brand.offWhite,
  },
  header: {
    paddingHorizontal: Spacing.screen,
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Brand.textPrimary,
  },
  sectionSub: {
    ...Typography.small,
    color: Brand.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: Spacing.screen,
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  cardWrap: {
    width: CARD_W,
    borderRadius: Radius.xl,
    ...Shadow.md,
  },
  cardClip: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  pressable: {
    borderRadius: Radius.xl,
  },
  pressablePressed: {
    opacity: 0.85,
  },
  card: {
    padding: Spacing.xl,
    gap: Spacing.sm,
    overflow: 'hidden',
    minHeight: 200,
    justifyContent: 'flex-end',
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.base,
    right: Spacing.base,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  discountText: {
    ...Typography.smallMedium,
    color: Brand.white,
    fontWeight: '800',
  },
  expiresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clockIcon: {
    fontSize: 11,
  },
  expiresText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  title: {
    ...Typography.h3,
    color: Brand.white,
    fontWeight: '700',
  },
  desc: {
    ...Typography.small,
    color: 'rgba(255,255,255,0.75)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  originalPrice: {
    ...Typography.small,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'line-through',
  },
  price: {
    ...Typography.h3,
    color: Brand.white,
    fontWeight: '800',
  },
  ctaBtnWrap: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    marginTop: 4,
    ...Shadow.sm,
  },
  ctaBtnClip: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  ctaBtn: {
    backgroundColor: Brand.white,
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  ctaBtnPressed: {
    opacity: 0.7,
  },
  ctaText: {
    ...Typography.smallMedium,
    color: Brand.primary,
    fontWeight: '700',
  },
  circle1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -30,
    right: -30,
  },
  circle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: 40,
    right: 60,
  },
});
