import { Brand, Spacing } from '@/constants/brand';
import {
  FindingTechnicianSheet,
  TechnicianAssignedSheet,
  useBookingFlow,
} from '@/features/booking-flow';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddressCard } from './components/AddressCard';
import { BookingNotes } from './components/BookingNotes';
import { BottomBookingBar } from './components/BottomBookingBar';
import { CheckoutHeader } from './components/CheckoutHeader';
import { OffersCoupons } from './components/OffersCoupons';
import { PaymentMethods } from './components/PaymentMethods';
import { ScheduleCard, ScheduleSheet } from './components/ScheduleSelector';
import { ServiceList } from './components/ServiceList';
import { useCartQuery } from '@/hooks/queries/useCartQuery';
import { useCartMutations } from '@/hooks/mutations/useCartMutations';
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
  const { removeItem, checkout: checkoutMutation } = useCartMutations();

  const [sheetVisible, setSheetVisible] = useState(false);
  const bookingFlow = useBookingFlow();

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/cart');
  }, [router]);

  const handleBrowse = useCallback(() => {
    router.replace('/');
  }, [router]);

  const handleConfirmBooking = useCallback(async () => {
    const idempotencyKey = `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      const checkoutResult = await checkoutMutation.mutateAsync({
        addressId: (checkout.address as any)?.id || undefined,
        scheduleMode: checkout.scheduleMode === 'asap' ? 'NOW' : 'SCHEDULED',
        scheduledDate: checkout.selectedDate
          ? checkout.selectedDate.toISOString().split('T')[0]
          : undefined,
        scheduledTime: checkout.selectedTime || undefined,
        paymentMethod: checkout.paymentMethod === 'cash' ? 'CASH' : 'ONLINE',
        notes: checkout.noteText,
        idempotencyKey,
        expectedCartVersion: cart?.version,
      });

      if (checkoutResult && checkoutResult.booking) {
        bookingFlow.confirmBooking({
          userId: checkoutResult.booking.userId,
          items: checkoutResult.booking.items.map((i: any) => ({
            id: i.id,
            name: i.title,
            price: i.price,
          })),
          address: checkout.address?.shortLabel ?? 'Home Address',
          scheduleMode: checkout.scheduleMode,
          scheduledDate: checkout.selectedDate?.toDateString() ?? null,
          scheduledTime: checkout.selectedTime,
          paymentMethod: checkout.paymentMethod,
          notes: checkout.noteText,
          grandTotal: checkoutResult.booking.total,
        });
      }
    } catch (err) {
      console.error('Checkout failed', err);
    }
  }, [bookingFlow, checkout, checkoutMutation, cart?.version]);

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
          onChangeAddress={checkout.openLocationSelector}
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
