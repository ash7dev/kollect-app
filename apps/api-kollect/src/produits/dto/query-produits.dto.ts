import { z } from 'zod';

// Schéma pour les requêtes de produits standards
export const QueryProduitsSchema = z.object({
  collectionId: z.string().optional(),
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1))
    .optional()
    .default(1),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional()
    .default(10),
});

// Schéma pour la récupération aléatoire de produits
export const RandomProduitsSchema = z.object({
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1))
    .optional()
    .default(1),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional()
    .default(20),
  seed: z.string().optional(), // Pour une pagination aléatoire cohérente
});

export type QueryProduitsDto = z.infer<typeof QueryProduitsSchema>;
export type RandomProduitsDto = z.infer<typeof RandomProduitsSchema>;
