import { apiFetch, ApiResponse } from './apiClient';
import { CreateAddressPayload, SavedAddress, UpdateAddressPayload } from '@/types/address';

export const addressService = {
  getAddresses: async (): Promise<ApiResponse<SavedAddress[]>> => {
    return apiFetch<SavedAddress[]>('customer/addresses', { method: 'GET' });
  },

  getDefaultAddress: async (): Promise<ApiResponse<SavedAddress>> => {
    return apiFetch<SavedAddress>('customer/addresses/default', { method: 'GET' });
  },

  createAddress: async (payload: CreateAddressPayload): Promise<ApiResponse<SavedAddress>> => {
    return apiFetch<SavedAddress>('customer/addresses', {
      method: 'POST',
      body: payload,
    });
  },

  updateAddress: async (id: string, payload: UpdateAddressPayload): Promise<ApiResponse<SavedAddress>> => {
    return apiFetch<SavedAddress>(`customer/addresses/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  deleteAddress: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiFetch<{ success: boolean }>(`customer/addresses/${id}`, { method: 'DELETE' });
  },

  setDefaultAddress: async (id: string): Promise<ApiResponse<SavedAddress>> => {
    return apiFetch<SavedAddress>(`customer/addresses/${id}/default`, { method: 'PATCH' });
  },
};
