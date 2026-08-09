// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarInitials: string;
  avatarColor: string;
  memberSince: string;
  isVerified: boolean;
  loyaltyTier: 'Silver' | 'Gold' | 'Platinum';
  profileCompletion: number;
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'upcoming'
  | 'completed'
  | 'cancelled';

export interface BookingRecord {
  id: string;
  serviceName: string;
  serviceIcon: string;
  date: string;
  time: string;
  status: BookingStatus;
  price: number;
  technicianName: string;
}

// ─── Track Service ────────────────────────────────────────────────────────────

export type TrackStageId =
  | 'confirmed'
  | 'assigned'
  | 'journey'
  | 'nearby'
  | 'arrived'
  | 'started'
  | 'completed';

export type TrackStageStatus = 'done' | 'active' | 'pending';

export interface TrackStage {
  id: TrackStageId;
  title: string;
  description: string;
  timestamp: string | null;
  status: TrackStageStatus;
}

export interface Engineer {
  id: string;
  name: string;
  avatarInitials: string;
  avatarColor: string;
  rating: string;
  experience: string;
  isVerified: boolean;
  phone: string;
}

export interface ActiveBooking {
  id: string;
  bookingId: string;
  serviceName: string;
  serviceIcon: string;
  applianceName: string;
  currentStage: TrackStageId;
  eta: string;
  scheduledDate: string;
  scheduledTime: string;
  price: number;
  paymentMethod: string;
  warranty: string;
  estimatedDuration: string;
  engineer: Engineer | null;
  address: string;
  landmark: string;
  contactPerson: string;
  contactPhone: string;
  stages: TrackStage[];
}

// ─── Saved Address ────────────────────────────────────────────────────────────

import { SavedAddress } from '@/types/address';
export type { SavedAddress };

// ─── Stats / Actions / Settings ───────────────────────────────────────────────

export interface StatCard {
  id: string;
  label: string;
  value: string;
  iconType: string;
  iconColor: string;
  iconBg: string;
}

export interface QuickAction {
  id: string;
  label: string;
  iconType: string;
  iconColor: string;
  iconBg: string;
}

export interface SettingsRow {
  id: string;
  label: string;
  subtitle?: string;
  iconType: string;
  iconColor: string;
  iconBg: string;
  hasChevron: boolean;
  hasToggle?: boolean;
  danger?: boolean;
}

