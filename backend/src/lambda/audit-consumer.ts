/**
 * AWS Lambda Function: Rental Audit Event Consumer
 * Triggered by: Amazon SQS Queue (borrowbuy-events)
 * Purpose: Consumes asynchronous booking & rental events and persists to DynamoDB
 */

import { dynamoDbService } from '../integrations/dynamodb/dynamodb.service.js';

export async function handler(event: any) {
  const records = event.Records || [];
  console.log(`[Lambda:AuditConsumer] Processing ${records.length} SQS event records...`);

  let processedCount = 0;
  for (const record of records) {
    try {
      const parsed = JSON.parse(record.body);
      await dynamoDbService.recordAuditEvent({
        bookingId: parsed.bookingId || 'UNKNOWN',
        eventType: parsed.eventType || 'SYSTEM_EVENT',
        actorId: parsed.customerId || parsed.ownerId || 'SYSTEM',
        actorRole: parsed.actorRole || 'CUSTOMER',
        metadata: {
          productTitle: parsed.productTitle,
          totalAmount: parsed.totalAmount,
          sqsMessageId: record.messageId,
        },
        timestamp: parsed.timestamp || new Date().toISOString(),
      });
      processedCount++;
    } catch (err: any) {
      console.error(`[Lambda:AuditConsumer] Failed to process record ${record.messageId}:`, err.message);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      processedCount,
    }),
  };
}
