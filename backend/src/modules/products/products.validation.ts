import { z } from 'zod';
import { ProductCondition, ListingStatus } from '@prisma/client';

export const createProductSchema = z.object({
  name: z.string().min(3, 'Product title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  model: z.string().optional(),
  pricePerDay: z.coerce.number().positive('Daily rental price must be greater than 0'),
  securityDeposit: z.coerce.number().min(0, 'Security deposit must be 0 or higher'),
  condition: z.enum([
    ProductCondition.BRAND_NEW,
    ProductCondition.LIKE_NEW,
    ProductCondition.GOOD,
    ProductCondition.FAIR,
  ]).default(ProductCondition.GOOD),
  location: z.string().min(3, 'Location is required'),
});

export const updateProductSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  categoryId: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  pricePerDay: z.coerce.number().positive().optional(),
  securityDeposit: z.coerce.number().min(0).optional(),
  condition: z.enum([
    ProductCondition.BRAND_NEW,
    ProductCondition.LIKE_NEW,
    ProductCondition.GOOD,
    ProductCondition.FAIR,
  ]).optional(),
  location: z.string().min(3).optional(),
  listingStatus: z.enum([
    ListingStatus.ACTIVE,
    ListingStatus.INACTIVE,
    ListingStatus.UNDER_MAINTENANCE,
  ]).optional(),
});

export const productQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  condition: z.enum([
    ProductCondition.BRAND_NEW,
    ProductCondition.LIKE_NEW,
    ProductCondition.GOOD,
    ProductCondition.FAIR,
  ]).optional(),
  location: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'deposit_asc']).default('newest'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

