import { useAuthStore } from '@/store/authStore';
import { useAddressesQuery } from '@/hooks/queries/useAddressesQuery';
import { useAddressMutations } from '@/hooks/mutations/useAddressMutations';
import { useBookingsQuery } from '@/hooks/queries/useBookingsQuery';
import { useCallback, useMemo, useState } from 'react';
import type {
  ActiveBooking,
  BookingRecord,
  SavedAddress,
  UserProfile,
} from '../constants';

export interface ProfileState {
  user: UserProfile;
  bookings: BookingRecord[];
  addresses: SavedAddress[];
  activeBooking: ActiveBooking | null;
  walletBalance: number;
  rewardPoints: number;
  isLoading: boolean;
  isRefreshing: boolean;
  logoutSheetVisible: boolean;
  biometricEnabled: boolean;
  editingAddressId: string | null;
}

export interface ProfileActions {
  onRefresh: () => void;
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
  
  const { data: addresses = [], refetch: refetchAddresses, isRefetching: isAddressesRefetching } = useAddressesQuery();
  const { createAddress, updateAddress, setDefaultAddress } = useAddressMutations();
  const upcomingQuery = useBookingsQuery('upcoming');

  const isRefreshing = isAddressesRefetching || upcomingQuery.isRefetching;
  const onRefresh = useCallback(() => {
    refetchAddresses();
    upcomingQuery.refetch();
  }, [refetchAddresses, upcomingQuery]);

  const onEditProfile = useCallback(() => {}, []);
  const onNotifications = useCallback(() => {}, []);
  const onSettings = useCallback(() => {}, []);
  const onSettingsRowPress = useCallback((_id: string) => {}, []);
  const onAddAddress = useCallback(() => {
    setEditingAddressId('new');
  }, []);
  
  const onUpdateName = useCallback((name: string) => {
    setLocalName(name);
  }, []);

  const onEditAddress = useCallback((id: string) => {
    setEditingAddressId(id);
  }, []);

  const onCloseEditAddress = useCallback(() => {
    setEditingAddressId(null);
  }, []);

  const onSaveAddress = useCallback((updatedAddress: any) => {
    if (updatedAddress.id === 'new' || !updatedAddress.id) {
      createAddress.mutate({
        label: updatedAddress.label || 'Home',
        completeAddress: updatedAddress.completeAddress || updatedAddress.address,
        postalCode: updatedAddress.postalCode,
        city: updatedAddress.city,
        state: updatedAddress.state,
        latitude: updatedAddress.latitude,
        longitude: updatedAddress.longitude,
        landmark: updatedAddress.landmark,
        isDefault: updatedAddress.isDefault,
      });
    } else {
      updateAddress.mutate({
        id: updatedAddress.id,
        payload: {
          label: updatedAddress.label,
          completeAddress: updatedAddress.completeAddress || updatedAddress.address,
          postalCode: updatedAddress.postalCode,
          city: updatedAddress.city,
          state: updatedAddress.state,
          latitude: updatedAddress.latitude,
          longitude: updatedAddress.longitude,
          landmark: updatedAddress.landmark,
          isDefault: updatedAddress.isDefault,
        },
      });
    }
  }, [createAddress, updateAddress]);

  const onSetDefaultAddress = useCallback((id: string) => {
    setDefaultAddress.mutate(id);
  }, [setDefaultAddress]);

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
    const activeName = localName ?? authUser?.name ?? 'User';
    const activePhone = authUser?.phone ?? '';
    const activeEmail = (authUser as any)?.email ?? '';
    const initials = activeName && activeName !== 'User'
      ? activeName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
      : 'U';

    const hasName = Boolean(authUser?.name || localName);
    const hasPhone = Boolean(authUser?.phone);
    const hasEmail = Boolean((authUser as any)?.email);
    const hasAddress = addresses.length > 0;

    const completedCount = [hasName, hasPhone, hasEmail, hasAddress].filter(Boolean).length;
    const profileCompletion = Math.round((completedCount / 4) * 100);

    return {
      id: authUser?.id || 'user',
      name: activeName,
      phone: activePhone,
      email: activeEmail,
      avatarInitials: initials,
      avatarColor: '#0052CC',
      memberSince: 'Member',
      isVerified: true,
      loyaltyTier: 'Silver',
      profileCompletion,
    };
  }, [authUser, localName, addresses.length]);

  const activeBooking: ActiveBooking | null = useMemo(() => {
    const rawList = upcomingQuery.data;
    if (!rawList || rawList.length === 0) return null;
    const b = rawList[0];
    const firstItem = (b as any).items?.[0] || (b as any).service || {};
    const title = firstItem.serviceTitle || firstItem.title || 'Service';
    return {
      id: (b as any)._id || (b as any).id,
      bookingId: (b as any)._id || (b as any).id,
      serviceName: title,
      serviceIcon: '🔧',
      applianceName: title,
      currentStage: (b as any).status === 'IN_PROGRESS' ? 'started' : 'confirmed',
      eta: '30 mins',
      scheduledDate: (b as any).scheduledDate || 'Scheduled',
      scheduledTime: (b as any).scheduledSlot || 'Slot',
      price: (b as any).totalAmount || (b as any).amount || 0,
      paymentMethod: (b as any).paymentMethod || 'Online',
      warranty: '30 Days Warranty',
      estimatedDuration: '45 mins',
      engineer: (b as any).technician ? {
        id: (b as any).technician._id || (b as any).technician.id || 'tech1',
        name: (b as any).technician.name || 'Technician',
        avatarInitials: ((b as any).technician.name || 'Tech').slice(0, 2).toUpperCase(),
        avatarColor: '#1565C0',
        rating: String((b as any).technician.rating || 4.9),
        experience: '5+ Yrs',
        isVerified: true,
        phone: (b as any).technician.phone || '',
      } : null,
      address: (b as any).address?.completeAddress || (b as any).address?.address || 'Service Location',
      landmark: (b as any).address?.landmark || '',
      contactPerson: (b as any).address?.contactPerson || 'Customer',
      contactPhone: (b as any).address?.contactPhone || '',
      stages: [
        { id: 'confirmed', title: 'Confirmed', description: 'Booking confirmed', timestamp: '', status: 'done' },
        { id: 'assigned', title: 'Assigned', description: 'Technician assigned', timestamp: '', status: 'done' },
        { id: 'journey', title: 'On the Way', description: 'Heading to location', timestamp: '', status: 'pending' },
        { id: 'nearby', title: 'Nearby', description: 'Near location', timestamp: '', status: 'pending' },
        { id: 'arrived', title: 'Arrived', description: 'Technician arrived', timestamp: '', status: 'pending' },
        { id: 'started', title: 'Started', description: 'Service started', timestamp: '', status: 'pending' },
        { id: 'completed', title: 'Completed', description: 'Service completed', timestamp: '', status: 'pending' },
      ],
    };
  }, [upcomingQuery.data]);

  return useMemo(() => ({
    user: resolvedUser,
    bookings: [],
    addresses,
    activeBooking,
    walletBalance: 0,
    rewardPoints: 0,
    isLoading: false,
    isRefreshing,
    logoutSheetVisible,
    biometricEnabled,
    editingAddressId,
    onRefresh,
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
    activeBooking,
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
