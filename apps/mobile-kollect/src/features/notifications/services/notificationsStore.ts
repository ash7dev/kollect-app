import { create } from 'zustand';
import { notificationsService, type NotificationDto } from './notifications.service';

interface NotificationsState {
  notifications: NotificationDto[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  fetchMyNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsReadLocal: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchMyNotifications: async () => {
    try {
      set({ loading: true, error: null });
      const { notifications, unreadCount } = await notificationsService.getMyNotifications();
      set({ notifications, unreadCount });
    } catch (error: any) {
      set({ error: error?.message || 'Impossible de charger les notifications' });
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (id: string) => {
    const { notifications, unreadCount } = get();
    // Optimistic update côté client
    set({
      notifications: notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
      unreadCount: Math.max(0, unreadCount - 1),
    });

    try {
      await notificationsService.markAsRead(id);
    } catch (error) {
      // En cas d'erreur, on pourra éventuellement refetch
      console.error('[Notifications] Erreur lors du markAsRead', error);
    }
  },

  markAllAsReadLocal: () => {
    const { notifications } = get();
    set({
      notifications: notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    });
  },
}));
