import { apiFetch, ApiResponse } from './apiClient';
import type {
  CreateBookingRequest,
  CreateBookingResponse,
  Booking,
  CancelBookingRequest,
} from '@/types/booking';

export const bookingService = {
  /**
   * Create a booking from the customer's active cart.
   * Transactional: validates → creates booking → clears cart.
   * Idempotent: same idempotencyKey returns existing booking.
   */
  async createBooking(
    payload: CreateBookingRequest,
  ): Promise<ApiResponse<CreateBookingResponse>> {
    return apiFetch<CreateBookingResponse>('bookings', {
      method: 'POST',
      body: payload,
    });
  },

  /**
   * Get all bookings for the current customer.
   * Optional tab filter: 'upcoming' | 'completed'
   */
  async getBookings(
    tab?: 'upcoming' | 'completed',
  ): Promise<ApiResponse<Booking[]>> {
    const query = tab ? `?tab=${tab}` : '';
    return apiFetch<Booking[]>(`bookings${query}`, { method: 'GET' });
  },

  /**
   * Get a single booking by internal ID (includes status history).
   */
  async getBookingById(id: string): Promise<ApiResponse<Booking>> {
    return apiFetch<Booking>(`bookings/${id}`, { method: 'GET' });
  },

  /**
   * Cancel an eligible booking.
   */
  async cancelBooking(
    id: string,
    payload?: CancelBookingRequest,
  ): Promise<ApiResponse<Booking>> {
    return apiFetch<Booking>(`bookings/${id}/cancel`, {
      method: 'POST',
      body: payload ?? {},
    });
  },
};