export interface SettingsSection {
  title: string;
  rows: SettingsRow[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const MOCK_USER: UserProfile = {
  id: 'usr_001',
  name: 'Arjun Mehta',
  phone: '+91 98765 43210',
  email: '',
  avatarInitials: 'AM',
  avatarColor: '#1565C0',
  memberSince: 'March 2023',
  isVerified: true,
  loyaltyTier: 'Gold',
  profileCompletion: 78,
};

export const MOCK_BOOKINGS: BookingRecord[] = [
  {
    id: 'bk_001',
    serviceName: 'AC Deep Cleaning',
    serviceIcon: '❄️',
    date: 'Today',
    time: '3:00 PM',
    status: 'upcoming',
    price: 599,
    technicianName: 'Ravi Kumar',
  },
  {
    id: 'bk_002',
    serviceName: 'Refrigerator Repair',
    serviceIcon: '🧊',
    date: '12 Jan 2025',
    time: '11:00 AM',
    status: 'completed',
    price: 849,
    technicianName: 'Suresh Patel',
  },
  {
    id: 'bk_003',
    serviceName: 'Washing Machine Fix',
    serviceIcon: '🫧',
    date: '5 Jan 2025',
    time: '2:00 PM',
    status: 'cancelled',
    price: 399,
    technicianName: 'Amit Singh',
  },
];

export const MOCK_ADDRESSES: SavedAddress[] = [];

export const MOCK_ACTIVE_BOOKING: ActiveBooking = {
  id: 'ab_001',
  bookingId: 'MBX-20250115-001',
  serviceName: 'AC Deep Cleaning',
  serviceIcon: '❄️',
  applianceName: 'Air Conditioner',
  currentStage: 'journey',
  eta: '~18 min',
  scheduledDate: 'Today, 15 Jan',
  scheduledTime: '3:00 PM',
  price: 599,
  paymentMethod: 'Cash on Service',
  warranty: '30-day service warranty',
  estimatedDuration: '60–90 min',
  engineer: {
    id: 'eng_001',
    name: 'Ravi Kumar',
    avatarInitials: 'RK',
    avatarColor: '#00695C',
    rating: '4.9',
    experience: '6 yrs exp',
    isVerified: true,
    phone: '+91 98765 00001',
  },
  address: 'B-204, Sunrise Apartments, Sector 18, Noida, UP 201301',
  landmark: 'Near City Mall',
  contactPerson: 'Arjun Mehta',
  contactPhone: '+91 98765 43210',
  stages: [
    { id: 'confirmed', title: 'Booking Confirmed', description: 'Your booking has been received and confirmed.', timestamp: '2:10 PM', status: 'done' },
    { id: 'assigned', title: 'Engineer Assigned', description: 'Ravi Kumar has been assigned to your service.', timestamp: '2:18 PM', status: 'done' },
    { id: 'journey', title: 'Engineer Started Journey', description: 'Ravi is on the way to your location.', timestamp: '2:42 PM', status: 'active' },
    { id: 'nearby', title: 'Engineer Nearby', description: 'Engineer is within 2 km of your location.', timestamp: null, status: 'pending' },
    { id: 'arrived', title: 'Engineer Arrived', description: 'Engineer has reached your doorstep.', timestamp: null, status: 'pending' },
    { id: 'started', title: 'Service Started', description: 'Work has begun on your appliance.', timestamp: null, status: 'pending' },
    { id: 'completed', title: 'Service Completed', description: 'Your service is done. Rate your experience!', timestamp: null, status: 'pending' },
  ],
};

export const STAT_CARDS: StatCard[] = [
  { id: 's1', label: 'Services Done', value: '14', iconType: 'check', iconColor: '#1565C0', iconBg: '#E3F2FD' },
  { id: 's2', label: 'Reward Points', value: '1,240', iconType: 'star', iconColor: '#F9A825', iconBg: '#FEFDE8' },
  { id: 's3', label: 'Saved ₹', value: '₹2,100', iconType: 'tag', iconColor: '#2E7D32', iconBg: '#E8F5E9' },
  { id: 's4', label: 'Active Coupons', value: '3', iconType: 'coupon', iconColor: '#E65100', iconBg: '#FFF3E0' },
];

export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'qa1', label: 'Book Again', iconType: 'repeat', iconColor: '#1565C0', iconBg: '#E3F2FD' },
  { id: 'qa2', label: 'Track', iconType: 'track', iconColor: '#00695C', iconBg: '#E0F2F1' },
  { id: 'qa3', label: 'Refer', iconType: 'gift', iconColor: '#6A1B9A', iconBg: '#F3E5F5' },
  { id: 'qa4', label: 'Wallet', iconType: 'wallet', iconColor: '#E65100', iconBg: '#FFF3E0' },
  { id: 'qa5', label: 'Support', iconType: 'headset', iconColor: '#0277BD', iconBg: '#E1F5FE' },
];

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    title: 'Account',
    rows: [
      { id: 'edit_profile', label: 'Edit Profile', subtitle: 'Name, photo, bio', iconType: 'user', iconColor: '#1565C0', iconBg: '#E3F2FD', hasChevron: true },
      { id: 'phone', label: 'Phone Number', iconType: 'phone', iconColor: '#2E7D32', iconBg: '#E8F5E9', hasChevron: false },
      { id: 'email', label: 'Email Address', iconType: 'mail', iconColor: '#6A1B9A', iconBg: '#F3E5F5', hasChevron: true },
    ],
  },
  {
    title: 'Support',
    rows: [
      { id: 'help', label: 'Help Center', subtitle: 'FAQs & guides', iconType: 'help', iconColor: '#1565C0', iconBg: '#E3F2FD', hasChevron: true },
      { id: 'call', label: 'Call', subtitle: 'Call support', iconType: 'phone', iconColor: '#2E7D32', iconBg: '#E8F5E9', hasChevron: true },
    ],
  },
  {
    title: 'About',
    rows: [
      { id: 'rate', label: 'Rate the App', subtitle: 'Love Mubryx? Tell others!', iconType: 'heart', iconColor: '#E53935', iconBg: '#FFEBEE', hasChevron: true },
      { id: 'share', label: 'Share App', subtitle: 'Invite friends & earn', iconType: 'share', iconColor: '#6A1B9A', iconBg: '#F3E5F5', hasChevron: true },
      { id: 'terms', label: 'Terms & Conditions', iconType: 'doc', iconColor: '#546E7A', iconBg: '#ECEFF1', hasChevron: true },
      { id: 'privacy', label: 'Privacy Policy', iconType: 'shield', iconColor: '#546E7A', iconBg: '#ECEFF1', hasChevron: true },
      { id: 'refund', label: 'Refund Policy', iconType: 'doc', iconColor: '#546E7A', iconBg: '#ECEFF1', hasChevron: true },
      { id: 'technician', label: 'Become Technician', iconType: 'user', iconColor: '#1565C0', iconBg: '#E3F2FD', hasChevron: true },
      { id: 'version', label: 'App Version', subtitle: 'v1.0.0 (Build 100)', iconType: 'info', iconColor: '#90A4AE', iconBg: '#F5F5F5', hasChevron: false },
    ],
  },
];

export const TIER_COLORS: Record<UserProfile['loyaltyTier'], { bg: string; text: string; border: string }> = {
  Silver: { bg: '#F5F5F5', text: '#546E7A', border: '#B0BEC5' },
  Gold: { bg: '#FFFDE7', text: '#F57F17', border: '#FFD54F' },
  Platinum: { bg: '#EDE7F6', text: '#4527A0', border: '#9575CD' },
};

export const STATUS_COLORS: Record<BookingStatus, { bg: string; text: string; dot: string }> = {
  upcoming: { bg: '#E3F2FD', text: '#1565C0', dot: '#1565C0' },
  completed: { bg: '#E8F5E9', text: '#2E7D32', dot: '#2E7D32' },
  cancelled: { bg: '#FFEBEE', text: '#C62828', dot: '#C62828' },
};
