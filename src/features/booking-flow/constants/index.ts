import type { MatchingStep, MatchingMetrics } from '../types';

export const MATCHING_STEPS: MatchingStep[] = [
  { id: 'finding_nearby',       label: 'Finding Nearby Technicians',    status: 'pending' },
  { id: 'matching_expertise',   label: 'Matching Appliance Expertise',  status: 'pending' },
  { id: 'checking_availability',label: 'Checking Availability',         status: 'pending' },
  { id: 'selecting_best',       label: 'Selecting Best Rated Engineer', status: 'pending' },
  { id: 'confirming',           label: 'Confirming Assignment',         status: 'pending' },
];

// Duration (ms) each step stays "active" before completing (total 2.5s)
export const STEP_DURATIONS_MS = [500, 500, 500, 500, 500];

export const INITIAL_METRICS: MatchingMetrics = {
  searchRadius:     '5 km',
  nearbyEngineers:  0,
  bestMatchRating:  '—',
  estimatedArrival: '—',
};

export const FINAL_METRICS: MatchingMetrics = {
  searchRadius:     '3.2 km',
  nearbyEngineers:  7,
  bestMatchRating:  '4.9 ★',
  estimatedArrival: '~18 min',
};
