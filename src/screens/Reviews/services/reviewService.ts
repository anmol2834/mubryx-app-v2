/**
 * reviewService — data layer for the My Reviews module.
 * Currently backed by mock data.
 * To integrate a real API: replace only the functions below.
 * No UI changes required.
 */

import { CURRENT_USER_ID, MOCK_COMPLETED_SERVICES, MOCK_MY_REVIEWS, MOCK_PERSONAL_STATS } from '../mock/data';
import type { CompletedService, FilterOption, MyReview, PersonalStats, ReviewTag } from '../mock/types';

export interface SubmitReviewPayload {
  bookingId: string;
  serviceName: string;
  serviceIcon: string;
  bookingDate: string;
  completedDate: string;
  engineerId: string;
  rating: number;
  reviewText: string;
  tags: ReviewTag[];
  isAnonymous: boolean;
}

export interface EditReviewPayload {
  reviewId: string;
  rating: number;
  reviewText: string;
  tags: ReviewTag[];
  isAnonymous: boolean;
}

// Future: GET /api/users/:id/reviews
export async function fetchMyReviews(userId: string): Promise<MyReview[]> {
  await new Promise((r) => setTimeout(r, 600));
  // Filter by userId — when API is live, the server handles this
  return MOCK_MY_REVIEWS.filter((r) => r.userId === userId);
}

// Future: GET /api/users/:id/review-stats
export async function fetchPersonalStats(userId: string): Promise<PersonalStats> {
  await new Promise((r) => setTimeout(r, 300));
  void userId; // used by real API
  return { ...MOCK_PERSONAL_STATS };
}

// Future: GET /api/users/:id/completed-services?reviewed=false
export async function fetchPendingReviews(userId: string): Promise<CompletedService[]> {
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_COMPLETED_SERVICES.filter(
    (s) => s.userId === userId && !s.reviewSubmitted && !s.dismissedInSession
  );
}

// Future: POST /api/reviews
export async function submitReview(_payload: SubmitReviewPayload): Promise<void> {
  await new Promise((r) => setTimeout(r, 800));
}

// Future: PATCH /api/reviews/:id
export async function editReview(_payload: EditReviewPayload): Promise<void> {
  await new Promise((r) => setTimeout(r, 600));
}

// Future: DELETE /api/reviews/:id
export async function deleteReview(_reviewId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 400));
}

export function applyFilter(reviews: MyReview[], filter: FilterOption): MyReview[] {
  switch (filter) {
    case '5star': return reviews.filter((r) => r.rating === 5);
    case '4star': return reviews.filter((r) => r.rating === 4);
    case '3star': return reviews.filter((r) => r.rating === 3);
    case '2star': return reviews.filter((r) => r.rating === 2);
    case '1star': return reviews.filter((r) => r.rating === 1);
    case 'oldest': return [...reviews].reverse();
    case 'with_photos': return reviews.filter((r) => r.images.length > 0);
    case 'recent':
    default: return [...reviews]; // already sorted newest-first in mock
  }
}

export { CURRENT_USER_ID };
