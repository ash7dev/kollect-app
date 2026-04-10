/* eslint-disable prettier/prettier */
import { z } from 'zod';

// ─── Enums ──────────────────────────────────────────────────────────────────

export const PromotionScopeEnum = z.enum(['BRAND', 'COLLECTION']);
export type PromotionScope = z.infer<typeof PromotionScopeEnum>;

export const DiscountTypeEnum = z.enum(['PERCENTAGE', 'FIXED_AMOUNT']);
export type DiscountType = z.infer<typeof DiscountTypeEnum>;

// ─── Création d'une promotion automatique ────────────────────────────────────

export const CreateAutoPromotionSchema = z.object({
  description: z.string().min(3).max(300).optional(),

  // Portée
  scope: PromotionScopeEnum,
  collectionId: z.string().cuid().optional(),

  // Remise
  discountType: DiscountTypeEnum,
  discountValue: z
    .number()
    .int()
    .positive()
    .refine(
      (v) => v <= 100,
      'Un pourcentage ne peut pas dépasser 100%',
    ),
  maxDiscount: z.number().int().positive().optional(), // Plafond FCFA si %
  minOrderAmount: z.number().int().positive().optional(),

  // Validité
  startsAt: z.string().datetime({ message: 'Date de début invalide' }),
  expiresAt: z
    .string()
    .datetime({ message: 'Date de fin invalide' })
    .optional(),
}).superRefine((data, ctx) => {
  // Si scope = COLLECTION → collectionId obligatoire
  if (data.scope === 'COLLECTION' && !data.collectionId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['collectionId'],
      message: 'collectionId est requis quand scope = COLLECTION',
    });
  }
  // Si scope = BRAND → collectionId interdit
  if (data.scope === 'BRAND' && data.collectionId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['collectionId'],
      message: 'collectionId doit être absent quand scope = BRAND',
    });
  }
  // maxDiscount n'a de sens qu'avec PERCENTAGE
  if (data.discountType === 'FIXED_AMOUNT' && data.maxDiscount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['maxDiscount'],
      message: 'maxDiscount est inutile avec un montant fixe',
    });
  }
  // expiresAt doit être après startsAt
  if (data.expiresAt && new Date(data.expiresAt) <= new Date(data.startsAt)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['expiresAt'],
      message: 'La date de fin doit être postérieure à la date de début',
    });
  }
});

export type CreateAutoPromotionDto = z.infer<typeof CreateAutoPromotionSchema>;

// ─── Création d'un code promo ─────────────────────────────────────────────────

export const CreatePromoCodeSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[A-Z0-9_-]+$/, 'Le code doit être en majuscules (A-Z, 0-9, - ou _)'),
  description: z.string().min(3).max(300).optional(),

  // Portée (pour restreindre à une collection si voulu)
  scope: PromotionScopeEnum.default('BRAND'),
  collectionId: z.string().cuid().optional(),

  // Remise
  discountType: DiscountTypeEnum,
  discountValue: z.number().int().positive(),
  maxDiscount: z.number().int().positive().optional(),
  minOrderAmount: z.number().int().positive().optional(),

  // Utilisation
  usageLimit: z.number().int().positive().optional(),   // null = illimité
  isSingleUse: z.boolean().default(false),

  // Validité
  startsAt: z.string().datetime({ message: 'Date de début invalide' }),
  expiresAt: z.string().datetime({ message: 'Date de fin invalide' }).optional(),
}).superRefine((data, ctx) => {
  if (data.scope === 'COLLECTION' && !data.collectionId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['collectionId'],
      message: 'collectionId est requis quand scope = COLLECTION',
    });
  }
  if (data.expiresAt && new Date(data.expiresAt) <= new Date(data.startsAt)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['expiresAt'],
      message: 'La date de fin doit être postérieure à la date de début',
    });
  }
  // PERCENTAGE → valeur <= 100
  if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['discountValue'],
      message: 'Un pourcentage ne peut pas dépasser 100%',
    });
  }
});

export type CreatePromoCodeDto = z.infer<typeof CreatePromoCodeSchema>;

// ─── Désactivation ────────────────────────────────────────────────────────────

export const TogglePromotionSchema = z.object({
  isActive: z.boolean(),
});
export type TogglePromotionDto = z.infer<typeof TogglePromotionSchema>;

// ─── Query params ─────────────────────────────────────────────────────────────

export const QueryPromotionsSchema = z.object({
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  isAutoApplied: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  scope: PromotionScopeEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type QueryPromotionsDto = z.infer<typeof QueryPromotionsSchema>;

// ─── Mise à jour d'une promotion ──────────────────────────────────────────────
export const UpdatePromotionSchema = z.object({
  description: z.string().min(3).max(300).optional(),
  discountValue: z.number().int().positive().optional(),
  maxDiscount: z.number().int().positive().nullable().optional(),
  minOrderAmount: z.number().int().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
});
export type UpdatePromotionDto = z.infer<typeof UpdatePromotionSchema>;

export const ValidatePromoCodeSchema = z.object({
  code: z.string().min(1),
  subtotal: z.coerce.number().int().positive(),
  brandId: z.string().cuid(),
});
export type ValidatePromoCodeDto = z.infer<typeof ValidatePromoCodeSchema>;
