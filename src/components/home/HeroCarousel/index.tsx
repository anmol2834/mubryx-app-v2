import { Brand, Radius, Shadow, Spacing } from '@/constants/brand';
import { HERO_BANNERS } from '@/constants/homeData';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');
const BANNER_W = SCREEN_W - Spacing.screen * 2;
const BANNER_H = BANNER_W * 0.52;
const ITEM_W = BANNER_W + Spacing.md; // snap interval = card + gap

const COUNT: number = HERO_BANNERS.length;

// ─── Infinite loop data ───────────────────────────────────────────────────────
// Three full copies: [clone-tail | originals | clone-head]
// We start in the middle copy so the user can swipe both directions seamlessly.
// When they reach either clone region we silently teleport to the matching
// position in the middle copy — the images are identical so it's invisible.
type BannerItem = { id: string; loopKey: string; image: (typeof HERO_BANNERS)[number]['image'] };

const LOOP_DATA: BannerItem[] = [
  ...HERO_BANNERS.map((b) => ({ ...b, loopKey: `pre-${b.id}` })),
  ...HERO_BANNERS.map((b) => ({ ...b, loopKey: `mid-${b.id}` })),
  ...HERO_BANNERS.map((b) => ({ ...b, loopKey: `post-${b.id}` })),
];

const MID_OFFSET = COUNT; // index of first item in the middle copy

// ─── Banner item ──────────────────────────────────────────────────────────────

const HeroBannerItem = memo(function HeroBannerItem({ item }: { item: BannerItem }) {
  return (
    <View style={styles.bannerCard}>
      <View style={styles.bannerClip}>
        <Image
          source={item.image}
          style={styles.image}
          resizeMode="cover"
          fadeDuration={0}
          accessibilityIgnoresInvertColors
        />
      </View>
    </View>
  );
});

// ─── Dot indicator ────────────────────────────────────────────────────────────

const DotIndicator = memo(function DotIndicator({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 20 : 6);
  const opacity = useSharedValue(active ? 1 : 0.4);

  useEffect(() => {
    width.value = withTiming(active ? 20 : 6, { duration: 250 });
    opacity.value = withTiming(active ? 1 : 0.4, { duration: 250 });
  }, [active]);

  const style = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, style]} />;
});

// ─── Carousel ─────────────────────────────────────────────────────────────────

export const HeroCarousel = memo(function HeroCarousel() {
  // realIndex tracks position within the ORIGINAL array (0…COUNT-1) for dots
  const [realIndex, setRealIndex] = useState(0);

  const flatRef = useRef<FlatList<BannerItem>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // loopIndex tracks the current position within LOOP_DATA
  const loopIndexRef = useRef(MID_OFFSET);
  // Guard: prevent the scroll handler from firing during a silent teleport
  const isTeleportingRef = useRef(false);

  // ── Silent jump to a loop index without animation ──────────────────────────
  const jumpTo = useCallback((index: number) => {
    isTeleportingRef.current = true;
    flatRef.current?.scrollToIndex({ index, animated: false });
    loopIndexRef.current = index;
    // Release the guard after the next frame so the scroll event has settled
    requestAnimationFrame(() => {
      isTeleportingRef.current = false;
    });
  }, []);

  // ── Autoplay ───────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const next = loopIndexRef.current + 1;
      loopIndexRef.current = next;
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      setRealIndex(next % COUNT);
    }, 3500);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Start positioned at the first item of the middle copy (no animation)
    jumpTo(MID_OFFSET);
    startTimer();
    return stopTimer;
  }, []);

  // ── Scroll handler: detect edge proximity and teleport ─────────────────────
  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isTeleportingRef.current) return;

      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / ITEM_W);

      // Update dot indicator
      setRealIndex(index % COUNT);
      loopIndexRef.current = index;

      // Teleport when entering the pre-copy (index < COUNT)
      if (index < COUNT) {
        jumpTo(index + COUNT);
        return;
      }
      // Teleport when entering the post-copy (index >= COUNT * 2)
      if (index >= COUNT * 2) {
        jumpTo(index - COUNT);
      }
    },
    [jumpTo]
  );

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatRef}
        data={LOOP_DATA}
        keyExtractor={(item) => item.loopKey}
        renderItem={({ item }) => <HeroBannerItem item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_W}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={stopTimer}
        onScrollEndDrag={startTimer}
        getItemLayout={(_, index) => ({
          length: ITEM_W,
          offset: ITEM_W * index,
          index,
        })}
        // Memory-optimized windowing for smooth Android image rendering
        windowSize={3}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        removeClippedSubviews={false}
      />

      <View style={styles.dots}>
        {HERO_BANNERS.map((_, i) => (
          <DotIndicator key={i} active={i === realIndex} />
        ))}
      </View>
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Spacing.base,
    gap: Spacing.md,
    backgroundColor: Brand.white,
  },
  listContent: {
    paddingHorizontal: Spacing.screen,
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  bannerCard: {
    width: BANNER_W,
    height: BANNER_H,
    borderRadius: Radius.lg, // reduced from Radius.xl (24) → Radius.lg (18)
    ...Shadow.lg,
  },
  bannerClip: {
    flex: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Brand.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingBottom: Spacing.sm,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.primary,
  },
});
