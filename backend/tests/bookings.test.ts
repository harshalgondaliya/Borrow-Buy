import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/shared/prisma.js';

describe('Rental Availability Engine & Booking Concurrency Tests', () => {
  let customer1Token: string;
  let customer2Token: string;
  let ownerToken: string;
  let testProductId: string;
  let createdBookingId: string;

  beforeAll(async () => {
    // 1. Login Customer 1 (Priya)
    const c1Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya.customer@borrowbuy.in', password: 'Password123!' });
    customer1Token = c1Res.body.data.token;

    // 2. Login Customer 2 (Parth)
    const c2Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'parth.dave@borrowbuy.in', password: 'Password123!' });
    customer2Token = c2Res.body.data.token;

    // 3. Login Owner (Rajesh)
    const oRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rajesh.owner@borrowbuy.in', password: 'Password123!' });
    ownerToken = oRes.body.data.token;

    // 4. Fetch an active category to create a fresh isolated test product
    const catRes = await request(app).get('/api/products/categories');
    const categoryId = catRes.body.data[0].id;

    // Create a fresh test product so each test run has clean calendar availability
    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${ownerToken}`)
      .field('name', `Concurrency Test Gear ${Date.now()}`)
      .field('description', 'Test product specifically for date availability and concurrency verification.')
      .field('categoryId', categoryId)
      .field('pricePerDay', '50')
      .field('securityDeposit', '200')
      .field('condition', 'LIKE_NEW')
      .field('location', 'Satellite, Ahmedabad, Gujarat');

    expect(prodRes.status).toBe(201);
    testProductId = prodRes.body.data.id;
  }, 25000);

  afterAll(async () => {
    if (testProductId) {
      await prisma.booking.deleteMany({ where: { productId: testProductId } });
      await prisma.product.delete({ where: { id: testProductId } });
    }
  });

  it('should fetch availability calendar for a product', async () => {
    const res = await request(app).get(`/api/bookings/calendar/${testProductId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should check date availability for open dates', async () => {
    const start = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const end = new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .get(`/api/bookings/check-availability?productId=${testProductId}&startDate=${start}&endDate=${end}`);

    expect(res.status).toBe(200);
    expect(res.body.available).toBe(true);
  });

  it('should reject booking if owner attempts to rent their own item', async () => {
    const start = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();
    const end = new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        productId: testProductId,
        startDate: start,
        endDate: end,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('owners cannot book their own equipment');
  });

  it('should successfully reserve rental dates for Customer 1', async () => {
    const start = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        productId: testProductId,
        startDate: start,
        endDate: end,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('RESERVED');
    expect(res.body.data.totalDays).toBe(3);
    expect(res.body.data.pickupCode).toBeDefined();
    expect(res.body.data.returnCode).toBeDefined();
    createdBookingId = res.body.data.id;
  });

  it('should reject a second sequential booking for overlapping dates', async () => {
    // Exact overlap with Customer 1's booking (Day 31 to Day 32)
    const overlapStart = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();
    const overlapEnd = new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({
        productId: testProductId,
        startDate: overlapStart,
        endDate: overlapEnd,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('no longer available');
  });

  it('CRITICAL CONCURRENCY TEST: Two simultaneous requests for the exact same dates must prevent double-booking', async () => {
    const targetStart = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
    const targetEnd = new Date(Date.now() + 63 * 24 * 60 * 60 * 1000).toISOString();

    // Fire two simultaneous asynchronous HTTP requests
    const [res1, res2] = await Promise.all([
      request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          productId: testProductId,
          startDate: targetStart,
          endDate: targetEnd,
        }),
      request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customer2Token}`)
        .send({
          productId: testProductId,
          startDate: targetStart,
          endDate: targetEnd,
        }),
    ]);

    const statuses = [res1.status, res2.status].sort();

    // Exactly one must be 201 Created and the other must be 400 Bad Request
    expect(statuses).toEqual([201, 400]);

    const successfulRes = res1.status === 201 ? res1 : res2;
    const failedRes = res1.status === 400 ? res1 : res2;

    expect(successfulRes.body.success).toBe(true);
    expect(failedRes.body.success).toBe(false);
    expect(failedRes.body.message).toContain('no longer available');
  });

  it('should allow customer to view their personal bookings', async () => {
    const res = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${customer1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((b: any) => b.id === createdBookingId)).toBe(true);
  });

  it('should allow owner to view incoming rental requests', async () => {
    const res = await request(app)
      .get('/api/bookings/owner-requests')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((b: any) => b.id === createdBookingId)).toBe(true);
  });

  it('should allow owner to confirm booking request', async () => {
    const res = await request(app)
      .post(`/api/bookings/${createdBookingId}/confirm`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CONFIRMED');
  });

  it('should allow customer to cancel confirmed booking', async () => {
    const res = await request(app)
      .post(`/api/bookings/${createdBookingId}/cancel`)
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ reason: 'Trip plans changed.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CANCELLED');
    expect(res.body.data.cancellationReason).toBe('Trip plans changed.');
  });
});
