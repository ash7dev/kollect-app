import { z } from 'zod';
import { ProductGender, ProductType } from '@prisma/client';

export const UpdateProduitSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().optional().nullable(),
  price: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).min(1).max(10).optional(),
  stock: z.number().int().min(0).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  productType: z.nativeEnum(ProductType).optional().nullable(),
  gender: z.nativeEnum(ProductGender).optional().nullable(),
  sku: z.string().max(50).optional().nullable(),
  material: z.string().max(100).optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isVisible: z.boolean().optional(),
});

export type UpdateProduitDto = z.infer<typeof UpdateProduitSchema>;
