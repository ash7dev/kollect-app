/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from 'zod';

// Schéma pour les produits
const ProductSchema = z.object({
  name: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(200),
  description: z.string().optional(),
  price: z.number().int().positive('Le prix doit être un nombre positif'),
  images: z.array(z.string().url()).min(1, 'Au moins une image est requise'),
  stock: z.number().int().min(0).default(0),
  sizes: z.array(z.string()).default(['UNIQUE']),
  sku: z.string().optional(),
  categoryId: z.string().optional(),
});

/// backend/src/collections/dto/create-collection.dto.ts
export const CreateCollectionSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional().nullable(),
  launchDate: z.string().optional().nullable(),
  isFeatured: z.boolean().optional().default(false),
  coverImage: z.union([z.string(), z.null(), z.undefined()]).optional(),
  teaserVideo: z.union([z.string(), z.null(), z.undefined()]).optional(),
  products: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional().nullable(),
      price: z.number(),
      stock: z.number(),
      sku: z.string(),
      images: z.array(z.string()),
      sizes: z.array(z.string()),
      colors: z.array(z.string()),
    }),
  ).min(1, 'Au moins un produit est requis'),
});
export type CreateCollectionDto = z.infer<typeof CreateCollectionSchema>;
