import { useAuthStore } from '@/store/authStore';
import { useCallback, useMemo, useState } from 'react';
import {
    MOCK_ACTIVE_BOOKING,
    MOCK_ADDRESSES,
    MOCK_BOOKINGS,
    MOCK_USER,
    type ActiveBooking,
    type BookingRecord,
    type SavedAddress,
    type UserProfile,
} from '../constants';

export interface ProfileState {
  user: UserProfile;
  bookings: BookingRecord[];
  addresses: SavedAddress[];
  activeBooking: ActiveBooking | null;
  walletBalance: number;
  rewardPoints: number;
  isLoading: boolean;
  logoutSheetVisible: boolean;
  biometricEnabled: boolean;
  editingAddressId: string | null;
}

export interface ProfileActions {
  onEditProfile: () => void;
  onNotifications: () => void;
  onSettings: () => void;
  onSettingsRowPress: (id: string) => void;
  onAddAddress: () => void;
  onEditAddress: (id: string) => void;
  onCloseEditAddress: () => void;
  onSaveAddress: (address: SavedAddress) => void;
  onSetDefaultAddress: (id: string) => void;
  onBookingPress: (b: BookingRecord) => void;
  onTrackService: () => void;
  onQuickAction: (id: string) => void;
  onLogoutPress: () => void;
  onLogoutConfirm: () => void;
  onLogoutCancel: () => void;
  onToggleBiometric: () => void;
  onUpdateName: (name: string) => void;
}

export function useProfile(onNavigateToTrack?: () => void): ProfileState & ProfileActions {
  const [logoutSheetVisible, setLogoutSheetVisible] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [localName, setLocalName] = useState<string | null>(null);
  
  // Create a local copy of addresses so we can update them in-memory
  const [addresses, setAddresses] = useState<SavedAddress[]>(MOCK_ADDRESSES);

  const onEditProfile = useCallback(() => {}, []);
  const onNotifications = useCallback(() => {}, []);
  const onSettings = useCallback(() => {}, []);
  const onSettingsRowPress = useCallback((_id: string) => {}, []);
  const onAddAddress = useCallback(() => {}, []);
  
  const onUpdateName = useCallback((name: string) => {
    setLocalName(name);
  }, []);

  const onEditAddress = useCallback((id: string) => {
    setEditingAddressId(id);
  }, []);

  const onCloseEditAddress = useCallback(() => {
    setEditingAddressId(null);
  }, []);

  const onSaveAddress = useCallback((updatedAddress: SavedAddress) => {
    setAddresses(prev => prev.map(addr => {
      if (addr.id === updatedAddress.id) {
        return updatedAddress;
      }
      if (updatedAddress.isDefault) {
        return { ...addr, isDefault: false };
      }
      return addr;
    }));
  }, []);

  const onSetDefaultAddress = useCallback((id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  }, []);

  const onBookingPress = useCallback((_b: BookingRecord) => {}, []);

  const onTrackService = useCallback(() => {
    onNavigateToTrack?.();
  }, [onNavigateToTrack]);

  const onQuickAction = useCallback((id: string) => {
    if (id === 'qa2') onNavigateToTrack?.();
  }, [onNavigateToTrack]);

  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const onLogoutPress = useCallback(() => setLogoutSheetVisible(true), []);
  const onLogoutConfirm = useCallback(async () => {
    setLogoutSheetVisible(false);
    await logout();
  }, [logout]);
  const onLogoutCancel = useCallback(() => setLogoutSheetVisible(false), []);
  const onToggleBiometric = useCallback(() => setBiometricEnabled((v) => !v), []);

  const resolvedUser: UserProfile = useMemo(() => {
    const activeName = localName ?? authUser?.name ?? MOCK_USER.name;
    return {
      ...MOCK_USER,
      name: activeName,
      phone: authUser?.phone ?? MOCK_USER.phone,
      avatarInitials: activeName
        ? activeName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
        : MOCK_USER.avatarInitials,
    };
  }, [authUser, localName]);

  return useMemo(() => ({
    user: resolvedUser,
    bookings: MOCK_BOOKINGS,
    addresses,
    activeBooking: MOCK_ACTIVE_BOOKING,
    walletBalance: 350,
    rewardPoints: 1240,
    isLoading: false,
    logoutSheetVisible,
    biometricEnabled,
    editingAddressId,
    onEditProfile,
    onNotifications,
    onSettings,
    onSettingsRowPress,
    onAddAddress,
    onEditAddress,
    onCloseEditAddress,
    onSaveAddress,
    onSetDefaultAddress,
    onBookingPress,
    onTrackService,
    onQuickAction,
    onLogoutPress,
    onLogoutConfirm,
    onLogoutCancel,
    onToggleBiometric,
    onUpdateName,
  }), [
    resolvedUser,
    logoutSheetVisible,
    biometricEnabled,
    onEditProfile,
    onNotifications,
    onSettings,
    onSettingsRowPress,
    onAddAddress,
    onEditAddress,
    onCloseEditAddress,
    onSaveAddress,
    onSetDefaultAddress,
    onBookingPress,
    onTrackService,
    onQuickAction,
    onLogoutPress,
    onLogoutConfirm,
    onLogoutCancel,
    onToggleBiometric,
    editingAddressId,
    addresses,
    onUpdateName,
  ]);
}
