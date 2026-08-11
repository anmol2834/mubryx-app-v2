import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo, useCallback, useEffect, useRef } from 'react';
import {
  Alert,
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
import type { BookingResult } from '../../types';
import type { TrackStage } from '@/screens/Profile/constants';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_H * 0.92;

// ─── Icons ────────────────────────────────────────────────────────────────────

function PhoneIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
        stroke={Brand.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChatIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="#00695C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function TrackIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke="#E65100" strokeWidth="1.8" />
      <Circle cx="12" cy="12" r="8" stroke="#E65100" strokeWidth="1.8" strokeDasharray="4 2" />
    </Svg>
  );
}

function VerifiedBadge() {
  return (
    <View style={eng.verifiedDot}>
      <Svg width={8} height={8} viewBox="0 0 24 24" fill="none">
        <Polyline points="20 6 9 17 4 12" stroke={Brand.white} strokeWidth="3.5"
          strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

function StarIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="#FFC107">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

// ─── OTP Card ─────────────────────────────────────────────────────────────────

const OTPCard = memo(function OTPCard({ otp }: { otp: string }) {
  const digits = otp.split('');
  return (
    <View style={otp_s.card}>
      <View style={otp_s.left}>
        <Text style={otp_s.label}>Booking OTP</Text>
        <Text style={otp_s.hint}>Share with technician on arrival</Text>
      </View>
      <View style={otp_s.digitsRow}>
        {digits.map((d, i) => (
          <View key={i} style={otp_s.digitBox}>
            <Text style={otp_s.digit}>{d}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const otp_s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Brand.navy,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    ...Shadow.md,
  },
  left: { gap: 3 },
  label: { ...Typography.bodyMedium, color: Brand.white, fontWeight: '700' as const },
  hint: { ...Typography.caption, color: 'rgba(255,255,255,0.6)' },
  digitsRow: { flexDirection: 'row', gap: Spacing.sm },
  digitBox: {
    width: 40, height: 48,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  digit: { fontSize: 22, fontWeight: '800' as const, color: Brand.white, letterSpacing: -0.5 },
});

// ─── Engineer Card ────────────────────────────────────────────────────────────

const EngineerCard = memo(function EngineerCard({ result }: { result: BookingResult }) {
  const { engineer } = result;
  if (!engineer) return null;
  return (
    <View style={eng.card}>
      <View style={eng.avatarSection}>
        <View style={[eng.avatar, { backgroundColor: engineer.avatarColor }]}>
          <Text style={eng.avatarText}>{engineer.avatarInitials}</Text>
        </View>
        {engineer.isVerified && <VerifiedBadge />}
      </View>

      <View style={eng.info}>
        <View style={eng.nameRow}>
          <Text style={eng.name}>{engineer.name}</Text>
          {engineer.isTopRated && (
            <View style={eng.topBadge}>
              <Text style={eng.topBadgeText}>⭐ Top Rated</Text>
            </View>
          )}
        </View>
        <View style={eng.ratingRow}>
          <StarIcon />
          <Text style={eng.rating}>{engineer.rating}</Text>
          <Text style={eng.dot}>·</Text>
          <Text style={eng.exp}>{engineer.experience}</Text>
          <Text style={eng.dot}>·</Text>
          <Text style={eng.jobs}>{engineer.completedJobs} jobs</Text>
        </View>
        <View style={eng.metaRow}>
          <View style={eng.metaChip}>
            <Text style={eng.metaChipText}>📍 {engineer.distance}</Text>
          </View>
          <View style={eng.metaChip}>
            <Text style={eng.metaChipText}>🕐 {result.estimatedArrival}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const eng = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Brand.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    ...Shadow.card,
  },
  avatarSection: { position: 'relative', flexShrink: 0 },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.sm,
  },
  avatarText: { fontSize: 20, fontWeight: '700' as const, color: Brand.white },
  verifiedDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Brand.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Brand.white,
  },
  info: { flex: 1, gap: 5 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  name: { fontSize: 16, fontWeight: '700' as const, color: Brand.textPrimary, letterSpacing: -0.2 },
  topBadge: {
    backgroundColor: '#FEFDE8',
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: '#FFD54F',
  },
  topBadgeText: { fontSize: 9, fontWeight: '700' as const, color: '#F57F17' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { ...Typography.smallMedium, color: Brand.textPrimary, fontWeight: '700' as const },
  dot: { ...Typography.caption, color: Brand.textMuted },
  exp: { ...Typography.caption, color: Brand.textSecondary },
  jobs: { ...Typography.caption, color: Brand.textSecondary },
  metaRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 2 },
  metaChip: {
    backgroundColor: Brand.surface,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: Brand.borderLight,
  },
  metaChipText: { fontSize: 11, color: Brand.textSecondary, fontWeight: '500' as const },
});

// ─── Quick Actions ────────────────────────────────────────────────────────────

const QuickActions = memo(function QuickActions({
  onCall, onChat, onTrack,
}: { onCall: () => void; onChat: () => void; onTrack: () => void }) {
  return (
    <View style={qa.row}>
      <Pressable style={({ pressed }) => [qa.btn, pressed && qa.pressed]} onPress={onCall} android_ripple={null}>
        <View style={[qa.iconWrap, { backgroundColor: Brand.primarySoft }]}>
          <PhoneIcon />
        </View>
        <Text style={qa.label}>Call</Text>
      </Pressable>
      <Pressable style={({ pressed }) => [qa.btn, pressed && qa.pressed]} onPress={onChat} android_ripple={null}>
        <View style={[qa.iconWrap, { backgroundColor: '#E0F2F1' }]}>
          <ChatIcon />
        </View>
        <Text style={qa.label}>Chat</Text>
      </Pressable>
      <Pressable style={({ pressed }) => [qa.btn, pressed && qa.pressed]} onPress={onTrack} android_ripple={null}>
        <View style={[qa.iconWrap, { backgroundColor: '#FFF3E0' }]}>
          <TrackIcon />
        </View>
        <Text style={qa.label}>Track</Text>
      </Pressable>
    </View>
  );
});

const qa = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.md },
  btn: { flex: 1, alignItems: 'center', gap: Spacing.sm },
  iconWrap: {
    width: 52, height: 52, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Brand.borderLight,
  },
  label: { ...Typography.caption, color: Brand.textSecondary, fontWeight: '600' as const },
  pressed: { opacity: 0.7 },
});

// ─── Mini Timeline ────────────────────────────────────────────────────────────

const MiniTimeline = memo(function MiniTimeline({ stages }: { stages: TrackStage[] }) {
  return (
    <View style={tl.wrap}>
      <Text style={tl.title}>Booking Progress</Text>
      {stages.slice(0, 4).map((stage, idx) => {
        const isDone   = stage.status === 'done';
        const isActive = stage.status === 'active';
        return (
          <View key={stage.id} style={tl.row}>
            <View style={tl.lineCol}>
              <View style={[tl.dot, isDone && tl.dotDone, isActive && tl.dotActive]} />
              {idx < 3 && <View style={[tl.line, isDone && tl.lineDone]} />}
            </View>
            <View style={tl.textCol}>
              <Text style={[tl.stageTitle, isDone && tl.stageTitleDone, isActive && tl.stageTitleActive]}>
                {stage.title}
              </Text>
              {stage.timestamp && (
                <Text style={tl.timestamp}>{stage.timestamp}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
});

const tl = StyleSheet.create({
  wrap: {
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    gap: 0,
  },
  title: {
    ...Typography.caption, color: Brand.textMuted,
    fontWeight: '700' as const, textTransform: 'uppercase',
    letterSpacing: 0.6, marginBottom: Spacing.md,
  },
  row: { flexDirection: 'row', gap: Spacing.md, minHeight: 36 },
  lineCol: { alignItems: 'center', width: 16 },
  dot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Brand.border, marginTop: 3,
  },
  dotDone: { backgroundColor: Brand.success },
  dotActive: { backgroundColor: Brand.primary },
  line: { flex: 1, width: 2, backgroundColor: Brand.borderLight, marginVertical: 2 },
  lineDone: { backgroundColor: Brand.success + '60' },
  textCol: { flex: 1, paddingBottom: Spacing.md, gap: 2 },
  stageTitle: { ...Typography.smallMedium, color: Brand.textMuted },
  stageTitleDone: { color: Brand.textPrimary, fontWeight: '600' as const },
  stageTitleActive: { color: Brand.primary, fontWeight: '700' as const },
  timestamp: { ...Typography.caption, color: Brand.textMuted },
});

// ─── TechnicianAssignedSheet ──────────────────────────────────────────────────

interface Props {
  visible: boolean;
  result: BookingResult | null;
  onTrack: () => void;
  onBackHome: () => void;
}

export const TechnicianAssignedSheet = memo(function TechnicianAssignedSheet({
  visible,
  result,
  onTrack,
  onBackHome,
}: Props) {
  const insets    = useSafeAreaInsets();
  const slideAnim    = useRef(new Animated.Value(SHEET_HEIGHT)).current;
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

  const handleCall = useCallback(() => {
    Alert.alert('Call Technician', `Calling ${result?.engineer?.name ?? 'technician'}...`);
  }, [result]);

  const handleChat = useCallback(() => {
    Alert.alert('Chat', 'In-app chat coming soon.');
  }, []);

  if (!result) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onBackHome}>
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

          {/* Success header */}
          <View style={s.successHeader}>
            <View style={s.successIconWrap}>
              <Text style={s.successEmoji}>🎉</Text>
            </View>
            <Text style={s.successTitle}>{result.engineer ? 'Great News!' : 'Booking Confirmed!'}</Text>
            <Text style={s.successSub}>
              {result.engineer ? (
                <>
                  <Text style={s.successName}>{result.engineer.name}</Text>
                  {' '}has accepted your booking and is on the way.
                </>
              ) : (
                'We are finding the best technician nearby for you.'
              )}
            </Text>
            <View style={s.bookingIdRow}>
              <Text style={s.bookingIdLabel}>Booking ID</Text>
              <Text style={s.bookingId}>{result.bookingId}</Text>
            </View>
          </View>

          {/* OTP */}
          <OTPCard otp={result.otp} />

          {/* Engineer */}
          {result.engineer && <EngineerCard result={result} />}

          {/* Quick Actions */}
          {result.engineer && <QuickActions onCall={handleCall} onChat={handleChat} onTrack={onTrack} />}

          {/* Timeline */}
          <MiniTimeline stages={result.stages} />

          {/* Service summary */}
          <View style={s.summaryCard}>
            <View style={s.summaryRow}>
              <Text style={s.summaryIcon}>{result.serviceIcon}</Text>
              <View style={s.summaryInfo}>
                <Text style={s.summaryService}>{result.serviceName}</Text>
                <Text style={s.summaryMeta}>{result.scheduledDate} · {result.scheduledTime}</Text>
              </View>
              <Text style={s.summaryPrice}>₹{result.price}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer CTAs */}
        <View style={s.footer}>
          <Pressable
            style={({ pressed }) => [s.trackBtn, pressed && s.btnPressed]}
            onPress={onTrack}
            android_ripple={null}>
            <Text style={s.trackBtnText}>Track Service</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [s.homeBtn, pressed && s.btnPressed]}
            onPress={onBackHome}
            android_ripple={null}>
            <Text style={s.homeBtnText}>Back to Home</Text>
          </Pressable>
        </View>
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
    paddingBottom: Spacing.sm,
    gap: Spacing.base,
  },
  // Success header
  successHeader: { alignItems: 'center', gap: Spacing.sm },
  successIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Brand.successSoft,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.sm,
  },
  successEmoji: { fontSize: 32 },
  successTitle: {
    fontSize: 22, fontWeight: '800' as const,
    color: Brand.textPrimary, letterSpacing: -0.4,
  },
  successSub: {
    ...Typography.body, color: Brand.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  successName: { fontWeight: '700' as const, color: Brand.textPrimary },
  bookingIdRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Brand.surface,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: Brand.borderLight,
  },
  bookingIdLabel: { ...Typography.caption, color: Brand.textMuted },
  bookingId: { ...Typography.caption, color: Brand.primary, fontWeight: '700' as const },
  // Summary card
  summaryCard: {
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  summaryIcon: { fontSize: 28 },
  summaryInfo: { flex: 1, gap: 3 },
  summaryService: { ...Typography.bodyMedium, color: Brand.textPrimary, fontWeight: '600' as const },
  summaryMeta: { ...Typography.caption, color: Brand.textMuted },
  summaryPrice: { fontSize: 18, fontWeight: '800' as const, color: Brand.textPrimary, letterSpacing: -0.3 },
  // Footer
  footer: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Brand.borderLight,
    gap: Spacing.sm,
  },
  trackBtn: {
    backgroundColor: Brand.primary,
    borderRadius: Radius.xl,
    paddingVertical: 15,
    alignItems: 'center',
  },
  trackBtnText: { ...Typography.bodyMedium, color: Brand.white, fontWeight: '700' as const, letterSpacing: -0.2 },
  homeBtn: {
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.xl,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  homeBtnText: { ...Typography.bodyMedium, color: Brand.textSecondary, fontWeight: '600' as const },
  btnPressed: { opacity: 0.75 },
});
