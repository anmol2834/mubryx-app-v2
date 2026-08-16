import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import type { CartItem } from '@/types/cart';
import { memo } from 'react';
import {
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
import Svg, { Path } from 'react-native-svg';

function CloseIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={Brand.textPrimary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronDownIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke={Brand.textSecondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface PriceBreakdownModalProps {
  visible: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  gst: number;
  discount: number;
  grandTotal: number;
}

const formatPrice = (val: number) =>
  Number.isInteger(val) ? `₹${val}` : `₹${val.toFixed(2)}`;

export const PriceBreakdownModal = memo(function PriceBreakdownModal({
  visible,
  onClose,
  items,
  subtotal,
  gst,
  discount,
  grandTotal,
}: PriceBreakdownModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, Spacing.base) + Spacing.sm },
        ]}>
        {/* Handle Bar */}
        <Pressable onPress={onClose} style={styles.handleWrap}>
          <View style={styles.handle} />
        </Pressable>

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Price Breakdown</Text>
          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            onPress={onClose}
            accessibilityLabel="Close price breakdown">
            <CloseIcon />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Selected Services list */}
          <Text style={styles.sectionLabel}>Selected Services</Text>
          <View style={styles.card}>
            {items.map((item, idx) => {
              const name = item.service?.title || (item as any).title || 'Service';
              return (
                <View key={item.id || idx} style={styles.itemRow}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {name} {item.quantity > 1 ? `× ${item.quantity}` : ''}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.unitPrice * item.quantity)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Detailed Calculations */}
          <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>
            Bill Details
          </Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Subtotal (Selected Services)</Text>
              <Text style={styles.rowValue}>{formatPrice(subtotal)}</Text>
            </View>

            {discount > 0 && (
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: Brand.success }]}>
                  Coupon Savings
                </Text>
                <Text style={[styles.rowValue, { color: Brand.success }]}>
                  -{formatPrice(discount)}
                </Text>
              </View>
            )}

            <View style={styles.row}>
              <Text style={styles.rowLabel}>GST (18%)</Text>
              <Text style={styles.rowValue}>{formatPrice(gst)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.rowTotal}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalPrice}>{formatPrice(grandTotal)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Done / Close Button */}
        <Pressable
          style={({ pressed }) => [styles.doneBtn, pressed && styles.pressed]}
          onPress={onClose}>
          <Text style={styles.doneBtnText}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 22, 40, 0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Brand.white,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.screen,
    paddingTop: 8,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: { elevation: 20 },
    }),
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Brand.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
  },
  headerTitle: {
    ...Typography.h3,
    color: Brand.textPrimary,
  },
  closeBtn: {
    padding: 6,
    borderRadius: Radius.full,
    backgroundColor: Brand.surface,
  },
  scroll: {
    maxHeight: 320,
  },
  scrollContent: {
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Brand.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  card: {
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    gap: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    flex: 1,
    paddingRight: Spacing.sm,
  },
  itemPrice: {
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    ...Typography.smallMedium,
    color: Brand.textSecondary,
  },
  rowValue: {
    ...Typography.smallMedium,
    color: Brand.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Brand.borderLight,
    marginVertical: 4,
  },
  rowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    fontWeight: '700',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Brand.primary,
    letterSpacing: -0.3,
  },
  doneBtn: {
    backgroundColor: Brand.navy,
    borderRadius: Radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.base,
  },
  doneBtnText: {
    ...Typography.bodyMedium,
    color: Brand.white,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
