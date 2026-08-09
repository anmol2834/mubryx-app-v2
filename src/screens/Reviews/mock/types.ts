// ─── Review Module Types — "My Reviews" personal account view ─────────────────
// All interfaces are future-API-ready. Swap service layer only — no UI changes.

export interface ReviewEngineer {
  id: string;
  name: string;
  avatarInitials: string;
  avatarColor: string;
  rating: string;
  isVerified: boolean;
}

export interface ReviewImage {
  id: string;
  uri: string;
  thumbnail: string;
}

export type ReviewTag =
  | 'Professional'
  | 'Quick Service'
  | 'Affordable'
  | 'Clean Work'
  | 'Friendly Engineer'
  | 'On Time'
  | 'Highly Recommended'
  | 'Problem Solved'
  | 'Easy Booking';

// Owned by the current user — linked to one of their bookings
export interface MyReview {
  id: string;
  userId: string;          // always === CURRENT_USER.id
  bookingId: string;
  serviceName: string;
  serviceIcon: string;
  bookingDate: string;
  completedDate: string;
  engineer: ReviewEngineer;
  rating: number;
  reviewText: string;
  tags: ReviewTag[];
  images: ReviewImage[];
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface PersonalStats {
  totalReviews: number;
  averageRating: number;
  photosUploaded: number;
  completedServices: number;
}

export interface CompletedService {
  id: string;
  userId: string;          // always === CURRENT_USER.id
  bookingId: string;
  serviceName: string;
  serviceIcon: string;
  bookingDate: string;
  engineer: ReviewEngineer;
  completedAt: string;
  price: number;
  reviewSubmitted: boolean;
  dismissedInSession: boolean;
}

export type FilterOption =
  | 'all'
  | '5star'
  | '4star'
  | '3star'
  | '2star'
  | '1star'
  | 'recent'
  | 'oldest'
  | 'with_photos';
