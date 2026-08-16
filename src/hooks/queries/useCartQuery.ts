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
  const authReady = !useAuthStore((s) => s.isLoading);
  const isAuthenticated = !!(user?.id && tokens?.accessToken);

  const guestItems = useGuestCartStore((s) => s.items);
  const isGuestHydrated = useGuestCartStore((s) => s.isHydrated);

  const guestCart: CartResponse = useMemo(() => {
    const items = guestItems || [];
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
  }, [guestItems]);

  const queryKey = useMemo(() => {
    return isAuthenticated && user?.id ? ['cart', user.id] : ['cart', 'guest'];
  }, [isAuthenticated, user?.id]);

  const query = useQuery<CartResponse, Error>({
    queryKey,
    queryFn: async () => {
      if (!isAuthenticated || !authReady) {
        return guestCart;
      }
      const res = await cartService.getCart();
      if (!res.ok || !res.data) {
        throw new Error(res.error || 'Failed to fetch cart');
      }
      return res.data;
    },
    enabled: isAuthenticated ? authReady : isGuestHydrated,
    staleTime: 5 * 60 * 1000, // 5 mins fresh
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const guestResult = useMemo(() => ({
    ...query,
    data: guestCart,
    isLoading: !isGuestHydrated,
    isFetching: false,
    isSuccess: true,
    refetch: async () => ({ data: guestCart } as any),
  }), [query, guestCart, isGuestHydrated]);

  if (!isAuthenticated) {
    return guestResult;
  }

  return query;
}

/**
 * Granular selector hook for cart item count.
 * Prevents re-renders in Header components when total/pricing changes but item count is unchanged.
 */
export function useCartItemCount(): number {
  const user = useAuthStore((s) => s.user);
  const tokens = useAuthStore((s) => s.tokens);
  const isAuthenticated = !!(user?.id && tokens?.accessToken);

  const guestItemCount = useGuestCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  const { data: cart } = useCartQuery();

  if (!isAuthenticated) {
    return guestItemCount;
  }

  return cart?.itemCount ?? cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
}
