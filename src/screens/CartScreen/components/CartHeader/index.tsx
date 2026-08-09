import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Path } from 'react-native-svg';

function BackArrow() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5"
        stroke={Brand.textPrimary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 19l-7-7 7-7"
        stroke={Brand.textPrimary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BagIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
        stroke={Brand.textPrimary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="3" y1="6" x2="21" y2="6"
        stroke={Brand.textPrimary}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M16 10a4 4 0 0 1-8 0"
        stroke={Brand.textPrimary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface CartHeaderProps {
  onBack: () => void;
  itemCount: number;
}

export const CartHeader = memo(function CartHeader({
  onBack,
  itemCount,
}: CartHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
      {/* Back button */}
      <View style={styles.backClip}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
          onPress={onBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          android_ripple={null}>
          <BackArrow />
        </Pressable>
      </View>

      {/* Center: icon + title */}
      <View style={styles.titleRow}>
        <BagIcon />
        <Text style={styles.title}>Your Cart</Text>
      </View>

      {/* Right spacer — mirror of back button width for centering */}
      <View style={styles.spacer} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.md,
    backgroundColor: Brand.white,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#0A1628',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  backClip: {
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    opacity: 0.6,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    ...Typography.h3,
    color: Brand.textPrimary,
    letterSpacing: -0.3,
  },
  spacer: {
    width: 40,
  },
});
