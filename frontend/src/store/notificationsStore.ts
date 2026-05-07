import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';
import { io, Socket } from 'socket.io-client';

const API_URL = 'http://localhost:3001/api/notifications';
const SOCKET_URL = 'http://localhost:3001/notifications';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'GRADE' | 'ABSENCE' | 'ALERT' | 'SYSTEM' | 'MESSAGE' | 'INCIDENT';
  isRead: boolean;
  createdAt: string;
  targetScope?: string;
  targetIds?: string[];
}

interface NotificationsState {
  notifications: Notification[];
  history: any[];
  unreadCount: number;
  isLoading: boolean;
  socket: Socket | null;
  
  fetchMyNotifications: () => Promise<void>;
  fetchAdminHistory: () => Promise<void>;
  sendNotification: (data: any) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  initSocket: (userId: string) => void;
  disconnectSocket: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  history: [],
  unreadCount: 0,
  isLoading: false,
  socket: null,

  fetchMyNotifications: async () => {
    set({ isLoading: true });
    try {
      const { accessToken } = useAuthStore.getState();
      const res = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = res.data.data || res.data;
      set({ 
        notifications: data, 
        unreadCount: data.filter((n: Notification) => !n.isRead).length,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  fetchAdminHistory: async () => {
    set({ isLoading: true });
    try {
      const { accessToken } = useAuthStore.getState();
      const res = await axios.get(`${API_URL}/admin/history`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      set({ history: res.data.data || res.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  sendNotification: async (data) => {
    const { accessToken } = useAuthStore.getState();
    await axios.post(`${API_URL}/admin/send`, data, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    get().fetchAdminHistory();
  },

  markAsRead: async (id) => {
    const { accessToken } = useAuthStore.getState();
    await axios.patch(`${API_URL}/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));
  },

  initSocket: (userId: string) => {
    if (get().socket) return;

    const socket = io(SOCKET_URL, {
      query: { userId }
    });

    socket.on('new_notification', (notification: Notification) => {
      set(state => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      }));
      
      // Browser notification or Toast could be triggered here
      if (Notification.permission === 'granted') {
        new Notification(notification.title, { body: notification.body });
      }
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  }
}));
