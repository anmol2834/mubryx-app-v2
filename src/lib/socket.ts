import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { Platform } from 'react-native';

const getBaseUrl = () => {
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

  connect() {
    if (this.socket) {
      if (!this.socket.connected) {
        this.socket.connect();
      }
      return this.socket;
    }

    const token = useAuthStore.getState().tokens?.accessToken;
    if (!token) return null;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Customer Connected');
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket] Customer Disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.log('[Socket] Customer Connection Error:', error.message);
    });

    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketManager = new SocketManager();
