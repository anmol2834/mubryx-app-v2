import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';

import classes from './animated-icon.module.css';

const DURATION = 300;

export function AnimatedSplashOverlay() {
  return null;
}

const keyframe = new Keyframe({
  0: { transform: [{ scale: 0 }] },
  60: { transform: [{ scale: 1.2 }], easing: Easing.elastic(1.2) },
  100: { transform: [{ scale: 1 }], easing: Easing.elastic(1.2) },
});

const logoKeyframe = new Keyframe({
  0: { opacity: 0 },
  60: { transform: [{ scale: 1.2 }], opacity: 0, easing: Easing.elastic(1.2) },
  100: { transform: [{ scale: 1 }], opacity: 1, easing: Easing.elastic(1.2) },
});

const LogoMark = () => (
  <View style={styles.logoMark}>
    <Text style={styles.logoLetter}>M</Text>
  </View>
);

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View style={styles.background} entering={keyframe.duration(DURATION)}>
        <div className={classes.expoLogoBackground} />
      </Animated.View>

      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <LogoMark />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    width: 128,
    height: 128,
    position: 'absolute',
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
