import { useState, useEffect } from 'react';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type * as NotificationsType from 'expo-notifications';

/**
 * Detects whether the app is running in Expo Go (where remote FCM push is disabled in SDK 53+).
 * In Development Builds (npx expo run:android) or Standalone APK/AAB builds, this is false.
 */
export const isExpoGo: boolean =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let _notificationsModule: typeof NotificationsType | null = null;
let _hasAttemptedLoad = false;

/**
 * Safely retrieves the expo-notifications module without throwing in Expo Go.
 */
export function getExpoNotifications(): typeof NotificationsType | null {
  if (isExpoGo) {
    return null;
  }
  if (_hasAttemptedLoad) {
    return _notificationsModule;
  }
  _hasAttemptedLoad = true;

  try {
    _notificationsModule = require('expo-notifications');
    return _notificationsModule;
  } catch (err) {
    console.warn('[SafeNotifications] expo-notifications unavailable in current runtime:', err);
    _notificationsModule = null;
    return null;
  }
}

/**
 * Safe React hook to get the last tapped notification response.
 * Works seamlessly in both Expo Go (returns null safely) and native Dev/Standalone Builds.
 */
export function useSafeLastNotificationResponse(): NotificationsType.NotificationResponse | null {
  const [response, setResponse] = useState<NotificationsType.NotificationResponse | null>(null);

  useEffect(() => {
    if (isExpoGo) return;

    const Notifications = getExpoNotifications();
    if (!Notifications) return;

    let isMounted = true;

    try {
      if (typeof Notifications.getLastNotificationResponseAsync === 'function') {
        Notifications.getLastNotificationResponseAsync()
          .then((initialResponse) => {
            if (isMounted && initialResponse) {
              setResponse(initialResponse);
            }
          })
          .catch((err) => {
            console.warn('[SafeNotifications] Error getting initial notification response:', err);
          });
      }
    } catch (err) {
      console.warn('[SafeNotifications] getLastNotificationResponseAsync unavailable:', err);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return response;
}
