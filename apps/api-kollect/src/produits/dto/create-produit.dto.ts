import { z } from 'zod';

export const CreateProduitSchema = z.object({
  collectionId: z.string().min(1),
  name: z.string().min(3).max(200),
  description: z.string().optional().nullable(),
  price: z.number().int().min(0), // en FCFA (centimes)
  // Les images réelles sont gérées via upload; ici on accepte un tableau optionnel
  // Le contrôleur vérifie ensuite qu'au moins une image existe après upload
  images: z.array(z.string().url()).max(10).optional().default([]),
  stock: z.number().int().min(0).default(0),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  sku: z.string().max(50).optional().nullable(),
  material: z.string().max(100).optional().nullable(),
  weight: z.number().positive().optional().nullable(), // en grammes
  isFeatured: z.boolean().default(false),
  isVisible: z.boolean().optional(), // Sera déterminé automatiquement si non fourni
});

export type CreateProduitDto = z.infer<typeof CreateProduitSchema>;


