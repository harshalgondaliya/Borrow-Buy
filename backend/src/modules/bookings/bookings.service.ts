import crypto from 'crypto';
import { prisma } from '../../shared/prisma.js';
import { BookingStatus, UserRole } from '@prisma/client';
import { BookingStateMachine } from './bookings.state-machine.js';
import { env } from '../../config/env.js';
import { sqsQueueService } from '../../integrations/queue/sqs-queue.service.js';

export class BookingsService {
  /**
   * Returns all booked/reserved date ranges for a product that block future rentals.
   */
  static async getProductAvailabilityCalendar(productId: string) {
    const now = new Date();

    const activeBookings = await prisma.booking.findMany({
      where: {
        productId,
        OR: [
          {
            status: {
              in: [
                BookingStatus.CONFIRMED,
                BookingStatus.READY_FOR_PICKUP,
                BookingStatus.ACTIVE,
              ],
            },
            endDate: { gte: now },
          },
          {
            status: BookingStatus.RESERVED,
            holdExpiresAt: { gt: now },
            endDate: { gte: now },
          },
        ],
      },
      select: {
        startDate: true,
        endDate: true,
        status: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return activeBookings;
  }

  /**
   * Checks whether the requested dates overlap with any active or unexpired bookings.
   */
  static async checkAvailability(productId: string, startDateStr: string, endDateStr: string) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const now = new Date();

    if (end < start) {
      throw new Error('End date cannot be earlier than start date.');
    }

    // Active bookings overlap check
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        productId,
        startDate: { lt: end },
        endDate: { gt: start },
        OR: [
          {
            status: {
              in: [
                BookingStatus.CONFIRMED,
                BookingStatus.READY_FOR_PICKUP,
                BookingStatus.ACTIVE,
              ],
            },
          },
          {
            status: BookingStatus.RESERVED,
            holdExpiresAt: { gt: now },
          },
        ],
      },
    });

