import { notificationRepository } from '@/repositories/NotificationRepository';
import type { AdminNotification } from '@/types/database';

export class NotificationService {
  async fetchNotifications(userId?: string): Promise<AdminNotification[]> {
    try {
      return await notificationRepository.getNotifications(userId);
    } catch {
      return [];
    }
  }

  async markRead(id: string): Promise<void> {
    await notificationRepository.markAsRead(id);
  }

  async markAllRead(): Promise<void> {
    await notificationRepository.markAllAsRead();
  }

  async notify(type: string, title: string, message: string, link?: string, userId?: string): Promise<void> {
    try {
      await notificationRepository.create(type, title, message, link, userId);
    } catch (err) {
      console.warn('Failed to send notification:', err);
    }
  }
}

export const notificationService = new NotificationService();

