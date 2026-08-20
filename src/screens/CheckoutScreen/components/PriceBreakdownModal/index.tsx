import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import type { CartItem } from '@/types/cart';
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
import Svg, { Path } from 'react-native-svg';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_H * 0.72;

function XIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={Brand.textSecondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ReceiptIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 8h8M8 12h8M8 16h5"
        stroke={color}
        strokeWidth={1.8}
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
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(SHEET_HEIGHT);
      backdropAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[sheetS.backdrop, { opacity: backdropAnim }]} />
      </TouchableWithoutFeedback>

      {/* Sheet panel */}
      <Animated.View
        style={[
          sheetS.sheet,
          { paddingBottom: insets.bottom + 16 },
          { transform: [{ translateY: slideAnim }] },
        ]}>
        {/* Handle */}
        <View style={sheetS.handleWrap}>
          <View style={sheetS.handle} />
        </View>

        {/* Header */}
        <View style={sheetS.header}>
          <View style={sheetS.headerLeft}>
            <ReceiptIcon color={Brand.primary} />
            <Text style={sheetS.headerTitle}>Price Breakdown</Text>
          </View>
          <Pressable style={sheetS.closeBtn} onPress={handleClose} hitSlop={8} android_ripple={null}>
            <XIcon />
          </Pressable>
        </View>

        <ScrollView
          style={sheetS.scrollArea}
          contentContainerStyle={sheetS.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Selected Services list */}
          <Text style={sheetS.sectionLabel}>Selected Services</Text>
          <View style={sheetS.card}>
            {items.map((item, idx) => {
              const name = item.service?.title || (item as any).title || 'Service';
              return (
                <View key={item.id || idx} style={sheetS.itemRow}>
                  <Text style={sheetS.itemName} numberOfLines={1}>
                    {name} {item.quantity > 1 ? `× ${item.quantity}` : ''}
                  </Text>
                  <Text style={sheetS.itemPrice}>
                    {formatPrice(item.unitPrice * item.quantity)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Detailed Calculations */}
          <Text style={[sheetS.sectionLabel, { marginTop: Spacing.base }]}>
            Bill Details
          </Text>
          <View style={sheetS.card}>
            <View style={sheetS.row}>
              <Text style={sheetS.rowLabel}>Subtotal (Selected Services)</Text>
              <Text style={sheetS.rowValue}>{formatPrice(subtotal)}</Text>
            </View>

            {discount > 0 && (
              <View style={sheetS.row}>
                <Text style={[sheetS.rowLabel, { color: Brand.success }]}>
                  Coupon Savings
                </Text>
                <Text style={[sheetS.rowValue, { color: Brand.success }]}>
                  -{formatPrice(discount)}
                </Text>
              </View>
            )}

            <View style={sheetS.row}>
              <Text style={sheetS.rowLabel}>GST (18%)</Text>
              <Text style={sheetS.rowValue}>{formatPrice(gst)}</Text>
            </View>

            <View style={sheetS.divider} />

            <View style={sheetS.rowTotal}>
              <Text style={sheetS.totalLabel}>Total Amount</Text>
              <Text style={sheetS.totalPrice}>{formatPrice(grandTotal)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={sheetS.footer}>
          <Pressable style={sheetS.confirmBtn} onPress={handleClose} android_ripple={null}>
            <Text style={sheetS.confirmText}>Got It</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
});

const sheetS = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,22,40,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: Brand.white,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
      },
      android: { elevation: 24 },
    }),
  },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Brand.border,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Brand.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerTitle: { ...Typography.h4, color: Brand.textPrimary, fontWeight: '700' },
  closeBtn: {
    width: 34, height: 34, borderRadius: Radius.full,
    backgroundColor: Brand.surface, alignItems: 'center', justifyContent: 'center',
  },
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.screen, paddingTop: Spacing.base, paddingBottom: Spacing.sm },
  sectionLabel: {
    ...Typography.caption, color: Brand.textMuted, textTransform: 'uppercase',
    letterSpacing: 0.8, fontWeight: '700', marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Brand.white,
    borderRadius: Radius.xl,
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
  footer: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Brand.borderLight,
  },
  confirmBtn: {
    backgroundColor: Brand.navy,
    borderRadius: Radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmText: {
    ...Typography.bodyMedium,
    color: Brand.white,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
