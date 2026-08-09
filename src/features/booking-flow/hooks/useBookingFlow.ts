import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MATCHING_STEPS,
  STEP_DURATIONS_MS,
  INITIAL_METRICS,
  FINAL_METRICS,
} from '../constants';
import { cancelBooking, createBooking } from '../services/bookingService';
import type {
  BookingFlowStatus,
  BookingResult,
  CreateBookingPayload,
  MatchingMetrics,
  MatchingStep,
} from '../types';

export type BookingSheet = 'none' | 'finding' | 'assigned';

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

    // Safety timeout — if something goes wrong after 12s
    const safetyTimer = setTimeout(() => {
      if (cancelledRef.current) return;
      onError('Matching timed out. Please try again.');
    }, 12_000);
    timersRef.current.push(safetyTimer);
  }, []);

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
          setBookingResult(apiResult);
          // Small pause before switching sheets for a polished feel
          const t = setTimeout(() => {
            if (!cancelledRef.current) setActiveSheet('assigned');
          }, 400);
          timersRef.current.push(t);
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
        tryTransition();
      })
      .catch(() => {
        if (!cancelledRef.current) {
          setHasError(true);
          setErrorMessage('Booking failed. Please try again.');
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
