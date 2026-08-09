import { useCatalogQuery } from './useCatalogQuery';
import { CategoryApiDto } from '@/types/category';

/**
 * Returns categories list derived directly from the cached ['catalog'] query.
 * Zero redundant network requests on navigation.
 */
export function useCategoriesQuery() {
  const catalogQuery = useCatalogQuery();
  
  return {
    ...catalogQuery,
    data: catalogQuery.data?.categories ?? ([] as CategoryApiDto[]),
  };
}
