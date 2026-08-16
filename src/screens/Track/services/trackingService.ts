import { bookingService } from '@/services/bookingService';
import type { ActiveBooking, TrackStageId } from '../types';
import { isLiveBooking, sortBookingsByProgress } from '../utils';

function mapApiBookingToActiveBooking(b: any): ActiveBooking {
  const firstItem = b.items?.[0] || b.service || {};
  const serviceTitle =
    firstItem.title ||
    firstItem.serviceTitle ||
    firstItem.serviceTitleSnapshot ||
    b.serviceName ||
    'Service';

  let currentStage: TrackStageId = 'confirmed';
  if (b.status === 'COMPLETED' || b.status === 'SERVICE_COMPLETED') {
    currentStage = 'completed';
  } else if (b.status === 'SERVICE_STARTED' || b.status === 'IN_PROGRESS') {
    currentStage = 'started';
  } else if (b.status === 'TECHNICIAN_ARRIVED' || b.status === 'ARRIVED') {
    currentStage = 'arrived';
  } else if (b.status === 'NEARBY') {
    currentStage = 'nearby';
  } else if (b.status === 'TECHNICIAN_ON_THE_WAY' || b.status === 'EN_ROUTE') {
    currentStage = 'journey';
  } else if (b.status === 'TECHNICIAN_ASSIGNED' || b.status === 'TECHNICIAN_ACCEPTED' || b.technician) {
    currentStage = 'assigned';
  }

  const extractedPrice =
    b.pricing?.total ??
    b.totalAmount ??
    b.amount ??
    (Array.isArray(b.items) && b.items.length > 0
      ? b.items.reduce(
          (sum: number, item: any) =>
            sum + (item.lineTotal ?? (item.unitPrice ? item.unitPrice * (item.quantity || 1) : 0)),
          0,
        )
      : firstItem.lineTotal ?? firstItem.unitPrice ?? 0);

  const techObj = b.technician || b.assignedTechnician;
  const techName = techObj?.fullName || techObj?.name || (techObj?.user ? techObj.user.name : null);

  const isAssigned = ['assigned', 'journey', 'nearby', 'arrived', 'started', 'completed'].includes(currentStage);
  const isJourney = ['journey', 'nearby', 'arrived', 'started', 'completed'].includes(currentStage);
  const isArrived = ['arrived', 'started', 'completed'].includes(currentStage);
  const isStarted = ['started', 'completed'].includes(currentStage);
  const isCompleted = currentStage === 'completed';

  return {
    id: b.bookingId || b.id || b._id,
    bookingId: b.bookingId || b.id || b._id,
    serviceName: serviceTitle,
    serviceIcon: '🔧',
    applianceName: serviceTitle,
    currentStage,
    eta: b.eta || (currentStage === 'journey' ? '15 mins' : currentStage === 'arrived' ? 'Arrived' : '30 mins'),
    scheduledDate: b.scheduledAt
      ? new Date(b.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      : b.scheduledDate || 'Today',
    scheduledTime: b.scheduledAt
      ? new Date(b.scheduledAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
      : b.scheduledSlot || 'As scheduled',
    price: extractedPrice,
    paymentMethod: b.paymentMethod || 'Online',
    warranty: b.warranty || '30 Days Warranty',
    estimatedDuration: firstItem.duration || b.estimatedDuration || '45 mins',
    engineer: techName ? {
      id: techObj.id || techObj._id || 'tech1',
      name: techName,
      avatarInitials: techName.slice(0, 2).toUpperCase(),
      avatarColor: '#1565C0',
      rating: String(techObj.rating || 4.9),
      experience: techObj.experience || '5+ Yrs',
      isVerified: true,
      phone: techObj.phone || (techObj.user ? techObj.user.phone : '') || '',
    } : null,
    address: b.address?.completeAddress || b.address?.address || 'Service Location',
    landmark: b.address?.landmark || '',
    contactPerson: b.address?.contactPerson || 'Customer',
    contactPhone: b.address?.contactPhone || '',
    stages: [
      { id: 'confirmed', title: 'Booking Confirmed', description: 'Service confirmed', timestamp: b.createdAt || '', status: 'done' },
      { id: 'assigned', title: 'Technician Assigned', description: techName ? `${techName} assigned` : 'Assigning technician', timestamp: null, status: isAssigned ? 'done' : 'pending' },
      { id: 'journey', title: 'On the Way', description: 'Technician heading to location', timestamp: null, status: isJourney ? (currentStage === 'journey' ? 'active' : 'done') : 'pending' },
      { id: 'nearby', title: 'Nearby', description: 'Technician near location', timestamp: null, status: isArrived ? 'done' : currentStage === 'nearby' ? 'active' : 'pending' },
      { id: 'arrived', title: 'Arrived', description: 'Technician at location', timestamp: null, status: isArrived ? (currentStage === 'arrived' ? 'active' : 'done') : 'pending' },
      { id: 'started', title: 'Service Started', description: 'Work in progress', timestamp: null, status: isStarted ? (currentStage === 'started' ? 'active' : 'done') : 'pending' },
      { id: 'completed', title: 'Service Completed', description: 'Service done', timestamp: null, status: isCompleted ? 'done' : 'pending' },
    ],
  };
}

// ─── Fetch all live bookings for a user ───────────────────────────────────────

export async function getActiveBookings(_userId: string): Promise<ActiveBooking[]> {
  try {
    const res = await bookingService.getBookings('upcoming');
    if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
      const active = res.data.map(mapApiBookingToActiveBooking).filter(isLiveBooking);
      return sortBookingsByProgress(active);
    }
  } catch {
    // Return empty array on error so UI displays professional empty state
  }
  return [];
}

// ─── Fetch a single booking by ID ────────────────────────────────────────────

export async function getTrackingByBookingId(bookingId: string): Promise<ActiveBooking | null> {
  try {
    const res = await bookingService.getBookingById(bookingId);
    if (res.ok && res.data) {
      return mapApiBookingToActiveBooking(res.data);
    }
  } catch {
    // Return null on error
  }
  return null;
}
