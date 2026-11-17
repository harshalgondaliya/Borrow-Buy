import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/shared/prisma.js';
import { BackgroundJobRunner } from '../src/integrations/jobs/job-runner.js';
import { notificationService } from '../src/integrations/notifications/index.js';
import { BookingStatus, UserRole, UserStatus, ApprovalStatus, DisputeStatus } from '@prisma/client';

describe('Phase 6 – Notifications, Background Jobs & Admin Dashboard Tests', () => {
  let adminToken: string;
  let customerToken: string;
  let customerId: string;
  let ownerToken: string;
  let sampleNotificationId: string;
  let testProductId: string;
  let testBookingId: string;

  beforeAll(async () => {
    // 1. Login Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@borrowbuy.in';
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'DevAdmin#BorrowBuy2026!';
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: adminPassword });
    adminToken = adminRes.body.data.token;

    // 2. Login Customer (Neha)
    const custRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'neha.trivedi@borrowbuy.in', password: 'Password123!' });
    customerToken = custRes.body.data.token;
    customerId = custRes.body.data.user.id;

    // 3. Login Owner (Sneha)
    const ownerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sneha.owner@borrowbuy.in', password: 'Password123!' });
    ownerToken = ownerRes.body.data.token;

    // 4. Create sample in-app notification for Emma
    await notificationService.sendNotification({
      userId: customerId,
      title: 'Welcome to BorrowBuy!',
      message: 'Your account is ready for renting equipment.',
      type: 'SYSTEM_WELCOME',
    });

    // 5. Grab an active product and booking for admin testing
    const prods = await prisma.product.findMany({ take: 1 });
    testProductId = prods[0].id;

    const bookings = await prisma.booking.findMany({ take: 1 });
    testBookingId = bookings[0].id;
  });

  describe('Module 11: In-App Notifications Subsystem', () => {
    it('should fetch user notifications and unread count', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.notifications)).toBe(true);
      expect(res.body.unreadCount).toBeGreaterThanOrEqual(1);
      sampleNotificationId = res.body.notifications[0].id;
    });

    it('should mark a specific notification as read', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${sampleNotificationId}/read`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should mark all notifications as read', async () => {
      const res = await request(app)
        .patch('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const verifyRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(verifyRes.body.unreadCount).toBe(0);
    });
  });

  describe('Background Jobs: Expired Hold Sweeper & Overdue Detector', () => {
    it('should sweep expired 15-minute temporary reservation holds and free equipment', async () => {
      // Create a booking with an already-passed holdExpiresAt timestamp
      const expiredHoldBooking = await prisma.booking.create({
        data: {
          bookingNumber: `BB-TEST-EXP-${Date.now()}`,
          productId: testProductId,
          customerId,
          startDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 52 * 24 * 60 * 60 * 1000),
          expectedReturnDate: new Date(Date.now() + 52 * 24 * 60 * 60 * 1000),
          totalDays: 2,
          dailyPrice: 50,
          rentalTotal: 100,
          securityDeposit: 200,
          totalAmount: 300,
          status: BookingStatus.RESERVED,
          holdExpiresAt: new Date(Date.now() - 60 * 1000), // 1 minute in the past
        },
      });

      // Run sweeper
      const sweptCount = await BackgroundJobRunner.sweepExpiredHolds();
      expect(sweptCount).toBeGreaterThanOrEqual(1);

      // Verify status transitioned to EXPIRED
      const updated = await prisma.booking.findUnique({
        where: { id: expiredHoldBooking.id },
      });
      expect(updated?.status).toBe(BookingStatus.EXPIRED);
    });

    it('should detect overdue active rentals', async () => {
      const overdueCount = await BackgroundJobRunner.checkOverdueRentals();
      expect(typeof overdueCount).toBe('number');
    });
  });

  describe('Module 12: Admin Dashboard & Governance', () => {
    it('should reject non-admin users from accessing admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });

    it('should return platform statistics to authenticated admin', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('users');
      expect(res.body.data).toHaveProperty('products');
      expect(res.body.data).toHaveProperty('bookings');
      expect(res.body.data).toHaveProperty('financials');
      expect(res.body.data.users.total).toBeGreaterThanOrEqual(1);
    });

    it('should allow admin to list all registered users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should allow admin to update user account status', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${customerId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: UserStatus.ACTIVE, isVerifiedOwner: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isVerifiedOwner).toBe(true);
    });

    it('should allow admin to review and approve/reject products', async () => {
      const res = await request(app)
        .patch(`/api/admin/products/${testProductId}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ approvalStatus: ApprovalStatus.APPROVED });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should allow admin to list all platform bookings', async () => {
      const res = await request(app)
        .get('/api/admin/bookings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should allow admin to mediate and resolve disputes', async () => {
      // Create a test dispute
      const dispute = await prisma.dispute.create({
        data: {
          bookingId: testBookingId,
          raisedById: customerId,
          claimAmount: 50,
          reason: 'Minor accessory missing',
          description: 'Lens cap was missing upon receipt.',
          status: DisputeStatus.OPEN,
          photos: [],
        },
      });

      const res = await request(app)
        .post(`/api/admin/disputes/${dispute.id}/resolve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: DisputeStatus.RESOLVED,
          resolutionNotes: 'Owner agreed to provide replacement lens cap. $15 fee settled.',
          deductedFromDeposit: 15,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('RESOLVED');
    });
  });
});
