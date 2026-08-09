import type { FilterChip, NotificationCategory } from '../types';

export const CURRENT_USER_ID = 'usr_001';

export const FILTER_CHIPS: FilterChip[] = [
  { id: 'all',      label: 'All'      },
  { id: 'unread',   label: 'Unread'   },
  { id: 'bookings', label: 'Bookings' },
  { id: 'payments', label: 'Payments' },
  { id: 'offers',   label: 'Offers'   },
  { id: 'support',  label: 'Support'  },
  { id: 'system',   label: 'System'   },
];

// Maps each NotificationCategory to a display label
export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  all:      'All',
  unread:   'Unread',
  bookings: 'Bookings',
  payments: 'Payments',
  offers:   'Offers',
  support:  'Support',
  system:   'System',
};

// Group label thresholds (in hours)
export const GROUP_TODAY_HOURS     = 24;
export const GROUP_YESTERDAY_HOURS = 48;
export const GROUP_WEEK_HOURS      = 168;   // 7 days
export const GROUP_MONTH_HOURS     = 720;   // 30 days

export const GROUP_LABELS = {
  TODAY:        'Today',
  YESTERDAY:    'Yesterday',
  THIS_WEEK:    'Earlier This Week',
  THIS_MONTH:   'This Month',
  OLDER:        'Older',
} as const;
