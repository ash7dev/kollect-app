import { z } from 'zod';

export const CreateProductSchema = z.object({
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

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
