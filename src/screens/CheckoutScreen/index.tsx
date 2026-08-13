import { Brand, Spacing } from '@/constants/brand';
import {
  FindingTechnicianSheet,
  TechnicianAssignedSheet,
  useBookingFlow,
} from '@/features/booking-flow';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AddressCard } from './components/AddressCard';
import { BookingNotes } from './components/BookingNotes';
import { BottomBookingBar } from './components/BottomBookingBar';
import { CheckoutHeader } from './components/CheckoutHeader';
import { OffersCoupons } from './components/OffersCoupons';
import { PaymentMethods } from './components/PaymentMethods';
import { ScheduleCard, ScheduleSheet } from './components/ScheduleSelector';
import { ServiceList } from './components/ServiceList';
import { PriceBreakdownModal } from './components/PriceBreakdownModal';
import { useCartQuery } from '@/hooks/queries/useCartQuery';
import { useCartMutations } from '@/hooks/mutations/useCartMutations';
import { useAddressMutations } from '@/hooks/mutations/useAddressMutations';
import { SavedAddressSelectorSheet } from '@/components/address/SavedAddressSelectorSheet';
import { AddressEditModal } from '@/screens/Profile/components/AddressEditModal';
import { SavedAddress } from '@/types/address';
import { useCheckout } from './hooks/useCheckout';

