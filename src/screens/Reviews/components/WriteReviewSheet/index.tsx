/**
 * WriteReviewSheet — Modal bottom sheet for writing AND editing reviews.
 * Reuses the exact same Modal + Animated.Value pattern as ScheduleSheet.
 * mode='write' → new review from a completed service
 * mode='edit'  → pre-filled edit of an existing review (no service card, no Maybe Later)
 */

import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
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
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Polyline } from 'react-native-svg';
import type { CompletedService, ReviewTag } from '../../mock/types';
import type { SheetMode } from '../../hooks/useReviews';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_H * 0.88;

const QUICK_TAGS: ReviewTag[] = [
  'Professional', 'Quick Service', 'Affordable', 'Clean Work',
  'Friendly Engineer', 'On Time', 'Highly Recommended', 'Problem Solved', 'Easy Booking',
];

const MAX_REVIEW_CHARS = 300;

// ─── Icons ────────────────────────────────────────────────────────────────────

function XIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke={Brand.textSecondary} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Polyline points="20 6 9 17 4 12" stroke={Brand.white} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function StarIcon({ filled, size = 44 }: { filled: boolean; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#FFC107' : 'none'}>
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke={filled ? '#FFC107' : Brand.border}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

const StarRating = memo(function StarRating({
  value, onChange,
}: { value: number; onChange: (v: number) => void }) {
  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
  return (
    <View style={sr.wrap}>
      <View style={sr.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => onChange(star)} hitSlop={6} android_ripple={null}>
            <StarIcon filled={star <= value} />
          </Pressable>
        ))}
      </View>
      {value > 0 && <Text style={sr.label}>{LABELS[value]}</Text>}
    </View>
  );
});

const sr = StyleSheet.create({
  wrap: { alignItems: 'center', gap: Spacing.sm },
  starsRow: { flexDirection: 'row', gap: Spacing.sm },
  label: { ...Typography.bodyMedium, color: Brand.primary, fontWeight: '700' as const, letterSpacing: -0.2 },
});

// ─── Completed Service Card (write mode only) ─────────────────────────────────

const CompletedServiceCard = memo(function CompletedServiceCard({ service }: { service: CompletedService }) {
  return (
    <View style={sc.card}>
      <View style={sc.iconWrap}>
        <Text style={sc.icon}>{service.serviceIcon}</Text>
      </View>
      <View style={sc.info}>
        <Text style={sc.serviceName}>{service.serviceName}</Text>
        <Text style={sc.bookingId}>{service.bookingId}</Text>
        <View style={sc.metaRow}>
          <View style={[sc.avatar, { backgroundColor: service.engineer.avatarColor }]}>
            <Text style={sc.avatarText}>{service.engineer.avatarInitials}</Text>
          </View>
          <Text style={sc.engineerName}>{service.engineer.name}</Text>
          <Text style={sc.dot}>·</Text>
          <Text style={sc.completedAt}>{service.completedAt}</Text>
        </View>
      </View>
      <View style={sc.doneBadge}>
        <CheckIcon />
        <Text style={sc.doneText}>Done</Text>
      </View>
    </View>
  );
});

const sc = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Brand.offWhite, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Brand.borderLight,
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: Radius.md,
    backgroundColor: Brand.primarySoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  icon: { fontSize: 22 },
  info: { flex: 1, gap: 2 },
  serviceName: { ...Typography.bodyMedium, color: Brand.textPrimary, fontWeight: '600' as const },
  bookingId: { ...Typography.caption, color: Brand.textMuted },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  avatar: { width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 7, fontWeight: '700' as const, color: Brand.white },
  engineerName: { ...Typography.caption, color: Brand.textSecondary, fontWeight: '500' as const },
  dot: { ...Typography.caption, color: Brand.textMuted },
  completedAt: { ...Typography.caption, color: Brand.textMuted },
  doneBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Brand.success, paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  doneText: { fontSize: 10, color: Brand.white, fontWeight: '700' as const },
});

// ─── WriteReviewSheet ─────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  mode: SheetMode;
  service: CompletedService | null;   // required in write mode
  selectedRating: number;
  reviewText: string;
  selectedTags: Set<ReviewTag>;
  isSubmitting: boolean;
  onRatingChange: (r: number) => void;
  onTextChange: (t: string) => void;
  onToggleTag: (tag: ReviewTag) => void;
  onSubmit: () => void;
  onDismiss: () => void;   // "Maybe Later" in write mode / close in edit mode
}

