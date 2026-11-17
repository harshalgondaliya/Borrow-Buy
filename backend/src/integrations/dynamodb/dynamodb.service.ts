import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { env } from '../../config/env.js';

export interface RentalAuditEvent {
  bookingId: string;
  eventType: string;
  actorId: string;
  actorRole: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  timestamp?: string;
}

export class DynamoDbService {
  private docClient: DynamoDBDocumentClient | null = null;
  private tableName: string;
  private inMemoryFallback: Array<RentalAuditEvent & { eventId: string; timestamp: string }> = [];

  constructor() {
    this.tableName = process.env.DYNAMODB_TABLE_NAME || 'BorrowBuy-RentalAuditLogs';

    try {
      const client = new DynamoDBClient({
        region: env.AWS_REGION || 'ap-south-1',
      });
      this.docClient = DynamoDBDocumentClient.from(client, {
        marshallOptions: { removeUndefinedValues: true },
      });
      console.log(`[DynamoDbService] Initialized DynamoDB client for table: ${this.tableName}`);
    } catch (err: any) {
      console.warn(`[DynamoDbService] Initializing with in-memory fallback (${err.message})`);
      this.docClient = null;
    }
  }

  public async recordAuditEvent(event: RentalAuditEvent): Promise<{ success: boolean; eventId: string }> {
    const timestamp = event.timestamp || new Date().toISOString();
    const eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const item = {
      PK: `RENTAL#${event.bookingId}`,
      SK: `EVENT#${timestamp}#${eventId}`,
      bookingId: event.bookingId,
      eventId,
      eventType: event.eventType,
      actorId: event.actorId,
      actorRole: event.actorRole,
      metadata: event.metadata || {},
      ipAddress: event.ipAddress || '127.0.0.1',
      timestamp,
      ttl: Math.floor(Date.now() / 1000) + 90 * 86400, // 90-day retention
    };

    if (this.docClient && process.env.NODE_ENV === 'production') {
      try {
        await this.docClient.send(
          new PutCommand({
            TableName: this.tableName,
            Item: item,
          })
        );
        return { success: true, eventId };
      } catch (err: any) {
        console.error(`[DynamoDbService] Failed to write item to DynamoDB: ${err.message}. Recording to fallback.`);
      }
    }

    // Local / Offline fallback
    this.inMemoryFallback.unshift({ ...event, eventId, timestamp });
    if (this.inMemoryFallback.length > 500) this.inMemoryFallback.pop();
    return { success: true, eventId };
  }

  public async getAuditLogsForBooking(bookingId: string): Promise<any[]> {
    if (this.docClient && process.env.NODE_ENV === 'production') {
      try {
        const response = await this.docClient.send(
          new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
              ':pk': `RENTAL#${bookingId}`,
            },
            ScanIndexForward: false, // Descending order
          })
        );
        return response.Items || [];
      } catch (err: any) {
        console.error(`[DynamoDbService] Query failed: ${err.message}`);
      }
    }

    return this.inMemoryFallback.filter((e) => e.bookingId === bookingId);
  }

  public async listRecentAuditLogs(limit = 20): Promise<any[]> {
    if (this.docClient && process.env.NODE_ENV === 'production') {
      try {
        const response = await this.docClient.send(
          new ScanCommand({
            TableName: this.tableName,
            Limit: limit,
          })
        );
        return response.Items || [];
      } catch (err: any) {
        console.error(`[DynamoDbService] Scan failed: ${err.message}`);
      }
    }

    return this.inMemoryFallback.slice(0, limit);
  }
}

export const dynamoDbService = new DynamoDbService();
