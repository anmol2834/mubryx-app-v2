import { useAuthStore } from '@/store/authStore';
import { MubryxLogo } from '@/components/common/MubryxLogo';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(SCREEN_WIDTH * 0.82, 320);
// Scale factor to ensure the circle covers the entire screen (diagonal distance * 2)
const MAX_DIMENSION = Math.sqrt(SCREEN_WIDTH * SCREEN_WIDTH + SCREEN_HEIGHT * SCREEN_HEIGHT);
const EXPAND_TARGET_SCALE = (MAX_DIMENSION * 2.2) / CIRCLE_SIZE;

export function AnimatedSplashOverlay() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const [visible, setVisible] = useState(true);
  const [isEntryFinished, setIsEntryFinished] = useState(false);
  const isExpanding = useRef(false);

  const circleScale = useSharedValue(0.2);
  const circleOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(1);

  // 1. Initial Pop Up Animation
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    circleOpacity.value = withTiming(1, { duration: 150 });
    contentOpacity.value = withTiming(1, { duration: 250 });

    // Pop up bouncy spring entrance
    circleScale.value = withSpring(
      1,
      {
        damping: 11,
        stiffness: 95,
        mass: 0.9,
      },
      (finished) => {
        if (finished) {
          runOnJS(setIsEntryFinished)(true);
        }
      }
    );
  }, []);

  // 2. Full-Screen Circle Expansion Trigger when Session Check is ready
  useEffect(() => {
    if (!isLoading && isEntryFinished && !isExpanding.current) {
      isExpanding.current = true;

      // Fade out logo text inside circle as it begins expanding
      contentOpacity.value = withTiming(0, { duration: 180 });

      // Expand circle to cover full device screen
      circleScale.value = withTiming(
        EXPAND_TARGET_SCALE,
        {
          duration: 520,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        },
        (finished) => {
          if (finished) {
            // Once full screen is covered in blue, reveal underlying Home or Login screen
            overlayOpacity.value = withTiming(0, { duration: 220 }, (done) => {
              if (done) {
                runOnJS(setVisible)(false);
              }
            });
          }
        }
      );
    }
  }, [isLoading, isEntryFinished]);

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const circleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }));

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.splashOverlay, overlayAnimStyle]} pointerEvents="none">
      {/* Expanding Blue Circle Container */}
      <Animated.View style={[styles.blueCircle, circleAnimStyle]}>
        {/* Content Inside Circle */}
        <Animated.View style={[styles.contentWrap, contentAnimStyle]}>
          <MubryxLogo width={90} height={90} color="#FFFFFF" />
          <Text style={styles.brandTitle}>MUBRYX</Text>
          <Text style={styles.brandTagline}>HOME SERVICES, SIMPLIFIED</Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

export function AnimatedIcon() {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.iconContainer}>
      <View style={styles.background} />
      <Animated.View style={[styles.imageContainer, animStyle]}>
        <MubryxLogo width={64} height={64} color="#FFFFFF" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#07152D',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  blueCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#0047BA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: '#0047BA',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 16,
  },
  contentWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 3.5,
    marginTop: 8,
  },
  brandTagline: {
    fontSize: 10.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    borderRadius: 40,
    backgroundColor: '#0047BA',
    width: 128,
    height: 128,
    position: 'absolute',
  },
});
