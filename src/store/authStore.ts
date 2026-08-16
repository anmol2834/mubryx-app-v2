import { create } from 'zustand';
import { Storage } from '@/services/storage';
import { authService, AuthTokens, BackendUser } from '@/services/authService';
import { setTokenRefreshHandler } from '@/services/apiClient';
import { useGuestCartStore } from '@/store/guestCartStore';
import { cartService } from '@/services/cartService';
import { queryClient } from '@/api/queryClient';
import { customerNotificationService } from '@/services/notifications/customerNotificationService';

const AUTH_USER_KEY = 'mubryx_auth_user';
const ACCESS_TOKEN_KEY = 'mubryx_access_token';
const REFRESH_TOKEN_KEY = 'mubryx_refresh_token';

export interface AuthUser {
  id?: string;
  name: string;
  phone: string;
  email?: string | null;
  avatar?: string | null;
}

interface AuthState {
  // Persistent State
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  
  // Ephemeral OTP Session State
  pendingPhone: string;
  devOtp: string | null;
  otpExpiresAt: number | null;
  otpResendAvailableAt: number | null;

  // Profile completion flag — true after OTP success for a new user
  // Keeps otp.tsx from immediately redirecting to home before name is entered
  needsNameCompletion: boolean;

  // Actions
  hydrateSession: () => Promise<void>;
  saveSession: (bUser: BackendUser, tokenData: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  
  sendOtp: (phone: string) => Promise<{ ok: boolean; devOtp?: string; error?: string }>;
  verifyOtp: (otp: string, fullName?: string) => Promise<{ ok: boolean; isNewUser?: boolean; error?: string }>;
  completeRegistration: (name: string) => Promise<{ ok: boolean; error?: string }>;
}

export function isValidIndianNumber(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.trim());
}

let activeRefreshPromise: Promise<string | null> | null = null;
let isLoggingOut = false;

