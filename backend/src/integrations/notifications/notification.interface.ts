export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: string;
  referenceId?: string;
}

export interface INotificationService {
  sendNotification(payload: NotificationPayload): Promise<void>;
  sendBulk(payloads: NotificationPayload[]): Promise<void>;
}
