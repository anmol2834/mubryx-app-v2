import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MATCHING_STEPS,
  STEP_DURATIONS_MS,
  INITIAL_METRICS,
  FINAL_METRICS,
} from '../constants';
import { cancelBooking, createBooking } from '../services/bookingService';
import { queryClient } from '@/api/queryClient';
import { socketManager } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import type {
  BookingFlowStatus,
  BookingResult,
  CreateBookingPayload,
  MatchingMetrics,
  MatchingStep,
} from '../types';

export type BookingSheet = 'none' | 'finding' | 'assigned';

// ─── Error Message Mapping ────────────────────────────────────────────────────

function getBookingErrorMessage(errorCode: string, fallback?: string): string {
  const messages: Record<string, string> = {
    BOOKING_CART_EMPTY: 'Your cart is empty. Please add services before booking.',
    BOOKING_ADDRESS_REQUIRED: 'Please select a service address before booking.',
    BOOKING_ADDRESS_NOT_FOUND: 'Your selected address could not be found. Please choose another.',
    BOOKING_ADDRESS_NOT_OWNED: 'This address does not belong to your account.',
    BOOKING_SERVICE_UNAVAILABLE: 'One or more services in your cart are no longer available. Please update your cart.',
    BOOKING_INVALID_SCHEDULE: 'The scheduled time is invalid. Please choose a future date and time.',
    BOOKING_PAYMENT_METHOD_UNSUPPORTED: 'This payment method is not currently supported. Please select Cash on Service.',
    BOOKING_CREATION_FAILED: 'Your booking could not be created. Please try again.',
    NETWORK_ERROR: 'Network connection failed. Please check your internet and try again.',
    TIMEOUT: 'The request timed out. Please try again.',
  };
  return messages[errorCode] ?? fallback ?? 'Something went wrong. Please try again.';
}

export interface UseBookingFlowReturn {
  // Sheet visibility
  activeSheet: BookingSheet;

  // Matching state (Sheet #1)
  matchingSteps: MatchingStep[];
  matchingProgress: number;       // 0–1
  matchingMetrics: MatchingMetrics;
  isCancelling: boolean;

  // Result state (Sheet #2)
  bookingResult: BookingResult | null;

  // Error
  hasError: boolean;
  errorMessage: string;

  // Actions
  confirmBooking: (payload: CreateBookingPayload) => void;
  cancelFlow: () => void;
  closeAssignedSheet: () => void;
  retryFlow: () => void;
}

