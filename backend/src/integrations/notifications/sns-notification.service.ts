import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { prisma } from '../../shared/prisma.js';
import { env } from '../../config/env.js';
import { INotificationService, NotificationPayload } from './notification.interface.js';

export class SnsNotificationService implements INotificationService {
  private snsClient: SNSClient;
  private topicArn: string;

  constructor() {
    this.topicArn = env.AWS_SNS_TOPIC_ARN || 'arn:aws:sns:ap-south-1:123456789012:borrowbuy-notifications';
    this.snsClient = new SNSClient({
      region: env.AWS_REGION || 'ap-south-1',
    });
    console.log(`[SnsNotificationService] Configured with Topic ARN: ${this.topicArn}, Region: ${env.AWS_REGION}`);
  }

  public async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      // 1. Always record in-app notification in database for user dashboard
      await prisma.notification.create({
        data: {
          userId: payload.userId,
          title: payload.title,
          message: payload.message,
          type: payload.type,
          isRead: false,
        },
      });

      // 2. Publish to AWS SNS Topic
      const command = new PublishCommand({
        TopicArn: this.topicArn,
        Subject: payload.title,
        Message: JSON.stringify({
          userId: payload.userId,
          title: payload.title,
          message: payload.message,
          type: payload.type,
          referenceId: payload.referenceId,
          timestamp: new Date().toISOString(),
        }),
        MessageAttributes: {
          NotificationType: {
            DataType: 'String',
            StringValue: payload.type,
          },
          UserId: {
            DataType: 'String',
            StringValue: payload.userId,
          },
        },
      });

      const response = await this.snsClient.send(command);
      console.log(`[SnsNotificationService] 📢 Dispatched SNS Notification ID: ${response.MessageId} for User ${payload.userId}`);
    } catch (error: any) {
      console.error(`[SnsNotificationService] Error publishing to SNS: ${error.message}`);
      // Fallback: in-app notification was already saved above
    }
  }

  public async sendBulk(payloads: NotificationPayload[]): Promise<void> {
    for (const p of payloads) {
      await this.sendNotification(p);
    }
  }
}
