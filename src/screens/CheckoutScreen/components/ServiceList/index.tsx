import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import type { CartItem } from '@/types/cart';
import { memo, useCallback } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';

// ─── Icons ────────────────────────────────────────────────────────────────────

function ClockIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={Brand.textMuted} strokeWidth={1.8} />
      <Polyline
        points="12,7 12,12 15,15"
        stroke={Brand.textMuted}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ShieldIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="#2E7D32"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TrashIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="3,6 5,6 21,6"
        stroke={Brand.error}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
        stroke={Brand.error}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
        stroke={Brand.error}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckMark() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="20,6 9,17 4,12"
        stroke="#2E7D32"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Service Row Item ─────────────────────────────────────────────────────────

interface ServiceRowProps {
  item: CartItem;
  onRemove: (id: string) => void;
}

const ServiceRow = memo(function ServiceRow({ item, onRemove }: ServiceRowProps) {
  const handleRemove = useCallback(() => onRemove(item.id), [item.id, onRemove]);
  const title = item.service?.title || 'Service';
  const price = item.pricing?.unitPrice ?? item.pricing?.lineTotal ?? 0;
  const duration = item.service?.duration || '45–60 min';
  const imageProp = item.service?.image
    ? { uri: item.service.image }
    : require('@/assets/images/service-placeholder.png');

  return (
    <View style={rowStyles.card}>
      <View style={rowStyles.imageWrap}>
        <Image source={imageProp} style={rowStyles.image} resizeMode="cover" />
      </View>
      <View style={rowStyles.content}>
        <View style={rowStyles.topRow}>
          <Text style={rowStyles.name} numberOfLines={2}>{title}</Text>
          <Text style={rowStyles.price}>₹{price}</Text>
        </View>
        <View style={rowStyles.metaRow}>
          <View style={rowStyles.chip}>
            <ClockIcon />
            <Text style={rowStyles.chipText}>{duration}</Text>
          </View>
          <View style={rowStyles.chip}>
            <ShieldIcon />
            <Text style={[rowStyles.chipText, { color: '#2E7D32' }]}>30-day warranty</Text>
          </View>
        </View>
        <View style={rowStyles.highlightRow}>
          <CheckMark />
          <Text style={rowStyles.highlight}>30-Day Service Warranty</Text>
        </View>
        <Pressable
          style={({ pressed }) => [rowStyles.removeBtn, pressed && rowStyles.removeBtnPressed]}
          onPress={handleRemove}
          hitSlop={8}
          accessibilityLabel={`Remove ${title}`}
          accessibilityRole="button">
          <TrashIcon />
          <Text style={rowStyles.removeText}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
});

const rowStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  imageWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Brand.surface,
    flexShrink: 0,
  },
  image: { width: '100%', height: '100%' },
  content: { flex: 1, gap: 5 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    fontWeight: '700',
    lineHeight: 20,
  },
  price: {
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    fontWeight: '700',
    flexShrink: 0,
  },
  metaRow: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  chipText: { ...Typography.caption, color: Brand.textMuted },
  highlightRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  highlight: { ...Typography.caption, color: '#2E7D32', fontWeight: '600' },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  removeBtnPressed: { opacity: 0.5 },
  removeText: { ...Typography.caption, color: Brand.error, fontWeight: '600' },
});

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyServices({ onBrowse }: { onBrowse: () => void }) {
  return (
    <View style={emptyStyles.wrap}>
      <Text style={emptyStyles.emoji}>🔧</Text>
      <Text style={emptyStyles.title}>No services selected</Text>
      <Text style={emptyStyles.sub}>Go back and add services to continue.</Text>
      <Pressable
        style={({ pressed }) => [emptyStyles.btn, pressed && emptyStyles.btnPressed]}
        onPress={onBrowse}>
        <Text style={emptyStyles.btnText}>Browse Services</Text>
      </Pressable>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emoji: { fontSize: 36 },
  title: { ...Typography.h4, color: Brand.textPrimary },
  sub: { ...Typography.small, color: Brand.textMuted, textAlign: 'center' },
  btn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: Brand.primarySoft,
    borderWidth: 1,
    borderColor: Brand.primary,
  },
  btnPressed: { opacity: 0.65 },
  btnText: { ...Typography.smallMedium, color: Brand.primary, fontWeight: '700' },
});

// ─── Service List ─────────────────────────────────────────────────────────────

interface ServiceListProps {
  items: CartItem[];
  onRemove: (id: string) => void;
  onBrowse: () => void;
}

const Separator = memo(function Separator() {
  return <View style={{ height: 1, backgroundColor: Brand.borderLight }} />;
});

export const ServiceList = memo(function ServiceList({
  items,
  onRemove,
  onBrowse,
}: ServiceListProps) {
  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => <ServiceRow item={item} onRemove={onRemove} />,
    [onRemove]
  );
  const keyExtractor = useCallback((item: CartItem) => item.id, []);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Selected Services</Text>
        {items.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {items.length} {items.length === 1 ? 'service' : 'services'}
            </Text>
          </View>
        )}
      </View>

      {items.length === 0 ? (
        <EmptyServices onBrowse={onBrowse} />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={Separator}
          scrollEnabled={false}
          removeClippedSubviews={false}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.screen,
    backgroundColor: Brand.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  heading: {
    ...Typography.h4,
    color: Brand.textPrimary,
    letterSpacing: -0.2,
  },
  countBadge: {
    backgroundColor: Brand.primarySoft,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Brand.primary + '33',
  },
  countText: {
    ...Typography.caption,
    color: Brand.primary,
    fontWeight: '700',
  },
});
