import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { env } from '../../config/env.js';

export interface BookingEventMessage {
  eventId: string;
  eventType: 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'RETURN_DUE_REMINDER';
  bookingId: string;
  customerId: string;
  ownerId: string;
  productTitle: string;
  totalAmount: number;
  timestamp: string;
}

export class SqsQueueService {
  private sqsClient: SQSClient;
  private queueUrl: string;

  constructor() {
    this.queueUrl = env.AWS_SQS_QUEUE_URL || 'https://sqs.ap-south-1.amazonaws.com/123456789012/borrowbuy-events';
    this.sqsClient = new SQSClient({
      region: env.AWS_REGION || 'ap-south-1',
    });
    console.log(`[SqsQueueService] Configured with Queue URL: ${this.queueUrl}, Region: ${env.AWS_REGION}`);
  }

  public async publishEvent(event: BookingEventMessage): Promise<string | undefined> {
    try {
      const command = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(event),
        MessageAttributes: {
          EventType: {
            DataType: 'String',
            StringValue: event.eventType,
          },
          BookingId: {
            DataType: 'String',
            StringValue: event.bookingId,
          },
        },
      });

      const response = await this.sqsClient.send(command);
      console.log(`[SqsQueueService] 📥 Dispatched SQS Message ID: ${response.MessageId} for Event: ${event.eventType}`);
      return response.MessageId;
    } catch (error: any) {
      console.error(`[SqsQueueService] Error dispatching event to SQS: ${error.message}`);
      return undefined;
    }
  }

  public async processQueueBatch(handler: (event: BookingEventMessage) => Promise<void>): Promise<number> {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 2, // Short poll for scheduled worker
        VisibilityTimeout: 30,
      });

      const response = await this.sqsClient.send(command);
      const messages = response.Messages || [];

      for (const msg of messages) {
        if (!msg.Body || !msg.ReceiptHandle) continue;
        try {
          const parsed = JSON.parse(msg.Body) as BookingEventMessage;
          await handler(parsed);

          // Acknowledge and delete processed message
          await this.sqsClient.send(
            new DeleteMessageCommand({
              QueueUrl: this.queueUrl,
              ReceiptHandle: msg.ReceiptHandle,
            })
          );
        } catch (msgErr: any) {
          console.error(`[SqsQueueService] Error processing message ${msg.MessageId}: ${msgErr.message}`);
        }
      }

      return messages.length;
    } catch (error: any) {
      console.error(`[SqsQueueService] Error receiving messages from SQS: ${error.message}`);
      return 0;
    }
  }
}

export const sqsQueueService = new SqsQueueService();
