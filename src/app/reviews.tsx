import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar,
  Pressable, TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Brand, Typography, Spacing, Radius, Shadow } from '@/constants/brand';

// ─── Reviews data ─────────────────────────────────────────────────────────────
const INITIAL_REVIEWS = [
  {
    id: 'rev1', name: 'Priya Sharma', avatar: 'PS', avatarColor: '#1565C0',
    service: 'AC Repair', rating: 5, date: '25 Jul 2025',
    text: 'Excellent service! The technician arrived on time and fixed my AC in under an hour. Very professional and thorough.',
  },
  {
    id: 'rev2', name: 'Rahul Verma', avatar: 'RV', avatarColor: '#00695C',
    service: 'Refrigerator Service', rating: 5, date: '20 Jul 2025',
    text: 'Amazing experience. Transparent pricing, genuine parts used. My fridge is working perfectly now. Highly recommended!',
  },
  {
    id: 'rev3', name: 'Anita Patel', avatar: 'AP', avatarColor: '#6A1B9A',
    service: 'Washing Machine', rating: 4, date: '18 Jul 2025',
    text: 'Booked at 9 AM, technician arrived by 11 AM. Fixed the leak issue properly with 90-day warranty. Will use again.',
  },
  {
    id: 'rev4', name: 'Suresh Nair', avatar: 'SN', avatarColor: '#E65100',
    service: 'Electrician', rating: 5, date: '14 Jul 2025',
    text: 'Very skilled electrician. Identified the short circuit issue quickly and resolved it safely. Clean work, no mess left behind.',
  },
  {
    id: 'rev5', name: 'Meena Joshi', avatar: 'MJ', avatarColor: '#C2185B',
    service: 'TV Repair', rating: 4, date: '08 Jul 2025',
    text: 'TV screen issue fixed in 45 minutes. Good pricing and quick service. The technician explained everything clearly.',
  },
  {
    id: 'rev6', name: 'Arun Mishra', avatar: 'AM', avatarColor: '#2E7D32',
    service: 'Water Purifier', rating: 5, date: '02 Jul 2025',
    text: 'RO service was done very professionally. Filters replaced on time and water quality improved noticeably. 5 stars!',
  },
];

function StarIcon({ filled, size = 20 }: { filled: boolean; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? '#FFC107' : 'none'} stroke="#FFC107" strokeWidth={1.5}>
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} filled={i <= rating} size={size} />)}
    </View>
  );
}

function IconReviews() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24"
      fill={Brand.primary} fillOpacity={0.85} stroke={Brand.primary} strokeWidth={1.5}>
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

function IconClose() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke={Brand.textSecondary} strokeWidth={2.2} strokeLinecap="round">
      <Path d="M18 6L6 18M6 6l12 12" />
    </Svg>
  );
}

