import { apiFetch, ApiResponse } from './apiClient';
import { CategoryApiDto } from '@/types/category';

export const categoryService = {
  /**
   * Fetch all service categories from backend
   */
  async getCategories(): Promise<ApiResponse<CategoryApiDto[]>> {
    return apiFetch<CategoryApiDto[]>('categories', {
      method: 'GET',
    });
  },

  async getCategoryById(id: string): Promise<ApiResponse<CategoryApiDto>> {
    return apiFetch<CategoryApiDto>(`categories/${id}`, {
      method: 'GET',
    });
  },
};
