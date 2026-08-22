import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const STORE_KEY = 'mubryx_pending_review_state';

export interface PendingReviewBooking {
  bookingId: string;
  bookingNumber?: string;
  serviceTitle?: string;
  technicianName?: string;
  technicianPhoto?: string | null;
}

interface CompulsoryReviewState {
  pendingBooking: PendingReviewBooking | null;
  isModalVisible: boolean;
  revealedHappyCode: string | null;
  setPendingReview: (booking: PendingReviewBooking) => Promise<void>;
  setHappyCodeRevealed: (happyCode: string) => Promise<void>;
  clearPendingReview: () => Promise<void>;
  hydrateStore: () => Promise<void>;
}

export const useCompulsoryReviewStore = create<CompulsoryReviewState>((set, get) => ({
  pendingBooking: null,
  isModalVisible: false,
  revealedHappyCode: null,

  setPendingReview: async (booking: PendingReviewBooking) => {
    set({
      pendingBooking: booking,
      isModalVisible: true,
      revealedHappyCode: null,
    });
    try {
      await SecureStore.setItemAsync(STORE_KEY, JSON.stringify({ booking, revealedHappyCode: null }));
    } catch (e) {
      console.warn('[CompulsoryReviewStore] Failed to save state to SecureStore', e);
    }
  },

  setHappyCodeRevealed: async (happyCode: string) => {
    set({
      revealedHappyCode: happyCode,
      isModalVisible: true,
    });
    const current = get().pendingBooking;
    try {
      await SecureStore.setItemAsync(STORE_KEY, JSON.stringify({ booking: current, revealedHappyCode: happyCode }));
    } catch (e) {
      console.warn('[CompulsoryReviewStore] Failed to update Happy Code in SecureStore', e);
    }
  },

  clearPendingReview: async () => {
    set({
      pendingBooking: null,
      isModalVisible: false,
      revealedHappyCode: null,
    });
    try {
      await SecureStore.deleteItemAsync(STORE_KEY);
    } catch (e) {
      console.warn('[CompulsoryReviewStore] Failed to clear SecureStore', e);
    }
  },

  hydrateStore: async () => {
    try {
      const stored = await SecureStore.getItemAsync(STORE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.booking?.bookingId) {
          set({
            pendingBooking: parsed.booking,
            revealedHappyCode: parsed.revealedHappyCode || null,
            isModalVisible: true,
          });
        }
      }
    } catch (e) {
      console.warn('[CompulsoryReviewStore] Failed to hydrate state', e);
    }
  },
}));
