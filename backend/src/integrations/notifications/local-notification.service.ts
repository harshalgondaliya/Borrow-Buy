import { INotificationService, NotificationPayload } from './notification.interface.js';
import { prisma } from '../../shared/prisma.js';

export class LocalNotificationService implements INotificationService {
  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: payload.userId,
          title: payload.title,
          message: payload.message,
          type: payload.type,
          referenceId: payload.referenceId,
        },
      });

      console.log(
        `[LocalNotificationService] 🔔 In-App Alert Dispatched to User ${payload.userId}:\n` +
        `  Title: ${payload.title}\n` +
        `  Type: ${payload.type}\n` +
        `  Message: ${payload.message}`
      );
    } catch (error) {
      console.error('[LocalNotificationService] Failed to record in-app notification:', error);
    }
  }

  async sendBulk(payloads: NotificationPayload[]): Promise<void> {
    try {
      await prisma.notification.createMany({
        data: payloads.map((p) => ({
          userId: p.userId,
          title: p.title,
          message: p.message,
          type: p.type,
          referenceId: p.referenceId,
        })),
      });

      console.log(`[LocalNotificationService] 🔔 Dispatched ${payloads.length} bulk notifications.`);
    } catch (error) {
      console.error('[LocalNotificationService] Failed to record bulk notifications:', error);
    }
  }
}
