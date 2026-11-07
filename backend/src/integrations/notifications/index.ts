import { env } from '../../config/env.js';
import { INotificationService } from './notification.interface.js';
import { LocalNotificationService } from './local-notification.service.js';

class NotificationFactory {
  private static instance: INotificationService;

  public static getNotificationService(): INotificationService {
    if (!this.instance) {
      if (env.NOTIFICATION_DRIVER === 'sns') {
        // Will initialize AWS SNS provider in Stage B
        console.log('[NotificationFactory] Initializing SNS Notification Provider...');
        this.instance = new LocalNotificationService();
      } else {
        console.log('[NotificationFactory] Initializing Local Database Notification Provider');
        this.instance = new LocalNotificationService();
      }
    }
    return this.instance;
  }
}

export const notificationService = NotificationFactory.getNotificationService();
