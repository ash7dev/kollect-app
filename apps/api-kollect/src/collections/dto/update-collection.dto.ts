// src/modules/collections/dto/update-collection.dto.ts
import { z } from 'zod';

export const UpdateCollectionSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  launchDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional().nullable(),
  isFeatured: z.boolean().optional(),
  coverImage: z.string().url().optional().nullable(),
  teaserVideo: z.string().url().optional().nullable(),
});

export type UpdateCollectionDto = z.infer<typeof UpdateCollectionSchema>;
