import { apiRequest } from './api';

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsService = {
  async getNotifications(): Promise<{ success: boolean; notifications: InAppNotification[]; unreadCount: number }> {
    return apiRequest('/notifications');
  },

  async markAsRead(id: string): Promise<{ success: boolean }> {
    return apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    return apiRequest('/notifications/mark-all-read', { method: 'PATCH' });
  },
};