const SectionGap = () => <View style={styles.sectionGap} />;
const SectionLabel = ({ label }: { label: string }) => (
  <Text style={styles.sectionLabel}>{label}</Text>
);

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const checkout = useCheckout();
  const { data: cart } = useCartQuery();
  const { removeItem } = useCartMutations();
  const { createAddress, setDefaultAddress } = useAddressMutations();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [priceBreakdownVisible, setPriceBreakdownVisible] = useState(false);
  const bookingFlow = useBookingFlow();

  const addressSelectorRef = useRef<BottomSheetModal>(null);
  const addressEditRef = useRef<BottomSheetModal>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  // Automatically open Edit Address modal on mount if no address exists
  useEffect(() => {
    if (!checkout.addressesLoading && (!checkout.addresses || checkout.addresses.length === 0)) {
      const timer = setTimeout(() => {
        addressEditRef.current?.present();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [checkout.addressesLoading, checkout.addresses]);

  const handleOpenAddressSelector = useCallback(() => {
    addressSelectorRef.current?.present();
  }, []);

  const handleOpenAddNewAddress = useCallback(() => {
    addressSelectorRef.current?.dismiss();
    setTimeout(() => {
      addressEditRef.current?.present();
    }, 150);
  }, []);

  const handleSelectAddress = useCallback((addr: SavedAddress) => {
    checkout.selectAddress(addr);
    addressSelectorRef.current?.dismiss();
  }, [checkout]);

  const handleSaveNewAddress = useCallback((newAddr: any) => {
    addressEditRef.current?.dismiss();
    createAddress.mutate(
      {
        label: newAddr.label || 'Home',
        completeAddress: newAddr.completeAddress || newAddr.address,
        postalCode: newAddr.postalCode,
        city: newAddr.city,
        state: newAddr.state,
        latitude: newAddr.latitude,
        longitude: newAddr.longitude,
        landmark: newAddr.landmark,
        isDefault: newAddr.isDefault,
      },
      {
        onSuccess: (saved) => {
          if (saved) checkout.selectAddress(saved);
        },
      }
    );
  }, [createAddress, checkout]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/cart');
  }, [router]);

  const handleBrowse = useCallback(() => {
    router.replace('/');
  }, [router]);

  const handleConfirmBooking = useCallback(async () => {
    // 1. Validate address
    if (!checkout.address) {
      addressEditRef.current?.present();
      return;
    }

    // 2. Validate cart
    if (!cart?.items || cart.items.length === 0) {
      Alert.alert('Cart Empty', 'Please add services to your cart before booking.');
      return;
    }

    // 3. Validate schedule
    if (checkout.scheduleMode === 'scheduled' && !checkout.selectedDate) {
      Alert.alert('Select Time', 'Please choose a date and time for your scheduled booking.');
      return;
    }

    // 4. Build idempotency key — generated once per checkout session.
    //    On network retry or multiple clicks, the SAME key is resent so backend returns the existing booking.
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `mbx-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    const idempotencyKey = idempotencyKeyRef.current;

    // 5. Build scheduledAt ISO string if scheduled
    let scheduledAt: string | null = null;
    if (checkout.scheduleMode === 'scheduled' && checkout.selectedDate && checkout.selectedTime) {
      try {
        // Parse time string like "3:00 PM" and combine with date
        const [timePart, meridiem] = checkout.selectedTime.split(' ');
        const [hourStr, minuteStr] = timePart.split(':');
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        if (meridiem === 'PM' && hour !== 12) hour += 12;
        if (meridiem === 'AM' && hour === 12) hour = 0;
        const d = new Date(checkout.selectedDate);
        d.setHours(hour, minute, 0, 0);
        scheduledAt = d.toISOString();
      } catch {
        scheduledAt = null;
      }
    }

    // 6. Build notes (combine active chips + custom text)
    const chipNotes = Array.from(checkout.activeChips).join(', ');
    const notes = [chipNotes, checkout.noteText].filter(Boolean).join('. ');

    try {
      // 7. Trigger the matching animation + real API call via bookingFlow
      bookingFlow.confirmBooking({
        // Real API fields
        addressId: checkout.address.id,
        bookingType: checkout.scheduleMode === 'asap' ? 'ASAP' : 'SCHEDULED',
        scheduledAt,
        paymentMethod: 'CASH_ON_SERVICE',
        notes,
        couponCode: checkout.couponInput?.trim() || undefined,
        idempotencyKey,
        // UI display fields (not sent to API)
        displayAddress: checkout.address.completeAddress ?? checkout.address.label,
        displayScheduledDate: checkout.selectedDate
          ? checkout.selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          : null,
        displayScheduledTime: checkout.selectedTime,
      });
    } catch (err: any) {
      console.error('[CheckoutScreen] confirmBooking error:', err);
    }
  }, [bookingFlow, checkout, cart]);

  const handleTrackService = useCallback(() => {
    bookingFlow.closeAssignedSheet();
    router.replace('/');
  }, [bookingFlow, router]);

  const handleBackHome = useCallback(() => {
    bookingFlow.closeAssignedSheet();
    router.replace('/');
  }, [bookingFlow, router]);

  const handleDateTimeConfirm = useCallback(
    (date: Date, time: string) => {
      checkout.setSelectedDate(date);
      checkout.setSelectedTime(time);
    },
    [checkout]
  );

  const BOTTOM_BAR_HEIGHT = 130 + insets.bottom;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Brand.white} translucent={false} />

      <CheckoutHeader onBack={handleBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BOTTOM_BAR_HEIGHT }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Book a Professional Technician</Text>
          <Text style={styles.summarySub}>Review your booking before confirming.</Text>
        </View>

        <SectionGap />

        <SectionLabel label="Service Address" />
        <AddressCard
          address={checkout.address}
          onChangeAddress={handleOpenAddressSelector}
        />

        <SectionGap />

        <SectionLabel label="Service Time" />
        <ScheduleCard
          mode={checkout.scheduleMode}
          selectedDate={checkout.selectedDate}
          selectedTime={checkout.selectedTime}
          onModeChange={checkout.setScheduleMode}
          onOpenSheet={() => setSheetVisible(true)}
        />

        <SectionGap />

        <SectionLabel label="Your Services" />
        <ServiceList
          items={checkout.items}
          onRemove={(id) => removeItem.mutate({ itemId: id, expectedVersion: cart?.version })}
          onBrowse={handleBrowse}
        />

        <SectionGap />

        <SectionLabel label="Instructions" />
        <BookingNotes
          noteText={checkout.noteText}
          activeChips={checkout.activeChips}
          onNoteChange={checkout.handleNoteChange}
          onToggleChip={checkout.toggleChip}
          maxChars={200}
        />

        <SectionGap />

        <SectionLabel label="Payment" />
        <PaymentMethods
          selected={checkout.paymentMethod}
          onSelect={checkout.setPaymentMethod}
        />

        <SectionGap />

        <SectionLabel label="Offers" />
        <OffersCoupons
          couponInput={checkout.couponInput}
          couponApplied={checkout.couponApplied}
          couponDiscount={checkout.couponDiscount}
          couponError={checkout.couponError}
          couponLoading={checkout.couponLoading}
          onCouponChange={checkout.setCouponInput}
          onApply={checkout.applyCoupon}
          onRemove={checkout.removeCoupon}
        />
      </ScrollView>

      <BottomBookingBar
        grandTotal={checkout.grandTotal}
        itemCount={checkout.itemCount}
        couponDiscount={checkout.couponDiscount}
        onConfirm={handleConfirmBooking}
        onOpenBreakdown={() => setPriceBreakdownVisible(true)}
      />

      {/* Price Breakdown Modal */}
      <PriceBreakdownModal
        visible={priceBreakdownVisible}
        onClose={() => setPriceBreakdownVisible(false)}
        items={checkout.items}
        subtotal={checkout.subtotal}
        gst={checkout.gst}
        discount={checkout.couponDiscount}
        grandTotal={checkout.grandTotal}
      />

      {/* Booking Flow Sheets */}
      <FindingTechnicianSheet
        visible={bookingFlow.activeSheet === 'finding'}
        matchingSteps={bookingFlow.matchingSteps}
        matchingProgress={bookingFlow.matchingProgress}
        matchingMetrics={bookingFlow.matchingMetrics}
        isCancelling={bookingFlow.isCancelling}
        hasError={bookingFlow.hasError}
        errorMessage={bookingFlow.errorMessage}
        onCancel={bookingFlow.cancelFlow}
        onRetry={bookingFlow.retryFlow}
      />
      <TechnicianAssignedSheet
        visible={bookingFlow.activeSheet === 'assigned'}
        result={bookingFlow.bookingResult}
        onTrack={handleTrackService}
        onBackHome={handleBackHome}
      />

      {/* Schedule Modal sheet — renders as true overlay, no touch bleed-through */}
      <ScheduleSheet
        visible={sheetVisible}
        selectedDate={checkout.selectedDate}
        selectedTime={checkout.selectedTime}
        onConfirm={handleDateTimeConfirm}
        onClose={() => setSheetVisible(false)}
      />

      {/* Address Selector Sheet */}
      <SavedAddressSelectorSheet
        ref={addressSelectorRef}
        addresses={checkout.addresses}
        selectedAddressId={checkout.address?.id || null}
        onSelectAddress={handleSelectAddress}
        onSetDefaultAddress={(id) => setDefaultAddress.mutate(id)}
        onAddNewAddress={handleOpenAddNewAddress}
        onClose={() => {}}
      />

      {/* New Address Edit Modal */}
      <AddressEditModal
        ref={addressEditRef}
        address={{ id: 'new', label: 'Home', completeAddress: '', address: '', isDefault: false }}
        onSave={handleSaveNewAddress}
        onClose={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.offWhite,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: Spacing.base,
  },
  summaryHeader: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.base,
    gap: 4,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Brand.textPrimary,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  summarySub: {
    fontSize: 13,
    color: Brand.textSecondary,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  sectionGap: { height: Spacing.base },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.xs,
  },
});