export function useBookingFlow(): UseBookingFlowReturn {
  const [activeSheet, setActiveSheet]         = useState<BookingSheet>('none');
  const [matchingSteps, setMatchingSteps]     = useState<MatchingStep[]>(MATCHING_STEPS.map(s => ({ ...s })));
  const [matchingProgress, setMatchingProgress] = useState(0);
  const [matchingMetrics, setMatchingMetrics] = useState<MatchingMetrics>(INITIAL_METRICS);
  const [isCancelling, setIsCancelling]       = useState(false);
  const [bookingResult, setBookingResult]     = useState<BookingResult | null>(null);
  const [hasError, setHasError]               = useState(false);
  const [errorMessage, setErrorMessage]       = useState('');

  const user = useAuthStore((s) => s.user);
  const cancelledRef  = useRef(false);
  const payloadRef    = useRef<CreateBookingPayload | null>(null);
  const timersRef     = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ─── Cleanup all pending timers ──────────────────────────────────────────

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // ─── Reset state to initial ───────────────────────────────────────────────

  const resetState = useCallback(() => {
    setMatchingSteps(MATCHING_STEPS.map(s => ({ ...s })));
    setMatchingProgress(0);
    setMatchingMetrics(INITIAL_METRICS);
    setIsCancelling(false);
    setHasError(false);
    setErrorMessage('');
    cancelledRef.current = false;
  }, []);

  // ─── Run the matching animation sequence ─────────────────────────────────

  const runMatchingSequence = useCallback((
    onComplete: () => void,
    onError: (msg: string) => void,
  ) => {
    const totalSteps = MATCHING_STEPS.length;
    let elapsed = 0;

    MATCHING_STEPS.forEach((step, idx) => {
      const startAt = elapsed;
      const duration = STEP_DURATIONS_MS[idx];
      elapsed += duration;

      // Activate step
      const activateTimer = setTimeout(() => {
        if (cancelledRef.current) return;
        setMatchingSteps(prev =>
          prev.map((s, i) => ({
            ...s,
            status: i < idx ? 'done' : i === idx ? 'active' : 'pending',
          }))
        );
        // Update progress
        setMatchingProgress((idx) / totalSteps);

        // Update metrics mid-way
        if (idx === 2) {
          setMatchingMetrics(prev => ({ ...prev, nearbyEngineers: 7, searchRadius: '3.2 km' }));
        }
        if (idx === 3) {
          setMatchingMetrics(prev => ({ ...prev, bestMatchRating: '4.9 ★' }));
        }
      }, startAt);

      // Complete step
      const completeTimer = setTimeout(() => {
        if (cancelledRef.current) return;
        setMatchingSteps(prev =>
          prev.map((s, i) => ({
            ...s,
            status: i <= idx ? 'done' : 'pending',
          }))
        );
        setMatchingProgress((idx + 1) / totalSteps);

        if (idx === totalSteps - 1) {
          setMatchingMetrics(FINAL_METRICS);
          onComplete();
        }
      }, startAt + duration);

      timersRef.current.push(activateTimer, completeTimer);
    });

    // We do NOT time out automatically on the frontend anymore;
    // backend will orchestrate timeout / reassignment.
  }, []);

  // Socket Listener for Booking Assignment
  useEffect(() => {
    const socket = socketManager.connect();
    if (!socket) return;

    const onAssigned = (data: any) => {
      // Check if the assigned booking matches the current one we are searching for
      if (bookingResult?.bookingId === data?.bookingId) {
        // We received real-time confirmation that technician accepted!
        // Update local result and transition to success sheet
        setBookingResult(prev => prev ? { ...prev, ...data } : data);
        setActiveSheet('assigned');
      }
    };

    socket.on('booking:assigned', onAssigned);

    return () => {
      socket.off('booking:assigned', onAssigned);
    };
  }, [bookingResult?.bookingId]);

  // ─── Confirm booking — entry point ───────────────────────────────────────

  const confirmBooking = useCallback((payload: CreateBookingPayload) => {
    clearTimers();
    resetState();
    payloadRef.current = payload;
    cancelledRef.current = false;

    setActiveSheet('finding');

    // Fire the booking API call in parallel with the animation
    let apiResult: BookingResult | null = null;
    let apiDone = false;
    let animDone = false;

    const tryTransition = () => {
      if (apiDone && animDone && !cancelledRef.current) {
        if (apiResult) {
          // Set the result and transition immediately to success sheet
          setBookingResult(apiResult);
          setActiveSheet('assigned');
        } else {
          setHasError(true);
          setErrorMessage('Could not assign a technician. Please try again.');
        }
      }
    };

    // API call
    createBooking(payload)
      .then(result => {
        apiResult = result;
        apiDone = true;
        // Invalidate cart and bookings queries on success
        const cartKey = user?.id ? ['cart', user.id] : ['cart', 'guest'];
        const bookingsKey = user?.id ? ['bookings', user.id] : ['bookings'];
        queryClient.setQueryData(cartKey, null);
        queryClient.removeQueries({ queryKey: cartKey });
        queryClient.invalidateQueries({ queryKey: bookingsKey });
        tryTransition();
      })
      .catch((err) => {
        if (!cancelledRef.current) {
          // Provide user-friendly error based on error code
          const errorCode = (err as any)?.errorCode || 'BOOKING_CREATION_FAILED';
          const userMessage = getBookingErrorMessage(errorCode, err?.message);
          setHasError(true);
          setErrorMessage(userMessage);
          setActiveSheet('none');
        }
      });

    // Animation sequence
    runMatchingSequence(
      () => { animDone = true; tryTransition(); },
      (msg) => {
        setHasError(true);
        setErrorMessage(msg);
      },
    );
  }, [clearTimers, resetState, runMatchingSequence]);

  // ─── Cancel flow ─────────────────────────────────────────────────────────

  const cancelFlow = useCallback(() => {
    cancelledRef.current = true;
    clearTimers();
    setIsCancelling(true);

    const bookingId = bookingResult?.bookingId;
    if (bookingId) {
      cancelBooking(bookingId).finally(() => {
        setIsCancelling(false);
        setActiveSheet('none');
        resetState();
      });
    } else {
      setIsCancelling(false);
      setActiveSheet('none');
      resetState();
    }
  }, [clearTimers, resetState, bookingResult]);

  // ─── Close assigned sheet ─────────────────────────────────────────────────

  const closeAssignedSheet = useCallback(() => {
    setActiveSheet('none');
    resetState();
    setBookingResult(null);
  }, [resetState]);

  // ─── Retry ────────────────────────────────────────────────────────────────

  const retryFlow = useCallback(() => {
    if (payloadRef.current) {
      confirmBooking(payloadRef.current);
    }
  }, [confirmBooking]);

  return {
    activeSheet,
    matchingSteps,
    matchingProgress,
    matchingMetrics,
    isCancelling,
    bookingResult,
    hasError,
    errorMessage,
    confirmBooking,
    cancelFlow,
    closeAssignedSheet,
    retryFlow,
  };
}
