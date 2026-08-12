import { bookingService } from '@/services/bookingService';
import type { ActiveBooking, TrackStageId } from '../types';
import { isLiveBooking, sortBookingsByProgress } from '../utils';

import { STAGE_PRIORITY, type LiveStageId } from '../types';

function mapApiBookingToActiveBooking(b: any): ActiveBooking {
  const firstItem = b.items?.[0] || b.service || {};
  const serviceTitle = firstItem.serviceTitle || firstItem.title || 'Service';

  // Map backend BookingStatus to frontend TrackStageId
  let currentStage: TrackStageId = 'confirmed';
  if (['TECHNICIAN_ASSIGNED', 'TECHNICIAN_ACCEPTED'].includes(b.status)) {
    currentStage = 'assigned';
  } else if (b.status === 'TECHNICIAN_ON_THE_WAY') {
    currentStage = 'journey';
  } else if (b.status === 'TECHNICIAN_ARRIVED') {
    currentStage = 'arrived';
  } else if (['SERVICE_STARTED', 'PAYMENT_PENDING'].includes(b.status)) {
    currentStage = 'started';
  } else if (['SERVICE_COMPLETED', 'COMPLETED'].includes(b.status)) {
    currentStage = 'completed';
  }

  // Calculate status for a stage based on priority
  const getStageStatus = (stageId: LiveStageId | 'completed') => {
    if (stageId === 'completed') {
      return currentStage === 'completed' ? 'done' : 'pending';
    }
    const currentPriority = currentStage === 'completed' ? 99 : (STAGE_PRIORITY[currentStage as LiveStageId] ?? 0);
    const thisPriority = STAGE_PRIORITY[stageId as LiveStageId] ?? 0;
    
    if (thisPriority < currentPriority) return 'done';
    if (thisPriority === currentPriority) return 'active';
    return 'pending';
  };

  return {
    id: b.bookingId || b._id || b.id,
    bookingId: b.bookingNumber || b.bookingId || b._id || b.id,
    serviceName: serviceTitle,
    serviceIcon: '🔧',
    applianceName: serviceTitle,
    currentStage,
    eta: '30 mins',
    scheduledDate: b.scheduledDate || 'Today',
    scheduledTime: b.scheduledSlot || 'As scheduled',
    price: b.totalAmount || b.amount || 0,
    paymentMethod: b.paymentMethod || 'Online',
    warranty: '30 Days Warranty',
    estimatedDuration: '45 mins',
    engineer: b.technician ? {
      id: b.technician._id || b.technician.id || 'tech1',
      name: b.technician.name || 'Technician Assigned',
      avatarInitials: (b.technician.name || 'Tech').slice(0, 2).toUpperCase(),
      avatarColor: '#1565C0',
      rating: String(b.technician.rating || 4.9),
      experience: '5+ Yrs',
      isVerified: true,
      phone: b.technician.phone || '',
    } : null,
    address: b.address?.completeAddress || b.address?.address || 'Service Location',
    landmark: b.address?.landmark || '',
    contactPerson: b.address?.contactPerson || 'Customer',
    contactPhone: b.address?.contactPhone || '',
    otp: b.otp || null,
    happyCode: b.happyCode || null,
    stages: [
      { id: 'confirmed', title: 'Booking Confirmed', description: 'Service confirmed', timestamp: b.createdAt || '', status: getStageStatus('confirmed') },
      { id: 'assigned', title: 'Technician Assigned', description: b.technician?.name ? `${b.technician.name} assigned` : 'Assigning technician', timestamp: null, status: getStageStatus('assigned') },
      { id: 'journey', title: 'On the Way', description: 'Technician heading to location', timestamp: null, status: getStageStatus('journey') },
      { id: 'nearby', title: 'Nearby', description: 'Technician near location', timestamp: null, status: getStageStatus('nearby') },
      { id: 'arrived', title: 'Arrived', description: 'Technician at location', timestamp: null, status: getStageStatus('arrived') },
      { id: 'started', title: 'Service Started', description: 'Work in progress', timestamp: null, status: getStageStatus('started') },
      { id: 'completed', title: 'Service Completed', description: 'Service done', timestamp: null, status: getStageStatus('completed') },
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
