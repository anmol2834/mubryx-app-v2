// Zero Reanimated in this file — all animation removed per requirements.
// Checkbox uses plain React state for selected styling (no animated color interpolation).
// Card border/background use conditional StyleSheet — no useAnimatedStyle or useSharedValue.
// This fully eliminates the "Maximum call stack" crash that was caused by
// interpolateColor inside useAnimatedStyle being triggered during rapid state updates.

import { Brand, Radius, Spacing } from '@/constants/brand';
import { ServiceItem } from '@/constants/serviceDetail';
import { memo, useCallback } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';

// ─── Icons ────────────────────────────────────────────────────────────────────

function StarFull() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24"
      fill="#F9A825" stroke="#F9A825" strokeWidth={1}
      strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

function StarEmpty() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24"
      fill="none" stroke="#F9A825" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={Brand.textMuted} strokeWidth={1.8} />
      <Polyline points="12,7 12,12 15,15"
        stroke={Brand.textMuted} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronRight() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6"
        stroke={Brand.primary} strokeWidth={2.2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckMark() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
      <Polyline points="20,6 9,17 4,12"
        stroke={Brand.white} strokeWidth={2.8}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Simple star row
function StarRow({ rating }: { rating: string }) {
  const filled = Math.round(parseFloat(rating));
  return (
    <View style={starRowStyle.row}>
      {[1, 2, 3, 4, 5].map((i) =>
        i <= filled ? <StarFull key={i} /> : <StarEmpty key={i} />
      )}
    </View>
  );
}
const starRowStyle = StyleSheet.create({ row: { flexDirection: 'row', gap: 1.5 } });

// ─── Checkbox — plain View, NO Reanimated ─────────────────────────────────────

const Checkbox = memo(function Checkbox({
  selected,
  onToggle,
}: {
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      hitSlop={12}
      style={({ pressed }) => [
        cbStyle.box,
        selected ? cbStyle.boxSelected : cbStyle.boxUnselected,
        pressed && cbStyle.boxPressed,
      ]}>
      {selected && <CheckMark />}
    </Pressable>
  );
});

const cbStyle = StyleSheet.create({
  box: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxUnselected: {
    backgroundColor: Brand.white,
    borderColor: '#C0CDD8',
  },
  boxSelected: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  boxPressed: {
    opacity: 0.75,
  },
});

// ─── Service Card ─────────────────────────────────────────────────────────────

interface ServiceCardProps {
  item: ServiceItem;
  selected: boolean;
  onToggle: (id: string) => void;
  index: number;
}

export const ServiceCard = memo(function ServiceCard({
  item,
  selected,
  onToggle,
}: ServiceCardProps) {
  const handleToggle = useCallback(() => onToggle(item.id), [item.id, onToggle]);

  const discountPct = item.originalPrice
    ? Math.round((1 - item.price / item.originalPrice) * 100)
    : null;

  return (
    <View style={styles.outer}>
      {/* Card border changes color via plain conditional style — no Reanimated */}
      <View style={[styles.card, selected && styles.cardSelected]}>
        <Pressable
          onPress={handleToggle}
          style={({ pressed }) => [styles.inner, pressed && styles.innerPressed]}
          android_ripple={null}
          accessibilityLabel={item.name}>

          {/* Left: thumbnail */}
          <View style={styles.thumbWrap}>
            <Image 
              source={typeof item.image === 'string' ? { uri: item.image } : item.image} 
              style={styles.thumb} 
              resizeMode="cover" 
            />
          </View>

          {/* Center: text content */}
          <View style={styles.body}>
            <View style={styles.row1}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <View style={styles.durationTag}>
                <ClockIcon />
                <Text style={styles.durationText}>{item.duration}</Text>
              </View>
            </View>

            <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>

            <View style={styles.ratingRow}>
              <StarRow rating={item.rating} />
              <Text style={styles.ratingNum}>{item.rating}</Text>
              <Text style={styles.reviewCnt}>({item.reviewCount})</Text>
            </View>

            <View style={styles.highlightRow}>
              <Text style={styles.highlightTick}>{'✓ '}</Text>
              <Text style={styles.highlightText}>{item.successHighlight}</Text>
            </View>

            <View style={styles.viewDetailsRow}>
              <Text style={styles.viewDetails}>View Details</Text>
              <ChevronRight />
            </View>
          </View>

          {/* Right: price + checkbox */}
          <View style={styles.rightCol}>
            <View style={styles.priceBlock}>
              {discountPct !== null && (
                <Text style={styles.strikePrice}>₹{item.originalPrice}</Text>
              )}
              <Text style={styles.price}>₹{item.price}</Text>
            </View>
            <Checkbox selected={selected} onToggle={handleToggle} />
          </View>
        </Pressable>
      </View>
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const THUMB = 64;

const styles = StyleSheet.create({
  outer: {
    backgroundColor: Brand.white,
  },
  card: {
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.sm,
    backgroundColor: Brand.white,
    borderColor: Brand.borderLight,
  },
  // Selected state: blue border + very light blue tint background
  cardSelected: {
    borderColor: Brand.primary,
    backgroundColor: '#F5F9FF',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  innerPressed: {
    opacity: 0.9,
  },
  thumbWrap: {
    width: THUMB,
    height: THUMB,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: Brand.surface,
    flexShrink: 0,
    marginTop: 2,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  body: {
    flex: 1,
    gap: 5,
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 4,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700' as const,
    color: Brand.textPrimary,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  durationText: {
    fontSize: 11,
    color: Brand.textMuted,
    fontWeight: '500' as const,
  },
  desc: {
    fontSize: 12,
    color: Brand.textSecondary,
    lineHeight: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingNum: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Brand.textPrimary,
  },
  reviewCnt: {
    fontSize: 12,
    color: Brand.textMuted,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  highlightTick: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '700' as const,
    lineHeight: 17,
  },
  highlightText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600' as const,
    lineHeight: 17,
    flex: 1,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
  },
  viewDetails: {
    fontSize: 12,
    color: Brand.primary,
    fontWeight: '600' as const,
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexShrink: 0,
    minHeight: THUMB + 8,
    paddingTop: 2,
    gap: Spacing.sm,
  },
  priceBlock: {
    alignItems: 'flex-end',
    gap: 1,
  },
  strikePrice: {
    fontSize: 11,
    color: Brand.textMuted,
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Brand.textPrimary,
    letterSpacing: -0.3,
  },
});
