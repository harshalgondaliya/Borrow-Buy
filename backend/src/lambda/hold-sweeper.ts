/**
 * AWS Lambda Function: Expired Hold Sweeper
 * Triggered by: Amazon EventBridge Scheduled Rule (cron: rate(15 minutes))
 * Purpose: Finds temporary reservation holds past their 15-minute window and expires them safely
 */

import { prisma } from '../shared/prisma.js';
import { dynamoDbService } from '../integrations/dynamodb/dynamodb.service.js';

export async function handler(event?: any) {
  console.log('[Lambda:HoldSweeper] 🕒 Running EventBridge scheduled sweep...');

  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    // Find any bookings in PENDING status created > 15 mins ago
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: fifteenMinutesAgo },
      },
      include: {
        product: { select: { id: true, name: true } },
      },
    });

    console.log(`[Lambda:HoldSweeper] Found ${expiredBookings.length} expired reservation holds.`);

    let reclaimedCount = 0;
    for (const booking of expiredBookings) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'EXPIRED' },
      });

      // Record to DynamoDB audit trail
      await dynamoDbService.recordAuditEvent({
        bookingId: booking.id,
        eventType: 'BOOKING_HOLD_EXPIRED',
        actorId: 'AWS_EVENTBRIDGE_SCHEDULER',
        actorRole: 'SYSTEM_AUTOMATION',
        metadata: {
          productName: booking.product.name,
          reclaimedAt: new Date().toISOString(),
        },
      });

      reclaimedCount++;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        reclaimedCount,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (err: any) {
    console.error('[Lambda:HoldSweeper] Sweep error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
}
