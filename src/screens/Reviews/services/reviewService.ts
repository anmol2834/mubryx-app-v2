/**
 * reviewService — data layer for the My Reviews module.
 * Currently backed by mock data.
 * To integrate a real API: replace only the functions below.
 * No UI changes required.
 */

import { CURRENT_USER_ID, MOCK_COMPLETED_SERVICES, MOCK_MY_REVIEWS, MOCK_PERSONAL_STATS } from '../mock/data';
import type { CompletedService, FilterOption, MyReview, PersonalStats, ReviewTag } from '../mock/types';
import { apiFetch } from '@/services/apiClient';
import { mapReview } from '@/mappers/serviceMapper';
import { ServiceReviewModel } from '@/types/review';

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

// GET /api/users/:id/reviews
export async function fetchMyReviews(_userId: string): Promise<MyReview[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [];
}

// GET /api/users/:id/review-stats
export async function fetchPersonalStats(userId: string): Promise<PersonalStats> {
  await new Promise((r) => setTimeout(r, 100));
  const reviews = await fetchMyReviews(userId);
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      photosUploaded: 0,
      completedServices: 0,
    };
  }
  const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  const avg = Number((sum / reviews.length).toFixed(1));
  const photos = reviews.reduce((acc, curr) => acc + (curr.images?.length || 0), 0);
  return {
    averageRating: avg,
    totalReviews: reviews.length,
    photosUploaded: photos,
    completedServices: reviews.length,
  };
}

// GET /api/users/:id/completed-services?reviewed=false
export async function fetchPendingReviews(_userId: string): Promise<CompletedService[]> {
  await new Promise((r) => setTimeout(r, 100));
  return [];
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

// GET /api/v1/services/:serviceId/reviews
export async function fetchServiceReviews(
  serviceId: string,
  page = 1,
  limit = 10,
): Promise<{ reviews: ServiceReviewModel[]; hasMore: boolean; total: number; page: number }> {
  try {
    const res = await apiFetch<any>(`/services/${serviceId}/reviews?page=${page}&limit=${limit}`, { method: 'GET' });
    if (res.ok && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data.reviews || []);
      const total = typeof res.data.total === 'number' ? res.data.total : list.length;
      const hasMore = Boolean(res.data.hasMore);
      const pageNum = typeof res.data.page === 'number' ? res.data.page : page;
      return {
        reviews: list.map(mapReview),
        hasMore,
        total,
        page: pageNum,
      };
    }
  } catch (err) {
    console.warn('[reviewService] Failed to fetch service reviews:', err);
  }
  return { reviews: [], hasMore: false, total: 0, page: 1 };
}

export { CURRENT_USER_ID };
