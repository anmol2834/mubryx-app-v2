import type { CompletedService, MyReview, PersonalStats } from './types';

// The logged-in user — mirrors MOCK_USER from Profile/constants.ts
export const CURRENT_USER_ID = 'usr_001';

export const MOCK_PERSONAL_STATS: PersonalStats = {
  totalReviews: 3,
  averageRating: 4.7,
  photosUploaded: 0,
  completedServices: 5,
};

// All reviews belong to usr_001 (Arjun Mehta) — no other user's data here
export const MOCK_MY_REVIEWS: MyReview[] = [
  {
    id: 'rv_001',
    userId: 'usr_001',
    bookingId: 'MBX-20250110-001',
    serviceName: 'AC Deep Cleaning',
    serviceIcon: '❄️',
    bookingDate: '10 Jan 2025',
    completedDate: '10 Jan 2025',
    engineer: {
      id: 'eng_001',
      name: 'Ravi Kumar',
      avatarInitials: 'RK',
      avatarColor: '#00695C',
      rating: '4.9',
      isVerified: true,
    },
    rating: 5,
    reviewText: 'Excellent service! Ravi arrived exactly on time and did a thorough job cleaning my AC. The cooling improved significantly. Very professional and clean work.',
    tags: ['Professional', 'On Time', 'Clean Work'],
    images: [],
    isAnonymous: false,
    createdAt: '2 days ago',
    updatedAt: null,
  },
  {
    id: 'rv_002',
    userId: 'usr_001',
    bookingId: 'MBX-20250105-002',
    serviceName: 'Refrigerator Repair',
    serviceIcon: '🧊',
    bookingDate: '5 Jan 2025',
    completedDate: '5 Jan 2025',
    engineer: {
      id: 'eng_002',
      name: 'Suresh Patel',
      avatarInitials: 'SP',
      avatarColor: '#E65100',
      rating: '4.8',
      isVerified: true,
    },
    rating: 5,
    reviewText: 'Amazing experience. Transparent pricing, genuine parts used. My fridge is working perfectly now.',
    tags: ['Affordable', 'Problem Solved'],
    images: [],
    isAnonymous: false,
    createdAt: '1 week ago',
    updatedAt: null,
  },
  {
    id: 'rv_003',
    userId: 'usr_001',
    bookingId: 'MBX-20241228-003',
    serviceName: 'Washing Machine Fix',
    serviceIcon: '🫧',
    bookingDate: '28 Dec 2024',
    completedDate: '28 Dec 2024',
    engineer: {
      id: 'eng_003',
      name: 'Amit Singh',
      avatarInitials: 'AS',
      avatarColor: '#6A1B9A',
      rating: '4.7',
      isVerified: false,
    },
    rating: 4,
    reviewText: 'Good service overall. Fixed the leak issue with 90-day warranty. Took slightly longer than expected but quality was great.',
    tags: ['Friendly Engineer', 'Quick Service'],
    images: [],
    isAnonymous: false,
    createdAt: '3 weeks ago',
    updatedAt: null,
  },
];

// Completed services belonging to usr_001 that have NOT been reviewed yet
export const MOCK_COMPLETED_SERVICES: CompletedService[] = [
  {
    id: 'cs_001',
    userId: 'usr_001',
    bookingId: 'MBX-20250115-007',
    serviceName: 'AC Deep Cleaning',
    serviceIcon: '❄️',
    bookingDate: '15 Jan 2025',
    engineer: {
      id: 'eng_001',
      name: 'Ravi Kumar',
      avatarInitials: 'RK',
      avatarColor: '#00695C',
      rating: '4.9',
      isVerified: true,
    },
    completedAt: 'Today, 3:45 PM',
    price: 599,
    reviewSubmitted: false,
    dismissedInSession: false,
  },
];
