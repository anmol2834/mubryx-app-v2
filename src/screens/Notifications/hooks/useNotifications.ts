import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CURRENT_USER_ID } from '../constants';
import {
  applyFilter,
  deleteNotification,
  fetchNotifications,
  fetchSummaryStats,
  markAllAsRead,
  markAsRead,
} from '../services/notificationService';
import type {
  Notification,
  NotificationCategory,
  NotificationSummaryStats,
} from '../types';
import { groupNotifications } from '../utils';
import type { NotificationGroup } from '../types';

export interface UseNotificationsReturn {
  // Data
  notifications: Notification[];
  groups: NotificationGroup[];
  summaryStats: NotificationSummaryStats | null;
  unreadCount: number;

  // UI state
  isLoading: boolean;
  hasError: boolean;
  activeFilter: NotificationCategory;

  // Actions
  setActiveFilter: (c: NotificationCategory) => void;
  handleMarkRead: (id: string) => void;
  handleMarkAllRead: () => void;
  handleDelete: (id: string) => void;
  handleAction: (notification: Notification) => void;
  retry: () => void;
}

interface Handlers {
  onOpenTrack: () => void;
  onOpenReview: () => void;
}

export function useNotifications(
  isActive: boolean,
  handlers: Handlers,
): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summaryStats, setSummaryStats]   = useState<NotificationSummaryStats | null>(null);
  const [isLoading, setIsLoading]         = useState(true);
  const [hasError, setHasError]           = useState(false);
  const [activeFilter, setActiveFilter]   = useState<NotificationCategory>('all');

  const hasLoaded = useRef(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const [notifs, stats] = await Promise.all([
        fetchNotifications(CURRENT_USER_ID),
        fetchSummaryStats(CURRENT_USER_ID),
      ]);
      setNotifications(notifs);
      setSummaryStats(stats);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isActive || hasLoaded.current) return;
    hasLoaded.current = true;
    load();
  }, [isActive, load]);

  const retry = useCallback(() => {
    hasLoaded.current = false;
    load();
  }, [load]);

  // ─── Derived ───────────────────────────────────────────────────────────────

  const filtered = useMemo(
    () => applyFilter(notifications, activeFilter),
    [notifications, activeFilter],
  );

  const groups = useMemo(() => groupNotifications(filtered), [filtered]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleMarkRead = useCallback((id: string) => {
    markAsRead(id); // fire-and-forget
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setSummaryStats((prev) =>
      prev ? { ...prev, unread: Math.max(0, prev.unread - 1) } : prev,
    );
  }, []);

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead(CURRENT_USER_ID); // fire-and-forget
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setSummaryStats((prev) => (prev ? { ...prev, unread: 0 } : prev));
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteNotification(id); // fire-and-forget
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSummaryStats((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        total:  prev.total - 1,
        unread: target && !target.isRead ? Math.max(0, prev.unread - 1) : prev.unread,
      };
    });
  }, [notifications]);

  const handleAction = useCallback((notification: Notification) => {
    // Mark as read on tap
    if (!notification.isRead) handleMarkRead(notification.id);

    switch (notification.action.type) {
      case 'open_track':
        handlers.onOpenTrack();
        break;
      case 'open_review':
        handlers.onOpenReview();
        break;
      // Future: open_booking_detail, open_offers, open_support, open_wallet, open_profile
      default:
        break;
    }
  }, [handleMarkRead, handlers]);

  return {
    notifications,
    groups,
    summaryStats,
    unreadCount,
    isLoading,
    hasError,
    activeFilter,
    setActiveFilter,
    handleMarkRead,
    handleMarkAllRead,
    handleDelete,
    handleAction,
    retry,
  };
}
