/**
 * bookingService — data layer for the Booking Flow module.
 *
 * This layer calls the REAL backend API.
 * The UI hooks (useBookingFlow) and animation components are unchanged.
 * Only this service changes between mock and real implementation.
 */

import type { BookingResult, CreateBookingPayload } from '../types';
import { MOCK_ENGINEERS, buildInitialStages } from '../mock/engineers';
import { bookingService as apiBookingService } from '@/services/bookingService';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOTP(): string {
  return String(randomInt(1000, 9999));
}

// ─── Create Booking ───────────────────────────────────────────────────────────

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<BookingResult> {
  // Call the real backend API
  const res = await apiBookingService.createBooking({
    addressId: payload.addressId,
    bookingType: payload.bookingType,
    scheduledAt: payload.scheduledAt ?? null,
    paymentMethod: payload.paymentMethod,
    notes: payload.notes,
    couponCode: payload.couponCode,
    idempotencyKey: payload.idempotencyKey,
    customerCurrentLocation: payload.customerCurrentLocation,
  });

  if (!res.ok || !res.data) {
    // Extract the error code for structured error handling
    const errorCode = (res.apiError as any)?.code || 'BOOKING_CREATION_FAILED';
    const error = new Error(res.error || 'Booking failed. Please try again.');
    (error as any).errorCode = errorCode;
    (error as any).statusCode = res.statusCode;
    throw error;
  }

  const booking = res.data;

  // Mock engineer for the "assigned" sheet — real technician assignment is future work.
  // The booking is real; the engineer display is simulated.
  const engineer = MOCK_ENGINEERS[randomInt(0, MOCK_ENGINEERS.length - 1)];
  const otp = generateOTP();

  // Build the primary service name from items
  const primaryItem = booking.items[0];
  const serviceName =
    booking.items.length > 1
      ? `${primaryItem?.title} +${booking.items.length - 1} more`
      : primaryItem?.title ?? 'Home Service';

  // Format display schedule
  const now = new Date();
  const scheduledDate =
    payload.displayScheduledDate ??
    `Today, ${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
  const scheduledTime = payload.displayScheduledTime ?? 'ASAP';

  return {
    bookingId: booking.bookingId,
    bookingNumber: booking.bookingNumber,
    otp,
    status: 'assigned',
    engineer,
    estimatedArrival: '~18 min',
    stages: buildInitialStages(engineer.name),
    serviceName,
    serviceIcon: '🔧',
    scheduledDate,
    scheduledTime,
    price: booking.pricing.total,
    paymentMethod: booking.paymentMethod,
    address: booking.serviceAddress.completeAddress,
  };
}

// ─── Cancel Booking ───────────────────────────────────────────────────────────

export async function cancelBooking(bookingId: string): Promise<void> {
  await apiBookingService.cancelBooking(bookingId, {
    reason: 'Cancelled by customer from app',
  });
}