export default function ReviewsScreen() {
  const insets = useSafeAreaInsets();
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [serviceName, setServiceName] = useState('');

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  const handleSubmit = () => {
    if (!reviewText.trim() || selectedRating === 0) return;
    const newReview = {
      id: `rev${Date.now()}`,
      name: 'You',
      avatar: 'YO',
      avatarColor: Brand.primary,
      service: serviceName || 'General',
      rating: selectedRating,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      text: reviewText.trim(),
    };
    setReviews([newReview, ...reviews]);
    setModalVisible(false);
    setReviewText('');
    setSelectedRating(0);
    setServiceName('');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Brand.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={styles.iconBadge}><IconReviews /></View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Rating summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.avgRating}>{avgRating}</Text>
            <StarRow rating={Math.round(parseFloat(avgRating))} size={18} />
            <Text style={styles.totalReviews}>{reviews.length} reviews</Text>
          </View>
          <View style={styles.summaryRight}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter(r => r.rating === star).length;
              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <View key={star} style={styles.barRow}>
                  <Text style={styles.barLabel}>{star}</Text>
                  <StarIcon filled size={11} />
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.barCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Add review button */}
        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addBtnText}>+ Write a Review</Text>
        </Pressable>

        {/* Review cards */}
        {reviews.map((rev) => (
          <View key={rev.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={[styles.avatar, { backgroundColor: rev.avatarColor }]}>
                <Text style={styles.avatarText}>{rev.avatar}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewName}>{rev.name}</Text>
                <Text style={styles.reviewService}>{rev.service}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 3 }}>
                <StarRow rating={rev.rating} size={13} />
                <Text style={styles.reviewDate}>{rev.date}</Text>
              </View>
            </View>
            <Text style={styles.reviewText}>{rev.text}</Text>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Review Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent statusBarTranslucent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { paddingBottom: insets.bottom + Spacing.base }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Write a Review</Text>
                <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                  <IconClose />
                </Pressable>
              </View>

              {/* Star picker */}
              <Text style={styles.fieldLabel}>Your Rating</Text>
              <View style={styles.starPicker}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Pressable key={i} onPress={() => setSelectedRating(i)} hitSlop={6}>
                    <StarIcon filled={i <= selectedRating} size={36} />
                  </Pressable>
                ))}
              </View>

              {/* Service name */}
              <Text style={styles.fieldLabel}>Service (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. AC Repair, Plumbing..."
                placeholderTextColor={Brand.textMuted}
                value={serviceName}
                onChangeText={setServiceName}
              />

              {/* Review text */}
              <Text style={styles.fieldLabel}>Your Review</Text>
              <TextInput
                style={[styles.input, styles.inputMulti]}
                placeholder="Share your experience..."
                placeholderTextColor={Brand.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={reviewText}
                onChangeText={setReviewText}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.submitBtn,
                  (!reviewText.trim() || selectedRating === 0) && styles.submitBtnDisabled,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handleSubmit}
                disabled={!reviewText.trim() || selectedRating === 0}
              >
                <Text style={styles.submitBtnText}>Submit Review</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.offWhite },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen, paddingVertical: Spacing.base,
    backgroundColor: Brand.white, borderBottomWidth: 1, borderBottomColor: Brand.borderLight,
  },
  headerTitle: { ...Typography.h2, color: Brand.textPrimary },
  iconBadge: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: '#FFF8E1', alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.screen, gap: Spacing.md },

  summaryCard: {
    backgroundColor: Brand.white, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Brand.borderLight,
    padding: Spacing.base, flexDirection: 'row', gap: Spacing.lg,
    ...Shadow.card,
  },
  summaryLeft: { alignItems: 'center', justifyContent: 'center', gap: 6, minWidth: 80 },
  avgRating: { fontSize: 40, fontWeight: '700', color: Brand.textPrimary, lineHeight: 48 },
  totalReviews: { ...Typography.caption, color: Brand.textMuted },
  summaryRight: { flex: 1, justifyContent: 'center', gap: 5 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  barLabel: { ...Typography.caption, color: Brand.textSecondary, width: 10, textAlign: 'right' },
  barTrack: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: Brand.borderLight, overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: '#FFC107', borderRadius: 3 },
  barCount: { ...Typography.caption, color: Brand.textMuted, width: 14, textAlign: 'right' },

  addBtn: {
    backgroundColor: Brand.primary, borderRadius: Radius.md,
    paddingVertical: Spacing.md, alignItems: 'center',
    ...Shadow.md,
  },
  addBtnText: { ...Typography.h4, color: Brand.white, fontWeight: '700' },

  reviewCard: {
    backgroundColor: Brand.white, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Brand.borderLight,
    padding: Spacing.md, gap: Spacing.sm, ...Shadow.card,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: Brand.white },
  reviewName: { ...Typography.smallMedium, color: Brand.textPrimary, fontWeight: '700' },
  reviewService: { ...Typography.caption, color: Brand.textMuted, marginTop: 1 },
  reviewDate: { ...Typography.caption, color: Brand.textMuted },
  reviewText: { ...Typography.small, color: Brand.textSecondary, lineHeight: 20 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Brand.white,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.screen,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.lg,
  },
  modalTitle: { ...Typography.h3, color: Brand.textPrimary },
  fieldLabel: {
    ...Typography.smallMedium, color: Brand.textSecondary,
    fontWeight: '600', marginBottom: Spacing.sm, marginTop: Spacing.sm,
  },
  starPicker: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  input: {
    borderWidth: 1.5, borderColor: Brand.borderLight,
    borderRadius: Radius.md, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, ...Typography.body,
    color: Brand.textPrimary, backgroundColor: Brand.white,
  },
  inputMulti: { height: 100, paddingTop: Spacing.md },
  submitBtn: {
    marginTop: Spacing.lg, backgroundColor: Brand.primary,
    borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: Brand.textMuted },
  submitBtnText: { ...Typography.h4, color: Brand.white, fontWeight: '700' },
});
