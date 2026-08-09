import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const DURATION = 300;

const LogoMark = () => (
  <View style={styles.logoMark}>
    <Text style={styles.logoLetter}>M</Text>
  </View>
);

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const opacity = useSharedValue(1);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: DURATION }, (finished) => {
        if (finished) {
          runOnJS(setVisible)(false);
        }
      });
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.splashOverlay, animStyle]} pointerEvents="none">
      <LogoMark />
    </Animated.View>
  );
}

export function AnimatedIcon() {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: DURATION });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.iconContainer}>
      <View style={styles.background} />
      <Animated.View style={[styles.imageContainer, animStyle]}>
        <LogoMark />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  background: {
    borderRadius: 40,
    backgroundColor: '#1565C0',
    width: 128,
    height: 128,
    position: 'absolute',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1565C0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  logoMark: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
});
