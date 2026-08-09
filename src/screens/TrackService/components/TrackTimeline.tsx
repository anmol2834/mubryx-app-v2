import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import type { TrackStage, TrackStageStatus } from '../../Profile/constants';

// ─── Stage Icons ──────────────────────────────────────────────────────────────

function StageIcon({ id, status }: { id: string; status: TrackStageStatus }) {
  const color = status === 'pending' ? Brand.textMuted : Brand.white;
  const base = {
    width: 16, height: 16, viewBox: '0 0 24 24',
    fill: 'none' as const, stroke: color,
    strokeWidth: '2.5', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  switch (id) {
    case 'confirmed':
    case 'arrived':
      return <Svg {...base}><Polyline points="20 6 9 17 4 12" /></Svg>;
    case 'assigned':
      return <Svg {...base}><Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><Circle cx="12" cy="7" r="4" /></Svg>;
    case 'journey':
      return <Svg {...base}><Circle cx="12" cy="12" r="10" /><Path d="M12 8v4l3 3" /></Svg>;
    case 'nearby':
      return <Svg {...base}><Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><Circle cx="12" cy="10" r="3" /></Svg>;
    case 'started':
      return <Svg {...base}><Path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></Svg>;
    case 'completed':
      return <Svg {...base}><Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><Polyline points="22 4 12 14.01 9 11.01" /></Svg>;
    default:
      return <Svg {...base}><Circle cx="12" cy="12" r="4" /></Svg>;
  }
}

// ─── Active Dot with pulse ring + glow ───────────────────────────────────────

const DOT_SIZE = 36;

function ActiveDot({ id }: { id: string }) {
  // Outer pulse ring: scale 1 → 1.7, opacity 0.6 → 0
  const ring1Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0.55);
  // Second ring with delay for staggered effect
  const ring2Scale = useSharedValue(1);
  const ring2Opacity = useSharedValue(0.35);
  // Dot itself: subtle brightness pulse
  const dotScale = useSharedValue(1);

  useEffect(() => {
    const cfg = { duration: 1400, easing: Easing.out(Easing.ease) };
    ring1Scale.value = withRepeat(withTiming(1.75, cfg), -1, false);
    ring1Opacity.value = withRepeat(withTiming(0, cfg), -1, false);

    ring2Scale.value = withDelay(500, withRepeat(withTiming(1.75, cfg), -1, false));
    ring2Opacity.value = withDelay(500, withRepeat(withTiming(0, cfg), -1, false));

    dotScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));
  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));
  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  return (
    <View style={ad.wrap}>
      {/* Pulse ring 1 */}
      <Animated.View style={[ad.ring, ring1Style]} />
      {/* Pulse ring 2 — staggered */}
      <Animated.View style={[ad.ring, ad.ring2, ring2Style]} />
      {/* Core dot */}
      <Animated.View style={[ad.dot, dotStyle]}>
        <StageIcon id={id} status="active" />
      </Animated.View>
    </View>
  );
}

const ad = StyleSheet.create({
  wrap: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Brand.primary,
  },
  ring2: {
    backgroundColor: Brand.primaryLight,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: Brand.primaryLight,
  },
});

// ─── Single Timeline Item ─────────────────────────────────────────────────────

interface ItemProps {
  stage: TrackStage;
  isLast: boolean;
  onLiveLocation?: () => void;
}

const TimelineItem = memo(function TimelineItem({ stage, isLast, onLiveLocation }: ItemProps) {
  const isDone = stage.status === 'done';
  const isActive = stage.status === 'active';
  const isPending = stage.status === 'pending';

  const lineColor = isDone ? Brand.primary : Brand.borderLight;

  return (
    <View style={s.item}>
      {/* Left: dot + connector line */}
      <View style={s.leftCol}>
        {isActive ? (
          <ActiveDot id={stage.id} />
        ) : (
          <View style={[
            s.dot,
            isDone
              ? { backgroundColor: Brand.primary, borderColor: Brand.primary }
              : { backgroundColor: Brand.borderLight, borderColor: Brand.border },
          ]}>
            {isPending
              ? <View style={s.pendingInner} />
              : <StageIcon id={stage.id} status={stage.status} />
            }
          </View>
        )}
        {!isLast && <View style={[s.line, { backgroundColor: lineColor }]} />}
      </View>

      {/* Right: content */}
      <View style={[s.content, !isLast && s.contentGap]}>
        <View style={s.titleRow}>
          <Text style={[s.title, isPending && s.titlePending]}>{stage.title}</Text>
          {isActive && (
            <View style={s.activePill}>
              <View style={s.activePillDot} />
              <Text style={s.activePillText}>In Progress</Text>
            </View>
          )}
        </View>

        <Text style={[s.desc, isPending && s.descPending]} numberOfLines={2}>
          {stage.description}
        </Text>

        {stage.timestamp && (
          <Text style={s.timestamp}>{stage.timestamp}</Text>
        )}

        {/* Live Location — only on journey stage when active */}
        {stage.id === 'journey' && isActive && onLiveLocation && (
          <Pressable
            style={s.liveBtn}
            onPress={onLiveLocation}
            android_ripple={{ color: '#E1F5FE', borderless: false }}>
            <View style={s.liveDot} />
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                stroke="#0277BD" strokeWidth={2} strokeLinejoin="round" />
              <Circle cx="12" cy="9" r="2.5" stroke="#0277BD" strokeWidth={2} />
            </Svg>
            <Text style={s.liveBtnText}>View Live Location</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
});

// ─── Full Timeline ────────────────────────────────────────────────────────────

interface Props {
  stages: TrackStage[];
  onLiveLocation: () => void;
}

export const TrackTimeline = memo(function TrackTimeline({ stages, onLiveLocation }: Props) {
  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>Live Status</Text>
      <View style={s.timeline}>
        {stages.map((stage, idx) => (
          <TimelineItem
            key={stage.id}
            stage={stage}
            isLast={idx === stages.length - 1}
            onLiveLocation={onLiveLocation}
          />
        ))}
      </View>
    </View>
  );
});

const LINE_WIDTH = 2;

const s = StyleSheet.create({
  container: {
    backgroundColor: Brand.white,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Brand.textPrimary,
    marginBottom: Spacing.base,
  },
  timeline: { gap: 0 },
  item: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  leftCol: {
    alignItems: 'center',
    width: DOT_SIZE,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Brand.border,
  },
  line: {
    width: LINE_WIDTH,
    flex: 1,
    minHeight: 20,
    marginVertical: 2,
  },
  content: {
    flex: 1,
    paddingTop: 6,
    gap: 3,
  },
  contentGap: {
    paddingBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: {
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    fontWeight: '600',
  },
  titlePending: {
    color: Brand.textMuted,
    fontWeight: '400',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Brand.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  activePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.primary,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Brand.primary,
    letterSpacing: 0.3,
  },
  desc: {
    ...Typography.small,
    color: Brand.textSecondary,
    lineHeight: 18,
  },
  descPending: {
    color: Brand.textMuted,
  },
  timestamp: {
    ...Typography.caption,
    color: Brand.textMuted,
    marginTop: 1,
  },
  liveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#E1F5FE',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#B3E5FC',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0277BD',
  },
  liveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0277BD',
  },
});
