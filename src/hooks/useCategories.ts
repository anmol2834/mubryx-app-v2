import { useMemo } from 'react';
import { useCategoriesQuery } from '@/hooks/queries/useCategoriesQuery';
import { mapCategoryList } from '@/mappers/categoryMapper';

export function useCategories() {
  const { data: apiCategories = [], isLoading, error, refetch } = useCategoriesQuery();
  
  const categories = useMemo(() => mapCategoryList(apiCategories), [apiCategories]);

  return {
    categories,
    isLoading,
    error: error ? error.message : null,
    apiError: null,
    refetch,
  };
}
