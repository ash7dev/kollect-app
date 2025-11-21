/* eslint-disable prettier/prettier */
import { z } from 'zod';
import { CollectionStatus } from '@prisma/client';

/**
 * Schema Zod pour valider les query params de récupération des collections
 * Tous les champs sont optionnels pour permettre des appels sans paramètres
 */
export const QueryCollectionsSchema = z
  .object({
    status: z.nativeEnum(CollectionStatus).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    isFeatured: z.coerce.boolean().optional(),
    includeProducts: z.coerce.boolean().optional(),
  })
  .strip(); // strip() ignore les paramètres inconnus au lieu de renvoyer une erreur 400

export type QueryCollectionsDto = z.infer<typeof QueryCollectionsSchema>;