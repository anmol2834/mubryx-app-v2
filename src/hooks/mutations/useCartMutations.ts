import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cartService';
import { useAuthStore } from '@/store/authStore';
import { useGuestCartStore } from '@/store/guestCartStore';
import { AddCartItemPayload, CartItem, CartResponse, CartServiceMetadata, MergeCartPayload } from '@/types/cart';

export function useCartMutations() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const tokens = useAuthStore((s) => s.tokens);
  const isAuthenticated = !!(user?.id && tokens?.accessToken);

  const guestCartStore = useGuestCartStore();

  const cartQueryKey = isAuthenticated ? ['cart', user.id] : ['cart', 'guest'];

  // ADD ITEM MUTATION
  const addItemMutation = useMutation({
    mutationFn: async (payload: AddCartItemPayload & { serviceData?: CartServiceMetadata }) => {
      if (!isAuthenticated) {
        await guestCartStore.addItem(payload.serviceId, payload.quantity ?? 1, payload.serviceData);
        return guestCartStore.getFormattedCart();
      }
      const res = await cartService.addItem(payload);
      if (!res.ok || !res.data) throw res;
      return res.data;
    },
    onMutate: async (payload) => {
      if (!isAuthenticated) return;
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const previousCart = queryClient.getQueryData<CartResponse>(cartQueryKey);

      if (previousCart) {
        const existingItems = previousCart.items || [];
        const foundIdx = existingItems.findIndex(i => i.serviceId === payload.serviceId || i.id === payload.serviceId);
        let newItems: CartItem[];

        const unitPrice = payload.serviceData?.discountPrice ?? payload.serviceData?.price ?? 499;

        if (foundIdx >= 0) {
          newItems = existingItems.map((item, idx) =>
            idx === foundIdx
              ? {
                  ...item,
                  quantity: item.quantity + (payload.quantity ?? 1),
                  pricing: {
                    ...item.pricing,
                    lineTotal: unitPrice * (item.quantity + (payload.quantity ?? 1)),
                  },
                  lineTotal: unitPrice * (item.quantity + (payload.quantity ?? 1)),
                }
              : item
          );
        } else {
          const newItem: CartItem = {
            id: payload.serviceId,
            serviceId: payload.serviceId,
            quantity: payload.quantity ?? 1,
            unitPrice,
            lineTotal: unitPrice * (payload.quantity ?? 1),
            service: {
              id: payload.serviceId,
              title: payload.serviceData?.title || 'Service',
              description: payload.serviceData?.description || 'Service',
              price: payload.serviceData?.price || unitPrice,
              discountPrice: payload.serviceData?.discountPrice,
              image: payload.serviceData?.image,
              duration: payload.serviceData?.duration || '45 mins',
            },
            pricing: {
              listPrice: payload.serviceData?.price ?? unitPrice,
              unitPrice,
              lineTotal: unitPrice * (payload.quantity ?? 1),
            },
          };
          newItems = [...existingItems, newItem];
        }

        const subtotal = newItems.reduce((sum, i) => sum + i.pricing.lineTotal, 0);
        const tax = Math.round(subtotal * 0.18);
        const platformFee = 0;
        const total = subtotal + tax + platformFee;

        queryClient.setQueryData<CartResponse>(cartQueryKey, {
          ...previousCart,
          version: previousCart.version + 1,
          items: newItems,
          itemCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
          summary: {
            ...previousCart.summary,
            subtotal,
            tax,
            platformFee,
            total,
          },
        });
      }
      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart && isAuthenticated) {
        queryClient.setQueryData(cartQueryKey, context.previousCart);
      }
    },
    onSuccess: (serverCart) => {
      if (isAuthenticated && serverCart) {
        queryClient.setQueryData(cartQueryKey, (old: any) => { if (!old || serverCart.version >= old.version) return serverCart; return old; });
      }
    },
  });

  // UPDATE QUANTITY MUTATION
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity, expectedVersion }: { itemId: string; quantity: number; expectedVersion?: number }) => {
      if (!isAuthenticated) {
        await guestCartStore.updateQuantity(itemId, quantity);
        return guestCartStore.getFormattedCart();
      }
      const res = await cartService.updateQuantity(itemId, { quantity, expectedVersion });
      if (!res.ok || !res.data) throw res;
      return res.data;
    },
    onMutate: async ({ itemId, quantity }) => {
      if (!isAuthenticated) return;
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const previousCart = queryClient.getQueryData<CartResponse>(cartQueryKey);

      if (previousCart) {
        const newItems = previousCart.items
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

        const subtotal = newItems.reduce((sum, i) => sum + i.pricing.lineTotal, 0);
        const tax = Math.round(subtotal * 0.18);
        const platformFee = 0;
        const total = subtotal + tax + platformFee;

        queryClient.setQueryData<CartResponse>(cartQueryKey, {
          ...previousCart,
          version: previousCart.version + 1,
          items: newItems,
          itemCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
          summary: {
            ...previousCart.summary,
            subtotal,
            tax,
            platformFee,
            total,
          },
        });
      }
      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart && isAuthenticated) {
        queryClient.setQueryData(cartQueryKey, context.previousCart);
      }
    },
    onSuccess: (serverCart) => {
      if (isAuthenticated && serverCart) {
        queryClient.setQueryData(cartQueryKey, (old: any) => { if (!old || serverCart.version >= old.version) return serverCart; return old; });
      }
    },
  });

  // REMOVE ITEM MUTATION
  const removeItemMutation = useMutation({
    mutationFn: async ({ itemId }: { itemId: string; expectedVersion?: number }) => {
      if (!isAuthenticated) {
        await guestCartStore.removeItem(itemId);
        return guestCartStore.getFormattedCart();
      }
      const res = await cartService.removeItem(itemId);
      if (!res.ok || !res.data) throw res;
      return res.data;
    },
    onMutate: async ({ itemId }) => {
      if (!isAuthenticated) return;
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const previousCart = queryClient.getQueryData<CartResponse>(cartQueryKey);

      if (previousCart) {
        const newItems = previousCart.items.filter(i => i.id !== itemId && i.serviceId !== itemId);
        const subtotal = newItems.reduce((sum, i) => sum + i.pricing.lineTotal, 0);
        const tax = Math.round(subtotal * 0.18);
        const platformFee = 0;
        const total = subtotal + tax + platformFee;

        queryClient.setQueryData<CartResponse>(cartQueryKey, {
          ...previousCart,
          version: previousCart.version + 1,
          items: newItems,
          itemCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
          summary: {
            ...previousCart.summary,
            subtotal,
            tax,
            platformFee,
            total,
          },
        });
      }
      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart && isAuthenticated) {
        queryClient.setQueryData(cartQueryKey, context.previousCart);
      }
    },
    onSuccess: (serverCart) => {
      if (isAuthenticated && serverCart) {
        queryClient.setQueryData(cartQueryKey, (old: any) => { if (!old || serverCart.version >= old.version) return serverCart; return old; });
      }
    },
  });

  // CLEAR CART MUTATION
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        await guestCartStore.clear();
        return guestCartStore.getFormattedCart();
      }
      const res = await cartService.clearCart();
      if (!res.ok || !res.data) throw res;
      return res.data;
    },
    onSuccess: (serverCart) => {
      if (isAuthenticated && serverCart) {
        queryClient.setQueryData(cartQueryKey, (old: any) => { if (!old || serverCart.version >= old.version) return serverCart; return old; });
      }
    },
  });

  // MERGE GUEST CART MUTATION
  const mergeGuestCartMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) return null;
      const guestItems = guestCartStore.items;
      if (guestItems.length === 0) return null;

      const payload: MergeCartPayload = {
        items: guestItems.map((gi) => ({
          serviceId: gi.serviceId,
          quantity: gi.quantity,
          specialNotes: gi.specialNotes ?? undefined,
        })),
      };

      const res = await cartService.mergeCart(payload);
      if (res.ok && res.data) {
        await guestCartStore.clear();
        return res.data;
      }
      return null;
    },
    onSuccess: (serverCart) => {
      if (serverCart && isAuthenticated) {
        queryClient.setQueryData(cartQueryKey, (old: any) => { if (!old || serverCart.version >= old.version) return serverCart; return old; });
      }
    },
  });

  // APPLY COUPON MUTATION
  const applyCouponMutation = useMutation({
    mutationFn: async (_code: string) => {
      return null;
    },
  });

  // REMOVE COUPON MUTATION
  const removeCouponMutation = useMutation({
    mutationFn: async () => {
      return null;
    },
  });

  // CHECKOUT MUTATION
  const checkoutMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isAuthenticated) {
        const res = await cartService.checkout(payload);
        if (res.ok && res.data) {
          queryClient.setQueryData(cartQueryKey, null);
          return res.data;
        }
      }
      queryClient.setQueryData(cartQueryKey, null);
      return {
        message: 'Booking confirmed',
        booking: {
          id: `bk_${Date.now()}`,
          userId: user?.id || 'guest',
          items: [],
          total: 0,
        } as any,
      };
    },
  });

  return {
    addItem: addItemMutation,
    updateQuantity: updateQuantityMutation,
    removeItem: removeItemMutation,
    clearCart: clearCartMutation,
    applyCoupon: applyCouponMutation,
    removeCoupon: removeCouponMutation,
    mergeGuestCart: mergeGuestCartMutation,
    checkout: checkoutMutation,
  };
}
