import { Brand, Radius } from '@/constants/brand';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type TabName = 'home' | 'history' | 'track' | 'review' | 'profile';

// All icons share identical props: 24×24 canvas, same strokeWidth, same strokeLinecap.
// This ensures every icon has equal visual weight at a glance.
const ICON_SIZE = 24;
const SW = '1.8'; // strokeWidth — consistent across all icons

function TabIcon({ name, active }: { name: TabName; active: boolean }) {
  const color = active ? Brand.primary : Brand.textMuted;
  const base = {
    width: ICON_SIZE,
    height: ICON_SIZE,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: color,
    strokeWidth: SW,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    // ── Home ─────────────────────────────────────────────────────────────────
    case 'home':
      return (
        <Svg {...base}>
          {/* Roof */}
          <Path d="M3 11.5L12 3l9 8.5" />
          {/* Body — filled when active */}
          <Path
            d="M5 10.5V20a1 1 0 0 0 1 1h4v-4h4v4h4a1 1 0 0 0 1-1v-9.5"
            fill={active ? color : 'none'}
            fillOpacity={active ? 0.15 : 0}
          />
        </Svg>
      );

    // ── History (clock) ───────────────────────────────────────────────────────
    case 'history':
      return (
        // <Svg {...base}>
        //   {/* Outer circle — same radius as home/profile visual weight */}
        //   <Circle cx="12" cy="12" r="9" fill={active ? color : 'none'} fillOpacity={active ? 0.1 : 0} />
        //   {/* Clock hands */}
        //   <Path d="M12 7.5V12l3 2.5" />
        // </Svg>

        <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Calendar */}
      <Rect
        x="3"
        y="4"
        width="14"
        height="13"
        rx="2"
      />

      {/* Calendar top line */}
      <Path d="M3 8H17" />

      {/* Calendar pins */}
      <Path d="M7 2V6" />
      <Path d="M13 2V6" />

      {/* Clock */}
      <Circle
        cx="17.5"
        cy="17.5"
        r="4.5"
        fill={active ? color : 'none'}
        fillOpacity={active ? 0.1 : 0}
      />

      {/* Clock hands */}
      <Path d="M17.5 15.5V17.5H19.2" />
    </Svg>
      );

    // ── Track — exact Google Material Symbols "target/track" path ───────────
    case 'track':
      return (
        // viewBox matches the Google Material symbol coordinate space (0 -960 960 960)
        <Svg
          width={ICON_SIZE}
          height={ICON_SIZE}
          viewBox="0 -960 960 960"
          fill={color}>
          <Path d="M324-111.5Q251-143 197-197t-85.5-127Q80-397 80-480t31.5-156Q143-709 197-763t127-85.5Q397-880 480-880h40v331q18 11 29 28.5t11 40.5q0 33-23.5 56.5T480-400q-33 0-56.5-23.5T400-480q0-23 11-41t29-28v-86q-52 14-86 56.5T320-480q0 66 47 113t113 47q66 0 113-47t47-113q0-36-14.5-66.5T586-600l57-57q35 33 56 78.5t21 98.5q0 100-70 170t-170 70q-100 0-170-70t-70-170q0-90 57-156.5T440-717v-81q-119 15-199.5 105T160-480q0 134 93 227t227 93q134 0 227-93t93-227q0-69-27-129t-74-104l57-57q57 55 90.5 129.5T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80q-83 0-156-31.5Z" />
        </Svg>
      );

    // ── Review (star) ─────────────────────────────────────────────────────────
    case 'review':
      return (
        <Svg {...base}>
          <Path
            d="M12 2.5l2.75 5.57 6.14.89-4.44 4.33 1.05 6.11L12 16.27l-5.5 2.89 1.05-6.11L3.11 8.96l6.14-.89L12 2.5z"
            fill={active ? color : 'none'}
            fillOpacity={active ? 0.9 : 0}
          />
        </Svg>
      );

    // ── Profile (person) ─────────────────────────────────────────────────────
    case 'profile':
      return (
        <Svg {...base}>
          <Circle cx="12" cy="7.5" r="4" fill={active ? color : 'none'} fillOpacity={active ? 0.15 : 0} />
          <Path
            d="M4 21c0-4 3.6-7 8-7s8 3 8 7"
            fill={active ? color : 'none'}
            fillOpacity={active ? 0.1 : 0}
          />
        </Svg>
      );

    default:
      return null;
  }
}

const TABS: { name: TabName; label: string }[] = [
  { name: 'home',    label: 'Home'    },
  { name: 'history', label: 'History' },
  { name: 'track',   label: 'Track'   },
  { name: 'review',  label: 'Review'  },
  { name: 'profile', label: 'Profile' },
];

const TabItem = memo(function TabItem({
  tab,
  active,
  onPress,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  onPress: () => void;
}) {
  // No spring animation — withSpring completion callbacks cause "Maximum call
  // stack exceeded" on rapid taps due to recursive Reanimated scheduler calls.
  // Plain Pressable opacity feedback is sufficient and crash-free.
  return (
    <Pressable
      style={styles.tabItem}
      onPress={onPress}
      accessibilityLabel={tab.label}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}>
      <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
        <TabIcon name={tab.name} active={active} />
      </View>
    </Pressable>
  );
});

export const BottomNavigation = memo(function BottomNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <View style={styles.container}>
        {TABS.map((tab) => (
          <TabItem
            key={tab.name}
            tab={tab}
            active={activeTab === tab.name}
            onPress={() => onTabChange(tab.name)}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Brand.white,
    borderTopWidth: 1,
    borderTopColor: Brand.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#0A1628',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 16 },
    }),
  },
  container: {
    flexDirection: 'row',
    paddingTop: 6,
    paddingBottom: 2,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    minHeight: 40,
  },
  iconWrap: {
    // Fixed square container — all 5 icons rendered at the same 24×24 size
    // inside this 40×32 hit area so no icon appears larger or smaller
    width: 40,
    height: 32,
    borderRadius: Radius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: Brand.primarySoft,
  },
});
