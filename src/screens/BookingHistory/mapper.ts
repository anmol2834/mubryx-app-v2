import type { Booking, BookingStatus as ApiStatus } from '@/types/booking';
import type { CompletedBooking, UpcomingBooking, BookingStatus as UiStatus } from './mockData';
import { getCategoryAssetSource } from '@/utils/categoryImages';

const DEFAULT_SERVICE_IMAGE = require('@/assets/images/ac-service.webp');

function mapApiStatusToUiStatus(status: ApiStatus): UiStatus {
  switch (status) {
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
    amount: `₹${b.pricing.total.toLocaleString('en-IN')}`,
    amountRaw: b.pricing.total,
    image: assetSource,
    timestamp: Math.floor(new Date(b.createdAt).getTime() / 1000),
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

  return {
    id: b.bookingId,
    bookingId: b.bookingNumber,
    service: serviceTitle,
    category: categoryName,
    scheduledDate: scheduledDateStr,
    scheduledTime: scheduledTimeStr,
    address: b.serviceAddress.completeAddress,
    technician: b.technicianId ? 'Assigned Engineer' : null,
    amount: `₹${b.pricing.total.toLocaleString('en-IN')}`,
    amountRaw: b.pricing.total,
    status: mapApiStatusToUiStatus(b.status),
    image: assetSource,
    timestamp: Math.floor(new Date(b.createdAt).getTime() / 1000),
  };
}
