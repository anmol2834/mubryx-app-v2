import { Brand } from '@/constants/brand';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { ScrollView, StatusBar, StyleSheet, View, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { SavedAddress } from '@/types/address';
import { AddressesSection } from './components/AddressesSection';
import { AddressEditModal } from './components/AddressEditModal';
//import { BookingsSection } from './components/BookingsSection';
import { LogoutSection } from './components/LogoutSection';
import { ProfileHero } from './components/ProfileHero';
//import { QuickActions } from './components/QuickActions';
import { SettingsList } from './components/SettingsList';
import { UpcomingBookingCard } from './components/UpcomingBookingCard';
import { QUICK_ACTIONS, SETTINGS_SECTIONS, STAT_CARDS } from './constants';
import { useProfile } from './hooks/useProfile';

const Divider = memo(function Divider() {
  return <View style={s.divider} />;
});

interface Props {
  onNavigateToTrack?: () => void;
}

export const ProfileScreen = memo(function ProfileScreen({ onNavigateToTrack }: Props) {
  const insets = useSafeAreaInsets();
  const profile = useProfile(onNavigateToTrack);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const handleEditAddress = useCallback((id: string) => {
    profile.onEditAddress(id);
    // Give React a tiny tick to update the editingAddress state before opening
    setTimeout(() => {
      bottomSheetRef.current?.present();
    }, 50);
  }, [profile.onEditAddress]);

  const handleSaveAddress = useCallback((updatedAddress: any) => {
    bottomSheetRef.current?.dismiss();
    profile.onSaveAddress(updatedAddress);
  }, [profile.onSaveAddress]);

  const router = useRouter();

  const handleSettingsRowPress = useCallback((id: string) => {
    if (id === 'help') {
      router.push('/help-center');
    } else if (id === 'call') {
      Linking.openURL('tel:+919875134775');
    } else {
      profile.onSettingsRowPress(id);
    }
  }, [profile.onSettingsRowPress, router]);

  const editingAddress = useMemo(() => {
    if (!profile.editingAddressId) return null;
    const found = profile.addresses.find((a) => a.id === profile.editingAddressId);
    if (found) return found;

    if (profile.editingAddressId.startsWith('new_')) {
      const tagLabel = profile.editingAddressId.replace('new_', '');
      return {
        id: 'new',
        label: tagLabel,
        completeAddress: '',
        address: '',
        isDefault: false,
      } as SavedAddress;
    }
    return { id: 'new', label: 'Home', completeAddress: '', address: '', isDefault: false } as SavedAddress;
  }, [profile.addresses, profile.editingAddressId]);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Brand.white} translucent={false} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.content, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}>

        <ProfileHero
          user={profile.user}
          onEditProfile={profile.onEditProfile}
          onNotifications={profile.onNotifications}
        />

        <Divider />

        {/* <QuickActions actions={QUICK_ACTIONS} onPress={profile.onQuickAction} /> */}

        <Divider />

        <UpcomingBookingCard
          booking={profile.activeBooking}
          onTrack={profile.onTrackService}
        />

        <Divider />

        {/* <BookingsSection
          bookings={profile.bookings}
          onBookingPress={profile.onBookingPress}
        /> */}

        <Divider />

        <AddressesSection
          addresses={profile.addresses}
          onEdit={handleEditAddress}
        />

        <Divider />

        <SettingsList
          sections={SETTINGS_SECTIONS}
          onRowPress={handleSettingsRowPress}
          biometricEnabled={profile.biometricEnabled}
          onToggleBiometric={profile.onToggleBiometric}
          user={profile.user}
          onUpdateName={profile.onUpdateName}
        />

        <LogoutSection
          visible={profile.logoutSheetVisible}
          onLogoutPress={profile.onLogoutPress}
          onConfirm={profile.onLogoutConfirm}
          onCancel={profile.onLogoutCancel}
        />

      </ScrollView>

      <AddressEditModal
        ref={bottomSheetRef}
        address={editingAddress}
        onSave={handleSaveAddress}
        onClose={profile.onCloseEditAddress}
      />
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
