import { useQuery } from '@tanstack/react-query';
import { catalogService, CatalogResponse } from '@/services/catalogService';

export const CATALOG_QUERY_KEY = ['catalog'] as const;

export function useCatalogQuery() {
  return useQuery<CatalogResponse, Error>({
    queryKey: CATALOG_QUERY_KEY,
    queryFn: async () => {
      const res = await catalogService.getCatalog();
      if (!res.ok || !res.data) {
        throw new Error(res.error || 'Failed to load catalog');
      }
      return res.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes fresh time
    gcTime: 60 * 60 * 1000, // 1 hour memory cache retention
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
