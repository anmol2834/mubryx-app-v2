/**
 * NotificationCard — single notification row.
 *
 * Swipe-left → delete (Animated translateX, no Reanimated shared values)
 * Swipe-right → mark read
 * Tap → action + mark as read
 * Unread: bold title, blue left bar, soft bg highlight
 */

import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo, useCallback, useRef } from 'react';
import {
    Animated,
    PanResponder,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { Notification } from '../../types';
import { getRelativeTime, getTypeStyle } from '../../utils';

// ─── Action CTA labels ────────────────────────────────────────────────────────

function getCtaLabel(notification: Notification): string | null {
  switch (notification.action.type) {
    case 'open_track':   return 'Track Service →';
    case 'open_review':  return 'Rate Now →';
    case 'open_offers':  return 'View Offer →';
    case 'open_wallet':  return 'View Wallet →';
    case 'open_support': return 'View Ticket →';
    case 'open_booking_detail': return 'View Booking →';
    default:             return null;
  }
}

// ─── Swipe hint icons ─────────────────────────────────────────────────────────

function TrashIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ReadIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SWIPE_THRESHOLD = 80;
const SWIPE_DELETE    = -SWIPE_THRESHOLD;
const SWIPE_READ      = SWIPE_THRESHOLD;

// ─── NotificationCard ─────────────────────────────────────────────────────────

interface Props {
  notification: Notification;
  onPress:      (notification: Notification) => void;
  onMarkRead:   (id: string) => void;
  onDelete:     (id: string) => void;
}

export const NotificationCard = memo(function NotificationCard({
  notification,
  onPress,
  onMarkRead,
  onDelete,
}: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const typeStyle  = getTypeStyle(notification.type);
  const relTime    = getRelativeTime(notification.createdAt);
  const ctaLabel   = getCtaLabel(notification);
  const isUnread   = !notification.isRead;

  // ── Swipe gesture ──────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 8 && Math.abs(gs.dy) < Math.abs(gs.dx),
      onPanResponderMove: (_, gs) => {
        // Clamp: left max -120, right max +120
        const clamped = Math.max(-120, Math.min(120, gs.dx));
        translateX.setValue(clamped);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx <= SWIPE_DELETE) {
          // Slide out left then delete
          Animated.timing(translateX, {
            toValue: -400,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onDelete(notification.id));
        } else if (gs.dx >= SWIPE_READ) {
          // Snap back and mark read
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 8,
          }).start(() => {
            if (!notification.isRead) onMarkRead(notification.id);
          });
        } else {
          // Snap back to center
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }).start();
      },
    }),
  ).current;

  const handlePress = useCallback(() => {
    onPress(notification);
  }, [notification, onPress]);

  return (
    <View style={s.outer}>
      {/* Swipe hint backgrounds */}
      <View style={s.swipeHintRight}>
        <ReadIcon />
        <Text style={s.swipeHintText}>Read</Text>
      </View>
      <View style={s.swipeHintLeft}>
        <TrashIcon />
        <Text style={s.swipeHintText}>Delete</Text>
      </View>

      {/* Animated card */}
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}>
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            s.card,
            isUnread && s.cardUnread,
            pressed && s.cardPressed,
          ]}
          android_ripple={{ color: Brand.primarySoft, borderless: false }}>

          {/* Unread left indicator bar */}
          {isUnread && <View style={[s.unreadBar, { backgroundColor: typeStyle.dot }]} />}

          {/* Icon bubble */}
          <View style={[s.iconBubble, { backgroundColor: typeStyle.bg }]}>
            <Text style={s.iconText}>{notification.icon}</Text>
          </View>

          {/* Content */}
          <View style={s.content}>
            {/* Title row */}
            <View style={s.titleRow}>
              <Text
                style={[s.title, isUnread && s.titleUnread]}
                numberOfLines={1}>
                {notification.title}
              </Text>
              {isUnread && <View style={[s.unreadDot, { backgroundColor: typeStyle.dot }]} />}
            </View>

            {/* Description */}
            <Text style={s.description} numberOfLines={2}>
              {notification.description}
            </Text>

            {/* Footer: time + CTA */}
            <View style={s.footer}>
              <Text style={s.time}>{relTime}</Text>
              {ctaLabel && notification.action.type !== 'none' && (
                <Text style={[s.cta, { color: typeStyle.icon }]}>{ctaLabel}</Text>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
});

const s = StyleSheet.create({
  outer: {
    position: 'relative',
    overflow: 'hidden',
  },
  // ── Swipe hint layers (behind the card) ───────────────────────────────────
  swipeHintRight: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0,
    width: 90,
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingLeft: Spacing.base,
  },
  swipeHintLeft: {
    position: 'absolute',
    top: 0, bottom: 0, right: 0,
    width: 90,
    backgroundColor: Brand.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingRight: Spacing.base,
  },
  swipeHintText: {
    color: Brand.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    backgroundColor: Brand.white,
    gap: Spacing.md,
  },
  cardUnread: {
    backgroundColor: '#FAFCFF',
  },
  cardPressed: {
    backgroundColor: Brand.surface,
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopRightRadius: Radius.xs,
    borderBottomRightRadius: Radius.xs,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  iconText: { fontSize: 20 },
  content: { flex: 1, gap: 4 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    color: Brand.textSecondary,
    lineHeight: 20,
  },
  titleUnread: {
    fontWeight: '700' as const,
    color: Brand.textPrimary,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  description: {
    ...Typography.small,
    color: Brand.textSecondary,
    lineHeight: 19,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  time: {
    ...Typography.caption,
    color: Brand.textMuted,
  },
  cta: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
});
