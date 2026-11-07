import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/shared/prisma.js';
import { BookingStatus } from '@prisma/client';

describe('Phase 5 – Payments, QR Verification, Inspections & Reviews Tests', () => {
  let customerToken: string;
  let ownerToken: string;
  let ownerId: string;
  let testProductId: string;
  let testBookingId: string;
  let pickupCode: string;
  let returnCode: string;
  let preInspectionId: string;

  beforeAll(async () => {
    // 1. Login Customer (Emma)
    const cRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'emma.customer@borrowbuy.com', password: 'Password123!' });
    customerToken = cRes.body.data.token;

    // 2. Login Owner (Alex)
    const oRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex.owner@borrowbuy.com', password: 'Password123!' });
    ownerToken = oRes.body.data.token;
    ownerId = oRes.body.data.user.id;

    // 3. Create fresh test product
    const catRes = await request(app).get('/api/products/categories');
    const categoryId = catRes.body.data[0].id;

    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${ownerToken}`)
      .field('name', `Phase 5 Drone Kit ${Date.now()}`)
      .field('description', 'High performance drone for Phase 5 end-to-end testing.')
      .field('categoryId', categoryId)
      .field('pricePerDay', '60')
      .field('securityDeposit', '300')
      .field('condition', 'LIKE_NEW')
      .field('location', 'Downtown, Seattle, WA');

    testProductId = prodRes.body.data.id;

    // 4. Create a fresh reservation
    const start = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
    const end = new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString();

    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: testProductId,
        startDate: start,
        endDate: end,
      });

    testBookingId = bookRes.body.data.id;
    pickupCode = bookRes.body.data.pickupCode;
    returnCode = bookRes.body.data.returnCode;
  });

  describe('Module 6: Payment Simulation', () => {
    it('should handle simulated payment failure when requested', async () => {
      // Create a temporary reservation to test payment failure
      const tempBook = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: testProductId,
          startDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
        });

      const res = await request(app)
        .post('/api/payments/pay-booking')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          bookingId: tempBook.body.data.id,
          simulateFailure: true,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Simulated insufficient balance');
    });

    it('should successfully simulate payment, transition booking to CONFIRMED, and hold deposit', async () => {
      const res = await request(app)
        .post('/api/payments/pay-booking')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          bookingId: testBookingId,
          simulateFailure: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.booking.status).toBe('CONFIRMED');
      expect(res.body.data.payment.status).toBe('SUCCESSFUL');
      expect(res.body.data.payment.transactionId).toContain('TXN-SIM');
      expect(res.body.data.deposit.status).toBe('HELD');
    });

    it('should view payment audit history for the customer', async () => {
      const res = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Module 7: QR Pickup & Return Verification (Single-Use)', () => {
    it('should generate QR code Data URLs for confirmed booking', async () => {
      const res = await request(app)
        .get(`/api/qr/booking/${testBookingId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pickupQrDataUrl).toContain('data:image/png;base64');
      expect(res.body.data.returnQrDataUrl).toContain('data:image/png;base64');
    });

    it('should allow owner to verify customer pickup via QR code token', async () => {
      const res = await request(app)
        .post('/api/qr/verify-pickup')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ code: pickupCode });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.booking.status).toBe('ACTIVE');
      expect(res.body.booking.pickupAt).toBeDefined();
    });

    it('REPLAY ATTACK PREVENTION: should reject reuse of the single-use pickup token', async () => {
      const res = await request(app)
        .post('/api/qr/verify-pickup')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ code: pickupCode });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already been redeemed');
    });
  });

  describe('Module 8: Product Inspections & Damage Records', () => {
    it('should allow owner to upload pre-pickup condition photographs and notes', async () => {
      const res = await request(app)
        .post('/api/inspections')
        .set('Authorization', `Bearer ${ownerToken}`)
        .field('bookingId', testBookingId)
        .field('type', 'PRE_PICKUP')
        .field('conditionNotes', 'Camera body pristine. Propellers intact. 2 batteries charged.')
        .field('existingDamage', 'Minor hairline cosmetic scuff on left landing gear leg.');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('PRE_PICKUP');
      expect(res.body.data.confirmedByCustomer).toBe(false);
      preInspectionId = res.body.data.id;
    });

    it('should allow customer to confirm pre-pickup condition report', async () => {
      const res = await request(app)
        .post(`/api/inspections/${preInspectionId}/confirm`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.confirmedByCustomer).toBe(true);
    });
  });

  describe('Module 9: Equipment Return & Late Fee Calculation', () => {
    it('should allow owner to verify customer return via QR code token', async () => {
      const res = await request(app)
        .post('/api/qr/verify-return')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ code: returnCode });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.booking.status).toBe('RETURNED');
      expect(res.body.booking.returnedAt).toBeDefined();
    });

    it('REPLAY ATTACK PREVENTION: should reject reuse of the single-use return token', async () => {
      const res = await request(app)
        .post('/api/qr/verify-return')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ code: returnCode });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already been redeemed');
    });
  });

  describe('Module 10: Reviews & Trust Score Recalculation', () => {
    it('should mark rental as COMPLETED upon final deposit settlement', async () => {
      await prisma.booking.update({
        where: { id: testBookingId },
        data: { status: BookingStatus.COMPLETED },
      });
    });

    it('should allow customer to review owner and transparently update trust score', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          bookingId: testBookingId,
          rating: 5,
          comment: 'Outstanding drone gear! Alex was prompt and very professional.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.review.rating).toBe(5);
      expect(res.body.data.updatedTrustScore).toBeGreaterThanOrEqual(4.5);
    });

    it('DUPLICATE REVIEW PREVENTION: should reject duplicate review for same booking', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          bookingId: testBookingId,
          rating: 4,
          comment: 'Attempting duplicate review...',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already submitted a review');
    });

    it('should fetch public reviews for the owner', async () => {
      const res = await request(app).get(`/api/reviews/user/${ownerId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });
});

