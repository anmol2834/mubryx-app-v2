import { create } from 'zustand';
import { Storage } from '@/services/storage';
import { CartItem, CartResponse, CartServiceMetadata } from '@/types/cart';

const GUEST_CART_STORAGE_KEY = 'mubryx_guest_cart';

interface GuestCartState {
  items: CartItem[];
  isHydrated: boolean;
  
  hydrate: () => Promise<void>;
  addItem: (serviceId: string, quantity?: number, serviceData?: CartServiceMetadata) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
  getFormattedCart: () => CartResponse;
}

function calculateGuestCartResponse(items: CartItem[]): CartResponse {
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.pricing.lineTotal, 0);
  const tax = Math.round(subtotal * 0.05);
  const platformFee = items.length > 0 ? 49 : 0;
  const total = items.length > 0 ? subtotal + tax + platformFee : 0;

  return {
    id: 'guest_cart',
    cartId: 'guest_cart',
    status: 'ACTIVE',
    currency: 'INR',
    version: 1,
    lastActivityAt: new Date().toISOString(),
    items,
    itemCount,
    appliedCoupon: null,
    summary: {
      subtotal,
      discount: 0,
      taxableAmount: subtotal,
      tax,
      platformFee,
      total,
    },
  };
}

export const useGuestCartStore = create<GuestCartState>((set, get) => ({
  items: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await Storage.getItem(GUEST_CART_STORAGE_KEY);
      if (raw) {
        const parsed: CartItem[] = JSON.parse(raw);
        set({ items: parsed, isHydrated: true });
        return;
      }
    } catch (err) {
      console.warn('[guestCartStore] Failed to hydrate guest cart:', err);
    }
    set({ isHydrated: true });
  },

  addItem: async (serviceId, quantity = 1, serviceData) => {
    const { items } = get();
    const existingIndex = items.findIndex(i => i.serviceId === serviceId || i.id === serviceId);

    let updatedItems: CartItem[];
    const unitPrice = serviceData?.discountPrice ?? serviceData?.price ?? 499;

    if (existingIndex >= 0) {
      updatedItems = items.map((item, idx) =>
        idx === existingIndex
          ? {
              ...item,
              quantity: item.quantity + quantity,
              pricing: {
                ...item.pricing,
                lineTotal: unitPrice * (item.quantity + quantity),
              },
              lineTotal: unitPrice * (item.quantity + quantity),
            }
          : item
      );
    } else {
      const newItem: CartItem = {
        id: serviceId,
        serviceId,
        quantity,
        unitPrice,
        lineTotal: unitPrice * quantity,
        service: {
          id: serviceId,
          title: serviceData?.title || 'Service',
          description: serviceData?.description || 'Service description',
          price: serviceData?.price || unitPrice,
          discountPrice: serviceData?.discountPrice,
          image: serviceData?.image,
          duration: serviceData?.duration || '45 mins',
        },
        pricing: {
          listPrice: serviceData?.price ?? unitPrice,
          unitPrice,
          lineTotal: unitPrice * quantity,
        },
      };
      updatedItems = [...items, newItem];
    }

    set({ items: updatedItems });
    await Storage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(updatedItems));
  },

  updateQuantity: async (itemId, quantity) => {
    const { items } = get();
    const updatedItems = items
      .map(item =>
        item.id === itemId || item.serviceId === itemId
          ? {
              ...item,
              quantity,
              pricing: {
                ...item.pricing,
                lineTotal: item.unitPrice * quantity,
              },
              lineTotal: item.unitPrice * quantity,
            }
          : item
      )
      .filter(item => item.quantity > 0);

    set({ items: updatedItems });
    await Storage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(updatedItems));
  },

  removeItem: async (itemId) => {
    const { items } = get();
    const updatedItems = items.filter(i => i.id !== itemId && i.serviceId !== itemId);

    set({ items: updatedItems });
    await Storage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(updatedItems));
  },

  clear: async () => {
    set({ items: [] });
    await Storage.removeItem(GUEST_CART_STORAGE_KEY);
  },

  getFormattedCart: () => {
    return calculateGuestCartResponse(get().items);
  },
}));
