import { useMemo } from 'react';
import { useCategoriesQuery } from '@/hooks/queries/useCategoriesQuery';
import { mapCategory } from '@/mappers/categoryMapper';

export function useCategory(idOrSlug?: string) {
  const { data: apiCategories = [], isLoading, error, refetch } = useCategoriesQuery();

  const category = useMemo(() => {
    if (!idOrSlug) return null;
    const found = apiCategories.find(
      (c) => c.id === idOrSlug || c.slug === idOrSlug
    );
    return found ? mapCategory(found) : null;
  }, [apiCategories, idOrSlug]);

  return {
    category,
    isLoading,
    error: error ? error.message : null,
    apiError: null,
    refetch,
  };
}
