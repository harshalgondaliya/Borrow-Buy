import QRCode from 'qrcode';
import { prisma } from '../../shared/prisma.js';
import { notificationService } from '../../integrations/notifications/index.js';
import { BookingStatus, UserRole, DepositStatus } from '@prisma/client';

export class QRService {
  /**
   * Generates base64 QR code image Data URLs for pickup and return
   */
  static async getBookingQRCodes(userId: string, bookingId: string, role: UserRole) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { product: true },
    });

    if (!booking) {
      throw new Error('Booking not found.');
    }

    if (
      role !== UserRole.ADMIN &&
      booking.customerId !== userId &&
      booking.product.ownerId !== userId
    ) {
      throw new Error('Forbidden: Unauthorized to access booking QR codes.');
    }

    const pickupPayload = JSON.stringify({
      action: 'BORROWBUY_PICKUP',
      code: booking.pickupCode,
      bookingNumber: booking.bookingNumber,
    });

    const returnPayload = JSON.stringify({
      action: 'BORROWBUY_RETURN',
      code: booking.returnCode,
      bookingNumber: booking.bookingNumber,
    });

    const [pickupQrDataUrl, returnQrDataUrl] = await Promise.all([
      booking.pickupCode ? QRCode.toDataURL(pickupPayload, { width: 300, margin: 2 }) : null,
      booking.returnCode ? QRCode.toDataURL(returnPayload, { width: 300, margin: 2 }) : null,
    ]);

    return {
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      pickupCode: booking.pickupCode,
      returnCode: booking.returnCode,
      pickupQrDataUrl,
      returnQrDataUrl,
      isPickedUp: !!booking.pickupAt,
      isReturned: !!booking.returnedAt,
    };
  }

  /**
   * Owner scans customer's single-use Pickup QR code
   * Transitions status from CONFIRMED -> ACTIVE
   */
  static async verifyPickup(scannerId: string, code: string, scannerRole: UserRole) {
    const booking = await prisma.booking.findFirst({
      where: { pickupCode: code },
      include: { product: true, customer: true },
    });

    if (!booking) {
      throw new Error('Invalid or unrecognised pickup verification token.');
    }

    if (scannerRole !== UserRole.ADMIN && booking.product.ownerId !== scannerId) {
      throw new Error('Forbidden: Only the equipment owner or administrator can verify this pickup.');
    }

    if (booking.pickupAt) {
      throw new Error('Security Alert: This pickup token has already been redeemed! Single-use tokens cannot be reused.');
    }

    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.READY_FOR_PICKUP) {
      throw new Error(`Cannot complete pickup for booking in status '${booking.status}'. Must be 'CONFIRMED'.`);
    }

    const pickupTime = new Date();

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        pickupAt: pickupTime,
        status: BookingStatus.ACTIVE,
      },
      include: {
        product: { select: { name: true } },
        customer: { select: { fullName: true, email: true } },
      },
    });

    // Notify customer that pickup is verified
    await notificationService.sendNotification({
      userId: booking.customerId,
      title: 'Equipment Picked Up',
      message: `Pickup confirmed for '${booking.product.name}'. Rental period is now ACTIVE. Enjoy your gear!`,
      type: 'PICKUP_VERIFIED',
      referenceId: booking.id,
    }).catch((err) => console.error('Failed to dispatch pickup notification:', err));

    return {
      message: 'Pickup verified successfully! Rental is now ACTIVE.',
      booking: updated,
    };
  }

  /**
   * Owner scans customer's single-use Return QR code
   * Transitions status from ACTIVE -> RETURNED and calculates any applicable late fees
   */
  static async verifyReturn(scannerId: string, code: string, scannerRole: UserRole) {
    const booking = await prisma.booking.findFirst({
      where: { returnCode: code },
      include: { product: true, customer: true, depositRecord: true },
    });

    if (!booking) {
      throw new Error('Invalid or unrecognised return verification token.');
    }

    if (scannerRole !== UserRole.ADMIN && booking.product.ownerId !== scannerId) {
      throw new Error('Forbidden: Only the equipment owner or administrator can verify this return.');
    }

    if (booking.returnedAt) {
      throw new Error('Security Alert: This return token has already been redeemed! Single-use tokens cannot be reused.');
    }

    if (booking.status !== BookingStatus.ACTIVE && booking.status !== BookingStatus.RETURN_REQUESTED) {
      throw new Error(`Cannot process return for booking in status '${booking.status}'. Rental must be 'ACTIVE'.`);
    }

    const returnTime = new Date();
    const expectedReturn = new Date(booking.expectedReturnDate);

    // Module 9: Late Return Management & Automatic Late Fee Calculation
    let lateFeeCalculated = 0;
    let isOverdue = false;

    if (returnTime.getTime() > expectedReturn.getTime()) {
      const diffMs = returnTime.getTime() - expectedReturn.getTime();
      const overdueHours = diffMs / (1000 * 60 * 60);

      // Grace period of 2 hours, beyond which each 24h block counts as 1 overdue day
      if (overdueHours > 2) {
        const overdueDays = Math.ceil((overdueHours - 2) / 24);
        lateFeeCalculated = overdueDays * booking.lateFeePerDay;
        isOverdue = true;
      }
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        returnedAt: returnTime,
        actualReturnDate: returnTime,
        lateFeeCalculated,
        status: BookingStatus.RETURNED,
      },
      include: {
        product: { select: { name: true } },
        customer: { select: { fullName: true } },
      },
    });

    // Automatically settle and refund security deposit escrow upon verified return
    if (booking.depositRecord) {
      const origAmt = Number(booking.depositRecord.originalAmount);
      const refundAmt = Math.max(0, origAmt - lateFeeCalculated);
      await prisma.securityDeposit.update({
        where: { id: booking.depositRecord.id },
        data: {
          deductionAmount: lateFeeCalculated,
          refundedAmount: refundAmt,
          status: lateFeeCalculated > 0 ? DepositStatus.DEDUCTED : DepositStatus.FULLY_REFUNDED,
          releasedAt: new Date(),
        },
      });
    }

    // Notify customer that return is verified
    await notificationService.sendNotification({
      userId: booking.customerId,
      title: 'Equipment Return Verified',
      message: `Return confirmed for '${booking.product.name}'. The owner will complete the return inspection.`,
      type: 'RETURN_VERIFIED',
      referenceId: booking.id,
    }).catch((err) => console.error('Failed to dispatch return notification:', err));

    return {
      message: isOverdue
        ? `Equipment return verified. Item was overdue! Late fee calculated: $${lateFeeCalculated.toFixed(2)}.`
        : 'Equipment return verified successfully right on schedule!',
      isOverdue,
      lateFeeCalculated,
      booking: updated,
    };
  }
}

