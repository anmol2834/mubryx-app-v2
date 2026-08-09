import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo, useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import type { MatchingMetrics, MatchingStep } from '../../types';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_H * 0.86;

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon({ color = Brand.white }: { color?: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Polyline points="20 6 9 17 4 12" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SpinnerDot({ color }: { color: string }) {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rot, { toValue: 1, duration: 900, useNativeDriver: true })
    ).start();
  }, []);
  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5"
          strokeDasharray="28 56" strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

// ─── Matching Step Row ────────────────────────────────────────────────────────

const StepRow = memo(function StepRow({ step }: { step: MatchingStep }) {
  const fadeAnim = useRef(new Animated.Value(step.status === 'pending' ? 0.4 : 1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: step.status === 'pending' ? 0.4 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [step.status]);

  const isDone   = step.status === 'done';
  const isActive = step.status === 'active';

  return (
    <Animated.View style={[s.stepRow, { opacity: fadeAnim }]}>
      <View style={[s.stepIcon, isDone && s.stepIconDone, isActive && s.stepIconActive]}>
        {isDone   && <CheckIcon />}
        {isActive && <SpinnerDot color={Brand.primary} />}
        {!isDone && !isActive && <View style={s.stepDot} />}
      </View>
      <Text style={[s.stepLabel, isDone && s.stepLabelDone, isActive && s.stepLabelActive]}>
        {step.label}
      </Text>
      {isDone && (
        <View style={s.stepDoneBadge}>
          <Text style={s.stepDoneBadgeText}>Done</Text>
        </View>
      )}
    </Animated.View>
  );
});

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar = memo(function ProgressBar({ progress }: { progress: number }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthPct = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={pb.track}>
      <Animated.View style={[pb.fill, { width: widthPct }]} />
    </View>
  );
});

const pb = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: Brand.borderLight,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Brand.primary,
    borderRadius: Radius.full,
  },
});

// ─── Metric Card ──────────────────────────────────────────────────────────────

const MetricCard = memo(function MetricCard({
  emoji, label, value,
}: { emoji: string; label: string; value: string }) {
  return (
    <View style={mc.card}>
      <Text style={mc.emoji}>{emoji}</Text>
      <Text style={mc.value}>{value}</Text>
      <Text style={mc.label}>{label}</Text>
    </View>
  );
});

const mc = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  emoji: { fontSize: 18 },
  value: { fontSize: 14, fontWeight: '700' as const, color: Brand.textPrimary, letterSpacing: -0.2 },
  label: { ...Typography.caption, color: Brand.textMuted, textAlign: 'center' },
});

// ─── Error State ──────────────────────────────────────────────────────────────

const ErrorState = memo(function ErrorState({
  message, onRetry, onCancel,
}: { message: string; onRetry: () => void; onCancel: () => void }) {
  return (
    <View style={es.wrap}>
      <Text style={es.emoji}>😕</Text>
      <Text style={es.title}>Something went wrong</Text>
      <Text style={es.message}>{message}</Text>
      <Pressable style={es.retryBtn} onPress={onRetry} android_ripple={null}>
        <Text style={es.retryText}>Try Again</Text>
      </Pressable>
      <Pressable onPress={onCancel} hitSlop={8}>
        <Text style={es.cancelText}>Cancel Booking</Text>
      </Pressable>
    </View>
  );
});

const es = StyleSheet.create({
  wrap: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl },
  emoji: { fontSize: 40 },
  title: { ...Typography.h4, color: Brand.textPrimary, fontWeight: '700' as const },
  message: { ...Typography.small, color: Brand.textMuted, textAlign: 'center' },
  retryBtn: {
    backgroundColor: Brand.primary, borderRadius: Radius.xl,
    paddingHorizontal: Spacing.xl, paddingVertical: 12, marginTop: Spacing.sm,
  },
  retryText: { ...Typography.bodyMedium, color: Brand.white, fontWeight: '700' as const },
  cancelText: { ...Typography.small, color: Brand.textMuted, fontWeight: '500' as const },
});

// ─── FindingTechnicianSheet ───────────────────────────────────────────────────

interface Props {
  visible: boolean;
  matchingSteps: MatchingStep[];
  matchingProgress: number;
  matchingMetrics: MatchingMetrics;
  isCancelling: boolean;
  hasError: boolean;
  errorMessage: string;
  onCancel: () => void;
  onRetry: () => void;
}