export const WriteReviewSheet = memo(function WriteReviewSheet({
  visible, mode, service, selectedRating, reviewText, selectedTags,
  isSubmitting, onRatingChange, onTextChange,
  onToggleTag, onSubmit, onDismiss,
}: Props) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
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

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: SHEET_HEIGHT, duration: 240, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onDismiss());
  }, [onDismiss]);

  const canSubmit = selectedRating > 0 && !isSubmitting;
  const isWrite = mode === 'write';

  // In write mode, don't render if there's no service to review
  if (isWrite && !service) return null;

  const headerEmoji = isWrite ? '🎉' : '✏️';
  const headerTitle = isWrite ? 'Service Complete!' : 'Edit Review';
  const headerSub = isWrite ? 'Share your experience' : 'Update your feedback';
  const submitLabel = isSubmitting
    ? (isWrite ? 'Submitting...' : 'Saving...')
    : selectedRating === 0
      ? 'Select a rating to continue'
      : isWrite ? 'Submit Review' : 'Save Changes';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[sh.backdrop, { opacity: backdropAnim }]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View style={[sh.sheet, { paddingBottom: insets.bottom + 16 }, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={sh.handleWrap}>
          <View style={sh.handle} />
        </View>

        {/* Header */}
        <View style={sh.header}>
          <View style={sh.headerLeft}>
            <Text style={sh.headerEmoji}>{headerEmoji}</Text>
            <View>
              <Text style={sh.headerTitle}>{headerTitle}</Text>
              <Text style={sh.headerSub}>{headerSub}</Text>
            </View>
          </View>
          <Pressable style={sh.closeBtn} onPress={handleClose} hitSlop={8} android_ripple={null}>
            <XIcon />
          </Pressable>
        </View>

        <ScrollView
          style={sh.scroll}
          contentContainerStyle={sh.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Service card — write mode only */}
          {isWrite && service && <CompletedServiceCard service={service} />}

          {/* Star rating */}
          <View style={sh.section}>
            <Text style={sh.sectionLabel}>Rate your experience</Text>
            <StarRating value={selectedRating} onChange={onRatingChange} />
          </View>

          {/* Quick tags */}
          <View style={sh.section}>
            <Text style={sh.sectionLabel}>What went well?</Text>
            <View style={sh.tagsWrap}>
              {QUICK_TAGS.map((tag) => {
                const active = selectedTags.has(tag);
                return (
                  <Pressable
                    key={tag}
                    style={[sh.tag, active && sh.tagActive]}
                    onPress={() => onToggleTag(tag)}
                    android_ripple={null}>
                    <Text style={[sh.tagText, active && sh.tagTextActive]}>
                      {active ? '✓ ' : ''}{tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Review text */}
          <View style={sh.section}>
            <Text style={sh.sectionLabel}>Tell us more (optional)</Text>
            <View style={sh.inputWrap}>
              <TextInput
                style={sh.input}
                placeholder="Tell us about your experience..."
                placeholderTextColor={Brand.textMuted}
                value={reviewText}
                onChangeText={onTextChange}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={MAX_REVIEW_CHARS}
                returnKeyType="done"
                blurOnSubmit
              />
              <Text style={sh.charCount}>{reviewText.length}/{MAX_REVIEW_CHARS}</Text>
            </View>
          </View>


        </ScrollView>

        {/* Footer */}
        <View style={sh.footer}>
          <Pressable
            style={({ pressed }) => [sh.submitBtn, !canSubmit && sh.submitBtnDisabled, pressed && sh.submitBtnPressed]}
            onPress={canSubmit ? onSubmit : undefined}
            android_ripple={null}>
            <Text style={sh.submitText}>{submitLabel}</Text>
          </Pressable>
          {/* "Maybe Later" only in write mode */}
          {isWrite && (
            <Pressable style={sh.laterBtn} onPress={handleClose} android_ripple={null}>
              <Text style={sh.laterText}>Maybe Later</Text>
            </Pressable>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
});

const sh = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10,22,40,0.55)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SHEET_HEIGHT, backgroundColor: Brand.white,
    borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.18, shadowRadius: 20 },
      android: { elevation: 24 },
    }),
  },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Brand.border },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Brand.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerEmoji: { fontSize: 26 },
  headerTitle: { ...Typography.h4, color: Brand.textPrimary, fontWeight: '700' as const },
  headerSub: { ...Typography.caption, color: Brand.textMuted },
  closeBtn: {
    width: 34, height: 34, borderRadius: Radius.full,
    backgroundColor: Brand.surface, alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.screen, paddingTop: Spacing.base, paddingBottom: Spacing.sm, gap: Spacing.base },
  section: { gap: Spacing.md },
  sectionLabel: {
    ...Typography.caption, color: Brand.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '700' as const,
  },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: {
    paddingHorizontal: Spacing.md, paddingVertical: 9,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Brand.border, backgroundColor: Brand.white,
  },
  tagActive: { borderColor: Brand.primary, backgroundColor: Brand.primarySoft },
  tagText: { ...Typography.smallMedium, color: Brand.textSecondary, fontWeight: '500' as const },
  tagTextActive: { color: Brand.primary, fontWeight: '700' as const },
  inputWrap: {
    borderWidth: 1.5, borderColor: Brand.border,
    borderRadius: Radius.lg, backgroundColor: Brand.offWhite, padding: Spacing.md,
  },
  input: { ...Typography.small, color: Brand.textPrimary, minHeight: 88, padding: 0 },
  charCount: { ...Typography.caption, color: Brand.textMuted, textAlign: 'right', marginTop: 6 },

  footer: {
    paddingHorizontal: Spacing.screen, paddingTop: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Brand.borderLight, gap: Spacing.sm,
  },
  submitBtn: {
    backgroundColor: Brand.navy, borderRadius: Radius.xl, paddingVertical: 16, alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnPressed: { opacity: 0.82 },
  submitText: { ...Typography.bodyMedium, color: Brand.white, fontWeight: '700' as const, letterSpacing: -0.2 },
  laterBtn: { alignItems: 'center', paddingVertical: 10 },
  laterText: { ...Typography.smallMedium, color: Brand.textMuted, fontWeight: '500' as const },
});
