/**
 * bookingService — data layer for the Booking Flow module.
 * Currently backed by mock data with realistic delays.
 * To integrate a real API: replace only the functions below.
 * UI and hooks require zero changes.
 */

import type { BookingResult, CreateBookingPayload } from '../types';
import { MOCK_ENGINEERS, buildInitialStages } from '../mock/engineers';

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOTP(): string {
  return String(randomInt(1000, 9999));
}

function generateBookingId(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const seq = String(randomInt(100, 999));
  return `MBX-${date}-${seq}`;
}

// ─── Create Booking ───────────────────────────────────────────────────────────

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<BookingResult> {
  // Simulate network round-trip
  await delay(300);

  // Pick a random engineer from the mock pool
  const engineer = MOCK_ENGINEERS[randomInt(0, MOCK_ENGINEERS.length - 1)];
  const bookingId = generateBookingId();
  const otp = generateOTP();

  const now = new Date();
  const scheduledDate = payload.scheduledDate ?? `Today, ${now.getDate()} Jan`;
  const scheduledTime = payload.scheduledTime ?? 'ASAP';

  const primaryItem = payload.items[0];
  const serviceName = primaryItem?.name ?? 'Home Service';
  const serviceIcon = '🔧';
  const price = payload.grandTotal;

  return {
    bookingId,
    otp,
    status: 'assigned',
    engineer,
    estimatedArrival: '~18 min',
    stages: buildInitialStages(engineer.name),
    serviceName,
    serviceIcon,
    scheduledDate,
    scheduledTime,
    price,
    paymentMethod: payload.paymentMethod,
    address: payload.address,
  };
}

// ─── Cancel Booking ───────────────────────────────────────────────────────────

export async function cancelBooking(_bookingId: string): Promise<void> {
  await delay(400);
}
