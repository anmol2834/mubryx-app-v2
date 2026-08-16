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
  const subtotal = items.reduce((sum, i) => sum + (i.pricing?.lineTotal ?? i.lineTotal ?? 0), 0);
  const tax = Math.round(subtotal * 0.18);
  const platformFee = 0;
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
    const newCategoryId = serviceData?.categoryId;

    // Single-Category Cart Isolation:
    // If incoming item belongs to a different category, reset existing items
    let currentItems = items;
    if (newCategoryId && items.length > 0) {
      const hasDifferentCategory = items.some((i) => {
        const itemCat = i.service?.categoryId || i.categoryId;
        return !itemCat || itemCat !== newCategoryId;
      });
      if (hasDifferentCategory) {
        currentItems = [];
      }
    }

    const existingIndex = currentItems.findIndex(
      (i) => i.serviceId === serviceId || i.id === serviceId
    );

    let updatedItems: CartItem[];
    const unitPrice = serviceData?.discountPrice ?? serviceData?.price ?? 499;

    if (existingIndex >= 0) {
      updatedItems = currentItems.map((item, idx) =>
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
        categoryId: newCategoryId,
        quantity,
        unitPrice,
        lineTotal: unitPrice * quantity,
        service: {
          id: serviceId,
          categoryId: newCategoryId,
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
      updatedItems = [...currentItems, newItem];
    }

    // Synchronous 0ms state update for immediate UI responsiveness
    set({ items: updatedItems });

    // Non-blocking async background storage persistence
    Storage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(updatedItems)).catch((err) => {
      console.warn('[guestCartStore] Storage persist error:', err);
    });
  },

  updateQuantity: async (itemId, quantity) => {
    const { items } = get();
    const updatedItems = items
      .map((item) =>
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
      .filter((item) => item.quantity > 0);

    set({ items: updatedItems });
    Storage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(updatedItems)).catch((err) => {
      console.warn('[guestCartStore] Storage persist error:', err);
    });
  },

  removeItem: async (itemId) => {
    const { items } = get();
    const updatedItems = items.filter((i) => i.id !== itemId && i.serviceId !== itemId);

    set({ items: updatedItems });
    Storage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(updatedItems)).catch((err) => {
      console.warn('[guestCartStore] Storage persist error:', err);
    });
  },

  clear: async () => {
    set({ items: [] });
    Storage.removeItem(GUEST_CART_STORAGE_KEY).catch((err) => {
      console.warn('[guestCartStore] Storage clear error:', err);
    });
  },

  getFormattedCart: () => {
    return calculateGuestCartResponse(get().items);
  },
}));
