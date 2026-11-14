import { prisma } from '../../shared/prisma.js';
import { notificationService } from '../notifications/index.js';
import { BookingStatus } from '@prisma/client';

export class BackgroundJobRunner {
  private static timer: NodeJS.Timeout | null = null;

  /**
   * Reclaims equipment blocked by expired 15-minute temporary reservation holds.
   */
  static async sweepExpiredHolds(): Promise<number> {
    const now = new Date();

    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.RESERVED,
        holdExpiresAt: { lte: now },
      },
      include: {
        product: { select: { name: true } },
      },
    });

    if (expiredBookings.length === 0) {
      return 0;
    }

    // Mark as EXPIRED
    await prisma.booking.updateMany({
      where: {
        id: { in: expiredBookings.map((b) => b.id) },
      },
      data: {
        status: BookingStatus.EXPIRED,
      },
    });

    // Notify customers
    for (const booking of expiredBookings) {
      await notificationService.sendNotification({
        userId: booking.customerId,
        title: 'Reservation Hold Expired',
        message: `Your 15-minute reservation hold for '${booking.product.name}' has expired. Equipment dates have been released.`,
        type: 'HOLD_EXPIRED',
        referenceId: booking.id,
      });
    }

    console.log(`[BackgroundJobRunner] 🧹 Swept and reclaimed ${expiredBookings.length} expired reservation holds.`);
    return expiredBookings.length;
  }

  /**
   * Scans active rentals that have passed their expected return date.
   */
  static async checkOverdueRentals(): Promise<number> {
    const now = new Date();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const overdueBookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.ACTIVE,
        expectedReturnDate: { lt: now },
      },
      include: {
        product: { select: { name: true, ownerId: true } },
        customer: { select: { fullName: true } },
      },
    });

    for (const b of overdueBookings) {
      // Debounce: Alert Customer at most once every 24 hours
      const recentCustomerAlert = await prisma.notification.findFirst({
        where: {
          userId: b.customerId,
          referenceId: b.id,
          type: 'OVERDUE_ALERT',
          createdAt: { gte: oneDayAgo },
        },
      });

      if (!recentCustomerAlert) {
        await notificationService.sendNotification({
          userId: b.customerId,
          title: '⚠️ Rental Return Overdue',
          message: `Your rental period for '${b.product.name}' ended on ${b.expectedReturnDate.toLocaleDateString()}. Please return equipment immediately to avoid late fees.`,
          type: 'OVERDUE_ALERT',
          referenceId: b.id,
        });
      }

      // Debounce: Alert Owner at most once every 24 hours
      const recentOwnerAlert = await prisma.notification.findFirst({
        where: {
          userId: b.product.ownerId,
          referenceId: b.id,
          type: 'OWNER_OVERDUE_ALERT',
          createdAt: { gte: oneDayAgo },
        },
      });

      if (!recentOwnerAlert) {
        await notificationService.sendNotification({
          userId: b.product.ownerId,
          title: 'Overdue Rental Alert',
          message: `'${b.product.name}' rented by ${b.customer.fullName} is past its return date.`,
          type: 'OWNER_OVERDUE_ALERT',
          referenceId: b.id,
        });
      }
    }

    return overdueBookings.length;
  }

  /**
   * Starts periodic background task scheduler
   */
  static start(intervalMs: number = 60000): void {
    if (this.timer) return;

    console.log(`[BackgroundJobRunner] ⏱️ Background worker scheduled every ${intervalMs / 1000}s.`);
    this.timer = setInterval(async () => {
      try {
        await this.sweepExpiredHolds();
        await this.checkOverdueRentals();
      } catch (err) {
        console.error('[BackgroundJobRunner] Error during background execution:', err);
      }
    }, intervalMs);
  }

  static stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[BackgroundJobRunner] Background worker stopped.');
    }
  }
}
