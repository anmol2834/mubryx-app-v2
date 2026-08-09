import type { BookingFlowEngineer } from '../types';
import type { TrackStage } from '@/screens/Profile/constants';

// ─── Mock Engineers ───────────────────────────────────────────────────────────

export const MOCK_ENGINEERS: BookingFlowEngineer[] = [
  {
    id: 'eng_001',
    name: 'Ravi Kumar',
    avatarInitials: 'RK',
    avatarColor: '#00695C',
    rating: '4.9',
    experience: '6 yrs exp',
    isVerified: true,
    phone: '+91 98765 00001',
    completedJobs: 312,
    distance: '2.4 km',
    isTopRated: true,
  },
  {
    id: 'eng_002',
    name: 'Suresh Patel',
    avatarInitials: 'SP',
    avatarColor: '#1565C0',
    rating: '4.8',
    experience: '5 yrs exp',
    isVerified: true,
    phone: '+91 98765 00002',
    completedJobs: 248,
    distance: '3.1 km',
    isTopRated: true,
  },
  {
    id: 'eng_003',
    name: 'Amit Singh',
    avatarInitials: 'AS',
    avatarColor: '#6A1B9A',
    rating: '4.7',
    experience: '4 yrs exp',
    isVerified: true,
    phone: '+91 98765 00003',
    completedJobs: 189,
    distance: '4.8 km',
    isTopRated: false,
  },
];

// ─── Mock booking stages (confirmed + assigned done, rest pending) ─────────────

export function buildInitialStages(engineerName: string): TrackStage[] {
  const now = new Date();
  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const t0 = new Date(now.getTime() - 2 * 60_000);
  const t1 = new Date(now.getTime() - 1 * 60_000);

  return [
    { id: 'confirmed', title: 'Booking Confirmed',       description: 'Your booking has been received and confirmed.',       timestamp: fmt(t0), status: 'done'    },
    { id: 'assigned',  title: 'Engineer Assigned',        description: `${engineerName} has been assigned to your service.`, timestamp: fmt(t1), status: 'done'    },
    { id: 'journey',   title: 'Engineer Started Journey', description: `${engineerName} is on the way to your location.`,   timestamp: null,    status: 'active'  },
    { id: 'nearby',    title: 'Engineer Nearby',          description: 'Engineer is within 2 km of your location.',          timestamp: null,    status: 'pending' },
    { id: 'arrived',   title: 'Engineer Arrived',         description: 'Engineer has reached your doorstep.',                timestamp: null,    status: 'pending' },
    { id: 'started',   title: 'Service Started',          description: 'Work has begun on your appliance.',                  timestamp: null,    status: 'pending' },
    { id: 'completed', title: 'Service Completed',        description: 'Your service is done. Rate your experience!',        timestamp: null,    status: 'pending' },
  ];
}
