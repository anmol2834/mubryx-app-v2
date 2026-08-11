/**
 * NotificationService — data layer for the Notifications module.
 * Currently backed by mock data.
 * To integrate a real API / Firebase / OneSignal:
 *   → Replace only the functions below.
 *   → UI and hooks require zero changes.
 */

import { MOCK_NOTIFICATIONS } from '../mock/notifications';
import type {
  Notification,
  NotificationCategory,
  NotificationSummaryStats,
} from '../types';

// Simulated network delay (ms)
const DELAY = 500;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function fetchNotifications(_userId: string): Promise<Notification[]> {
  await delay(100);
  return [];
}

// ─── Summary stats ────────────────────────────────────────────────────────────

export async function fetchSummaryStats(userId: string): Promise<NotificationSummaryStats> {
  await delay(100);
  const all = await fetchNotifications(userId);
  const now = Date.now();
  const todayMs = 24 * 3_600_000;

  return {
    total:           all.length,
    unread:          all.filter((n) => !n.isRead).length,
    todayCount:      all.filter((n) => now - new Date(n.createdAt).getTime() < todayMs).length,
    bookingUpdates:  all.filter((n) => n.category === 'bookings').length,
    offerCount:      all.filter((n) => n.category === 'offers').length,
    supportMessages: all.filter((n) => n.category === 'support').length,
  };
}

// ─── Mutations (fire-and-forget; awaited when real API is live) ───────────────

export async function markAsRead(_notificationId: string): Promise<void> {
  await delay(100);
}

export async function markAllAsRead(_userId: string): Promise<void> {
  await delay(200);
}

export async function deleteNotification(_notificationId: string): Promise<void> {
  await delay(150);
}

// ─── Filter ───────────────────────────────────────────────────────────────────

export function applyFilter(
  notifications: Notification[],
  category: NotificationCategory,
): Notification[] {
  if (category === 'all')    return notifications;
  if (category === 'unread') return notifications.filter((n) => !n.isRead);
  return notifications.filter((n) => n.category === category);
}
