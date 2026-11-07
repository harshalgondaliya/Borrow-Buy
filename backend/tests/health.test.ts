import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('System Health Check API', () => {
  it('should return 200 and healthy status with driver metadata', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('service', 'borrowbuy-backend');
    expect(res.body).toHaveProperty('environment');
    expect(res.body).toHaveProperty('drivers');
    expect(res.body.drivers).toEqual({
      storage: 'local',
      notification: 'local',
      payment: 'simulation',
    });
  });

  it('should return 404 for unknown endpoints', async () => {
    const res = await request(app).get('/api/non-existent-route');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

