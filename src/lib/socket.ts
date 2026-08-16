import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { Platform } from 'react-native';

const DEFAULT_PRODUCTION_URL = 'https://mubryx-backend.onrender.com';

const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    const raw = process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
    try {
      const url = new URL(raw);
      return url.origin;
    } catch {
      return raw.replace(/\/api\/v1$/, '').replace(/\/api$/, '');
    }
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
};

const SOCKET_URL = getBaseUrl();

class SocketManager {
  private socket: Socket | null = null;
  private joinedBookingRooms = new Set<string>();

  connect(): Socket | null {
    const token = useAuthStore.getState().tokens?.accessToken;

    if (this.socket) {
      if (token && (this.socket.auth as any)?.token !== token) {
        this.socket.auth = { token };
      }
      if (!this.socket.connected) {
        this.socket.connect();
      }
      return this.socket;
    }

    if (!token) return null;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Customer Connected:', this.socket?.id);
      // Re-join any active booking rooms upon reconnection
      this.joinedBookingRooms.forEach((bookingId) => {
        this.socket?.emit('booking:join', { bookingId });
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Customer Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.log('[Socket] Customer Connection Error:', error.message);
    });

    return this.socket;
  }

  joinBooking(bookingId: string) {
    if (!bookingId) return;
    this.joinedBookingRooms.add(bookingId);
    const socket = this.connect();
    if (socket && socket.connected) {
      socket.emit('booking:join', { bookingId });
      console.log('[Socket] Emitted booking:join for', bookingId);
    }
  }

  leaveBooking(bookingId: string) {
    if (!bookingId) return;
    this.joinedBookingRooms.delete(bookingId);
    if (this.socket && this.socket.connected) {
      this.socket.emit('booking:leave', { bookingId });
      console.log('[Socket] Emitted booking:leave for', bookingId);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.joinedBookingRooms.clear();
    }
  }
}

export const socketManager = new SocketManager();
