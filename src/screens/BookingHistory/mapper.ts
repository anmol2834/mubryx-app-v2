import type { Booking, BookingStatus as ApiStatus } from '@/types/booking';
import type { CompletedBooking, UpcomingBooking, BookingStatus as UiStatus } from './mockData';
import { getCategoryAssetSource } from '@/utils/categoryImages';

const DEFAULT_SERVICE_IMAGE = require('@/assets/images/ac-service.webp');

function mapApiStatusToUiStatus(status: ApiStatus): UiStatus {
  switch (status) {
    case 'SERVICE_COMPLETED':
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
    case 'FAILED':
      return 'Cancelled';
    case 'SERVICE_STARTED':
    case 'TECHNICIAN_ON_THE_WAY':
    case 'TECHNICIAN_ARRIVED':
      return 'In Progress';
    case 'TECHNICIAN_ASSIGNED':
    case 'TECHNICIAN_ACCEPTED':
    case 'PARTIALLY_ASSIGNED':
      return 'Assigned';
    case 'PENDING_MATCHING':
    case 'TECHNICIAN_SEARCHING':
    default:
      return 'Pending';
  }
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}

function formatTime(isoString: string | null | undefined): string {
  if (!isoString) return 'ASAP';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'ASAP';
  }
}

import { formatPrice } from '@/utils/number';

export function mapBookingToCompleted(b: Booking): CompletedBooking {
  const primaryItem = b.items[0];
  const serviceTitle =
    b.items.length > 1
      ? `${primaryItem?.title ?? 'Service'} +${b.items.length - 1} more`
      : primaryItem?.title ?? 'Home Service';

  const categoryName = primaryItem?.category ?? 'General Service';
  const assetSource = getCategoryAssetSource(categoryName) ?? DEFAULT_SERVICE_IMAGE;

  return {
    id: b.bookingId,
    bookingId: b.bookingNumber,
    service: serviceTitle,
    category: categoryName,
    date: formatDate(b.createdAt),
    location: b.serviceAddress.completeAddress,
    technician: 'Assigned Engineer',
    amount: `₹${formatPrice(b.pricing.total)}`,
    amountRaw: Math.round((b.pricing.total || 0) * 100) / 100,
    image: assetSource,
    timestamp: Math.floor(new Date(b.createdAt).getTime() / 1000),
    invoiceNumber: b.invoiceNumber ?? null,
    invoiceUrl: b.invoiceUrl ?? null,
  };
}

export function mapBookingToUpcoming(b: Booking): UpcomingBooking {
  const primaryItem = b.items[0];
  const serviceTitle =
    b.items.length > 1
      ? `${primaryItem?.title ?? 'Service'} +${b.items.length - 1} more`
      : primaryItem?.title ?? 'Home Service';

  const categoryName = primaryItem?.category ?? 'General Service';
  const assetSource = getCategoryAssetSource(categoryName) ?? DEFAULT_SERVICE_IMAGE;

  const scheduledDateStr = b.scheduledAt
    ? formatDate(b.scheduledAt)
    : `Today, ${formatDate(b.createdAt)}`;

  const scheduledTimeStr = b.scheduledAt
    ? formatTime(b.scheduledAt)
    : 'As soon as possible';

  const hasTechnicianAssigned = Boolean(
    b.technicianId ||
    (b as any).technician ||
    (Array.isArray(b.items) && b.items.some((i: any) => i.technicianId || i.technician))
  );

  let mappedStatus = mapApiStatusToUiStatus(b.status);
  if (hasTechnicianAssigned && mappedStatus === 'Pending') {
    mappedStatus = 'Assigned';
  }

  return {
    id: b.bookingId,
    bookingId: b.bookingNumber,
    service: serviceTitle,
    category: categoryName,
    scheduledDate: scheduledDateStr,
    scheduledTime: scheduledTimeStr,
    address: b.serviceAddress.completeAddress,
    technician: hasTechnicianAssigned ? 'Assigned Engineer' : null,
    amount: `₹${formatPrice(b.pricing.total)}`,
    amountRaw: Math.round((b.pricing.total || 0) * 100) / 100,
    status: mappedStatus,
    image: assetSource,
    timestamp: Math.floor(new Date(b.createdAt).getTime() / 1000),
    invoiceNumber: b.invoiceNumber ?? null,
    invoiceUrl: b.invoiceUrl ?? null,
  };
}
