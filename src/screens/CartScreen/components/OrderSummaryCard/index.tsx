import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import type { CartItem, CartSummary } from '@/types/cart';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';

function ShieldIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="#00897B"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="20,6 9,17 4,12"
        stroke="#2E7D32"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke="#00897B" strokeWidth={1.8} />
      <Polyline
        points="12,7 12,12 15,15"
        stroke="#00897B"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const ServiceCountBadge = memo(function ServiceCountBadge({ count }: { count: number }) {
  return (
    <View style={badge.pill}>
      <Text style={badge.text}>
        {count} {count === 1 ? 'service' : 'services'}
      </Text>
    </View>
  );
});

const badge = StyleSheet.create({
  pill: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  text: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Brand.textSecondary,
    letterSpacing: 0.2,
  },
});

const ServiceRow = memo(function ServiceRow({
  name,
  price,
  quantity,
}: {
  name: string;
  price: number;
  quantity: number;
}) {
  return (
    <View style={serviceRow.row}>
      <Text style={serviceRow.name} numberOfLines={1}>
        {name} {quantity > 1 ? `x${quantity}` : ''}
      </Text>
      <Text style={serviceRow.price}>₹{price}</Text>
    </View>
  );
});

const serviceRow = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  name: {
    flex: 1,
    fontSize: 14,
    color: Brand.textSecondary,
    fontWeight: '400' as const,
    marginRight: Spacing.sm,
  },
  price: {
    fontSize: 14,
    color: Brand.textPrimary,
    fontWeight: '600' as const,
  },
});

const PriceRow = memo(function PriceRow({
  label,
  value,
  isDiscount,
  isTotal,
}: {
  label: string;
  value: number;
  isDiscount?: boolean;
  isTotal?: boolean;
}) {
  return (
    <View style={priceRow.row}>
      <Text style={[priceRow.label, isTotal && priceRow.totalLabel]}>{label}</Text>
      <Text
        style={[
          priceRow.value,
          isDiscount && priceRow.discountText,
          isTotal && priceRow.totalValue,
        ]}
      >
        {isDiscount ? `-₹${value}` : `₹${value}`}
      </Text>
    </View>
  );
});

const priceRow = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  label: {
    fontSize: 14,
    color: Brand.textSecondary,
    fontWeight: '400' as const,
  },
  totalLabel: {
    fontSize: 16,
    color: Brand.textPrimary,
    fontWeight: '700' as const,
  },
  value: {
    fontSize: 14,
    color: Brand.textPrimary,
    fontWeight: '500' as const,
  },
  discountText: {
    color: '#2E7D32',
    fontWeight: '600' as const,
  },
  totalValue: {
    fontSize: 18,
    color: Brand.textPrimary,
    fontWeight: '800' as const,
    letterSpacing: -0.4,
  },
});

const BenefitItem = memo(function BenefitItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <View style={benefit.row}>
      {icon}
      <Text style={benefit.text}>{text}</Text>
    </View>
  );
});

const benefit = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 3,
  },
  text: {
    fontSize: 13,
    color: Brand.textSecondary,
    fontWeight: '400' as const,
  },
});

interface OrderSummaryCardProps {
  items: CartItem[];
  summary: CartSummary;
}

export const OrderSummaryCard = memo(function OrderSummaryCard({
  items,
  summary,
}: OrderSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Order Summary</Text>
        <ServiceCountBadge count={items.length} />
      </View>

      <View style={styles.servicesList}>
        {items.map((item) => (
          <ServiceRow
            key={item.id}
            name={item.service?.title || 'Service'}
            price={item.pricing?.lineTotal ?? item.lineTotal ?? 0}
            quantity={item.quantity}
          />
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.priceSection}>
        <PriceRow label="Subtotal" value={summary.subtotal} />
        {summary.discount > 0 && (
          <PriceRow label="Discount" value={summary.discount} isDiscount />
        )}
        <PriceRow label="Taxes (GST)" value={summary.tax} />
        <PriceRow label="Platform Fee" value={summary.platformFee ?? 0} />
      </View>

      <View style={styles.totalDivider} />
      <PriceRow label="Total" value={summary.total} isTotal />

      <View style={styles.benefitsSection}>
        <BenefitItem icon={<ShieldIcon />} text="30-day service warranty" />
        <BenefitItem icon={<CheckIcon />} text="Verified technicians" />
        <BenefitItem icon={<ClockIcon />} text="On-time service guarantee" />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.screen,
    backgroundColor: Brand.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    ...Shadow.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  heading: {
    ...Typography.h3,
    color: Brand.textPrimary,
    letterSpacing: -0.3,
  },
  servicesList: {
    gap: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Brand.borderLight,
    marginVertical: Spacing.md,
  },
  priceSection: {
    gap: 2,
  },
  totalDivider: {
    height: 1,
    backgroundColor: Brand.border,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  benefitsSection: {
    marginTop: Spacing.base,
    gap: 2,
  },
});
