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
    if (this.socket?.connected) return this.socket;

    const token = useAuthStore.getState().tokens?.accessToken;
    if (!token) return null;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Customer Connected');
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
