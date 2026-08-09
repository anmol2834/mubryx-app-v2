import { useQuery } from '@tanstack/react-query';
import { bookingService } from '@/services/bookingService';
import { useAuthStore } from '@/store/authStore';
import type { Booking } from '@/types/booking';

export function useBookingQuery(bookingId: string | null | undefined) {
  const user = useAuthStore((s) => s.user);
  const tokens = useAuthStore((s) => s.tokens);
  const isAuthenticated = !!(user?.id && tokens?.accessToken);

  return useQuery<Booking>({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      if (!bookingId) throw new Error('No booking ID provided');
      const res = await bookingService.getBookingById(bookingId);
      if (!res.ok || !res.data) {
        throw new Error(res.error || 'Failed to load booking details.');
      }
      return res.data;
    },
    enabled: isAuthenticated && !!bookingId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });
}