export const useAuthStore = create<AuthState>((set, get) => {
  // We can define the refresh handler here once
  setTokenRefreshHandler(async () => {
    if (activeRefreshPromise) return activeRefreshPromise;

    activeRefreshPromise = (async () => {
      try {
        const storedRefreshToken = await Storage.getItem(REFRESH_TOKEN_KEY);
        if (!storedRefreshToken) return null;
        
        const res = await authService.refreshTokens(storedRefreshToken);
        if (isLoggingOut) return null;
        
        if (res.ok && res.data) {
          const payload = (res.data as any)?.data || res.data;
          const newAccessToken = payload.accessToken;
          const newRefreshToken = payload.refreshToken || storedRefreshToken;
          const updatedTokens = { accessToken: newAccessToken, refreshToken: newRefreshToken };
          
          await Promise.all([
            Storage.setItem(ACCESS_TOKEN_KEY, newAccessToken),
            Storage.setItem(REFRESH_TOKEN_KEY, newRefreshToken),
          ]);
          set({ tokens: updatedTokens });
          return newAccessToken;
        }
      } catch (err) {
        console.warn('[authStore] Token refresh failed:', err);
      } finally {
        activeRefreshPromise = null;
      }
      
      if (!isLoggingOut) {
        await get().logout();
      }
      return null;
    })();

    return activeRefreshPromise;
  });

  return {
    user: null,
    tokens: null,
    isLoading: true,
    
    pendingPhone: '',
    devOtp: null,
    otpExpiresAt: null,
    otpResendAvailableAt: null,
    needsNameCompletion: false,

    hydrateSession: async () => {
      try {
        await useGuestCartStore.getState().hydrate();
        const [rawUser, accessToken, refreshToken] = await Promise.all([
          Storage.getItem(AUTH_USER_KEY),
          Storage.getItem(ACCESS_TOKEN_KEY),
          Storage.getItem(REFRESH_TOKEN_KEY),
        ]);
        if (rawUser && accessToken) {
          const parsedUser: AuthUser = JSON.parse(rawUser);
          set({ user: parsedUser, tokens: refreshToken ? { accessToken, refreshToken } : null });
        }
      } catch (err) {
        console.warn('[authStore] Error restoring session:', err);
      } finally {
        set({ isLoading: false });
      }
    },

    saveSession: async (bUser: BackendUser, tokenData: AuthTokens) => {
      isLoggingOut = false;
      const authUser: AuthUser = {
        id: bUser.id,
        name: bUser.fullName || 'User',
        phone: bUser.phone,
        email: bUser.email,
        avatar: bUser.avatar,
      };
      
      await Promise.all([
        Storage.setItem(AUTH_USER_KEY, JSON.stringify(authUser)),
        Storage.setItem(ACCESS_TOKEN_KEY, tokenData.accessToken),
        Storage.setItem(REFRESH_TOKEN_KEY, tokenData.refreshToken),
      ]);
      
      set({ tokens: tokenData, user: authUser });

      // Initialize FCM device registration asynchronously upon login
      customerNotificationService.initialize(bUser.id).catch((err) => {
        console.warn('[authStore] FCM registration error on saveSession:', err);
      });

      // Merge local guest cart into backend database cart on login
      try {
        const guestItems = useGuestCartStore.getState().items;
        if (guestItems.length > 0) {
          const payload = {
            items: guestItems.map(gi => ({
              serviceId: gi.serviceId,
              quantity: gi.quantity,
              specialNotes: gi.specialNotes ?? undefined,
            })),
          };
          await cartService.mergeCart(payload);
          await useGuestCartStore.getState().clear();
        }
      } catch (err) {
        console.warn('[authStore] Guest cart merge failed:', err);
      }
    },

    logout: async () => {
      isLoggingOut = true;
      const { tokens, user } = get();

      // Deactivate FCM token on logout
      try {
        await customerNotificationService.deactivateDeviceToken();
      } catch {
        /* ignore */
      }

      if (tokens?.accessToken) {
        try { await authService.logout(tokens.accessToken); } catch { /* ignore */ }
      }

      if (user?.id) {
        queryClient.removeQueries({ queryKey: ['cart', user.id] });
      }
      queryClient.removeQueries({ queryKey: ['cart', 'guest'] });
      
      await Promise.all([
        Storage.removeItem(AUTH_USER_KEY),
        Storage.removeItem(ACCESS_TOKEN_KEY),
        Storage.removeItem(REFRESH_TOKEN_KEY),
        Storage.removeItem('mubryx_saved_location'),
      ]);
      
      await useGuestCartStore.getState().clear();
      set({ user: null, tokens: null, pendingPhone: '', devOtp: null, otpExpiresAt: null, otpResendAvailableAt: null, needsNameCompletion: false });
    },

    sendOtp: async (phone: string) => {
      const cleanPhone = phone.trim();
      if (!isValidIndianNumber(cleanPhone)) {
        return { ok: false, error: 'Enter a valid 10-digit Indian mobile number.' };
      }
      
      const res = await authService.sendOtp(cleanPhone);
      if (!res.ok) {
        return { ok: false, error: res.error || 'Failed to send OTP.' };
      }
      
      // apiClient already unwraps TransformInterceptor so res.data is the payload directly
      const payload = res.data as any;
      const expiresIn = payload?.expiresIn || 300;
      const resendIn = payload?.resendAvailableIn || 30;
      
      set({
        pendingPhone: cleanPhone,
        devOtp: payload?.devOtp || null,
        otpExpiresAt: Date.now() + expiresIn * 1000,
        otpResendAvailableAt: Date.now() + resendIn * 1000,
      });
      
      return { ok: true, devOtp: payload?.devOtp };
    },

    verifyOtp: async (otp: string, fullName?: string) => {
      const { pendingPhone, saveSession } = get();
      if (!pendingPhone) {
        return { ok: false, error: 'No active OTP session. Please enter your phone number again.' };
      }
      if (!/^\d{6}$/.test(otp)) {
        return { ok: false, error: 'Invalid OTP format. Must be 6 digits.' };
      }
      
      const res = await authService.verifyOtp(pendingPhone, otp, fullName);
      if (!res.ok) {
        return { ok: false, error: res.error || 'OTP verification failed.' };
      }
      
      // apiClient already strips the NestJS TransformInterceptor wrapper, so
      // res.data === { user, accessToken, refreshToken, isNewUser } directly.
      const payload = res.data as any;
      const bUser = payload?.user;
      const accessToken = payload?.accessToken;
      const refreshToken = payload?.refreshToken;
      
      if (!bUser || !accessToken || !refreshToken) {
        return { ok: false, error: 'Invalid response from server. Please try again.' };
      }
      
      const isNew: boolean = payload?.isNewUser === true ||
        !bUser.fullName ||
        bUser.fullName.trim() === '';

      // ⚠️ CRITICAL: Set needsNameCompletion BEFORE calling saveSession.
      // saveSession calls set({ user }) which triggers otp.tsx to re-render.
      // If needsNameCompletion is false at that moment, otp.tsx will redirect
      // to home BEFORE the NameToaster modal can open.
      set({
        pendingPhone: '',
        devOtp: null,
        otpExpiresAt: null,
        otpResendAvailableAt: null,
        needsNameCompletion: isNew,
      });

      await saveSession(bUser, { accessToken, refreshToken });
      
      return { ok: true, isNewUser: isNew };
    },

    completeRegistration: async (name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) return { ok: false, error: 'Name cannot be empty.' };
      
      const { tokens, user, saveSession } = get();
      
      if (tokens?.accessToken) {
        const res = await authService.updateProfile(tokens.accessToken, { fullName: trimmedName });
        if (res.ok && res.data) {
          // apiClient already unwraps TransformInterceptor
          const updatedUser = res.data as any;
          await saveSession(updatedUser, tokens);
          set({ needsNameCompletion: false }); // allow otp.tsx → home redirect
          return { ok: true };
        }
        return { ok: false, error: res.error || 'Failed to update profile. Please try again.' };
      }
      
      // Fallback: update locally if no token (shouldn't happen in normal flow)
      if (user) {
        const updated: AuthUser = { ...user, name: trimmedName };
        set({ user: updated, needsNameCompletion: false });
        await Storage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
        return { ok: true };
      }
      
      return { ok: false, error: 'Session expired. Please log in again.' };
    },
  };
});
