// ─── Track Module Constants ───────────────────────────────────────────────────

export const CURRENT_USER_ID = 'usr_001';

// Stage display labels
export const STAGE_LABELS: Record<string, string> = {
  confirmed: 'Booking Confirmed',
  assigned:  'Engineer Assigned',
  journey:   'Engineer En Route',
  nearby:    'Engineer Nearby',
  arrived:   'Engineer Arrived',
  started:   'Service Started',
  completed: 'Service Completed',
};

// Stage accent colors for status badges in the list
export const STAGE_BADGE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  confirmed: { bg: '#E3F2FD', text: '#1565C0', dot: '#1565C0' },
  assigned:  { bg: '#E0F2F1', text: '#00695C', dot: '#00695C' },
  journey:   { bg: '#E1F5FE', text: '#0277BD', dot: '#0277BD' },
  nearby:    { bg: '#FFF3E0', text: '#E65100', dot: '#E65100' },
  arrived:   { bg: '#E8F5E9', text: '#2E7D32', dot: '#2E7D32' },
  started:   { bg: '#F3E5F5', text: '#6A1B9A', dot: '#6A1B9A' },
};

// Total number of live stages (used for progress calculation)
export const TOTAL_LIVE_STAGES = 6; // confirmed → started (completed is not live)
