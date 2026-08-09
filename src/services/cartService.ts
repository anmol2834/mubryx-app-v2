import { apiFetch, ApiResponse } from './apiClient';
import {
  CartResponse,
  AddCartItemPayload,
  UpdateCartItemPayload,
  MergeCartPayload,
  CheckoutPayload,
  CheckoutResponse,
} from '@/types/cart';

export const cartService = {
  /**
   * Get active cart for current authenticated customer.
   */
  async getCart(): Promise<ApiResponse<CartResponse>> {
    return apiFetch<CartResponse>('cart', { method: 'GET' });
  },

  /**
   * Add service item to active cart.
   */
  async addItem(payload: AddCartItemPayload): Promise<ApiResponse<CartResponse>> {
    return apiFetch<CartResponse>('cart/items', {
      method: 'POST',
      body: {
        serviceId: payload.serviceId,
        quantity: payload.quantity ?? 1,
        specialNotes: payload.specialNotes,
      },
    });
  },

  /**
   * Update quantity of an existing cart item.
   */
  async updateQuantity(
    itemId: string,
    payload: UpdateCartItemPayload,
  ): Promise<ApiResponse<CartResponse>> {
    return apiFetch<CartResponse>(`cart/items/${itemId}`, {
      method: 'PATCH',
      body: {
        quantity: payload.quantity,
        expectedVersion: payload.expectedVersion,
      },
    });
  },

  /**
   * Remove item from active cart.
   */
  async removeItem(itemId: string): Promise<ApiResponse<CartResponse>> {
    return apiFetch<CartResponse>(`cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Clear all items from active cart.
   */
  async clearCart(): Promise<ApiResponse<CartResponse>> {
    return apiFetch<CartResponse>('cart', {
      method: 'DELETE',
    });
  },

  /**
   * Merge guest cart items into authenticated cart upon login.
   */
  async mergeCart(payload: MergeCartPayload): Promise<ApiResponse<CartResponse>> {
    return apiFetch<CartResponse>('cart/merge', {
      method: 'POST',
      body: payload,
    });
  },

  /**
   * Validate cart & create checkout session/booking.
   */
  async checkout(payload: CheckoutPayload): Promise<ApiResponse<CheckoutResponse>> {
    return apiFetch<CheckoutResponse>('checkout', {
      method: 'POST',
      body: payload,
    });
  },
};
