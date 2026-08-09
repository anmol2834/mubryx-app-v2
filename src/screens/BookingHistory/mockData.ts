import { Brand } from '@/constants/brand';
import type { ImageSourcePropType } from 'react-native';

export type BookingStatus = 'Completed' | 'Confirmed' | 'Pending' | 'Assigned' | 'In Progress' | 'Cancelled';

export interface CompletedBooking {
  id: string;
  bookingId: string;
  service: string;
  category: string;
  date: string;
  location: string;
  technician: string;
  amount: string;
  amountRaw: number;
  image: ImageSourcePropType;
  timestamp: number;
}

export interface UpcomingBooking {
  id: string;
  bookingId: string;
  service: string;
  category: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  technician: string | null;
  amount: string;
  amountRaw: number;
  status: BookingStatus;
  image: ImageSourcePropType;
  timestamp: number;
}

export const STATUS_CONFIG: Record<BookingStatus, { color: string; bg: string }> = {
  Completed:     { color: '#2E7D32', bg: '#E8F5E9' },
  Confirmed:     { color: Brand.primary, bg: Brand.primarySoft },
  Pending:       { color: '#E65100', bg: '#FFF3E0' },
  Assigned:      { color: '#00695C', bg: '#E0F2F1' },
  'In Progress': { color: '#6A1B9A', bg: '#F3E5F5' },
  Cancelled:     { color: '#C62828', bg: '#FFEBEE' },
};

export const COMPLETED_BOOKINGS: CompletedBooking[] = [
  {
    id: 'c1', bookingId: 'MBX-20250724-001',
    service: 'AC Gas Refill Service', category: 'AC Service',
    date: '24 Jul 2025',
    location: 'B-204, Sunrise Apartments, Sector 18, Noida',
    technician: 'Ravi Kumar', amount: '₹2,599', amountRaw: 2599,
    image: require('@/assets/images/ac-service.webp'), timestamp: 1753315200,
  },
  {
    id: 'c2', bookingId: 'MBX-20250718-002',
    service: 'Washing Machine Repair', category: 'Washing Machine',
    date: '18 Jul 2025',
    location: 'Tower A, Cyber City, DLF Phase 2, Gurugram',
    technician: 'Suresh Singh', amount: '₹499', amountRaw: 499,
    image: require('@/assets/images/washing-machine-service.webp'), timestamp: 1752796800,
  },
  {
    id: 'c3', bookingId: 'MBX-20250710-003',
    service: 'TV Screen Issue Fix', category: 'Television',
    date: '10 Jul 2025',
    location: 'B-204, Sunrise Apartments, Sector 18, Noida',
    technician: 'Anil Sharma', amount: '₹499', amountRaw: 499,
    image: require('@/assets/images/tv-service.webp'), timestamp: 1752105600,
  },
  {
    id: 'c4', bookingId: 'MBX-20250702-004',
    service: 'Microwave Not Heating', category: 'Microwave',
    date: '02 Jul 2025',
    location: 'B-204, Sunrise Apartments, Sector 18, Noida',
    technician: 'Deepak Verma', amount: '₹299', amountRaw: 299,
    image: require('@/assets/images/microwave-service.webp'), timestamp: 1751414400,
  },
  {
    id: 'c5', bookingId: 'MBX-20250625-005',
    service: 'Geyser Not Working', category: 'Geyser',
    date: '25 Jun 2025',
    location: 'Tower A, Cyber City, DLF Phase 2, Gurugram',
    technician: 'Mohit Yadav', amount: '₹349', amountRaw: 349,
    image: require('@/assets/images/geyser-service.webp'), timestamp: 1750809600,
  },
  {
    id: 'c6', bookingId: 'MBX-20250610-006',
    service: 'Fridge Cooling Issue', category: 'Refrigerator',
    date: '10 Jun 2025',
    location: 'B-204, Sunrise Apartments, Sector 18, Noida',
    technician: 'Pradeep Nair', amount: '₹849', amountRaw: 849,
    image: require('@/assets/images/fridge-service.webp'), timestamp: 1749513600,
  },
];

export const UPCOMING_BOOKINGS: UpcomingBooking[] = [
  {
    id: 'u1', bookingId: 'MBX-20250801-007',
    service: 'AC Deep Cleaning', category: 'AC Service',
    scheduledDate: '01 Aug 2025', scheduledTime: '10:00 AM',
    address: 'B-204, Sunrise Apartments, Sector 18, Noida',
    technician: 'Ravi Kumar', amount: '₹599', amountRaw: 599,
    status: 'Assigned',
    image: require('@/assets/images/ac-service.webp'), timestamp: 1753920000,
  },
  {
    id: 'u2', bookingId: 'MBX-20250803-008',
    service: 'Electrician Home Visit', category: 'Electrician',
    scheduledDate: '03 Aug 2025', scheduledTime: '02:30 PM',
    address: 'Tower A, Cyber City, DLF Phase 2, Gurugram',
    technician: null, amount: '₹199', amountRaw: 199,
    status: 'Confirmed',
    image: require('@/assets/images/Electrician-Services.webp'), timestamp: 1754092800,
  },
  {
    id: 'u3', bookingId: 'MBX-20250805-009',
    service: 'Water Purifier Service', category: 'Water Purifier',
    scheduledDate: '05 Aug 2025', scheduledTime: '11:00 AM',
    address: 'B-204, Sunrise Apartments, Sector 18, Noida',
    technician: null, amount: '₹449', amountRaw: 449,
    status: 'Pending',
    image: require('@/assets/images/water-purifier-service.webp'), timestamp: 1754265600,
  },
  {
    id: 'u4', bookingId: 'MBX-20250807-010',
    service: 'Plumbing Pipe Leak Fix', category: 'Plumbing',
    scheduledDate: '07 Aug 2025', scheduledTime: '09:00 AM',
    address: 'Tower A, Cyber City, DLF Phase 2, Gurugram',
    technician: 'Suresh Singh', amount: '₹299', amountRaw: 299,
    status: 'In Progress',
    image: require('@/assets/images/Plumbing-Services.webp'), timestamp: 1754438400,
  },
];

export type SortOption = 'latest' | 'oldest' | 'price_high' | 'price_low';
export type FilterOption = 'all' | 'recent' | 'this_month' | 'last_month';

export const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'latest',     label: 'Latest First' },
  { key: 'oldest',     label: 'Oldest First' },
  { key: 'price_high', label: 'Price: High to Low' },
  { key: 'price_low',  label: 'Price: Low to High' },
];

export const FILTER_OPTIONS: { key: FilterOption; label: string }[] = [
  { key: 'all',        label: 'All' },
  { key: 'recent',     label: 'Recent' },
  { key: 'this_month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
];
