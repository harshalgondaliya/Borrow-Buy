import { prisma } from '../../shared/prisma.js';
import { paymentGateway } from '../../integrations/payments/mock-payment.gateway.js';
import { notificationService } from '../../integrations/notifications/index.js';
import { BookingStatus, PaymentStatus, DepositStatus } from '@prisma/client';

export class PaymentsService {
  static async payBooking(
    userId: string,
    bookingId: string,
    simulateFailure: boolean = false
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { product: true },
    });

    if (!booking) {
      throw new Error('Booking not found.');
    }

    if (booking.customerId !== userId) {
      throw new Error('Forbidden: You can only pay for your own bookings.');
    }

    if (booking.status !== BookingStatus.RESERVED) {
      throw new Error(
        `Cannot pay for booking in status '${booking.status}'. Only 'RESERVED' bookings can be paid.`
      );
    }

    // Call payment gateway abstraction
    const paymentResult = await paymentGateway.processPayment({
      bookingId: booking.id,
      userId,
      amount: booking.totalAmount,
      rentalAmount: booking.rentalTotal,
      depositAmount: booking.securityDeposit,
      simulateFailure,
    });

    const result = await prisma.$transaction(async (tx) => {
      // Create Payment audit record
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          userId,
          transactionId: paymentResult.transactionId,
          amount: booking.totalAmount,
          rentalAmount: booking.rentalTotal,
          depositAmount: booking.securityDeposit,
          status: paymentResult.success ? PaymentStatus.SUCCESSFUL : PaymentStatus.FAILED,
          paymentMethod: paymentResult.paymentMethod,
          failureReason: paymentResult.failureReason,
        },
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.failureReason || 'Simulated payment failed.');
      }

      // Transition booking from RESERVED to CONFIRMED
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CONFIRMED,
          holdExpiresAt: null, // Clear temporary hold
        },
      });

      // Create Security Deposit record with status HELD
      const deposit = await tx.securityDeposit.create({
        data: {
          bookingId: booking.id,
          originalAmount: booking.securityDeposit,
          deductionAmount: 0,
          refundedAmount: 0,
          status: DepositStatus.HELD,
        },
      });

      return {
        booking: updatedBooking,
        payment,
        deposit,
      };
    });

    // Dispatch in-app notifications
    await Promise.allSettled([
      notificationService.sendNotification({
        userId,
        title: 'Booking Confirmed!',
        message: `Your booking for '${booking.product.name}' is confirmed. Security deposit of $${booking.securityDeposit} is held securely.`,
        type: 'BOOKING_CONFIRMED',
        referenceId: booking.id,
      }),
      notificationService.sendNotification({
        userId: booking.product.ownerId,
        title: 'New Confirmed Booking',
        message: `Equipment '${booking.product.name}' was confirmed and paid. Ready for pickup scheduling.`,
        type: 'BOOKING_RECEIVED',
        referenceId: booking.id,
      }),
    ]);

    return result;
  }

  static async getPaymentHistory(userId: string) {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            bookingNumber: true,
            product: {
              select: { name: true, images: true },
            },
          },
        },
      },
    });
  }
}