export const FindingTechnicianSheet = memo(function FindingTechnicianSheet({
  visible,
  matchingSteps,
  matchingProgress,
  matchingMetrics,
  isCancelling,
  hasError,
  errorMessage,
  onCancel,
  onRetry,
}: Props) {
  const insets   = useSafeAreaInsets();
  const slideAnim   = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 200 }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      slideAnim.setValue(SHEET_HEIGHT);
      backdropAnim.setValue(0);
    }
  }, [visible]);

  const pct = Math.round(matchingProgress * 100);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {}}>
      {/* Backdrop — not dismissible during matching */}
      <TouchableWithoutFeedback onPress={() => {}}>
        <Animated.View style={[s.backdrop, { opacity: backdropAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[s.sheet, { paddingBottom: insets.bottom + 16 }, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={s.handleWrap}><View style={s.handle} /></View>

        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <View style={s.heroSection}>
            <View style={s.heroIconWrap}>
              <Text style={s.heroEmoji}>🔍</Text>
            </View>
            <Text style={s.heroTitle}>Finding Your Perfect Technician</Text>
            <Text style={s.heroSub}>
              Matching your booking with the nearest verified technician based on availability, skill, ratings, and estimated arrival.
            </Text>
          </View>

          {/* Progress */}
          <View style={s.progressSection}>
            <View style={s.progressHeader}>
              <Text style={s.progressLabel}>Matching Progress</Text>
              <Text style={s.progressPct}>{pct}%</Text>
            </View>
            <ProgressBar progress={matchingProgress} />
          </View>

          {hasError ? (
            <ErrorState message={errorMessage} onRetry={onRetry} onCancel={onCancel} />
          ) : (
            <>
              {/* Steps */}
              <View style={s.stepsSection}>
                {matchingSteps.map(step => (
                  <StepRow key={step.id} step={step} />
                ))}
              </View>

              {/* Metrics */}
              <View style={s.metricsSection}>
                <Text style={s.metricsTitle}>Live Matching Data</Text>
                <View style={s.metricsGrid}>
                  <MetricCard emoji="📍" label="Search Radius"    value={matchingMetrics.searchRadius} />
                  <MetricCard emoji="👷" label="Nearby Engineers" value={String(matchingMetrics.nearbyEngineers || '—')} />
                </View>
                <View style={[s.metricsGrid, { marginTop: Spacing.sm }]}>
                  <MetricCard emoji="⭐" label="Best Rating"      value={matchingMetrics.bestMatchRating} />
                  <MetricCard emoji="🕐" label="Est. Arrival"     value={matchingMetrics.estimatedArrival} />
                </View>
              </View>

              {/* Cancel */}
              <Pressable
                style={({ pressed }) => [s.cancelBtn, pressed && s.cancelBtnPressed]}
                onPress={onCancel}
                disabled={isCancelling}
                android_ripple={null}>
                <Text style={s.cancelText}>
                  {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
});

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,22,40,0.6)',
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: Brand.white,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.18, shadowRadius: 20 },
      android: { elevation: 24 },
    }),
  },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Brand.border },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xl,
    gap: Spacing.xl,
  },
  // Hero
  heroSection: { alignItems: 'center', gap: Spacing.md },
  heroIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Brand.primarySoft,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.md,
  },
  heroEmoji: { fontSize: 36 },
  heroTitle: {
    fontSize: 20, fontWeight: '700' as const,
    color: Brand.textPrimary, textAlign: 'center', letterSpacing: -0.3,
  },
  heroSub: {
    ...Typography.small, color: Brand.textSecondary,
    textAlign: 'center', lineHeight: 20,
  },
  // Progress
  progressSection: { gap: Spacing.sm },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { ...Typography.caption, color: Brand.textMuted, fontWeight: '600' as const, textTransform: 'uppercase', letterSpacing: 0.6 },
  progressPct: { ...Typography.bodyMedium, color: Brand.primary, fontWeight: '700' as const },
  // Steps
  stepsSection: {
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepIcon: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Brand.border,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  stepIconDone: { backgroundColor: Brand.success },
  stepIconActive: { backgroundColor: Brand.primarySoft },
  stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Brand.textMuted },
  stepLabel: { flex: 1, ...Typography.smallMedium, color: Brand.textMuted },
  stepLabelDone: { color: Brand.textPrimary, fontWeight: '600' as const },
  stepLabelActive: { color: Brand.primary, fontWeight: '700' as const },
  stepDoneBadge: {
    backgroundColor: Brand.successSoft,
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: Radius.full,
  },
  stepDoneBadgeText: { fontSize: 9, fontWeight: '700' as const, color: Brand.success },
  // Metrics
  metricsSection: { gap: Spacing.sm },
  metricsTitle: { ...Typography.caption, color: Brand.textMuted, fontWeight: '600' as const, textTransform: 'uppercase', letterSpacing: 0.6 },
  metricsGrid: { flexDirection: 'row', gap: Spacing.sm },
  // Cancel
  cancelBtn: { alignItems: 'center', paddingVertical: Spacing.md },
  cancelBtnPressed: { opacity: 0.6 },
  cancelText: { ...Typography.smallMedium, color: Brand.textMuted, fontWeight: '500' as const },
});
