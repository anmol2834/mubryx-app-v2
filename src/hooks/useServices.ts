import { useMemo } from 'react';
import { useServicesQuery, UseServicesOptions } from '@/hooks/queries/useServicesQuery';
import { mapServiceList } from '@/mappers/serviceMapper';

export function useServices(optionsOrCategoryId?: UseServicesOptions | string, searchArg?: string) {
  const { data: apiServices = [], isLoading, error, refetch } = useServicesQuery(optionsOrCategoryId, searchArg);

  const services = useMemo(() => mapServiceList(apiServices), [apiServices]);

  return {
    services,
    isLoading,
    error: error ? error.message : null,
    apiError: null,
    refetch,
  };
}
