import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiFetch } from '@/services/apiClient';
import { Storage } from '@/services/storage';
import { getExpoNotifications, isExpoGo } from './safeNotifications';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'blocked' | 'undetermined';

export interface DeviceTokenPayload {
  pushToken: string;
  deviceId: string;
  platform: 'android' | 'ios' | 'web';
  appVersion: string;
}

// Configure foreground presentation behavior safely
const initialNotifications = getExpoNotifications();
if (initialNotifications && typeof initialNotifications.setNotificationHandler === 'function') {
  try {
    initialNotifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: (initialNotifications.AndroidNotificationPriority?.MAX ?? 2) as any,
      } as any),
    });
  } catch (err) {
    console.warn('[CustomerNotifications] Could not set foreground notification handler:', err);
  }
}

class CustomerNotificationService {
  private isInitialized = false;
  private isInitializing = false;
  private lastRegisteredToken: string | null = null;
  private lastRegisteredUserId: string | null = null;
  private lastRegisteredAt = 0;
  private registerPromise: Promise<boolean> | null = null;
  private tokenSubscription: any = null;
  private receivedSubscription: any = null;
  private responseSubscription: any = null;

  /**
   * Configures high-importance Android notification channels for booking alerts & updates.
   */
  async createChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    const Notifications = getExpoNotifications();
    if (!Notifications || typeof Notifications.setNotificationChannelAsync !== 'function') {
      return;
    }

