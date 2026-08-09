import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/services/bookingService';
import { useAuthStore } from '@/store/authStore';
import type { CreateBookingRequest, Booking } from '@/types/booking';

export function useBookingMutations() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const cartQueryKey = user?.id ? ['cart', user.id] : ['cart', 'guest'];
  const bookingsQueryKey = user?.id ? ['bookings', user.id] : ['bookings'];

  /**
   * Create a booking from the customer's active cart.
   * On success: invalidates cart cache (shows empty) + bookings cache (history updates).
   */
  const createBookingMutation = useMutation({
    mutationFn: async (payload: CreateBookingRequest) => {
      const res = await bookingService.createBooking(payload);
      if (!res.ok || !res.data) {
        const errorCode = (res.apiError as any)?.code || 'BOOKING_CREATION_FAILED';
        const err = new Error(res.error || 'Booking failed. Please try again.');
        (err as any).errorCode = errorCode;
        (err as any).statusCode = res.statusCode;
        throw err;
      }
      return res.data;
    },
    onSuccess: () => {
      // Clear cart display — backend already converted the cart
      queryClient.setQueryData(cartQueryKey, null);
      queryClient.removeQueries({ queryKey: cartQueryKey });
      // Refresh booking history
      queryClient.invalidateQueries({ queryKey: bookingsQueryKey });
    },
  });

  /**
   * Cancel an eligible booking.
   */
  const cancelBookingMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await bookingService.cancelBooking(id, { reason });
      if (!res.ok || !res.data) {
        throw new Error(res.error || 'Failed to cancel booking.');
      }
      return res.data as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsQueryKey });
    },
  });

  return {
    createBooking: createBookingMutation,
    cancelBooking: cancelBookingMutation,
  };
}
