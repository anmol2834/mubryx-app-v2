import { Brand, Radius, Shadow, Spacing } from '@/constants/brand';
import type { CartItem } from '@/types/cart';
import { memo, useCallback } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';

function ClockIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
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

function WarrantyIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={Brand.textMuted} strokeWidth={1.8} />
      <Path
        d="M12 8v4l2 2"
        stroke={Brand.textMuted}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TrashIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="3,6 5,6 21,6"
        stroke={Brand.textMuted}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
        stroke={Brand.textMuted}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 11v6M14 11v6"
        stroke={Brand.textMuted}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
        stroke={Brand.textMuted}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckMarkGreen() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
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

export interface CartItemCardProps {
  item: CartItem;
  onRemove: (itemId: string) => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  disabled?: boolean;
}

export const CartItemCard = memo(function CartItemCard({
  item,
  onRemove,
  onUpdateQuantity,
  disabled,
}: CartItemCardProps) {
  const handleRemove = useCallback(() => {
    if (!disabled) onRemove(item.id);
  }, [disabled, item.id, onRemove]);

  const handleIncrement = useCallback(() => {
    if (!disabled && onUpdateQuantity) {
      onUpdateQuantity(item.id, item.quantity + 1);
    }
  }, [disabled, item.id, item.quantity, onUpdateQuantity]);

  const handleDecrement = useCallback(() => {
    if (!disabled && onUpdateQuantity) {
      if (item.quantity > 1) {
        onUpdateQuantity(item.id, item.quantity - 1);
      } else {
        onRemove(item.id);
      }
    }
  }, [disabled, item.id, item.quantity, onRemove, onUpdateQuantity]);

  const imageSource =
    typeof item.service.image === 'string'
      ? { uri: item.service.image }
      : item.service.image || require('@/assets/images/service-placeholder.png');

  return (
    <View style={styles.cardOuter}>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.imageWrap}>
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="cover"
              accessibilityLabel={item.service.title}
            />
          </View>

          <View style={styles.content}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={2}>
                {item.service.title}
              </Text>
              <Text style={styles.price}>₹{item.pricing.lineTotal}</Text>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <ClockIcon />
                <Text style={styles.metaText}>{item.service.duration || '45 mins'}</Text>
              </View>
              <View style={styles.metaChip}>
                <WarrantyIcon />
                <Text style={styles.metaText}>30-day warranty</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <CheckMarkGreen />
              <Text style={styles.featureText}>Free Inspection</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            {onUpdateQuantity && (
              <View style={[styles.stepperContainer, disabled && styles.disabledContainer]}>
                <Pressable
                  style={styles.stepperBtn}
                  onPress={handleDecrement}
                  disabled={disabled}
                  accessibilityLabel="Decrease quantity"
                >
                  <Text style={[styles.stepperText, disabled && styles.disabledText]}>-</Text>
                </Pressable>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <Pressable
                  style={styles.stepperBtn}
                  onPress={handleIncrement}
                  disabled={disabled}
                  accessibilityLabel="Increase quantity"
                >
                  <Text style={[styles.stepperText, disabled && styles.disabledText]}>+</Text>
                </Pressable>
              </View>
            )}

            <Pressable
              style={styles.removeBtn}
              onPress={handleRemove}
              disabled={disabled}
              hitSlop={8}
              accessibilityLabel={`Remove ${item.service.title}`}
            >
              <TrashIcon />
              <Text style={[styles.removeText, disabled && styles.disabledText]}>Remove</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  cardOuter: {
    marginHorizontal: Spacing.screen,
  },
  card: {
    backgroundColor: Brand.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    ...Shadow.card,
  },
  topRow: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Brand.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: Brand.textPrimary,
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Brand.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Brand.textMuted,
    fontWeight: '400' as const,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Brand.borderLight,
  },
  featuresList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500' as const,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  disabledText: {
    color: Brand.textMuted,
  },
  stepperBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stepperText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Brand.textPrimary,
  },
  quantityText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Brand.textPrimary,
    paddingHorizontal: 6,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  removeText: {
    fontSize: 12,
    color: Brand.textMuted,
    fontWeight: '500' as const,
  },
});
