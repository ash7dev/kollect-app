import * as SecureStore from 'expo-secure-store';

export interface NotificationDto {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any> | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  read: boolean;
  createdAt?: string;
}

export interface UserNotificationsResponse {
  notifications: NotificationDto[];
  unreadCount: number;
}

const API_URL = 'https://maurice-unfelicitous-semisuccessfully.ngrok-free.dev/api';
const NOTIFICATIONS_BASE = `${API_URL}/notifications`;

async function getToken(): Promise<string> {
  const token =
    (await SecureStore.getItemAsync('jwt_token')) ||
    (await SecureStore.getItemAsync('JWT_TOKEN')) ||
    (await SecureStore.getItemAsync('ACCESS_TOKEN')) ||
    null;

  if (!token) {
    throw new Error('No authentication token');
  }

  return token;
}

class NotificationsService {
  async getMyNotifications(): Promise<UserNotificationsResponse> {
    const token = await getToken();
    const response = await fetch(`${NOTIFICATIONS_BASE}/my-notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as any));
      throw new Error(errorData.message || 'Impossible de charger les notifications');
    }

    return response.json();
  }

  async markAsRead(notificationId: string): Promise<void> {
    const token = await getToken();
    const response = await fetch(`${NOTIFICATIONS_BASE}/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as any));
      throw new Error(errorData.message || 'Erreur lors de la mise à jour de la notification');
    }
  }
}

export const notificationsService = new NotificationsService();
