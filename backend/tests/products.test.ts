import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/shared/prisma.js';

describe('Products & Marketplace Module Tests', () => {
  let ownerToken: string;
  let customerToken: string;
  let sampleCategoryId: string;
  let createdProductId: string;

  beforeAll(async () => {
    // Login as seeded owner (Rajesh)
    const ownerRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rajesh.owner@borrowbuy.in',
        password: 'Password123!',
      });
    ownerToken = ownerRes.body.data.token;

    // Login as seeded customer (Priya)
    const customerRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'priya.customer@borrowbuy.in',
        password: 'Password123!',
      });
    customerToken = customerRes.body.data.token;

    // Get categories to grab a valid ID
    const catRes = await request(app).get('/api/products/categories');
    expect(catRes.status).toBe(200);
    expect(catRes.body.data.length).toBeGreaterThan(0);
    sampleCategoryId = catRes.body.data[0].id;
  });

  it('should list all categories with product counts', async () => {
    const res = await request(app).get('/api/products/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('_count');
  });

  it('should list all active products with pagination metadata', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination.page).toBe(1);
  });

  it('should search products by keyword', async () => {
    const res = await request(app).get('/api/products?search=Sony');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThanOrEqual(1);
    expect(res.body.products[0].name).toContain('Sony');
  });

  it('should filter products by category', async () => {
    const res = await request(app).get(`/api/products?categoryId=${sampleCategoryId}`);
    expect(res.status).toBe(200);
    res.body.products.forEach((p: any) => {
      expect(p.categoryId).toBe(sampleCategoryId);
    });
  });

  it('should filter products by price range', async () => {
    const res = await request(app).get('/api/products?minPrice=30&maxPrice=50');
    expect(res.status).toBe(200);
    res.body.products.forEach((p: any) => {
      expect(p.pricePerDay).toBeGreaterThanOrEqual(30);
      expect(p.pricePerDay).toBeLessThanOrEqual(50);
    });
  });

  it('should fetch single product details including reviews and owner info', async () => {
    const listRes = await request(app).get('/api/products');
    const firstProduct = listRes.body.products[0];

    const res = await request(app).get(`/api/products/${firstProduct.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(firstProduct.id);
    expect(res.body.data).toHaveProperty('owner');
    expect(res.body.data).toHaveProperty('reviews');
    expect(res.body.data).toHaveProperty('averageRating');
  });

  it('should reject product creation when unauthenticated', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({
        name: 'Unauthenticated Drone',
        description: 'Should not be allowed to create.',
        categoryId: sampleCategoryId,
        pricePerDay: 50,
        securityDeposit: 200,
        condition: 'LIKE_NEW',
        location: 'Ahmedabad (SG Highway)',
      });

    expect(res.status).toBe(401);
  });

  it('should reject product creation when user is only a CUSTOMER', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        name: 'Unauthorized Customer Drone',
        description: 'Customer should not create listings.',
        categoryId: sampleCategoryId,
        pricePerDay: 50,
        securityDeposit: 200,
        condition: 'LIKE_NEW',
        location: 'Ahmedabad (SG Highway)',
      });

    expect(res.status).toBe(403);
  });

  it('should allow verified OWNER to create a product listing', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${ownerToken}`)
      .field('name', 'DJI Mavic 3 Pro Cine Drone')
      .field('description', 'Triple-camera system with Apple ProRes support and 43-min flight time.')
      .field('categoryId', sampleCategoryId)
      .field('brand', 'DJI')
      .field('model', 'Mavic 3 Pro')
      .field('pricePerDay', '75')
      .field('securityDeposit', '400')
      .field('condition', 'LIKE_NEW')
      .field('location', 'Gandhinagar (Infocity)');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('DJI Mavic 3 Pro Cine Drone');
    createdProductId = res.body.data.id;
  });

  it('should allow owner to update their product listing', async () => {
    const res = await request(app)
      .put(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .field('pricePerDay', '85')
      .field('description', 'Updated description: Includes 3 spare batteries and ND filters.');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pricePerDay).toBe(85);
  });

  it('should allow owner to list their personal inventory', async () => {
    const res = await request(app)
      .get('/api/products/owner/my-listings')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((p: any) => p.id === createdProductId)).toBe(true);
  });

  it('should allow owner to deactivate their listing', async () => {
    const res = await request(app)
      .delete(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.product.listingStatus).toBe('INACTIVE');
  });

  afterAll(async () => {
    if (createdProductId) {
      await prisma.productImage.deleteMany({ where: { productId: createdProductId } });
      await prisma.product.deleteMany({ where: { id: createdProductId } });
    }
  });
});

