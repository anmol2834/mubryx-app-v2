import { useCallback, useEffect, useRef, useState } from 'react';
import type { CompletedService, FilterOption, MyReview, PersonalStats, ReviewTag } from '../mock/types';
import {
  applyFilter,
  CURRENT_USER_ID,
  deleteReview,
  editReview,
  fetchMyReviews,
  fetchPendingReviews,
  fetchPersonalStats,
  submitReview,
  type EditReviewPayload,
  type SubmitReviewPayload,
} from '../services/reviewService';

export type SheetMode = 'write' | 'edit';

export interface UseReviewsReturn {
  // Data
  myReviews: MyReview[];
  filteredReviews: MyReview[];
  personalStats: PersonalStats | null;
  pendingService: CompletedService | null;

  // UI state
  isLoading: boolean;
  isRefreshing: boolean;
  activeFilter: FilterOption;
  sheetVisible: boolean;
  sheetMode: SheetMode;
  editingReview: MyReview | null;

  // Write / Edit state
  selectedRating: number;
  reviewText: string;
  selectedTags: Set<ReviewTag>;
  isSubmitting: boolean;

  // Actions
  onRefresh: () => Promise<void>;
  setActiveFilter: (f: FilterOption) => void;
  openWriteSheet: () => void;
  openEditSheet: (review: MyReview) => void;
  closeSheet: () => void;
  dismissPendingReview: () => void;
  setSelectedRating: (r: number) => void;
  setReviewText: (t: string) => void;
  toggleTag: (tag: ReviewTag) => void;
  handleSubmit: () => Promise<void>;
  handleDelete: (reviewId: string) => void;
}

export function useReviews(isActive: boolean): UseReviewsReturn {
  const [myReviews, setMyReviews] = useState<MyReview[]>([]);
  const [personalStats, setPersonalStats] = useState<PersonalStats | null>(null);
  const [pendingService, setPendingService] = useState<CompletedService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>('write');
  const [editingReview, setEditingReview] = useState<MyReview | null>(null);

  // Write / Edit form state
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<ReviewTag>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dismissedIds = useRef<Set<string>>(new Set());
  const hasLoaded = useRef(false);

  const loadData = useCallback(async () => {
    const [reviews, stats, pending] = await Promise.all([
      fetchMyReviews(CURRENT_USER_ID),
      fetchPersonalStats(CURRENT_USER_ID),
      fetchPendingReviews(CURRENT_USER_ID),
    ]);
    setMyReviews(reviews);
    setPersonalStats(stats);
    const first = pending[0] ?? null;
    if (first) {
      setPendingService(first);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadData();
    } catch {
      // Keep state
    } finally {
      setIsRefreshing(false);
    }
  }, [loadData]);

  useEffect(() => {
    if (!isActive || hasLoaded.current) return;
    hasLoaded.current = true;
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      await loadData();
      if (!cancelled) setIsLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [isActive, loadData]);

  const filteredReviews = applyFilter(myReviews, activeFilter);

  const resetForm = useCallback(() => {
    setSelectedRating(0);
    setReviewText('');
    setSelectedTags(new Set());
    setEditingReview(null);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
    resetForm();
  }, [resetForm]);

  const openWriteSheet = useCallback(() => {
    resetForm();
    setSheetMode('write');
    setSheetVisible(true);
  }, [resetForm]);

  const openEditSheet = useCallback((review: MyReview) => {
    setEditingReview(review);
    setSelectedRating(review.rating);
    setReviewText(review.reviewText);
    setSelectedTags(new Set(review.tags));
    setSheetMode('edit');
    setSheetVisible(true);
  }, []);

  const dismissPendingReview = useCallback(() => {
    if (pendingService) dismissedIds.current.add(pendingService.id);
    closeSheet();
  }, [pendingService, closeSheet]);

  const toggleTag = useCallback((tag: ReviewTag) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (selectedRating === 0) return;
    setIsSubmitting(true);

    if (sheetMode === 'edit' && editingReview) {
      // Edit existing review
      const payload: EditReviewPayload = {
        reviewId: editingReview.id,
        rating: selectedRating,
        reviewText,
        tags: Array.from(selectedTags),
        isAnonymous: false,
      };
      await editReview(payload);
      setMyReviews((prev) =>
        prev.map((r) =>
          r.id === editingReview.id
            ? { ...r, rating: payload.rating, reviewText: payload.reviewText, tags: payload.tags, isAnonymous: payload.isAnonymous, updatedAt: 'Just now' }
            : r
        )
      );
      // Update personal stats avg
      setPersonalStats((prev) => {
        if (!prev) return prev;
        const updated = myReviews.map((r) => r.id === editingReview.id ? { ...r, rating: selectedRating } : r);
        const avg = updated.reduce((s, r) => s + r.rating, 0) / updated.length;
        return { ...prev, averageRating: Math.round(avg * 10) / 10 };
      });
    } else if (sheetMode === 'write' && pendingService) {
      // New review
      const payload: SubmitReviewPayload = {
        bookingId: pendingService.bookingId,
        serviceName: pendingService.serviceName,
        serviceIcon: pendingService.serviceIcon,
        bookingDate: pendingService.bookingDate,
        completedDate: pendingService.completedAt,
        engineerId: pendingService.engineer.id,
        rating: selectedRating,
        reviewText,
        tags: Array.from(selectedTags),
        isAnonymous: false,
      };
      await submitReview(payload);
      const newReview: MyReview = {
        id: `rv_new_${Date.now()}`,
        userId: CURRENT_USER_ID,
        bookingId: payload.bookingId,
        serviceName: payload.serviceName,
        serviceIcon: payload.serviceIcon,
        bookingDate: payload.bookingDate,
        completedDate: payload.completedDate,
        engineer: pendingService.engineer,
        rating: payload.rating,
        reviewText: payload.reviewText,
        tags: payload.tags,
        images: [],
        isAnonymous: false,
        createdAt: 'Just now',
        updatedAt: null,
      };
      setMyReviews((prev) => [newReview, ...prev]);
      setPendingService((prev) => prev ? { ...prev, reviewSubmitted: true } : null);
      setPersonalStats((prev) =>
        prev
          ? {
              ...prev,
              totalReviews: prev.totalReviews + 1,
              averageRating: Math.round(((prev.averageRating * prev.totalReviews + selectedRating) / (prev.totalReviews + 1)) * 10) / 10,
            }
          : prev
      );
    }

    setIsSubmitting(false);
    closeSheet();
  }, [sheetMode, editingReview, pendingService, selectedRating, reviewText, selectedTags, myReviews, closeSheet]);

  const handleDelete = useCallback((reviewId: string) => {
    deleteReview(reviewId); // fire-and-forget; real API awaited when integrated
    setMyReviews((prev) => prev.filter((r) => r.id !== reviewId));
    setPersonalStats((prev) => {
      if (!prev || prev.totalReviews === 0) return prev;
      return { ...prev, totalReviews: prev.totalReviews - 1 };
    });
  }, []);

  return {
    myReviews,
    filteredReviews,
    personalStats,
    pendingService,
    isLoading,
    isRefreshing,
    onRefresh: handleRefresh,
    activeFilter,
    sheetVisible,
    sheetMode,
    editingReview,
    selectedRating,
    reviewText,
    selectedTags,
    isSubmitting,
    setActiveFilter,
    openWriteSheet,
    openEditSheet,
    closeSheet,
    dismissPendingReview,
    setSelectedRating,
    setReviewText,
    toggleTag,
    handleSubmit,
    handleDelete,
  };
}
