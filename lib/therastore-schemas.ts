import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.enum(['createdAt', 'price', 'rating', 'name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const ProductFilterSchema = z.object({
  category: z.string().min(1).optional(),
  subcategory: z.string().min(1).optional(),
  search: z.string().min(1).optional(),
  minPrice: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  brand: z.string().optional(),
  condition: z.string().optional(),
  featured: z.enum(['true', 'false']).optional(),
}).merge(PaginationQuerySchema);

export const ProductCreateSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(''),
  brand: z.string().optional().default(''),
  price: z.union([z.number(), z.string()]),
  originalPrice: z.union([z.number(), z.string()]).nullable().optional(),
  category: z.string().min(1),
  subcategory: z.string().optional().default(''),
  images: z.array(z.string().url()).optional().default([]),
  stock: z.union([z.number(), z.string()]).optional().default(0),
  sku: z.string().optional(),
  condition: z.string().optional().default('New'),
  features: z.array(z.string()).optional().default([]),
  specifications: z.record(z.string(), z.any()).optional().default({}),
  tags: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  fastDelivery: z.boolean().optional().default(false),
  weight: z.union([z.number(), z.string()]).optional(),
  dimensions: z.any().optional(),
  warranty: z.string().optional(),
  seller: z.any().optional(),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export const CategoryResponseSchema = z.array(
  z.object({ name: z.string(), count: z.number() })
);