    try {
      // 1. Customer Bookings & Live Tracking Updates Channel
      await Notifications.setNotificationChannelAsync('customer_booking_channel', {
        name: 'Customer Updates & Bookings',
        description: 'Real-time updates regarding your service bookings, technician assignment, and arrival',
        importance: Notifications.AndroidImportance?.MAX ?? 5,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1565C0',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
        bypassDnd: false,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility?.PUBLIC ?? 1,
      });

      // 2. Default / General Notifications Channel
      await Notifications.setNotificationChannelAsync('default', {
        name: 'General Notifications',
        description: 'Offers, announcements, and general account updates',
        importance: Notifications.AndroidImportance?.HIGH ?? 4,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1565C0',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility?.PUBLIC ?? 1,
      });

      console.log('[CustomerNotifications] Android notification channels configured');
    } catch (err) {
      console.warn('[CustomerNotifications] Failed to configure Android notification channels:', err);
    }
  }

  /**
   * Checks and requests push notification permissions (Android 13+ POST_NOTIFICATIONS & iOS).
   */
  async requestPermission(): Promise<NotificationPermissionStatus> {
    const Notifications = getExpoNotifications();
    if (!Notifications || typeof Notifications.getPermissionsAsync !== 'function') {
      if (isExpoGo) {
        console.log('[CustomerNotifications] Skipping permission request in Expo Go');
      }
      return 'undetermined';
    }

    try {
      const { status: existingStatus, canAskAgain } = await Notifications.getPermissionsAsync();
      if (existingStatus === 'granted') {
        return 'granted';
      }

      if (!canAskAgain) {
        return 'blocked';
      }

      const { status: newStatus } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      if (newStatus === 'granted') {
        console.log('[CustomerNotifications] Push notification permission granted');
        return 'granted';
      }

      console.log('[CustomerNotifications] Push notification permission denied:', newStatus);
      return 'denied';
    } catch (err) {
      console.warn('[CustomerNotifications] Permission check/request error:', err);
      return 'undetermined';
    }
  }

  /**
   * Retrieves the native FCM device token on Android.
   */
  async getFCMToken(): Promise<string | null> {
    const Notifications = getExpoNotifications();
    if (!Notifications || typeof Notifications.getDevicePushTokenAsync !== 'function') {
      if (isExpoGo) {
        console.log('[CustomerNotifications] Native FCM device token is not available in Expo Go');
      }
      return null;
    }

    try {
      if (!Device.isDevice) {
        console.log('[CustomerNotifications] Physical device required for native FCM device token');
        return null;
      }

      const deviceTokenResult = await Notifications.getDevicePushTokenAsync();
      const token = deviceTokenResult?.data;

      if (!token) {
        console.warn('[CustomerNotifications] No native device push token returned');
        return null;
      }

      return token;
    } catch (err: any) {
      console.warn('[CustomerNotifications] Failed to retrieve native FCM token:', err?.message || err);
      return null;
    }
  }

  /**
   * Registers the native FCM token with the backend for the currently authenticated customer.
   * Fully thread-safe, debounced, and idempotent without circular dependencies.
   */
  async registerDeviceToken(userId?: string, authToken?: string): Promise<boolean> {
    if (isExpoGo) {
      return false;
    }

    // Reuse in-flight registration promise if currently running
    if (this.registerPromise) {
      return this.registerPromise;
    }

    let token = authToken;
    let currentUserId = userId;

    if (!token) {
      token = (await Storage.getItem('mubryx_access_token')) || undefined;
    }
    if (!currentUserId) {
      try {
        const rawUser = await Storage.getItem('mubryx_auth_user');
        if (rawUser) {
          currentUserId = JSON.parse(rawUser)?.id;
        }
      } catch {
        // ignore
      }
    }

    if (!token || !currentUserId) {
      return false;
    }

    this.registerPromise = (async () => {
      try {
        const permission = await this.requestPermission();
        if (permission !== 'granted') {
          return false;
        }

        const fcmToken = await this.getFCMToken();
        if (!fcmToken) {
          return false;
        }

        // Idempotency check: token, userId, and 5-minute cooldown
        const now = Date.now();
        if (
          this.lastRegisteredToken === fcmToken &&
          this.lastRegisteredUserId === currentUserId &&
          now - this.lastRegisteredAt < 300000
        ) {
          return true;
        }

        const payload: DeviceTokenPayload = {
          pushToken: fcmToken,
          deviceId: Device.osBuildId || Device.modelName || 'android-customer-device',
          platform: Platform.OS as 'android' | 'ios' | 'web',
          appVersion: Constants.expoConfig?.version ?? '1.0.0',
        };

        console.log('[CustomerNotifications] Registering native FCM token with backend...');
        const response = await apiFetch('notifications/devices', {
          method: 'POST',
          body: payload,
          token,
        });

        if (response.ok) {
          this.lastRegisteredToken = fcmToken;
          this.lastRegisteredUserId = currentUserId;
          this.lastRegisteredAt = Date.now();
          console.log('[CustomerNotifications] FCM token successfully registered with backend');
          return true;
        } else {
          console.warn('[CustomerNotifications] Backend responded with non-success:', response.error);
          return false;
        }
      } catch (err: any) {
        console.error('[CustomerNotifications] Failed to register FCM token with backend:', err?.message || err);
        return false;
      } finally {
        this.registerPromise = null;
      }
    })();

    return this.registerPromise;
  }

  /**
   * Deactivates the device token upon customer logout.
   */
  async deactivateDeviceToken(authToken?: string): Promise<void> {
    try {
      const token = this.lastRegisteredToken;
      const deviceId = Device.osBuildId || Device.modelName || 'android-customer-device';
      const accessToken = authToken || (await Storage.getItem('mubryx_access_token'));

      if (token && accessToken) {
        console.log('[CustomerNotifications] Deactivating device token on backend...');
        await apiFetch('notifications/devices/deactivate', {
          method: 'POST',
          body: {
            pushToken: token,
            deviceId,
          },
          token: accessToken,
        }).catch((err) => {
          console.warn('[CustomerNotifications] Deactivate call failed (ignoring for clean logout):', err?.message);
        });
      }
    } catch (err) {
      console.warn('[CustomerNotifications] Error during token deactivation:', err);
    } finally {
      this.lastRegisteredToken = null;
      this.lastRegisteredUserId = null;
      this.lastRegisteredAt = 0;
      this.isInitialized = false;
    }
  }

  /**
   * Centralizes notification event listeners.
   */
  setupNotificationListeners(handlers: {
    onNotificationReceived?: (notification: any) => void;
    onNotificationResponse?: (response: any) => void;
  }): () => void {
    const Notifications = getExpoNotifications();
    if (!Notifications) {
      return () => {};
    }

    try {
      if (this.receivedSubscription && typeof this.receivedSubscription.remove === 'function') {
        this.receivedSubscription.remove();
      }
      if (this.responseSubscription && typeof this.responseSubscription.remove === 'function') {
        this.responseSubscription.remove();
      }

      if (handlers.onNotificationReceived && typeof Notifications.addNotificationReceivedListener === 'function') {
        this.receivedSubscription = Notifications.addNotificationReceivedListener(
          handlers.onNotificationReceived
        );
      }

      if (handlers.onNotificationResponse && typeof Notifications.addNotificationResponseReceivedListener === 'function') {
        this.responseSubscription = Notifications.addNotificationResponseReceivedListener(
          handlers.onNotificationResponse
        );
      }
    } catch (err) {
      console.warn('[CustomerNotifications] Failed to attach notification listeners:', err);
    }

    return () => {
      if (this.receivedSubscription && typeof this.receivedSubscription.remove === 'function') {
        this.receivedSubscription.remove();
        this.receivedSubscription = null;
      }
      if (this.responseSubscription && typeof this.responseSubscription.remove === 'function') {
        this.responseSubscription.remove();
        this.responseSubscription = null;
      }
    };
  }

  /**
   * Initializes notification channels, permissions, token registration, and token refresh listener.
   * Safe to call multiple times (idempotent singleton).
   */
  async initialize(userId?: string, authToken?: string): Promise<boolean> {
    let currentUserId = userId;
    if (!currentUserId) {
      try {
        const rawUser = await Storage.getItem('mubryx_auth_user');
        if (rawUser) {
          currentUserId = JSON.parse(rawUser)?.id;
        }
      } catch {
        // ignore
      }
    }

    // Singleton guard: do not re-initialize if already registered for this session
    if (this.isInitialized && this.lastRegisteredUserId === currentUserId && this.lastRegisteredToken) {
      return true;
    }

    if (this.isInitializing) {
      return false;
    }

    this.isInitializing = true;

    try {
      console.log('[CustomerNotifications] Initializing customer notification subsystem...');
      await this.createChannels();

      const registered = await this.registerDeviceToken(currentUserId, authToken);

      const Notifications = getExpoNotifications();
      // Listen for genuine token rotation by OS
      if (!this.tokenSubscription && Notifications && typeof Notifications.addPushTokenListener === 'function') {
        try {
          this.tokenSubscription = Notifications.addPushTokenListener((newTokenEvent: any) => {
            const newToken = typeof newTokenEvent === 'string' ? newTokenEvent : newTokenEvent?.data;
            if (!newToken || newToken === this.lastRegisteredToken) {
              return;
            }
            console.log('[CustomerNotifications] FCM push token updated by OS');
            this.registerDeviceToken(currentUserId, authToken);
          });
        } catch (subErr) {
          console.warn('[CustomerNotifications] Could not attach token refresh listener:', subErr);
        }
      }

      this.isInitialized = true;
      console.log('[CustomerNotifications] Notification subsystem initialized successfully');
      return registered;
    } catch (err) {
      console.error('[CustomerNotifications] Error during notification initialization:', err);
      return false;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Cleanup all listeners on unmount.
   */
  cleanup(): void {
    if (this.tokenSubscription && typeof this.tokenSubscription.remove === 'function') {
      this.tokenSubscription.remove();
      this.tokenSubscription = null;
    }
    if (this.receivedSubscription && typeof this.receivedSubscription.remove === 'function') {
      this.receivedSubscription.remove();
      this.receivedSubscription = null;
    }
    if (this.responseSubscription && typeof this.responseSubscription.remove === 'function') {
      this.responseSubscription.remove();
      this.responseSubscription = null;
    }
    this.isInitialized = false;
  }
}

export const customerNotificationService = new CustomerNotificationService();
