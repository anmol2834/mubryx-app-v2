import { useQuery } from '@tanstack/react-query';
import { addressService } from '@/services/addressService';
import { useAuthStore } from '@/store/authStore';
import { SavedAddress } from '@/types/address';

export function useAddressesQuery() {
  const user = useAuthStore((s) => s.user);
  const tokens = useAuthStore((s) => s.tokens);
  const authReady = !useAuthStore((s) => s.isLoading);
  const isAuthenticated = !!(user?.id && tokens?.accessToken);

  return useQuery<SavedAddress[]>({
    queryKey: isAuthenticated ? ['customer', 'addresses', user.id] : ['customer', 'addresses', 'guest'],
    enabled: isAuthenticated ? authReady : true,
    queryFn: async () => {
      if (!isAuthenticated || !authReady) return [];
      const res = await addressService.getAddresses();
      if (res.ok && res.data) {
        return res.data;
      }
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache staleTime
    gcTime: 1000 * 60 * 30, // 30 minutes garbage collection time
  });
}
