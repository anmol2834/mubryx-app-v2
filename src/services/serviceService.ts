import { apiFetch, ApiResponse } from './apiClient';
import { ServiceApiDto } from '@/types/service';

export interface GetServicesParams {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  isPopular?: boolean;
  signal?: AbortSignal;
}

export const serviceService = {
  /**
   * Fetch services with optional categoryId filter, search query, and pagination parameters
   */
  async getServices(params: GetServicesParams = {}): Promise<ApiResponse<ServiceApiDto[]>> {
    const { categoryId, search, page, limit, isPopular, signal } = params;
    const searchParams = new URLSearchParams();

    if (categoryId) {
      searchParams.append('categoryId', categoryId);
    }
    if (search) {
      searchParams.append('search', search);
    }
    if (page) {
      searchParams.append('page', String(page));
    }
    if (limit) {
      searchParams.append('limit', String(limit));
    }
    if (isPopular) {
      searchParams.append('isPopular', 'true');
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `services?${queryString}` : 'services';

    return apiFetch<ServiceApiDto[]>(endpoint, {
      method: 'GET',
      signal,
    });
  },

  /**
   * Fetch single service details by ID
   */
  async getServiceById(id: string, signal?: AbortSignal): Promise<ApiResponse<ServiceApiDto>> {
    return apiFetch<ServiceApiDto>(`services/${id}`, {
      method: 'GET',
      signal,
    });
  },
};
