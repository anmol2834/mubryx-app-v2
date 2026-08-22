import { Brand } from '@/constants/brand';
import { memo, useCallback } from 'react';
import { Alert, Linking, RefreshControl, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_ACTIVE_BOOKING, type ActiveBooking } from '../Profile/constants';
import { bookingService } from '@/services/bookingService';
import { BookingStatusCard } from './components/BookingStatusCard';
import { EngineerCard } from './components/EngineerCard';
import { ServiceDetailsCard } from './components/ServiceDetailsCard';
import { TrackBottomActions } from './components/TrackActions';
import { TrackHeader } from './components/TrackHeader';
import { TrackTimeline } from './components/TrackTimeline';

const Divider = memo(function Divider() {
  return <View style={s.divider} />;
});

interface Props {
  onBack: () => void;
  booking?: ActiveBooking;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export const TrackServiceScreen = memo(function TrackServiceScreen({
  onBack,
  booking = MOCK_ACTIVE_BOOKING,
  isRefreshing = false,
  onRefresh,
}: Props) {
  const insets = useSafeAreaInsets();

  const handleLiveLocation = useCallback(() => {
    // Future: navigate to live map screen
    Alert.alert('Live Location', 'Live map integration coming soon.');
  }, []);

  const getPhone = useCallback(async (): Promise<string | null> => {
    let rawPhone =
      booking?.engineer?.phone ||
      (booking?.engineer as any)?.phoneNumber ||
      (booking as any)?.technician?.phone ||
      (booking as any)?.technician?.user?.phone;

    if (rawPhone) return String(rawPhone);

    const targetBookingId = booking?.id || booking?.bookingId;
    if (targetBookingId) {
      try {
        const res = await bookingService.getBookingById(targetBookingId);
        if (res.ok && res.data) {
          const tech = (res.data as any).technician || (res.data as any).engineer;
          const fetchedPhone = tech?.phone || tech?.user?.phone;
          if (fetchedPhone) return String(fetchedPhone);
        }
      } catch {
        // silent fallback
      }
    }
    return null;
  }, [booking]);

  const handleCall = useCallback(async () => {
    const rawPhone = await getPhone();
    if (!rawPhone) {
      Alert.alert('Phone Call', 'Technician phone number is not available at the moment.');
      return;
    }
    const cleanPhone = String(rawPhone).replace(/[^\d+]/g, '');
    const telUrl = `tel:${cleanPhone}`;
    Linking.openURL(telUrl).catch(() => {
      Alert.alert('Call Error', `Unable to open dialer for ${cleanPhone}`);
    });
  }, [getPhone]);

  const handleChat = useCallback(async () => {
    const rawPhone = await getPhone();
    if (!rawPhone) {
      Alert.alert('WhatsApp Chat', 'Technician phone number is not available for WhatsApp chat.');
      return;
    }
    const cleanDigits = String(rawPhone).replace(/\D/g, '');
    const formattedPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent('Hello, regarding my booking on Mubryx.')}`;
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('WhatsApp Error', 'Could not open WhatsApp on this device.');
    });
  }, [getPhone]);

  const handleHelp = useCallback(() => {
    Alert.alert('Help', 'Support team will contact you shortly.');
  }, []);

  const handleCancel = useCallback(() => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => {} },
    ]);
  }, []);

  const handleInvoice = useCallback(() => {
    Alert.alert('Invoice', 'Downloading invoice...');
  }, []);

  const handleBookAgain = useCallback(() => {
    Alert.alert('Book Again', 'Redirecting to booking...');
  }, []);

  const handleRate = useCallback(() => {
    Alert.alert('Rate Service', 'Rating screen coming soon.');
  }, []);

  const showEngineer =
    booking.engineer !== null &&
    booking.currentStage !== 'confirmed';

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Brand.white} translucent={false} />

      <TrackHeader bookingId={booking.bookingId} onBack={onBack} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.content, { paddingBottom: 48 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[Brand.primary]}
              tintColor={Brand.primary}
            />
          ) : undefined
        }>

        <BookingStatusCard booking={booking} />

        <Divider />

        <TrackTimeline stages={booking.stages} onLiveLocation={handleLiveLocation} />

        {showEngineer && booking.engineer && (
          <>
            <Divider />
            <EngineerCard
              engineer={booking.engineer}
              onCall={handleCall}
              onChat={handleChat}
            />
          </>
        )}

        <Divider />

        <ServiceDetailsCard booking={booking} />

        <Divider />

        <TrackBottomActions
          currentStage={booking.currentStage}
          onHelp={handleHelp}
          onCancel={handleCancel}
          onInvoice={handleInvoice}
          onBookAgain={handleBookAgain}
          onRate={handleRate}
        />

      </ScrollView>
    </View>
  );
});

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.offWhite,
  },
  scroll: { flex: 1 },
  content: { backgroundColor: Brand.offWhite },
  divider: {
    height: 8,
    backgroundColor: Brand.offWhite,
  },
});