    return {
      available: !conflictingBooking,
      conflictingBookingId: conflictingBooking?.id,
    };
  }

  /**
   * ATOMIC CONCURRENCY-SAFE BOOKING CREATION
   * Uses PostgreSQL pessimistic row-level locking (SELECT ... FOR UPDATE) to ensure
   * simultaneous requests for the same product are serialized and can NEVER double-book.
   */
  static async createBooking(
    customerId: string,
    data: {
      productId: string;
      startDate: string;
      endDate: string;
    }
  ) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const now = new Date();

    // Rental duration calculation in days (inclusive of first and last day, minimum 1 day)
    const diffTime = endDate.getTime() - startDate.getTime();
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    return prisma.$transaction(async (tx) => {
      // 1. Acquire pessimistic lock on the product row
      const lockedProduct = await tx.$queryRaw<Array<{
        id: string;
        pricePerDay: number;
        securityDeposit: number;
        ownerId: string;
        listingStatus: string;
        approvalStatus: string;
        name: string;
      }>>`
        SELECT id, "pricePerDay", "securityDeposit", "ownerId", "listingStatus", "approvalStatus", name
        FROM "Product"
        WHERE id = ${data.productId}
        FOR UPDATE;
      `;

      if (!lockedProduct || lockedProduct.length === 0) {
        throw new Error('Product not found.');
      }

      const product = lockedProduct[0];

      if (product.ownerId === customerId) {
        throw new Error('Product owners cannot book their own equipment.');
      }

      if (product.listingStatus !== 'ACTIVE' || product.approvalStatus !== 'APPROVED') {
        throw new Error('This product is currently not available for rental.');
      }

      // 2. Strict overlap check inside the locked transaction
      const conflictingBooking = await tx.booking.findFirst({
        where: {
          productId: data.productId,
          startDate: { lt: endDate },
          endDate: { gt: startDate },
          OR: [
            {
              status: {
                in: [
                  BookingStatus.CONFIRMED,
                  BookingStatus.READY_FOR_PICKUP,
                  BookingStatus.ACTIVE,
                ],
              },
            },
            {
              status: BookingStatus.RESERVED,
              holdExpiresAt: { gt: now },
            },
          ],
        },
      });

      if (conflictingBooking) {
        throw new Error(
          'Selected rental dates are no longer available. Another customer has reserved this equipment.'
        );
      }

      // 3. Financial calculations
      const dailyPrice = Number(product.pricePerDay);
      const securityDeposit = Number(product.securityDeposit);
      const rentalTotal = dailyPrice * totalDays;
      const totalAmount = rentalTotal + securityDeposit;

      // 4. Temporary reservation hold (15 minutes to simulate/complete payment)
      const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // 5. Unique booking number & cryptographic single-use QR tokens
      const bookingNumber = `BB-2026-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const pickupCode = `PK-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
      const returnCode = `RT-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

      // 6. Create Booking record
      const booking = await tx.booking.create({
        data: {
          bookingNumber,
          productId: data.productId,
          customerId,
          startDate,
          endDate,
          expectedReturnDate: endDate,
          totalDays,
          dailyPrice,
          rentalTotal,
          securityDeposit,
          totalAmount,
          status: BookingStatus.RESERVED,
          holdExpiresAt,
          pickupCode,
          returnCode,
          lateFeePerDay: dailyPrice * 1.5, // 1.5x daily rate for overdue days
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              location: true,
              owner: {
                select: { id: true, fullName: true, phone: true, avatarUrl: true },
              },
            },
          },
        },
      });

      // Asynchronously publish booking creation event to SQS queue if configured
      if (env.QUEUE_DRIVER === 'sqs' && env.AWS_SQS_QUEUE_URL) {
        sqsQueueService.publishEvent({
          eventId: `EVT-${booking.id}`,
          eventType: 'BOOKING_CREATED',
          bookingId: booking.id,
          customerId: booking.customerId,
          ownerId: product.ownerId,
          productTitle: product.name,
          totalAmount: Number(booking.totalAmount),
          timestamp: new Date().toISOString(),
        }).catch(() => {});
      }

      return booking;
    });
  }

  static async getCustomerBookings(customerId: string) {
    return prisma.booking.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            location: true,
            category: { select: { name: true } },
            owner: {
              select: { id: true, fullName: true, phone: true, trustScore: true, avatarUrl: true },
            },
          },
        },
        payments: true,
        depositRecord: true,
      },
    });
  }

  static async getOwnerBookings(ownerId: string) {
    return prisma.booking.findMany({
      where: {
        product: {
          ownerId,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            location: true,
          },
        },
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            trustScore: true,
            avatarUrl: true,
          },
        },
        payments: true,
        depositRecord: true,
      },
    });
  }

  static async getBookingById(userId: string, bookingId: string, role: UserRole) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        product: {
          include: {
            owner: {
              select: { id: true, fullName: true, phone: true, avatarUrl: true, trustScore: true },
            },
            category: true,
          },
        },
        customer: {
          select: { id: true, fullName: true, email: true, phone: true, trustScore: true, avatarUrl: true },
        },
        payments: true,
        depositRecord: true,
        inspections: true,
        disputes: true,
        reviews: true,
      },
    });

    if (!booking) {
      throw new Error('Booking not found.');
    }

    // Authorization check: User must be customer, product owner, or admin
    if (
      role !== UserRole.ADMIN &&
      booking.customerId !== userId &&
      booking.product.ownerId !== userId
    ) {
      throw new Error('Forbidden: You are not authorized to view this booking.');
    }

    return booking;
  }

  static async cancelBooking(userId: string, bookingId: string, reason?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { product: true },
    });

    if (!booking) {
      throw new Error('Booking not found.');
    }

    if (booking.customerId !== userId && booking.product.ownerId !== userId) {
      throw new Error('Forbidden: You can only cancel your own bookings.');
    }

    // Enforce state machine transition
    BookingStateMachine.assertValidTransition(booking.status, BookingStatus.CANCELLED);

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancellationReason: reason || 'Cancelled by user request.',
      },
    });

    return updated;
  }

  static async confirmBooking(ownerId: string, bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { product: true },
    });

    if (!booking) {
      throw new Error('Booking not found.');
    }

    if (booking.product.ownerId !== ownerId) {
      throw new Error('Forbidden: Only the product owner can confirm this booking.');
    }

    BookingStateMachine.assertValidTransition(booking.status, BookingStatus.CONFIRMED);

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
      },
    });

    return updated;
  }
}

