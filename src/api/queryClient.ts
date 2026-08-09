import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, // 15 minutes catalog fresh duration
      gcTime: 60 * 60 * 1000, // 60 minutes cache retention
      refetchOnMount: false, // Prevent redundant fetching on component remount
      refetchOnWindowFocus: false, // Prevent refetches when switching app focus
      refetchOnReconnect: false, // Prevent refetches on network reconnect
      retry: 1, // Retry once on network failure
    },
  },
});
