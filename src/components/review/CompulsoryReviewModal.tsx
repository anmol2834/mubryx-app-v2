import React, { memo, useState, useCallback, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Brand, Typography, Spacing, Radius } from '@/constants/brand';
import { apiFetch } from '@/services/apiClient';
import { useCompulsoryReviewStore } from '@/store/compulsoryReviewStore';

const { height: SCREEN_H } = Dimensions.get('window');

// Smart Suggested Reviews based on Star Rating
const SUGGESTIONS_MAP: Record<number, string[]> = {
  5: [
    'Excellent service! Very professional and on time.',
    'Great work, super clean and fast!',
    'Technician was polite, expert, and thorough.',
    '10/10 service, highly recommended!',
  ],
  4: [
    'Good work, satisfied with the service.',
    'Technician was prompt and polite.',
    'Decent job, resolved the issue well.',
    'Satisfactory experience overall.',
  ],
  3: [
    'Average experience, could be better.',
    'Service took longer than expected.',
    'Satisfactory, but scope for improvement.',
    'Basic service provided.',
  ],
  2: [
    'Service quality was below expectations.',
    'Technician arrived late.',
    'Issue was not resolved properly.',
    'Professionalism needs improvement.',
  ],
  1: [
    'Unsatisfactory service experience.',
    'Technician was unprofessional and late.',
    'Service was incomplete.',
    'Need customer support assistance.',
  ],
};

