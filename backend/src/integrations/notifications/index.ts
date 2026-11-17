import { env } from '../../config/env.js';
import { INotificationService } from './notification.interface.js';
import { LocalNotificationService } from './local-notification.service.js';
import { SnsNotificationService } from './sns-notification.service.js';

class NotificationFactory {
  private static instance: INotificationService;

  public static getNotificationService(): INotificationService {
    if (!this.instance) {
      if (env.NOTIFICATION_DRIVER === 'sns') {
        console.log('[NotificationFactory] Initializing AWS SNS Notification Provider...');
        this.instance = new SnsNotificationService();
      } else {
        console.log('[NotificationFactory] Initializing Local Database Notification Provider');
        this.instance = new LocalNotificationService();
      }
    }
    return this.instance;
  }
}

export const notificationService = NotificationFactory.getNotificationService();
export { INotificationService, NotificationPayload } from './notification.interface.js';
export { SnsNotificationService } from './sns-notification.service.js';
export { LocalNotificationService } from './local-notification.service.js';
