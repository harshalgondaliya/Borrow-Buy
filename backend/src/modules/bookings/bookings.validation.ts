import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

export const createBookingSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  startDate: z.string().datetime({ message: 'Start date must be a valid ISO 8601 string' }),
  endDate: z.string().datetime({ message: 'End date must be a valid ISO 8601 string' }),
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  },
  {
    message: 'Rental end date cannot be earlier than start date',
    path: ['endDate'],
  }
);

export const checkAvailabilitySchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  },
  {
    message: 'End date cannot be earlier than start date',
    path: ['endDate'],
  }
);

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    BookingStatus.PENDING,
    BookingStatus.RESERVED,
    BookingStatus.CONFIRMED,
    BookingStatus.READY_FOR_PICKUP,
    BookingStatus.ACTIVE,
    BookingStatus.RETURN_REQUESTED,
    BookingStatus.RETURNED,
    BookingStatus.COMPLETED,
    BookingStatus.CANCELLED,
    BookingStatus.EXPIRED,
    BookingStatus.DISPUTED,
  ]),
  cancellationReason: z.string().optional(),
});

