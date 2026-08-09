import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cartService } from '@/services/cartService';
import { useAuthStore } from '@/store/authStore';
import { useGuestCartStore } from '@/store/guestCartStore';
import { CartResponse } from '@/types/cart';

/**
 * Unified Cart Query Hook.
 * For authenticated users: fetches persistent cart from backend database with queryKey ['cart', userId].
 * For guest users: returns local guest cart state from guestCartStore with stable memoized calculation.
 */
export function useCartQuery() {
  const user = useAuthStore((s) => s.user);
  const tokens = useAuthStore((s) => s.tokens);
  const isAuthenticated = !!(user?.id && tokens?.accessToken);

  const guestItems = useGuestCartStore((s) => s.items);
  const isGuestHydrated = useGuestCartStore((s) => s.isHydrated);

  const guestCart: CartResponse = useMemo(() => {
    const items = guestItems || [];
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + (i.pricing?.lineTotal ?? i.lineTotal ?? 0), 0);
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
  }, [guestItems]);

  const queryKey = isAuthenticated ? ['cart', user.id] : ['cart', 'guest'];

  const query = useQuery<CartResponse, Error>({
    queryKey,
    queryFn: async () => {
      if (!isAuthenticated) {
        return guestCart;
      }
      const res = await cartService.getCart();
      if (!res.ok || !res.data) {
        throw new Error(res.error || 'Failed to fetch cart');
      }
      return res.data;
    },
    enabled: isAuthenticated || isGuestHydrated,
    staleTime: 5 * 60 * 1000, // 5 mins fresh
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  if (!isAuthenticated) {
    return {
      ...query,
      data: guestCart,
      isLoading: !isGuestHydrated,
      isFetching: false,
      isSuccess: true,
      refetch: async () => ({ data: guestCart } as any),
    };
  }

  return query;
}
