// ─── Notification Module — Type Definitions ───────────────────────────────────
// Designed to map 1:1 with future backend API responses.
// Only the service layer changes when backend goes live — UI stays untouched.

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_rescheduled'
  | 'engineer_assigned'
  | 'engineer_journey'
  | 'engineer_nearby'
  | 'engineer_arrived'
  | 'service_started'
  | 'service_completed'
  | 'payment_success'
  | 'payment_failed'
  | 'refund_processed'
  | 'invoice_ready'
  | 'offer'
  | 'coupon'
  | 'wallet'
  | 'referral'
  | 'review_reminder'
  | 'account'
  | 'system'
  | 'security'
  | 'support';

export type NotificationCategory =
  | 'all'
  | 'unread'
  | 'bookings'
  | 'payments'
  | 'offers'
  | 'support'
  | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationActionType =
  | 'open_track'
  | 'open_review'
  | 'open_booking_detail'
  | 'open_offers'
  | 'open_support'
  | 'open_wallet'
  | 'open_profile'
  | 'none';

export interface NotificationAction {
  type: NotificationActionType;
  /** ID of the entity to navigate to (bookingId, reviewId, etc.) */
  targetId: string | null;
}

export interface NotificationMetadata {
  bookingId?: string;
  engineerName?: string;
  serviceName?: string;
  amount?: number;
  couponCode?: string;
  offerTitle?: string;
  eta?: string;
  supportTicketId?: string;
}

export interface Notification {
  id: string;
  userId: string;           // always === CURRENT_USER_ID
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;        // ISO 8601 — used for grouping & relative time
  updatedAt: string;
  action: NotificationAction;
  icon: string;             // emoji — replaced by image URL when backend ready
  imageUrl: string | null;  // future: rich notification image
  metadata: NotificationMetadata;
}

// ─── Derived / UI types ───────────────────────────────────────────────────────

export interface NotificationGroup {
  label: string;            // 'Today', 'Yesterday', 'Earlier This Week', etc.
  data: Notification[];
}

export interface NotificationSummaryStats {
  total: number;
  unread: number;
  todayCount: number;
  bookingUpdates: number;
  offerCount: number;
  supportMessages: number;
}

export interface FilterChip {
  id: NotificationCategory;
  label: string;
}
