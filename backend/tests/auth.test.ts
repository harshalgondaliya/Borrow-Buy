import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Authentication & Authorization Module Tests', () => {
  const testUser = {
    email: `test.user.${Date.now()}@borrowbuy.com`,
    password: 'Password123!',
    fullName: 'Test Developer',
    role: 'CUSTOMER',
  };

  let authToken: string;

  it('should register a new customer successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.role).toBe('CUSTOMER');
    expect(res.body.data).toHaveProperty('token');
  });

  it('should reject registration with a duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  it('should reject registration with a weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `weak.${Date.now()}@borrowbuy.com`,
        password: 'weak',
        fullName: 'Weak Password User',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should log in an existing user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    authToken = res.body.data.token;
  });

  it('should reject login with an invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword999!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should fetch the authenticated user profile using Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.role).toBe('CUSTOMER');
  });

  it('should reject access to protected endpoint without a token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should update user profile information', async () => {
    const res = await request(app)
      .put('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        fullName: 'Updated Test Developer',
        phone: '+1 555-9988',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe('Updated Test Developer');
    expect(res.body.data.phone).toBe('+1 555-9988');
  });

  it('should upgrade customer to verified owner', async () => {
    const res = await request(app)
      .post('/api/auth/become-owner')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        ownerBio: 'Experienced sound engineer and camera technician.',
        ownerAddress: 'Queen Anne, Seattle, WA',
        phone: '+1 206-555-9876',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('OWNER');
    expect(res.body.data.user.isVerifiedOwner).toBe(true);
    authToken = res.body.data.token; // Update with owner token
  });

  it('should support local password reset flow', async () => {
    // 1. Request reset
    const forgotRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testUser.email });

    expect(forgotRes.status).toBe(200);
    expect(forgotRes.body.success).toBe(true);
    const resetToken = forgotRes.body.devResetToken;
    expect(resetToken).toBeDefined();

    // 2. Perform reset
    const newPassword = 'NewSecretPassword2026!';
    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword,
      });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    // 3. Verify login works with new password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: newPassword,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
  });
});

