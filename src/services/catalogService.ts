import { apiFetch, ApiResponse } from './apiClient';
import { CategoryApiDto } from '@/types/category';
import { ServiceApiDto } from '@/types/service';

export interface CatalogResponse {
  categories: CategoryApiDto[];
  services: ServiceApiDto[];
}

export const catalogService = {
  /**
   * Fetch complete unified catalog (categories + active services) in one optimized request
   */
  async getCatalog(): Promise<ApiResponse<CatalogResponse>> {
    return apiFetch<CatalogResponse>('catalog', {
      method: 'GET',
    });
  },
};
