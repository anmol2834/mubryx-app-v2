import { useQuery } from '@tanstack/react-query';
import { fetchNotifications } from '@/screens/Notifications/services/notificationService';
import { useAuthStore } from '@/store/authStore';
import type { Notification } from '@/screens/Notifications/types';

export function useNotificationsQuery() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || 'guest';

  return useQuery<Notification[], Error>({
    queryKey: ['notifications', userId],
    queryFn: () => fetchNotifications(userId),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
