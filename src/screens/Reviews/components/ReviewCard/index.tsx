import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo, useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import type { MyReview } from '../../mock/types';

// ─── Icons ────────────────────────────────────────────────────────────────────

function StarFilled({ size = 13 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="#FFC107">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

function StarEmpty({ size = 13 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke={Brand.border} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  );
}

function VerifiedBadge() {
  return (
    <View style={s.verifiedDot}>
      <Svg width={8} height={8} viewBox="0 0 24 24" fill="none">
        <Polyline points="20 6 9 17 4 12" stroke={Brand.white} strokeWidth="3.5"
          strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  review: MyReview;
}

const MAX_CHARS = 160;

export const ReviewCard = memo(function ReviewCard({ review }: Props) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = useCallback(() => setExpanded((v) => !v), []);

  const isLong = review.reviewText.length > MAX_CHARS;
  const displayText = isLong && !expanded
    ? review.reviewText.slice(0, MAX_CHARS) + '...'
    : review.reviewText;

  return (
    <View style={s.card}>
      {/* ── Service header ── */}
      <View style={s.serviceRow}>
        <View style={s.serviceIconWrap}>
          <Text style={s.serviceIcon}>{review.serviceIcon}</Text>
        </View>
        <View style={s.serviceInfo}>
          <Text style={s.serviceName}>{review.serviceName}</Text>
        </View>
        {/* Star rating top-right */}
        <View style={s.ratingCol}>
          <View style={s.starsRow}>
            {Array.from({ length: 5 }).map((_, i) =>
              i < review.rating ? <StarFilled key={i} /> : <StarEmpty key={i} />
            )}
          </View>
          <Text style={s.ratingNum}>{review.rating}.0</Text>
        </View>
      </View>

      {/* ── Booking meta ── */}
      <View style={s.metaRow}>
        <View style={s.metaChip}>
          <Text style={s.metaChipText}>#{review.bookingId}</Text>
        </View>
        <Text style={s.metaDot}>·</Text>
        <Text style={s.metaDate}>{review.completedDate}</Text>
        {review.updatedAt && (
          <>
            <Text style={s.metaDot}>·</Text>
            <Text style={s.metaEdited}>Edited</Text>
          </>
        )}
      </View>

      {/* ── Engineer row ── */}
      <View style={s.engineerRow}>
        <View style={s.engineerAvatarWrap}>
          <View style={[s.engineerAvatar, { backgroundColor: review.engineer.avatarColor }]}>
            <Text style={s.engineerAvatarText}>{review.engineer.avatarInitials}</Text>
          </View>
          {review.engineer.isVerified && <VerifiedBadge />}
        </View>
        <View style={s.engineerInfo}>
          <Text style={s.engineerName}>{review.engineer.name}</Text>
          <Text style={s.engineerRating}>★ {review.engineer.rating} · Engineer</Text>
        </View>
      </View>

      {/* ── Review text ── */}
      {review.reviewText.length > 0 && (
        <View style={s.reviewTextWrap}>
          <Text style={s.reviewText}>{displayText}</Text>
          {isLong && (
            <Pressable onPress={toggleExpand} hitSlop={8}>
              <Text style={s.readMore}>{expanded ? 'Show less' : 'Read more'}</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* ── Tags ── */}
      {review.tags.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tagsRow}>
          {review.tags.map((tag) => (
            <View key={tag} style={s.tag}>
              <Text style={s.tagText}>{tag}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── Review images (future) ── */}
      {review.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.imagesRow}>
          {review.images.map((img) => (
            <View key={img.id} style={s.imagePlaceholder}>
              <Text style={s.imagePlaceholderText}>📷</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── Footer ── */}
      <View style={s.footer}>
        <Text style={s.createdAt}>{review.createdAt}</Text>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  card: {
    backgroundColor: Brand.white,
    marginHorizontal: Spacing.screen,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    ...Shadow.card,
  },
  // Service header
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  serviceIconWrap: {
    width: 46, height: 46,
    borderRadius: Radius.md,
    backgroundColor: Brand.primarySoft,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  serviceIcon: { fontSize: 22 },
  serviceInfo: { flex: 1, gap: 3, paddingTop: 2 },
  serviceName: {
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  ratingCol: { alignItems: 'flex-end', gap: 3 },
  starsRow: { flexDirection: 'row', gap: 1 },
  ratingNum: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Brand.textSecondary,
  },
  // Booking meta
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  metaChip: {
    backgroundColor: Brand.surface,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  metaChipText: { fontSize: 10, fontWeight: '600' as const, color: Brand.textSecondary },
  metaDot: { ...Typography.caption, color: Brand.textMuted },
  metaDate: { ...Typography.caption, color: Brand.textMuted },
  metaEdited: { ...Typography.caption, color: Brand.primary, fontWeight: '600' as const },
  // Engineer
  engineerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  engineerAvatarWrap: { position: 'relative' },
  engineerAvatar: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  engineerAvatarText: { fontSize: 11, fontWeight: '700' as const, color: Brand.white },
  verifiedDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 13, height: 13, borderRadius: 7,
    backgroundColor: Brand.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Brand.white,
  },
  engineerInfo: { flex: 1, gap: 1 },
  engineerName: { ...Typography.smallMedium, color: Brand.textPrimary, fontWeight: '600' as const },
  engineerRating: { ...Typography.caption, color: Brand.textMuted },
  // Review text
  reviewTextWrap: { gap: 4 },
  reviewText: { ...Typography.small, color: Brand.textSecondary, lineHeight: 20 },
  readMore: { ...Typography.caption, color: Brand.primary, fontWeight: '600' as const },
  // Tags
  tagsRow: { gap: Spacing.xs },
  tag: {
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Brand.primarySoft,
    borderWidth: 1, borderColor: Brand.primary + '30',
  },
  tagText: { fontSize: 10, color: Brand.primary, fontWeight: '600' as const },
  // Images
  imagesRow: { gap: Spacing.sm },
  imagePlaceholder: {
    width: 64, height: 64, borderRadius: Radius.md,
    backgroundColor: Brand.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Brand.borderLight,
  },
  imagePlaceholderText: { fontSize: 20 },
  // Footer
  footer: {
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Brand.borderLight,
  },
  createdAt: { ...Typography.caption, color: Brand.textMuted },
});
