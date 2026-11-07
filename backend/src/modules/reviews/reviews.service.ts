import { prisma } from '../../shared/prisma.js';
import { notificationService } from '../../integrations/notifications/index.js';
import { BookingStatus, ReviewType } from '@prisma/client';

export class ReviewsService {
  static async createReview(
    reviewerId: string,
    data: {
      bookingId: string;
      rating: number;
      comment: string;
    }
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { product: true },
    });

    if (!booking) {
      throw new Error('Booking not found.');
    }

    if (booking.status !== BookingStatus.COMPLETED && booking.status !== BookingStatus.RETURNED) {
      throw new Error(
        `Reviews can only be submitted for completed rentals. Current status: '${booking.status}'.`
      );
    }

    let revieweeId: string;
    let reviewType: ReviewType;

    if (booking.customerId === reviewerId) {
      revieweeId = booking.product.ownerId;
      reviewType = ReviewType.CUSTOMER_TO_OWNER;
    } else if (booking.product.ownerId === reviewerId) {
      revieweeId = booking.customerId;
      reviewType = ReviewType.OWNER_TO_CUSTOMER;
    } else {
      throw new Error('Forbidden: You are not a participant in this rental booking.');
    }

    // Check if reviewer already reviewed this booking
    const existing = await prisma.review.findUnique({
      where: {
        bookingId_reviewerId: {
          bookingId: data.bookingId,
          reviewerId,
        },
      },
    });

    if (existing) {
      throw new Error('You have already submitted a review for this completed rental.');
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create review record
      const review = await tx.review.create({
        data: {
          bookingId: data.bookingId,
          reviewerId,
          revieweeId,
          rating: data.rating,
          comment: data.comment,
          type: reviewType,
        },
        include: {
          reviewer: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      });

      // 2. Recalculate reviewee trust score based on transparent average
      const allReviewsReceived = await tx.review.findMany({
        where: { revieweeId },
        select: { rating: true },
      });

      const avgRating =
        allReviewsReceived.reduce((sum, r) => sum + r.rating, 0) / allReviewsReceived.length;

      const roundedScore = parseFloat(avgRating.toFixed(1));

      await tx.user.update({
        where: { id: revieweeId },
        data: { trustScore: roundedScore },
      });

      return {
        review,
        updatedTrustScore: roundedScore,
      };
    });

    // Dispatch in-app notification to the reviewee
    await notificationService.sendNotification({
      userId: revieweeId,
      title: 'New Review Received',
      message: `You received a ${data.rating}-star review for booking #${booking.bookingNumber}. Trust score updated to ${result.updatedTrustScore}!`,
      type: 'REVIEW_RECEIVED',
      referenceId: booking.id,
    }).catch((err) => console.error('Failed to dispatch review notification:', err));

    return result;
  }

  static async getUserReviews(userId: string) {
    return prisma.review.findMany({
      where: { revieweeId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        booking: {
          select: {
            bookingNumber: true,
            product: { select: { name: true } },
          },
        },
      },
    });
  }
}

