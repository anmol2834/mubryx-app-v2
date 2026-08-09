import { useMemo } from 'react';
import { useCatalogQuery } from './useCatalogQuery';
import { ServiceApiDto } from '@/types/service';

export interface UseServicesOptions {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  isPopular?: boolean;
}

/**
 * Returns services list derived directly from the cached ['catalog'] query.
 * Automatically filters locally by categoryId, search, or isPopular.
 * Zero redundant network requests on navigation.
 */
export function useServicesQuery(optionsOrCategoryId?: UseServicesOptions | string, searchArg?: string) {
  const options: UseServicesOptions = typeof optionsOrCategoryId === 'string'
    ? { categoryId: optionsOrCategoryId, search: searchArg }
    : optionsOrCategoryId || {};

  const { categoryId, search, isPopular } = options;
  const catalogQuery = useCatalogQuery();

  const filteredServices = useMemo(() => {
    const services = catalogQuery.data?.services ?? [];
    if (!services.length) return [];

    return services.filter((svc) => {
      if (categoryId) {
        const matchesId = svc.categoryId === categoryId;
        const matchesSlug = (svc.category as any)?.slug === categoryId;
        if (!matchesId && !matchesSlug) return false;
      }
      if (isPopular && !svc.isPopular) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchesTitle = svc.title.toLowerCase().includes(q);
        const matchesDesc = svc.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [catalogQuery.data?.services, categoryId, search, isPopular]);

  return {
    ...catalogQuery,
    data: filteredServices as ServiceApiDto[],
  };
}
