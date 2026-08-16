import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import type { PaymentMethod } from '@/screens/CheckoutScreen/hooks/useCheckout';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';

// ─── Icons ────────────────────────────────────────────────────────────────────

function UpiIcon({ active, disabled }: { active: boolean; disabled?: boolean }) {
  const c = disabled ? Brand.textMuted : active ? Brand.primary : Brand.textMuted;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L2 7l10 5 10-5-10-5z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M2 17l10 5 10-5" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 12l10 5 10-5" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CardIcon({ active, disabled }: { active: boolean; disabled?: boolean }) {
  const c = disabled ? Brand.textMuted : active ? Brand.primary : Brand.textMuted;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke={c} strokeWidth={1.8} />
      <Path d="M1 10h22" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function BankIcon({ active, disabled }: { active: boolean; disabled?: boolean }) {
  const c = disabled ? Brand.textMuted : active ? Brand.primary : Brand.textMuted;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
      <Polyline points="9,22 9,12 15,12 15,22" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function WalletIcon({ active, disabled }: { active: boolean; disabled?: boolean }) {
  const c = disabled ? Brand.textMuted : active ? Brand.primary : Brand.textMuted;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke={c} strokeWidth={1.8} />
      <Path d="M16 3H8L4 7h16l-4-4z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx="17" cy="13" r="1.5" fill={c} />
    </Svg>
  );
}

function CashIcon({ active }: { active: boolean }) {
  const c = active ? Brand.primary : Brand.textMuted;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x="1" y="4" width="22" height="16" rx="2" stroke={c} strokeWidth={1.8} />
      <Circle cx="12" cy="12" r="3" stroke={c} strokeWidth={1.8} />
    </Svg>
  );
}

function RadioSelected() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={Brand.primary} strokeWidth={2} />
      <Circle cx="12" cy="12" r="5" fill={Brand.primary} />
    </Svg>
  );
}

function RadioEmpty({ disabled }: { disabled?: boolean }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={disabled ? Brand.borderLight : Brand.border} strokeWidth={2} />
    </Svg>
  );
}

// ─── Payment Option Data ──────────────────────────────────────────────────────

interface PaymentOption {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  badge?: string;
  isAvailable: boolean;
  icon: (active: boolean) => React.ReactNode;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'cash',
    title: 'Cash on Service',
    subtitle: 'Pay when technician completes service',
    badge: 'Available',
    isAvailable: true,
    icon: (a) => <CashIcon active={a} />,
  },
  {
    id: 'upi',
    title: 'UPI',
    subtitle: 'GPay, PhonePe, Paytm & more',
    badge: 'Coming Soon',
    isAvailable: false,
    icon: (a) => <UpiIcon active={a} disabled={true} />,
  },
  {
    id: 'credit_card',
    title: 'Credit Card',
    subtitle: 'Visa, Mastercard, Amex',
    badge: 'Coming Soon',
    isAvailable: false,
    icon: (a) => <CardIcon active={a} disabled={true} />,
  },
  {
    id: 'debit_card',
    title: 'Debit Card',
    subtitle: 'All major banks supported',
    badge: 'Coming Soon',
    isAvailable: false,
    icon: (a) => <CardIcon active={a} disabled={true} />,
  },
  {
    id: 'net_banking',
    title: 'Net Banking',
    subtitle: 'All major banks',
    badge: 'Coming Soon',
    isAvailable: false,
    icon: (a) => <BankIcon active={a} disabled={true} />,
  },
  {
    id: 'wallet',
    title: 'Wallet',
    subtitle: 'Paytm, Amazon Pay & more',
    badge: 'Coming Soon',
    isAvailable: false,
    icon: (a) => <WalletIcon active={a} disabled={true} />,
  },
];

// ─── Payment Methods ──────────────────────────────────────────────────────────

interface PaymentMethodsProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export const PaymentMethods = memo(function PaymentMethods({
  selected,
  onSelect,
}: PaymentMethodsProps) {
  const handleSelect = useCallback(
    (opt: PaymentOption) => {
      if (opt.isAvailable) {
        onSelect(opt.id);
      }
    },
    [onSelect]
  );

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Payment Method</Text>

      {PAYMENT_OPTIONS.map((opt, index) => {
        const active = selected === opt.id && opt.isAvailable;
        const disabled = !opt.isAvailable;

        return (
          <View key={opt.id}>
            {index > 0 && <View style={styles.rowDivider} />}
            <Pressable
              style={({ pressed }) => [
                styles.row,
                active && styles.rowActive,
                disabled && styles.rowDisabled,
                pressed && opt.isAvailable && styles.rowPressed,
              ]}
              disabled={disabled}
              onPress={() => handleSelect(opt)}
              android_ripple={null}
              accessibilityRole="radio"
              accessibilityState={{ checked: active, disabled }}>
              <View style={[styles.iconWrap, active && styles.iconWrapActive, disabled && styles.iconWrapDisabled]}>
                {opt.icon(active)}
              </View>
              <View style={styles.texts}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, active && styles.titleActive, disabled && styles.titleDisabled]}>
                    {opt.title}
                  </Text>
                  {opt.badge && (
                    <View style={[styles.badge, disabled ? styles.badgeDisabled : styles.badgeAvailable]}>
                      <Text style={[styles.badgeText, disabled ? styles.badgeTextDisabled : styles.badgeTextAvailable]}>
                        {opt.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.subtitle, disabled && styles.subtitleDisabled]}>{opt.subtitle}</Text>
              </View>
              {active ? <RadioSelected /> : <RadioEmpty disabled={disabled} />}
            </Pressable>
          </View>
        );
      })}
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
  heading: {
    ...Typography.h4,
    color: Brand.textPrimary,
    letterSpacing: -0.2,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.lg,
  },
  rowActive: { backgroundColor: Brand.primarySoft },
  rowDisabled: { opacity: 0.45 },
  rowPressed: { opacity: 0.7 },
  rowDivider: {
    height: 1,
    backgroundColor: Brand.borderLight,
    marginHorizontal: Spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconWrapActive: { backgroundColor: Brand.white },
  iconWrapDisabled: { backgroundColor: '#F3F4F6' },
  texts: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { ...Typography.bodyMedium, color: Brand.textPrimary, fontWeight: '600' },
  titleActive: { color: Brand.primary, fontWeight: '700' },
  titleDisabled: { color: Brand.textMuted },
  subtitle: { ...Typography.caption, color: Brand.textMuted },
  subtitleDisabled: { color: Brand.textMuted, opacity: 0.8 },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeAvailable: {
    backgroundColor: Brand.successSoft,
  },
  badgeDisabled: {
    backgroundColor: '#F3F4F6',
  },
  badgeText: {
    ...Typography.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  badgeTextAvailable: {
    color: Brand.success,
  },
  badgeTextDisabled: {
    color: Brand.textMuted,
  },
});
