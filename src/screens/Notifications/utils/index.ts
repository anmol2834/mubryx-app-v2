import type { Notification } from '../types';
import {
  GROUP_LABELS,
  GROUP_TODAY_HOURS,
  GROUP_YESTERDAY_HOURS,
  GROUP_WEEK_HOURS,
  GROUP_MONTH_HOURS,
} from '../constants';
import type { NotificationGroup } from '../types';

// ─── Relative time ────────────────────────────────────────────────────────────

export function getRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr  = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1)  return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr  < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7)  return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return `${Math.floor(diffDay / 30)}mo ago`;
}

// ─── Grouping ─────────────────────────────────────────────────────────────────

export function groupNotifications(notifications: Notification[]): NotificationGroup[] {
  const now = Date.now();

  const buckets: Record<string, Notification[]> = {
    [GROUP_LABELS.TODAY]:      [],
    [GROUP_LABELS.YESTERDAY]:  [],
    [GROUP_LABELS.THIS_WEEK]:  [],
    [GROUP_LABELS.THIS_MONTH]: [],
    [GROUP_LABELS.OLDER]:      [],
  };

  for (const n of notifications) {
    const diffHr = (now - new Date(n.createdAt).getTime()) / 3_600_000;
    if      (diffHr < GROUP_TODAY_HOURS)     buckets[GROUP_LABELS.TODAY].push(n);
    else if (diffHr < GROUP_YESTERDAY_HOURS) buckets[GROUP_LABELS.YESTERDAY].push(n);
    else if (diffHr < GROUP_WEEK_HOURS)      buckets[GROUP_LABELS.THIS_WEEK].push(n);
    else if (diffHr < GROUP_MONTH_HOURS)     buckets[GROUP_LABELS.THIS_MONTH].push(n);
    else                                     buckets[GROUP_LABELS.OLDER].push(n);
  }

  return Object.entries(buckets)
    .filter(([, data]) => data.length > 0)
    .map(([label, data]) => ({ label, data }));
}

// ─── Type → accent color ──────────────────────────────────────────────────────

import { Brand } from '@/constants/brand';
import type { NotificationType } from '../types';

export interface TypeStyle {
  bg: string;
  icon: string;
  dot: string;
}

export function getTypeStyle(type: NotificationType): TypeStyle {
  switch (type) {
    case 'booking_confirmed':
    case 'booking_rescheduled':
      return { bg: '#E3F2FD', icon: Brand.primary,  dot: Brand.primary };
    case 'booking_cancelled':
      return { bg: '#FFEBEE', icon: Brand.error,    dot: Brand.error };
    case 'engineer_assigned':
    case 'engineer_journey':
    case 'engineer_nearby':
    case 'engineer_arrived':
    case 'service_started':
      return { bg: '#E0F2F1', icon: '#00695C',      dot: '#00695C' };
    case 'service_completed':
      return { bg: '#E8F5E9', icon: '#2E7D32',      dot: '#2E7D32' };
    case 'payment_success':
    case 'invoice_ready':
      return { bg: '#E8F5E9', icon: '#2E7D32',      dot: '#2E7D32' };
    case 'payment_failed':
      return { bg: '#FFEBEE', icon: Brand.error,    dot: Brand.error };
    case 'refund_processed':
      return { bg: '#E0F2F1', icon: '#00695C',      dot: '#00695C' };
    case 'offer':
    case 'coupon':
      return { bg: '#FFF3E0', icon: '#E65100',      dot: '#E65100' };
    case 'wallet':
    case 'referral':
      return { bg: '#F3E5F5', icon: '#6A1B9A',      dot: '#6A1B9A' };
    case 'review_reminder':
      return { bg: '#FEFDE8', icon: '#F9A825',      dot: '#F9A825' };
    case 'support':
      return { bg: '#E1F5FE', icon: '#0277BD',      dot: '#0277BD' };
    case 'security':
      return { bg: '#FFEBEE', icon: '#B71C1C',      dot: '#B71C1C' };
    case 'account':
    case 'system':
    default:
      return { bg: Brand.surface, icon: Brand.textSecondary, dot: Brand.textMuted };
  }
}
