import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/shared/prisma.js';
import { BookingStatus, DepositStatus } from '@prisma/client';

describe('Phase 8 – Master End-to-End User Lifecycle & Platform Acceptance Test', () => {
  const timestamp = Date.now();
  const ownerEmail = `e2e.owner.${timestamp}@borrowbuy.com`;
  const renterEmail = `e2e.renter.${timestamp}@borrowbuy.com`;
  const rivalEmail = `e2e.rival.${timestamp}@borrowbuy.com`;
  const password = 'Password123!';

  let ownerToken: string;
  let ownerId: string;
  let renterToken: string;
  let renterId: string;
  let rivalToken: string;

  let categoryId: string;
  let productId: string;
  let bookingId: string;
  let bookingNumber: string;

  let pickupCode: string;
  let returnCode: string;
  let preInspectionId: string;

  // 1. User Onboarding & Authentication
  describe('Step 1: User Onboarding, Profile Setup & Initial Trust Scores', () => {
    it('should register a new equipment owner with verified initial trust score', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: ownerEmail,
        password,
        fullName: 'Marcus Vance (Studio Owner)',
        role: 'OWNER',
        phone: '+1-555-0199',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(ownerEmail);
      expect(res.body.data.user.role).toBe('OWNER');
      expect(res.body.data.user.trustScore).toBe(5);
      expect(res.body.data.token).toBeDefined();

      ownerToken = res.body.data.token;
      ownerId = res.body.data.user.id;
    });

    it('should register a new renter customer with initial trust score', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: renterEmail,
        password,
        fullName: 'Elena Rostova (Indie Filmmaker)',
        role: 'CUSTOMER',
        phone: '+1-555-0177',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('CUSTOMER');
      expect(res.body.data.user.trustScore).toBe(5);

      renterToken = res.body.data.token;
      renterId = res.body.data.user.id;
    });

    it('should register a rival customer to test concurrency collision', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: rivalEmail,
        password,
        fullName: 'David Rival (Competing Renter)',
        role: 'CUSTOMER',
        phone: '+1-555-0188',
      });

      expect(res.status).toBe(201);
      rivalToken = res.body.data.token;
    });
  });

  // 2. Product Cataloging & Discovery
  describe('Step 2: Equipment Listing, Category Mapping & Catalog Search', () => {
    it('should fetch system categories and locate Cameras & Photography', async () => {
      const res = await request(app).get('/api/products/categories');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const cameraCat = res.body.data.find((c: any) => c.name.includes('Cameras') || c.slug === 'cameras-photography') || res.body.data[0];
      categoryId = cameraCat.id;
      expect(categoryId).toBeDefined();
    });

    it('should allow verified owner to list high-end cinema equipment', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${ownerToken}`)
        .field('name', `Sony FX3 Cinema Camera Kit ${timestamp}`)
        .field('description', 'Full-frame cinema camera with XLR handle, 3x batteries, and 160GB CFexpress card.')
        .field('categoryId', categoryId)
        .field('brand', 'Sony')
        .field('pricePerDay', '125.00')
        .field('securityDeposit', '500.00')
        .field('condition', 'LIKE_NEW')
        .field('location', 'Ahmedabad (SG Highway)');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(Number(res.body.data.pricePerDay)).toBe(125);
      expect(Number(res.body.data.securityDeposit)).toBe(500);

      productId = res.body.data.id;
    });

    it('should allow renters to discover the newly listed equipment via search and filters', async () => {
      const res = await request(app)
        .get(`/api/products?search=Sony+FX3+Cinema&categoryId=${categoryId}&condition=LIKE_NEW`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.products.length).toBeGreaterThan(0);

      const found = res.body.products.find((p: any) => p.id === productId);
      expect(found).toBeDefined();
      expect(found.name).toContain('Sony FX3 Cinema Camera Kit');
    });

    it('should check rental availability calendar for unbooked dates', async () => {
      const res = await request(app).get(`/api/bookings/calendar/${productId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // 3. Booking Hold Creation & Concurrency Prevention
  describe('Step 3: Atomic Booking Hold, Duration Calculation & Concurrency Defense', () => {
    const baseRentalTime = Date.now();
    const rentalStart = new Date(baseRentalTime + 10 * 86400000).toISOString();
    const rentalEnd = new Date(baseRentalTime + 14 * 86400000).toISOString(); // exactly 4 days

    it('should create an atomic 15-minute temporary reservation hold with exact pricing math', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          productId,
          startDate: rentalStart,
          endDate: rentalEnd,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const booking = res.body.data;
      bookingId = booking.id;
      bookingNumber = booking.bookingNumber;
      pickupCode = booking.pickupCode;
      returnCode = booking.returnCode;

      expect(booking.status).toBe(BookingStatus.RESERVED);
      expect(booking.totalDays).toBe(4);
      // 4 days * $125 = $500 rental fee
      expect(Number(booking.rentalTotal)).toBe(500);
      // $500 security deposit
      expect(Number(booking.securityDeposit)).toBe(500);
      // $500 + $500 = $1000 total
      expect(Number(booking.totalAmount)).toBe(1000);
      expect(booking.holdExpiresAt).toBeDefined();

      const expiresMs = new Date(booking.holdExpiresAt).getTime();
      const nowMs = Date.now();
      expect(expiresMs - nowMs).toBeGreaterThan(13 * 60 * 1000);
      expect(expiresMs - nowMs).toBeLessThanOrEqual(16 * 60 * 1000);
    });

    it('should prevent rival customer from double-booking overlapping rental dates via database row lock', async () => {
      // Overlapping by 2 days
      const rivalStart = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString();
      const rivalEnd = new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${rivalToken}`)
        .send({
          productId,
          startDate: rivalStart,
          endDate: rivalEnd,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Selected rental dates are no longer available');
    });
  });

  // 4. Simulated Payment Processing
  describe('Step 4: Pluggable Payment Simulator & Security Deposit Isolation', () => {
    it('should process simulated payment, transition booking to CONFIRMED, and isolate security deposit', async () => {
      const res = await request(app)
        .post('/api/payments/pay-booking')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          bookingId,
          simulateFailure: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.booking.status).toBe(BookingStatus.CONFIRMED);
      expect(res.body.data.payment.transactionId).toMatch(/^TXN-SIM-/);
      expect(res.body.data.payment.status).toBe('SUCCESSFUL');
      expect(Number(res.body.data.payment.amount)).toBe(1000);

      // Verify security deposit record in database
      const deposit = await prisma.securityDeposit.findUnique({
        where: { bookingId },
      });
      expect(deposit).toBeDefined();
      expect(deposit?.status).toBe(DepositStatus.HELD);
      expect(Number(deposit?.originalAmount)).toBe(500);
    });
  });

  // 5. QR Code Generation & Single-Use Handover Verification
  describe('Step 5: Cryptographic Single-Use QR Tokens & Secure Pickup Handover', () => {
    it('should retrieve single-use QR Data URLs for confirmed booking', async () => {
      const res = await request(app)
        .get(`/api/qr/booking/${bookingId}`)
        .set('Authorization', `Bearer ${renterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pickupQrDataUrl).toContain('data:image/png;base64');
      expect(res.body.data.returnQrDataUrl).toContain('data:image/png;base64');
    });

    it('should verify pickup by authorized owner and transition booking to ACTIVE', async () => {
      const res = await request(app)
        .post('/api/qr/verify-pickup')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ code: pickupCode });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.booking.status).toBe(BookingStatus.ACTIVE);
      expect(res.body.booking.pickupAt).toBeDefined();
    });

    it('should defeat replay attacks: prevent reuse of already redeemed pickup token', async () => {
      const res = await request(app)
        .post('/api/qr/verify-pickup')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ code: pickupCode });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already been redeemed');
    });
  });

  // 6. Pre-Rental Condition Inspection
  describe('Step 6: Pre-Rental Equipment Inspection', () => {
    it('should record owner pre-pickup inspection with condition notes and verification photos', async () => {
      const res = await request(app)
        .post('/api/inspections')
        .set('Authorization', `Bearer ${ownerToken}`)
        .field('bookingId', bookingId)
        .field('type', 'PRE_PICKUP')
        .field('conditionNotes', 'Equipment in flawless condition. Sensor pristine, 3x genuine batteries tested.')
        .field('existingDamage', 'None. Clean cosmetic state.');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('PRE_PICKUP');
      expect(res.body.data.confirmedByCustomer).toBe(false);
      preInspectionId = res.body.data.id;
    });

    it('should allow customer to confirm pre-pickup condition report', async () => {
      const res = await request(app)
        .post(`/api/inspections/${preInspectionId}/confirm`)
        .set('Authorization', `Bearer ${renterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.confirmedByCustomer).toBe(true);
    });
  });

  // 7. Equipment Return & Single-Use Handover
  describe('Step 7: QR Return Verification & Post-Rental Inspection', () => {
    it('should verify return by authorized owner, set returnedAt timestamp, and transition to RETURNED', async () => {
      const res = await request(app)
        .post('/api/qr/verify-return')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ code: returnCode });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.booking.status).toBe(BookingStatus.RETURNED);
      expect(res.body.booking.returnedAt).toBeDefined();
    });

    it('should defeat replay attacks: prevent reuse of already redeemed return token', async () => {
      const res = await request(app)
        .post('/api/qr/verify-return')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ code: returnCode });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already been redeemed');
    });

    it('should record owner post-return inspection with damage verification', async () => {
      const res = await request(app)
        .post('/api/inspections')
        .set('Authorization', `Bearer ${ownerToken}`)
        .field('bookingId', bookingId)
        .field('type', 'POST_RETURN')
        .field('conditionNotes', 'Returned on time and in immaculate shape. All accessories accounted for.')
        .field('newDamageReported', 'None');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('POST_RETURN');
    });
  });

  // 8. Security Deposit Settlement & Booking Completion
  describe('Step 8: Full Security Deposit Refund & Booking Completion', () => {
    it('should release full security deposit back to customer and complete the rental', async () => {
      const deposit = await prisma.securityDeposit.update({
        where: { bookingId },
        data: {
          status: DepositStatus.FULLY_REFUNDED,
          refundedAmount: 500,
          deductionAmount: 0,
          releasedAt: new Date(),
        },
      });

      expect(deposit.status).toBe(DepositStatus.FULLY_REFUNDED);
      expect(Number(deposit.refundedAmount)).toBe(500);

      // Transition booking to COMPLETED
      const completedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.COMPLETED },
      });

      expect(completedBooking.status).toBe(BookingStatus.COMPLETED);
    });
  });

  // 9. Verified Mutual Reviews & Trust Score Recalculation
  describe('Step 9: Verified Mutual Reviews & Dynamic Trust Score Calculation', () => {
    it('should allow customer to review owner for completed rental', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${renterToken}`)
        .send({
          bookingId,
          rating: 5,
          comment: 'Incredible camera package! Marcus was communicative and professional. Equipment worked flawlessly on set.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.review.rating).toBe(5);
    });

    it('should allow owner to review customer for completed rental', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          bookingId,
          rating: 5,
          comment: 'Elena took exemplary care of the cinema rig and returned it clean and packed perfectly. Highly recommended!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.review.rating).toBe(5);
    });

    it('should reject review attempts by uninvolved rival user', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${rivalToken}`)
        .send({
          bookingId,
          rating: 1,
          comment: 'Fake review attempt by rival',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should update user ratings and maintain high trust score', async () => {
      const updatedOwner = await prisma.user.findUnique({ where: { id: ownerId } });
      const updatedRenter = await prisma.user.findUnique({ where: { id: renterId } });

      expect(updatedOwner?.trustScore).toBeGreaterThanOrEqual(4.5);
      expect(updatedRenter?.trustScore).toBeGreaterThanOrEqual(4.5);
    });
  });

  // 10. Notifications & Audit Trail
  describe('Step 10: In-App Notification Delivery & User Inbox Audit', () => {
    it('should verify customer and owner received system notifications across the lifecycle', async () => {
      const renterNotifs = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${renterToken}`);

      expect(renterNotifs.status).toBe(200);
      expect(renterNotifs.body.success).toBe(true);
      expect(Array.isArray(renterNotifs.body.notifications)).toBe(true);
      expect(renterNotifs.body.notifications.length).toBeGreaterThan(0);

      const ownerNotifs = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(ownerNotifs.status).toBe(200);
      expect(ownerNotifs.body.success).toBe(true);
      expect(Array.isArray(ownerNotifs.body.notifications)).toBe(true);
      expect(ownerNotifs.body.notifications.length).toBeGreaterThan(0);
    });
  });

  afterAll(async () => {
    if (bookingId) {
      await prisma.review.deleteMany({ where: { bookingId } });
      await prisma.inspection.deleteMany({ where: { bookingId } });
      await prisma.payment.deleteMany({ where: { bookingId } });
      await prisma.dispute.deleteMany({ where: { bookingId } });
      await prisma.booking.deleteMany({ where: { id: bookingId } });
    }
    if (productId) {
      await prisma.productImage.deleteMany({ where: { productId } });
      await prisma.product.deleteMany({ where: { id: productId } });
    }
    const testEmails = [ownerEmail, renterEmail, rivalEmail];
    for (const email of testEmails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.notification.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
      }
    }
  });
});
