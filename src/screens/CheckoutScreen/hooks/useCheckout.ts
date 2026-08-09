import { useCartQuery } from '@/hooks/queries/useCartQuery';
import { useCartMutations } from '@/hooks/mutations/useCartMutations';
import { useCheckoutStore } from '@/hooks/store/useCheckoutStore';
import { useLocation } from '@/context/LocationContext';
import { useCallback, useState } from 'react';

export type ScheduleMode = 'asap' | 'scheduled';
export type PaymentMethod =
  | 'cash'
  | 'upi'
  | 'credit_card'
  | 'debit_card'
  | 'net_banking'
  | 'wallet';

export const NOTE_CHIPS = [
  'Dog at home',
  'Call before arrival',
  'Use Side Gate',
  'Apartment Access',
  'Bring Ladder',
  'Ring Doorbell Twice',
] as const;

export type NoteChip = (typeof NOTE_CHIPS)[number];

const MAX_NOTE_CHARS = 200;

export function useCheckout() {
  const { data: cart } = useCartQuery();
  const { applyCoupon: applyCouponMutation, removeCoupon: removeCouponMutation } = useCartMutations();
  const location = useLocation();

  // ── Schedule ──────────────────────────────────────────────────────────────
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('asap');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // ── Notes ─────────────────────────────────────────────────────────────────
  const [noteText, setNoteText] = useState('');
  const [activeChips, setActiveChips] = useState<Set<NoteChip>>(new Set());

  const toggleChip = useCallback((chip: NoteChip) => {
    setActiveChips((prev) => {
      const next = new Set(prev);
      if (next.has(chip)) next.delete(chip);
      else next.add(chip);
      return next;
    });
  }, []);

  const handleNoteChange = useCallback((text: string) => {
    if (text.length <= MAX_NOTE_CHARS) setNoteText(text);
  }, []);

  // ── Payment ───────────────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  // ── Coupon ────────────────────────────────────────────────────────────────
  const { couponInput, setCouponInput } = useCheckoutStore();
  const [couponError, setCouponError] = useState<string | null>(null);

  const couponLoading = applyCouponMutation.isPending || removeCouponMutation.isPending;

  const applyCoupon = useCallback(async () => {
    if (!couponInput.trim()) return;
    setCouponError(null);
    try {
      await applyCouponMutation.mutateAsync(couponInput.trim());
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err?.message || 'Failed to apply coupon');
    }
  }, [couponInput, applyCouponMutation, setCouponInput]);

  const removeCoupon = useCallback(async () => {
    setCouponError(null);
    try {
      await removeCouponMutation.mutateAsync();
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err?.message || 'Failed to remove coupon');
    }
  }, [removeCouponMutation, setCouponInput]);

  const items = cart?.items || [];
  const summary = cart?.summary || {
    subtotal: 0,
    discount: 0,
    taxableAmount: 0,
    tax: 0,
    platformFee: 0,
    total: 0,
  };

  return {
    // Cart snapshot & server totals
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: summary.subtotal,
    discount: summary.discount,
    tax: summary.tax,
    platformFee: summary.platformFee,
    total: summary.total,
    grandTotal: summary.total,
    appliedCoupon: cart?.appliedCoupon || null,

    // Location
    address: location.address,
    openLocationSelector: location.openLocationSelector,

    // Schedule
    scheduleMode,
    setScheduleMode,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,

    // Notes
    noteText,
    handleNoteChange,
    activeChips,
    toggleChip,

    // Payment
    paymentMethod,
    setPaymentMethod,

    // Coupon
    couponInput,
    setCouponInput,
    couponApplied: cart?.appliedCoupon?.code || null,
    couponDiscount: summary.discount,
    couponError,
    couponLoading,
    applyCoupon,
    removeCoupon,
  };
}
