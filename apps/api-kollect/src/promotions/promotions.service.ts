/* eslint-disable prettier/prettier */
 
 
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Prisma } from '@prisma/client';
import type {
  CreateAutoPromotionDto,
  CreatePromoCodeDto,
  QueryPromotionsDto,
  TogglePromotionDto,
  UpdatePromotionDto,
  ValidatePromoCodeDto,
} from './dto/promotions.dto';

interface ProductWithDiscount {
  id: string;
  price: number;
  collectionId?: string | null;
  collection?: {
    id: string;
  } | null;
  brandId?: string | null;
  brand?: {
    id: string;
  } | null;
  originalPrice?: number;
  discountType?: string;
  discountValue?: number;
}


@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * ✅ 1. Créer une Promotion Automatique (Marque ou Collection)
   */
  async createAutoPromotion(userId: string, dto: CreateAutoPromotionDto) {
    // 1. Trouver la marque du CEO
    const brand = await this.prisma.marque.findUnique({
      where: { userId },
    });
    if (!brand) throw new NotFoundException('Marque introuvable pour ce CEO');

    // 2. Vérifier si une autre promo automatique est déjà active !
    // Règle de gestion : On interdit d'avoir 2 promos auto (même scopes différents) pour la même marque.
    const activeAutoPromo = await this.prisma.codePromo.findFirst({
      where: {
        brandId: brand.id,
        isAutoApplied: true,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (activeAutoPromo) {
      throw new ConflictException(
        `Une promotion automatique est déjà active (Type : ${activeAutoPromo.scope}). Veuillez la désactiver avant d'en créer une nouvelle.`,
      );
    }

    // 3. Validation si SCOPE = COLLECTION
    if (dto.scope === 'COLLECTION') {
      const collection = await this.prisma.collection.findUnique({
        where: { id: dto.collectionId, brandId: brand.id },
      });
      if (!collection)
        throw new NotFoundException(
          'Collection introuvable ou ne vous appartient pas',
        );
    }

    // 4. Générer un faux "code" unique interne car le schéma Prisma l'exige comme @unique
    const internalCode = `AUTO_${brand.id.substring(0, 5)}_${Date.now()}`;

    // 5. Création
    const promotion = await this.prisma.codePromo.create({
      data: {
        code: internalCode,
        description:
          dto.description ||
          `Promotion automatique sur ${dto.scope === 'BRAND' ? 'toute la marque' : 'la collection'}`,
        scope: dto.scope,
        collectionId: dto.scope === 'COLLECTION' ? dto.collectionId : null,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        maxDiscount: dto.maxDiscount,
        minOrderAmount: dto.minOrderAmount,
        startsAt: new Date(dto.startsAt),
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        isActive: true, // Active par défaut
        isAutoApplied: true, // ⚠️ Le plus important
        brandId: brand.id,
      },
    });

    this.logger.log(
      `Promotion auto créée: ${promotion.id} | Marque: ${brand.id} | Scope: ${dto.scope}`,
    );

    // NOTIFICATION ASYNC - Aux followers de la marque !
    this.notifyFollowers(brand.id, promotion, dto.scope);

    return promotion;
  }

  /**
   * ✅ 2. Créer un Code Promo classique (Saisi manuellement)
   */
  async createPromoCode(userId: string, dto: CreatePromoCodeDto) {
    const brand = await this.prisma.marque.findUnique({
      where: { userId },
    });
    if (!brand) throw new NotFoundException('Marque introuvable pour ce CEO');

    // Vérifier unicité du code (globale)
    const existing = await this.prisma.codePromo.findUnique({
      where: { code: dto.code.toUpperCase() },
    });
    if (existing) {
      throw new ConflictException(
        `Le code promo "${dto.code}" existe déjà. Veuillez en choisir un autre.`,
      );
    }

    // Validation si SCOPE = COLLECTION
    if (dto.scope === 'COLLECTION') {
      const collection = await this.prisma.collection.findUnique({
        where: { id: dto.collectionId, brandId: brand.id },
      });
      if (!collection)
        throw new NotFoundException(
          'Collection introuvable ou ne vous appartient pas',
        );
    }

    const promotion = await this.prisma.codePromo.create({
      data: {
        code: dto.code.toUpperCase(),
        description: dto.description,
        scope: dto.scope,
        collectionId: dto.scope === 'COLLECTION' ? dto.collectionId : null,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        maxDiscount: dto.maxDiscount,
        minOrderAmount: dto.minOrderAmount,
        usageLimit: dto.usageLimit,
        isSingleUse: dto.isSingleUse,
        startsAt: new Date(dto.startsAt),
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        isActive: true,
        isAutoApplied: false, // ⚠️ C'est un code manuel
        brandId: brand.id,
      },
    });

    return promotion;
  }

  /**
   * ✅ 3. Lister les promotions du CEO (Dashboard)
   */
  async getMyPromotions(userId: string, query: QueryPromotionsDto) {
    const brand = await this.prisma.marque.findUnique({
      where: { userId },
    });
    if (!brand) throw new NotFoundException('Marque introuvable');

    const where: Prisma.CodePromoWhereInput = { brandId: brand.id };

    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.isAutoApplied !== undefined)
      where.isAutoApplied = query.isAutoApplied;
    if (query.scope !== undefined) where.scope = query.scope;

    const skip = (query.page - 1) * query.limit;

    const [promotions, total] = await Promise.all([
      this.prisma.codePromo.findMany({
        where,
        include: { collection: { select: { name: true } } }, // Pour afficher le nom de la collection
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.codePromo.count({ where }),
    ]);

    return {
      data: promotions,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  /**
   * ✅ 4. Activer/Désactiver une promo
   */
  async togglePromotion(
    userId: string,
    promoId: string,
    { isActive }: TogglePromotionDto,
  ) {
    const brand = await this.prisma.marque.findUnique({ where: { userId } });
    if (!brand) throw new NotFoundException('Marque introuvable');

    const promo = await this.prisma.codePromo.findUnique({
      where: { id: promoId },
    });
    if (!promo || promo.brandId !== brand.id)
      throw new NotFoundException('Promotion introuvable');

    // Si on veut ACTIVER une promo AUTO, revérifier qu'il n'y en a pas déjà une
    if (isActive && promo.isAutoApplied) {
      const activeAutoPromo = await this.prisma.codePromo.findFirst({
        where: {
          brandId: brand.id,
          isAutoApplied: true,
          isActive: true,
          id: { not: promoId },
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });

      if (activeAutoPromo) {
        throw new ConflictException(
          `Impossible d'activer. Une autre promotion automatique est déjà en ligne.`,
        );
      }
    }

    return this.prisma.codePromo.update({
      where: { id: promoId },
      data: { isActive },
    });
  }

  /**
   * ✅ 4.5. Mettre à jour une promotion (Dashboard)
   */
  async updatePromotion(
    userId: string,
    promoId: string,
    dto: UpdatePromotionDto,
  ) {
    const brand = await this.prisma.marque.findUnique({ where: { userId } });
    if (!brand) throw new NotFoundException('Marque introuvable');

    const promo = await this.prisma.codePromo.findUnique({
      where: { id: promoId },
    });
    if (!promo || promo.brandId !== brand.id)
      throw new NotFoundException('Promotion introuvable');

    return this.prisma.codePromo.update({
      where: { id: promoId },
      data: {
        description: dto.description,
        discountValue: dto.discountValue,
        maxDiscount: dto.maxDiscount,
        minOrderAmount: dto.minOrderAmount,
        usageLimit: dto.usageLimit,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        expiresAt: dto.expiresAt === null ? null : dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        isActive: dto.isActive,
      },
    });
  }

  /**
   * ✅ 4.6. Supprimer une promotion (Dashboard)
   */
  async deletePromotion(userId: string, promoId: string) {
    const brand = await this.prisma.marque.findUnique({ where: { userId } });
    if (!brand) throw new NotFoundException('Marque introuvable');

    const promo = await this.prisma.codePromo.findUnique({
      where: { id: promoId },
    });
    if (!promo || promo.brandId !== brand.id)
      throw new NotFoundException('Promotion introuvable');

    return this.prisma.codePromo.delete({
      where: { id: promoId },
    });
  }

  /**
   * ✅ 5. Validation d'un code manuel par le client (Checkout)
   */
  async validatePromoCode(
    { code, subtotal, brandId }: ValidatePromoCodeDto,
    userId: string,
  ) {
    const promo = await this.prisma.codePromo.findUnique({
      where: { code: code.toUpperCase() },
      include: { collection: true },
    });

    if (
      !promo ||
      promo.brandId !== brandId ||
      promo.isAutoApplied ||
      !promo.isActive
    ) {
      throw new BadRequestException('Code promo invalide pour cette boutique.');
    }

    // Vérifier les dates
    const now = new Date();
    if (now < promo.startsAt)
      throw new BadRequestException(
        `Ce code sera valide à partir du ${promo.startsAt.toLocaleDateString()}`,
      );
    if (promo.expiresAt && now > promo.expiresAt)
      throw new BadRequestException('Ce code promo est expiré.');

    // Limites globales
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      throw new BadRequestException(
        "Nombre maximum d'utilisations atteint pour ce code.",
      );
    }

    // Usage unique
    if (promo.isSingleUse && userId) {
      // Regarder si l'utilisateur l'a déjà utilisé dans une de ses commandes
      // On cherche dans l'historique... Normalement on ferait un relation `codePromoId` sur `Commande`.
      // NOTE: Le schéma actuel ne lie pas Commande -> CodePromo.
      // On le garde dans la logique pour le concept, mais on bypass pour le moment ou on devrait chercher dans les events
    }

    // Montant minimum
    if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
      throw new BadRequestException(
        `Montant minimum de ${promo.minOrderAmount.toLocaleString('fr-FR')} CFA requis.`,
      );
    }

    // Calcul
    let discount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discount = Math.floor((subtotal * promo.discountValue) / 100);
      if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
    } else if (promo.discountType === 'FIXED_AMOUNT') {
      discount = promo.discountValue;
    }

    return {
      isValid: true,
      discount,
      promoCodeData: {
        id: promo.id,
        code: promo.code,
        scope: promo.scope,
        collectionId: promo.collectionId,
      },
    };
  }

  /**
   * ✅ 5.5. Validation Client Checkout
   */
  async validatePromoCodeClient(
    code: string,
    subtotal: number,
    brandId?: string,
    brandSlug?: string,
    userId?: string,
  ) {
    let resolvedBrandId = brandId;
    if (!resolvedBrandId && brandSlug) {
      const brand = await this.prisma.marque.findUnique({
        where: { slug: brandSlug },
      });
      if (brand) resolvedBrandId = brand.id;
    }
    if (!resolvedBrandId) throw new BadRequestException('Marque introuvable.');

    return this.validatePromoCode(
      { code, subtotal, brandId: resolvedBrandId },
      userId || '',
    );
  }

  /**
   * 📡 Envoi de notification asynchrone aux favoris de la marque
   */
  private notifyFollowers(brandId: string, promo: { discountValue: number; discountType: string; id: string }, scope: string) {
    this.prisma.favori
      .findMany({
        where: { brandId, type: 'BRAND' },
        select: { userId: true },
      })
      .then((favoris) => {
        const messages = favoris.map((f) => ({
          userId: f.userId,

          type: 'PROMOTION_LANCEE' as const,
          title: `🔥 Nouvelle promotion automatique !`,
          message: `Bénéficiez de ${promo.discountValue}${promo.discountType === 'PERCENTAGE' ? '%' : ' CFA'} de réduction sur ${scope === 'BRAND' ? 'toute la boutique' : 'la nouvelle collection'} !`,
          data: { brandId, promoId: promo.id },
        }));

        messages.forEach((msg) => {
          this.notificationsService
            .create(msg)
            .catch((e) => this.logger.error('Erreur norif promo', e));
        });
      })
      .catch((e) => this.logger.error('Erreur fetch favoris', e));
  }

  /**
   * ✅ 6. Appliquer visuellement les promotions automatiques sur une liste de produits
   * Utilisé par le catalogue public pour injecter `originalPrice` et `discount*`.
   */

  async applyAutomaticPromotionsToProducts(products: ProductWithDiscount[], brandId?: string) {
    if (!products || products.length === 0) return products;

    // Use provided brandId or extract from first product
    const effectiveBrandId =
      brandId || products[0].brandId || products[0].brand?.id;
    if (!effectiveBrandId) return products;

    // Fetch active automatic promotions for the brand
    const now = new Date();
    const activeAutoPromos = await this.prisma.codePromo.findMany({
      where: {
        brandId: effectiveBrandId,
        isAutoApplied: true,
        isActive: true,
        startsAt: { lte: now },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });

    if (activeAutoPromos.length === 0) return products;

    return products.map((product) => {
      let bestDiscount = 0;
      let appliedPromo: (typeof activeAutoPromos)[0] | null = null;

      // Supporting both Prisma model (collectionId) and Mapped DTO (collection.id)
      const productCollectionId =
        product.collectionId || product.collection?.id;

      for (const promo of activeAutoPromos) {
        if (
          promo.scope === 'COLLECTION' &&
          promo.collectionId !== productCollectionId
        ) {
          continue; // Not applicable
        }

        // Calculate discount
        let currentDiscount = 0;
        if (promo.discountType === 'PERCENTAGE') {
          currentDiscount = Math.floor(
            (product.price * promo.discountValue) / 100,
          );
          if (promo.maxDiscount)
            currentDiscount = Math.min(currentDiscount, promo.maxDiscount);
        } else if (promo.discountType === 'FIXED_AMOUNT') {
          currentDiscount = promo.discountValue;
        }

        // We take the promotion that gives the HIGHEST discount
        if (currentDiscount > bestDiscount && product.price > currentDiscount) {
          bestDiscount = currentDiscount;
          appliedPromo = promo;
        }
      }

      if (appliedPromo && bestDiscount > 0) {
        return {
          ...product,
          originalPrice: product.price,
          price: product.price - bestDiscount,
          discountType: appliedPromo.discountType,
          discountValue: appliedPromo.discountValue,
        };
      }

      return product;
    });
  }
}
