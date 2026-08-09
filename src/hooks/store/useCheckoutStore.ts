import { create } from 'zustand';

interface CheckoutState {
  couponInput: string;
  setCouponInput: (coupon: string) => void;
  // We can add selected address, schedule, etc. here in the future
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  couponInput: '',
  setCouponInput: (couponInput) => set({ couponInput }),
  reset: () => set({ couponInput: '' }),
}));
