/* eslint-disable prettier/prettier */

import { z } from 'zod';

export const ActivateTeaserSchema = z.object({
  coverImage: z.string().url().optional(),
  teaserVideo: z.string().url().optional(),
}).refine(
  (data: { coverImage: any; teaserVideo: any; }) => data.coverImage || data.teaserVideo,
  {
    message: 'Au moins une image ou une vidéo teaser est requise',
    },
  );

export type ActivateTeaserDto = z.infer<typeof ActivateTeaserSchema>;
