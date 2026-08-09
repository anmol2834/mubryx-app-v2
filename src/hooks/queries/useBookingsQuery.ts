import { useQuery } from '@tanstack/react-query';
import { bookingService } from '@/services/bookingService';
import { useAuthStore } from '@/store/authStore';
import type { Booking } from '@/types/booking';

export function useBookingsQuery(tab?: 'upcoming' | 'completed') {
  const user = useAuthStore((s) => s.user);
  const tokens = useAuthStore((s) => s.tokens);
  const isAuthenticated = !!(user?.id && tokens?.accessToken);

  return useQuery<Booking[]>({
    queryKey: ['bookings', user?.id, tab],
    queryFn: async () => {
      const res = await bookingService.getBookings(tab);
      if (!res.ok || !res.data) {
        throw new Error(res.error || 'Failed to load bookings.');
      }
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000,        // 30s — bookings refresh frequently
    gcTime: 5 * 60 * 1000,       // 5 min cache
    refetchOnMount: true,         // Always check for new bookings on screen mount
    refetchOnWindowFocus: false,
  });
}