function StarIcon({ filled, size = 42 }: { filled: boolean; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#FFC107' : 'none'}>
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke={filled ? '#FFC107' : '#D1D5DB'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CopyIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={Brand.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <Path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
    </Svg>
  );
}

function CheckCircleIcon() {
  return (
    <Svg width={56} height={56} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#16A34A" />
      <Path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export const CompulsoryReviewModal = memo(function CompulsoryReviewModal() {
  const insets = useSafeAreaInsets();
  const pendingBooking = useCompulsoryReviewStore((s) => s.pendingBooking);
  const isModalVisible = useCompulsoryReviewStore((s) => s.isModalVisible);
  const revealedHappyCode = useCompulsoryReviewStore((s) => s.revealedHappyCode);
  const setHappyCodeRevealed = useCompulsoryReviewStore((s) => s.setHappyCodeRevealed);
  const clearPendingReview = useCompulsoryReviewStore((s) => s.clearPendingReview);

  const [rating, setRating] = useState<number>(0);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const suggestions = useMemo(() => {
    if (rating === 0) return [];
    return SUGGESTIONS_MAP[rating] || SUGGESTIONS_MAP[5];
  }, [rating]);

  const handleRatingChange = useCallback((newRating: number) => {
    setRating(newRating);
    setSelectedSuggestion(null);
    setErrorMessage('');
  }, []);

  const handleSelectSuggestion = useCallback((text: string) => {
    setSelectedSuggestion(text);
    setReviewText(text);
    setErrorMessage('');
  }, []);

  const handleTextChange = useCallback((text: string) => {
    setReviewText(text);
    setErrorMessage('');
    if (selectedSuggestion && text !== selectedSuggestion) {
      setSelectedSuggestion(null);
    }
  }, [selectedSuggestion]);

  const isValidToSubmit = useMemo(() => {
    if (rating < 1) return false;
    if (selectedSuggestion) return true;
    return reviewText.trim().length >= 10;
  }, [rating, selectedSuggestion, reviewText]);

  const handleSubmitReview = useCallback(async () => {
    if (!pendingBooking?.bookingId || !isValidToSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await apiFetch<{ happyCode?: string }>(`/bookings/${pendingBooking.bookingId}/review`, {
        method: 'POST',
        body: {
          rating,
          comment: reviewText.trim(),
          suggestion: selectedSuggestion || undefined,
        },
      });

      if (res.ok && res.data?.happyCode) {
        await setHappyCodeRevealed(res.data.happyCode);
      } else {
        setErrorMessage(res.error || 'Failed to submit review. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to submit review. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [pendingBooking, isValidToSubmit, isSubmitting, rating, reviewText, selectedSuggestion, setHappyCodeRevealed]);

  const handleCopyHappyCode = useCallback(() => {
    if (revealedHappyCode) {
      Clipboard.setString(revealedHappyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [revealedHappyCode]);

  const handleDone = useCallback(async () => {
    await clearPendingReview();
  }, [clearPendingReview]);

  if (!isModalVisible || !pendingBooking) return null;

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => {
        // NON-DISMISSIBLE: Block back button on Android until review is finished
      }}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {/* Header handle indicator */}
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          {revealedHappyCode ? (
            /* ─────────────────────────────────────────────────────────────
             * REVEALED HAPPY CODE STATE (After Successful Review Submission)
             * ───────────────────────────────────────────────────────────── */
            <ScrollView contentContainerStyle={styles.happyCodeContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.successBadgeWrap}>
                <CheckCircleIcon />
              </View>

              <Text style={styles.successTitle}>Thank You for Your Review! 🎉</Text>
              <Text style={styles.successSubtitle}>
                Your review has been recorded. Here is your official service completion Happy Code:
              </Text>

              {/* Large Copyable Happy Code Display */}
              <View style={styles.codeCard}>
                <Text style={styles.codeLabel}>YOUR HAPPY CODE</Text>
                <View style={styles.codeDigitsRow}>
                  {revealedHappyCode.split('').map((digit, idx) => (
                    <View key={idx} style={styles.digitBox}>
                      <Text style={styles.digitText}>{digit}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopyHappyCode} activeOpacity={0.85}>
                  <CopyIcon />
                  <Text style={styles.copyBtnText}>{copied ? 'Copied to Clipboard!' : 'Copy Happy Code'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.shareInstructionsCard}>
                <Text style={styles.shareInstructionsText}>
                  Please share this 4-digit Happy Code with <Text style={styles.highlightText}>{pendingBooking.technicianName || 'your technician'}</Text> to complete your service.
                </Text>
              </View>

              <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.85}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            /* ─────────────────────────────────────────────────────────────
             * COMPULSORY REVIEW INPUT FORM STATE
             * ───────────────────────────────────────────────────────────── */
            <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Mandatory Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>How was your experience?</Text>
                <Text style={styles.headerSubtitle}>
                  <Text style={styles.techName}>{pendingBooking.technicianName || 'Technician'}</Text> • {pendingBooking.serviceTitle || 'Service Request'}
                </Text>
              </View>

              {/* Star Rating Section */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>TAP TO RATE (MANDATORY)</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => handleRatingChange(star)} activeOpacity={0.7} style={styles.starTouch}>
                      <StarIcon filled={star <= rating} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Smart Suggested Reviews */}
              {rating > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>SMART SUGGESTIONS (TAP TO AUTO-FILL)</Text>
                  <View style={styles.chipsWrap}>
                    {suggestions.map((chip, idx) => {
                      const isSelected = selectedSuggestion === chip;
                      return (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => handleSelectSuggestion(chip)}
                          style={[styles.chip, isSelected && styles.chipSelected]}
                          activeOpacity={0.85}>
                          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {isSelected ? '✓ ' : ''}{chip}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Text Area Input */}
              <View style={styles.section}>
                <View style={styles.inputHeader}>
                  <Text style={styles.sectionLabel}>YOUR DETAILED REVIEW</Text>
                  <Text style={styles.charCounter}>{reviewText.length}/300</Text>
                </View>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Write your review here... (minimum 10 characters)"
                    placeholderTextColor={Brand.textMuted}
                    value={reviewText}
                    onChangeText={handleTextChange}
                    multiline
                    numberOfLines={4}
                    maxLength={300}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Error Message Display */}
              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, (!isValidToSubmit || isSubmitting) && styles.submitBtnDisabled]}
                onPress={handleSubmitReview}
                disabled={!isValidToSubmit || isSubmitting}
                activeOpacity={0.85}>
                {isSubmitting ? (
                  <ActivityIndicator color={Brand.white} size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {rating === 0 ? 'Select a rating to proceed' : 'Submit Review & Get Happy Code'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 22, 40, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: SCREEN_H * 0.9,
    backgroundColor: Brand.white,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.2, shadowRadius: 16 },
      android: { elevation: 24 },
    }),
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 6,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },

  // ── Form State Styles ──
  formContainer: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    gap: Spacing.base,
  },
  header: {
    gap: 4,
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h3,
    color: Brand.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...Typography.bodyMedium,
    color: Brand.textSecondary,
    textAlign: 'center',
  },
  techName: {
    fontWeight: '700',
    color: Brand.primary,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Brand.textMuted,
    letterSpacing: 0.8,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  starTouch: {
    padding: 4,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Brand.border,
    backgroundColor: Brand.offWhite,
  },
  chipSelected: {
    borderColor: Brand.primary,
    backgroundColor: Brand.primarySoft,
  },
  chipText: {
    ...Typography.smallMedium,
    color: Brand.textSecondary,
  },
  chipTextSelected: {
    color: Brand.primary,
    fontWeight: '700',
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCounter: {
    fontSize: 11,
    color: Brand.textMuted,
  },
  inputWrap: {
    borderWidth: 1.5,
    borderColor: Brand.border,
    borderRadius: Radius.lg,
    backgroundColor: Brand.offWhite,
    padding: Spacing.md,
  },
  textInput: {
    ...Typography.small,
    color: Brand.textPrimary,
    minHeight: 80,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: Brand.primary,
    borderRadius: Radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitBtnText: {
    ...Typography.bodyMedium,
    color: Brand.white,
    fontWeight: '700',
  },

  // ── Happy Code Revealed State Styles ──
  happyCodeContainer: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  successBadgeWrap: {
    marginTop: Spacing.xs,
  },
  successTitle: {
    ...Typography.h2,
    color: Brand.textPrimary,
    fontWeight: '800',
    textAlign: 'center',
  },
  successSubtitle: {
    ...Typography.bodyMedium,
    color: Brand.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  codeCard: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.xs,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
  },
  codeDigitsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  digitBox: {
    width: 52,
    height: 60,
    borderRadius: Radius.lg,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#38BDF8',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#0284C7',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
  },
  copyBtnText: {
    ...Typography.bodyMedium,
    color: Brand.white,
    fontWeight: '700',
  },
  shareInstructionsCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    width: '100%',
  },
  shareInstructionsText: {
    ...Typography.smallMedium,
    color: '#166534',
    textAlign: 'center',
    lineHeight: 20,
  },
  highlightText: {
    fontWeight: '800',
    color: '#14532D',
  },
  doneBtn: {
    width: '100%',
    backgroundColor: Brand.primary,
    paddingVertical: 16,
    borderRadius: Radius.xl,
    alignItems: 'center',
  },
  doneBtnText: {
    ...Typography.bodyMedium,
    color: Brand.white,
    fontWeight: '700',
  },
});
