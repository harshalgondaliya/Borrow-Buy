import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/shared/prisma.js';

describe('Catalogue Data Quality & Natural Naming Verification', () => {
  it('should verify exactly 116 active canonical products across 25 categories', async () => {
    const res = await request(app).get('/api/products?limit=50');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination.total).toBe(116);
    expect(res.body.products.length).toBe(50);

    const categoriesRes = await request(app).get('/api/products/categories');
    expect(categoriesRes.status).toBe(200);
    expect(categoriesRes.body.data.length).toBe(25);
  });

  it('should confirm zero duplicate product names among active listings', async () => {
    const products = await prisma.product.findMany({
      where: { listingStatus: 'ACTIVE' },
      select: { id: true, name: true }
    });

    const seenNames = new Set<string>();
    const duplicates: string[] = [];

    for (const p of products) {
      const normalized = p.name.trim().toLowerCase();
      if (seenNames.has(normalized)) {
        duplicates.push(p.name);
      }
      seenNames.add(normalized);
    }

    expect(duplicates).toEqual([]);
    expect(seenNames.size).toBe(116);
  });

  it('should confirm zero duplicate image assignments across distinct listings', async () => {
    const products = await prisma.product.findMany({
      where: { listingStatus: 'ACTIVE' },
      select: { id: true, name: true, images: true }
    });

    const imageToProducts: Record<string, string[]> = {};
    for (const p of products) {
      for (const img of p.images) {
        if (!imageToProducts[img]) imageToProducts[img] = [];
        imageToProducts[img].push(p.id);
      }
    }

    const sharedImages = Object.entries(imageToProducts).filter(([_, ids]) => ids.length > 1);
    expect(sharedImages).toHaveLength(0);
  });

  it('should verify natural, human-friendly product names free of robotic buzzwords', async () => {
    const forbiddenBuzzwords = [
      'ultra premium',
      'high performance professional drilling machinery device',
      'advanced portable wireless sound amplification unit',
      'multi-purpose outdoor adventure accommodation shelter',
      'industrial grade surface cleaning apparatus',
    ];

    const products = await prisma.product.findMany({
      where: { listingStatus: 'ACTIVE' },
      select: { id: true, name: true }
    });

    for (const p of products) {
      const lower = p.name.toLowerCase();
      for (const buzz of forbiddenBuzzwords) {
        expect(lower).not.toContain(buzz);
      }
      // Ensure no trailing unclosed quotes or broken brackets
      expect(p.name).not.toMatch(/"\s*$/);
      expect(p.name).not.toMatch(/\(\s*$/);
      // Ensure name length is reasonable (concise and readable)
      expect(p.name.length).toBeLessThan(75);
    }
  });

  it('should verify search compatibility with Indian colloquial synonyms (drill machine, mike, cycle)', async () => {
    // 1. "drill machine" should return Bosch / DeWalt drills
    const drillRes = await request(app).get('/api/products?search=drill%20machine');
    expect(drillRes.status).toBe(200);
    expect(drillRes.body.products.length).toBeGreaterThanOrEqual(1);
    const hasDrill = drillRes.body.products.some((p: any) => p.name.toLowerCase().includes('drill'));
    expect(hasDrill).toBe(true);

    // 2. "mike" should return microphones & PA sound systems
    const micRes = await request(app).get('/api/products?search=mike');
    expect(micRes.status).toBe(200);
    expect(micRes.body.products.length).toBeGreaterThanOrEqual(1);
    const hasMic = micRes.body.products.some(
      (p: any) => p.name.toLowerCase().includes('mic') || p.name.toLowerCase().includes('speaker')
    );
    expect(hasMic).toBe(true);

    // 3. "cycle" should return bicycles
    const cycleRes = await request(app).get('/api/products?search=cycle');
    expect(cycleRes.status).toBe(200);
    expect(cycleRes.body.products.length).toBeGreaterThanOrEqual(1);
    const hasBicycle = cycleRes.body.products.some((p: any) => p.name.toLowerCase().includes('bicycle') || p.name.toLowerCase().includes('bike'));
    expect(hasBicycle).toBe(true);

    // 4. "macbook" should return Apple MacBooks
    const macRes = await request(app).get('/api/products?search=macbook');
    expect(macRes.status).toBe(200);
    expect(macRes.body.products.length).toBeGreaterThanOrEqual(1);
    const hasMac = macRes.body.products.some((p: any) => p.brand.toLowerCase() === 'apple');
    expect(hasMac).toBe(true);
  });

  it('should verify category filtering functionality across multiple categories', async () => {
    const catsRes = await request(app).get('/api/products/categories');
    const firstCat = catsRes.body.data[0];

    const filterRes = await request(app).get(`/api/products?categoryId=${firstCat.id}`);
    expect(filterRes.status).toBe(200);
    expect(filterRes.body.products.length).toBeGreaterThan(0);
    for (const prod of filterRes.body.products) {
      expect(prod.categoryId).toBe(firstCat.id);
    }
  });

  it('should verify city / location filtering for Gujarat equipment hubs', async () => {
    const gujaratCities = ['Ahmedabad', 'Surat', 'Vadodara', 'Gandhinagar'];

    for (const city of gujaratCities) {
      const cityRes = await request(app).get(`/api/products?location=${city}`);
      expect(cityRes.status).toBe(200);
      expect(cityRes.body.products.length).toBeGreaterThan(0);
      for (const prod of cityRes.body.products) {
        expect(prod.location.toLowerCase()).toContain(city.toLowerCase());
      }
    }
  });

  it('should verify referential integrity across products, owners, and booking history', async () => {
    const productsWithBookings = await prisma.product.findMany({
      where: { listingStatus: 'ACTIVE' },
      include: {
        owner: true,
        category: true,
        bookings: {
          include: {
            payments: true,
            reviews: true,
          }
        },
        productImages: true,
      }
    });

    expect(productsWithBookings.length).toBe(116);
    for (const p of productsWithBookings) {
      expect(p.owner).toBeDefined();
      expect(p.category).toBeDefined();
      expect(p.productImages.length).toBeGreaterThanOrEqual(1);
      expect(p.pricePerDay).toBeGreaterThan(0);
      expect(p.securityDeposit).toBeGreaterThan(0);
      // All bookings must have valid customer relations
      for (const b of p.bookings) {
        expect(b.customerId).toBeDefined();
        expect(b.totalAmount).toBeGreaterThan(0);
      }
    }
  });
});
