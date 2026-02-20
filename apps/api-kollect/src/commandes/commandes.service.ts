/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
 
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/ email.service';
import { MetricsService } from '../metrics/metrics.service';
import {
  CommandeItemDto,
  CreateCommandeDto,
  QueryCommandesDto,
} from './dto/create-commande.dto';
import { $Enums, CommandeStatus, Prisma } from '@prisma/client';


// Type pour les items de commande
interface CommandeItem {
  productId: string;
  variantId: string | null;
  productName: string;
  price: number;
  size: string | null;
  color: string | null;
  quantity: number;
}

// Type pour les résultats d'auto-annulation
export interface AutoCancelResult {
  commandeId: string;
  orderNumber: string;
  success: boolean;
  error?: string;
}

@Injectable()
export class CommandesService {
  private readonly logger = new Logger(CommandesService.name);

  /**
   * Annuler une commande (CEO ou client)
   */
  async annulerCommande(
    commandeId: string,
    userId: string,
    isCEO: boolean,
    notes?: string,
  ) {
    // Charger la commande avec les relations nécessaires
    const commande = await this.prisma.commande.findUnique({
      where: { id: commandeId },
      include: {
        items: true,
        client: true,
        brand: { include: { user: true } },
      },
    });

    if (!commande) {
      throw new NotFoundException('Commande introuvable');
    }

    // Vérifier les droits d'accès
    if (isCEO) {
      // User CEO : doit être propriétaire de la marque
      const brand = await this.prisma.marque.findUnique({
        where: { userId },
      });

      if (!brand || brand.id !== commande.brandId) {
        throw new ForbiddenException('Cette commande ne vous appartient pas');
      }
    } else {
      // Client : doit être propriétaire de la commande
      if (commande.clientId !== userId) {
        throw new ForbiddenException('Accès non autorisé');
      }
    }

    // Seules les commandes en attente peuvent être annulées pour l'instant
    if (commande.status !== CommandeStatus.EN_ATTENTE) {
      throw new BadRequestException(
        'Seules les commandes en attente peuvent être annulées',
      );
    }

    // Exécuter l'annulation dans une transaction : restauration du stock + update statut
    const updated = await this.prisma.$transaction(async (tx) => {
      // Restaurer le stock (variantes + produits simples)
      for (const item of commande.items) {
        if (item.variantId) {
          await tx.varianteProduit.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        } else if (item.productId) {
          await tx.produit.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Mettre à jour le statut
      const updatedCommande = await tx.commande.update({
        where: { id: commande.id },
        data: {
          status: CommandeStatus.ANNULEE,
          cancelledAt: new Date(),
          statusHistory: {
            create: {
              status: CommandeStatus.ANNULEE,
              details:
                notes ||
                (isCEO
                  ? 'Commande annulée par la boutique'
                  : 'Commande annulée par le client'),
              changedById: userId,
            },
          },
        },
      });

      return updatedCommande;
    });

    // Notifications non bloquantes
    try {
      // Notifier le client
      this.notificationsService.create({
        userId: commande.clientId,
        type: 'COMMANDE_ANNULEE',
        title: '❌ Commande annulée',
        message: `Ta commande #${commande.orderNumber} a été annulée`,
        data: { commandeId: commande.id },
        priority: 'MEDIUM',
      });

      // Notifier le CEO
      const brandUserId = commande.brand.userId;
      if (brandUserId) {
        this.notificationsService.create({
          userId: brandUserId,
          type: 'COMMANDE_ANNULEE',
          title: '❌ Commande annulée',
          message: `La commande #${commande.orderNumber} a été annulée`,
          data: { commandeId: commande.id },
          priority: 'LOW',
        });
      }
    } catch (error) {
      this.logger.error('Erreur lors de la notification COMMANDE_ANNULEE', error);
    }

    return updated;
  }
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private metricsService: MetricsService,
  ) {}

  /**
   * Créer une commande avec gestion atomique du stock
   */
  // commandes.service.ts

async createCommande(userId: string, dto: CreateCommandeDto) {
  if (!dto.items || dto.items.length === 0) {
    throw new BadRequestException(
      'La commande doit contenir au moins un article',
    );
  }

  const itemsByBrand = await this.groupItemsByBrand(dto.items);
  const brandIds = Object.keys(itemsByBrand);
  
  if (brandIds.length > 1) {
    throw new BadRequestException('Tous les articles doivent appartenir à la même marque');
  }
  
  const brandId = brandIds[0];
  const brandItems = itemsByBrand[brandId];
  
  try {
    const commande = await this.prisma.$transaction(
      async (tx) => {
        const items: CommandeItem[] = [];
        let subtotal = 0;

        for (const item of brandItems) {
          if (item.variantId) {
            const variant = await tx.varianteProduit.findUnique({
              where: { id: item.variantId },
              include: { product: { include: { brand: true } } },
            });
            if (!variant) throw new BadRequestException(`Variante ${item.variantId} introuvable`);
            if (!variant.isActive) throw new BadRequestException(`Le produit "${variant.product.name}" n'est plus disponible`);
            if (variant.stock < item.quantity) throw new BadRequestException(`Stock insuffisant pour "${variant.product.name}" (${variant.name}). Disponible: ${variant.stock}, Demandé: ${item.quantity}`);

            const updatedVariant = await tx.varianteProduit.update({
              where: { id: item.variantId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
            if (!updatedVariant) throw new BadRequestException(`Impossible de réserver le stock pour "${variant.product.name}". Veuillez réessayer.`);

            const itemPrice = variant.price || variant.product.price;
            subtotal += itemPrice * item.quantity;
            items.push({
              productId: variant.productId,
              variantId: variant.id,
              productName: variant.product.name,
              price: itemPrice,
              size: variant.attributes?.['size'] ?? null,
              color: variant.attributes?.['color'] ?? null,
              quantity: item.quantity,
            });
          } else if (item.productId) {
            const product = await tx.produit.findUnique({ where: { id: item.productId } });
            if (!product || product.isDeleted) throw new BadRequestException(`Produit ${item.productId} introuvable`);
            if (!product.isVisible) throw new BadRequestException(`Le produit "${product.name}" n'est pas disponible`);
            if (product.stock < item.quantity) throw new BadRequestException(`Stock insuffisant pour "${product.name}". Disponible: ${product.stock}, Demandé: ${item.quantity}`);

            const updatedProduct = await tx.produit.update({
              where: { id: item.productId, stock: { gte: item.quantity } as any },
              data: { stock: { decrement: item.quantity } },
            });
            if (!updatedProduct) throw new BadRequestException(`Impossible de réserver le stock pour "${product.name}". Veuillez réessayer.`);

            subtotal += product.price * item.quantity;
            items.push({
              productId: product.id,
              variantId: null,
              productName: product.name,
              price: product.price,
              // Si le front envoie déjà une taille/couleur, on les conserve
              size: (item as any).size ?? null,
              color: (item as any).color ?? null,
              quantity: item.quantity,
            });
          } else {
            throw new BadRequestException('Chaque item doit contenir productId ou variantId');
          }
        }

        // ✅ Calculs en FCFA
        const shippingFee = 0; // MVP: gratuit
        const total = subtotal + shippingFee;

        const orderNumber = await this.generateOrderNumber(tx);

        const commande = await tx.commande.create({
          data: {
            orderNumber,
            clientId: userId,
            brandId,
            shippingAddress: dto.adresseLivraison.adresse,
            shippingCity: dto.adresseLivraison.ville,
            shippingPhone: dto.adresseLivraison.telephone,
            subtotal,           // ✅ En FCFA normal
            shippingFee,        // ✅ En FCFA normal
            discount: 0,
            total,              // ✅ En FCFA normal
            status: 'EN_ATTENTE',
            items: {
              create: items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId ?? null,
                productName: item.productName,
                price: item.price,      // ✅ En FCFA normal
                quantity: item.quantity,
                size: item.size,
                color: item.color,
              })),
            },
            statusHistory: {
              create: {
                status: 'EN_ATTENTE',
                details: 'Commande créée - Paiement à la livraison',
                changedById: userId,
              },
            },
          },
          include: {
            client: true,
            brand: true,
            items: true,
          },
        });

        this.logger.log(`Commande ${commande.orderNumber} créée pour l'utilisateur ${userId}`);
        this.metricsService.incrementOrdersCreated(commande.status);
        return commande;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10000,
      },
    );

    const notificationCommande = {
      ...commande,
      client: commande.client,
      brandId: commande.brandId,
      items: commande.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        // Peut être null si tu n'utilises pas de variantes
        variantId: item.variantId ?? null,
        productName: item.productName || 'Produit sans nom',
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      brand: {
        id: commande.brand.id,
        name: commande.brand.name,
      },
    };

    // Emails transactionnels
    try {
      const clientEmail = (commande.client as any)?.email as string | undefined;
      const clientName = `${(commande.client as any)?.firstName || ''} ${(commande.client as any)?.lastName || ''}`.trim() || 'Client';
      const brandName = commande.brand?.name ?? 'Marque';
      const totalFormatted = `${commande.total.toLocaleString('fr-FR')} FCFA`;
      const itemsHtml = this.buildItemsHtml(commande.items);

      if (clientEmail) {
        await this.emailService.sendClientConfirmationCommande(clientEmail, {
          clientName,
          brandName,
          orderNumber: commande.orderNumber,
          orderDate: commande.createdAt.toLocaleDateString('fr-FR'),
          totalAmount: totalFormatted,
          itemsHtml,
        });
      }

      const brand = await this.prisma.marque.findUnique({
        where: { id: commande.brandId },
        include: { user: true },
      });

      const brandEmail = brand?.user?.email;
      const dashboardBase = process.env.KOLLECT_DASHBOARD_URL || 'https://kollect.sn/backoffice';

      if (brandEmail) {
        await this.emailService.sendMarqueNouvelleCommandeCEO(brandEmail, {
          brandName,
          clientName,
          orderNumber: commande.orderNumber,
          orderDate: commande.createdAt.toLocaleDateString('fr-FR'),
          totalAmount: totalFormatted,
          itemsHtml,
          backofficeUrl: `${dashboardBase}/commandes/${commande.id}`,
        });
      }
    } catch (e) {
      // On log mais on ne bloque pas la création de commande si l'email échoue
       
      console.error('Erreur lors de lenvoi des emails de commande:', e);
    }

    await this.notifyNewCommande(notificationCommande);

    return commande;
  } catch (error) {
    throw error;
  }
}

  // Générer les lignes HTML pour les articles de commande (utilisé par les emails)
  private buildItemsHtml(items: { productName: string; quantity: number; price: number }[]): string {
    return items
      .map((item) => {
        const priceFormatted = `${item.price.toLocaleString('fr-FR')} FCFA`;
        return `
        <tr>
          <td>${item.productName}</td>
          <td>${item.quantity}</td>
          <td>${priceFormatted}</td>
        </tr>`;
      })
      .join('');
  }

  /**
   * Grouper les items par boutique
   */
  private async groupItemsByBrand(
    items: CommandeItemDto[],
  ): Promise<Record<string, CommandeItemDto[]>> {
    const itemsByBrand: Record<string, CommandeItemDto[]> = {};

    // Charger toutes les variantes nécessaires
    const variantIds = items.filter(i => i.variantId).map((i) => i.variantId as string);
    const variants = variantIds.length > 0 ? await this.prisma.varianteProduit.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    }) : [];

    // Charger tous les produits nécessaires
    const productIds = items.filter(i => !i.variantId && i.productId).map(i => i.productId as string);
    const products = productIds.length > 0 ? await this.prisma.produit.findMany({
      where: { id: { in: productIds } },
      select: { id: true, brandId: true },
    }) : [];

    for (const item of items) {
      let brandId: string | undefined;
      if (item.variantId) {
        const variant = variants.find((v) => v.id === item.variantId);
        if (!variant) throw new BadRequestException(`Variante ${item.variantId} introuvable`);
        brandId = variant.product.brandId;
      } else if (item.productId) {
        const product = products.find(p => p.id === item.productId);
        if (!product) throw new BadRequestException(`Produit ${item.productId} introuvable`);
        brandId = product.brandId;
      }
      if (!brandId) throw new BadRequestException('Article invalide');
      if (!itemsByBrand[brandId]) itemsByBrand[brandId] = [];
      itemsByBrand[brandId].push(item);
    }

    return itemsByBrand;
  }

  /**
   * Générer un numéro de commande unique
   */
  private async generateOrderNumber(tx: any): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Compter les commandes du mois
    const count = await tx.commande.count({
      where: {
        createdAt: {
          gte: new Date(year, date.getMonth(), 1),
          lt: new Date(year, date.getMonth() + 1, 1),
        },
      },
    });

    const sequence = String(count + 1).padStart(6, '0');
    return `CMD-${year}${month}-${sequence}`;
  }

  /**
   * Appliquer un code promo
   */
  private async applyPromoCode(
    tx: any,
    code: string,
    subtotal: number,
  ): Promise<number> {
    const promo = await tx.codePromo.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo || !promo.isActive) {
      throw new BadRequestException('Code promo invalide');
    }

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      throw new BadRequestException('Code promo expiré');
    }

    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      throw new BadRequestException('Code promo épuisé');
    }

    if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
      throw new BadRequestException(
        `Montant minimum de ${promo.minOrderAmount / 100} FCFA requis pour ce code promo`,
      );
    }

    let discount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discount = Math.floor((subtotal * promo.discountValue) / 100);
      if (promo.maxDiscount) {
        discount = Math.min(discount, promo.maxDiscount);
      }
    } else if (promo.discountType === 'FIXED_AMOUNT') {
      discount = promo.discountValue;
    }

    // Incrémenter le compteur d'utilisation
    await tx.codePromo.update({
      where: { id: promo.id },
      data: { usageCount: { increment: 1 } },
    });

    return discount;
  }

  /**
   * Récupérer les commandes du client
   */
  async getCommandesClient(userId: string, query: QueryCommandesDto) {
    const { status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { clientId: userId };
    if (status) {
      where.status = status as CommandeStatus;
    }

    const [commandes, total] = await Promise.all([
      this.prisma.commande.findMany({
        where,
        include: {
          items: {
            include: {
              product: { select: { name: true, images: true } },
            },
          },
          brand: { select: { name: true, logo: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.commande.count({ where }),
    ]);

    return {
      data: commandes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupérer les commandes de la boutique (CEO)
   */
 // commandes.service.ts

async getCommandesBoutique(userId: string, query: QueryCommandesDto) {
  const brand = await this.prisma.marque.findUnique({
    where: { userId },
  });

  if (!brand) {
    throw new ForbiddenException("Vous n'avez pas de boutique");
  }

  const { status, page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const where: any = { brandId: brand.id };
  if (status) {
    where.status = status as CommandeStatus;
  }

  const [commandes, total] = await Promise.all([
    this.prisma.commande.findMany({
      where,
      include: {
        items: {
          include: {
            product: { select: { name: true, images: true } },
          },
        },
        client: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    }),
    this.prisma.commande.count({ where }),
  ]);

  // ✅ Transformation pour le frontend
  // On laisse le statut en enum brut (EN_ATTENTE / CONFIRMEE / ANNULEE)
  // le mobile se charge de le mapper via mapApiStatusToFrontend
  const transformedCommandes = commandes.map(cmd => ({
    id: cmd.id,
    orderNumber: cmd.orderNumber,
    customer: `${cmd.client.firstName || ''} ${cmd.client.lastName || ''}`.trim() || 'Client',
    amount: cmd.total, // ✅ Déjà en FCFA normal
    status: cmd.status,
    date: cmd.createdAt.toISOString(),
    itemsCount: cmd.items.reduce((sum, item) => sum + item.quantity, 0),
    phone: cmd.shippingPhone,
    address: `${cmd.shippingAddress}, ${cmd.shippingCity}`,
  }));

  return {
    data: transformedCommandes,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

  /**
   * Statistiques des commandes de la boutique (CEO)
   */
  async getCommandeStats(userId: string) {
    const brand = await this.prisma.marque.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!brand) {
      throw new ForbiddenException("Vous n'avez pas de boutique");
    }

    const [total, groupedByStatus, revenueAgg] = await Promise.all([
      this.prisma.commande.count({ where: { brandId: brand.id } }),
      this.prisma.commande.groupBy({
        by: ['status'],
        where: { brandId: brand.id },
        _count: { _all: true },
      }),
      this.prisma.commande.aggregate({
        where: { brandId: brand.id, status: CommandeStatus.CONFIRMEE },
        _sum: { total: true },
      }),
    ]);

    const counts = groupedByStatus.reduce(
      (acc, row) => {
        if (row.status === CommandeStatus.EN_ATTENTE) acc.enAttente = row._count._all;
        if (row.status === CommandeStatus.CONFIRMEE) acc.confirmees = row._count._all;
        if (row.status === CommandeStatus.ANNULEE) acc.annulees = row._count._all;
        return acc;
      },
      { enAttente: 0, confirmees: 0, annulees: 0 },
    );

    return {
      total,
      enAttente: counts.enAttente,
      confirmees: counts.confirmees,
      annulees: counts.annulees,
      revenueTotal: revenueAgg._sum.total ?? 0,
    };
  }

  /**
   * Récupérer une commande par ID
   */
  async getCommandeById(commandeId: string, userId: string, isCEO: boolean) {
    const commande = await this.prisma.commande.findUnique({
      where: { id: commandeId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        brand: true,
        client: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!commande) {
      throw new NotFoundException('Commande introuvable');
    }

    // Vérifier les droits d'accès
    if (isCEO) {
      const brand = await this.prisma.marque.findUnique({
        where: { userId },
      });
      if (commande.brandId !== brand?.id) {
        throw new ForbiddenException('Accès non autorisé');
      }
    } else {
      if (commande.clientId !== userId) {
        throw new ForbiddenException('Accès non autorisé');
      }
    }

    return commande;
  }

  /**
   * Confirmer une commande (CEO uniquement)
   */
  async confirmerCommande(commandeId: string, userId: string, notes?: string) {
    // Vérifier que l'utilisateur est CEO et propriétaire de la boutique
    const brand = await this.prisma.marque.findUnique({
      where: { userId },
    });

    if (!brand) {
      throw new ForbiddenException("Vous n'avez pas de boutique");
    }

    const commande = await this.prisma.commande.findUnique({
      where: { id: commandeId },
      include: { client: true },
    });

    if (!commande) {
      throw new NotFoundException('Commande introuvable');
    }

    if (commande.brandId !== brand.id) {
      throw new ForbiddenException('Cette commande ne vous appartient pas');
    }

    // Vérifier que la commande est bien en attente
    if (commande.status !== 'EN_ATTENTE') {
      throw new BadRequestException('Seules les commandes en attente peuvent être confirmées');
    }

    // Mettre à jour le statut
    const updatedCommande = await this.prisma.commande.update({
      where: { id: commandeId },
      data: {
        status: CommandeStatus.CONFIRMEE,
        confirmedAt: new Date(),
        statusHistory: {
          create: {
            status: CommandeStatus.CONFIRMEE,
            details: notes || 'Commande confirmée par la boutique',
            changedById: userId,
          },
        },
      },
      include: {
        items: {
          include: { product: true },
        },
        brand: true,
        client: true,
      },
    });

    // Notifier le client (push in-app) - ne doit pas casser la confirmation si non implémenté
    try {
      this.notificationsService.create({
        userId: commande.clientId,
        type: 'COMMANDE_CONFIRMEE',
        title: '✅ Commande confirmée',
        message: `Ta commande #${commande.orderNumber} est confirmée ! Livraison en cours`,
        data: { commandeId },
        priority: 'MEDIUM',
      });
    } catch (error) {
      this.logger.error('Erreur lors de la notification COMMANDE_CONFIRMEE', error);
    }

    // Email de confirmation détaillé au client
    try {
      const clientEmail = (commande.client as any)?.email as string | undefined;
      const clientName = `${(commande.client as any)?.firstName || ''} ${(commande.client as any)?.lastName || ''}`.trim() || 'Client';
      const brandName = updatedCommande.brand?.name ?? 'Marque';
      const totalFormatted = `${updatedCommande.total.toLocaleString('fr-FR')} FCFA`;
      const itemsHtml = this.buildItemsHtml(
        updatedCommande.items.map((it) => ({
          productName: it.product?.name || it.productName || 'Produit',
          quantity: it.quantity,
          price: it.price,
        })),
      );

      if (clientEmail) {
        await this.emailService.sendClientCommandeConfirmee(clientEmail, {
          clientName,
          brandName,
          orderNumber: updatedCommande.orderNumber,
          orderDate: updatedCommande.confirmedAt?.toLocaleDateString('fr-FR') || new Date().toLocaleDateString('fr-FR'),
          totalAmount: totalFormatted,
          estimatedDelay: '2 heures',
          itemsHtml,
        });
      }
    } catch (e) {
      // on log, on ne casse pas la confirmation si l'email échoue
       
      console.error('Erreur lors de lenvoi de lemail de commande confirmée:', e);
    }

    return updatedCommande;
  }

  /**
   * Auto-annulation des commandes après 48h
   */
  async autoAnnulerCommandesExpirees() {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() - 48);

    const commandesExpirees = await this.prisma.commande.findMany({
      where: {
        status: CommandeStatus.EN_ATTENTE,
        createdAt: { lt: expirationDate },
      },
      include: {
        items: true,
        client: true,
        brand: { include: { user: true } },
      },
    });

    const results: AutoCancelResult[] = [];

    for (const commande of commandesExpirees) {
      try {
        await this.prisma.$transaction(async (tx) => {
          // Restaurer le stock (variantes + produits simples)
          for (const item of commande.items) {
            if (item.variantId) {
              await tx.varianteProduit.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });
            } else if (item.productId) {
              await tx.produit.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });
            }
          }

          // Annuler la commande
          await tx.commande.update({
            where: { id: commande.id },
            data: {
              status: CommandeStatus.ANNULEE,
              cancelledAt: new Date(),
              statusHistory: {
                create: {
                  status: CommandeStatus.ANNULEE,
                  details: 'Annulée automatiquement (délai de 48h dépassé)',
                },
              },
            },
          });
        });

        // Notifier le client et le CEO (non bloquant si NotificationsService n'est pas implémenté)
        try {
          this.notificationsService.create({
            userId: commande.clientId,
            type: 'COMMANDE_ANNULEE',
            title: '❌ Commande annulée automatiquement',
            message: `Ta commande #${commande.orderNumber} a été annulée (délai dépassé)`,
            data: { commandeId: commande.id },
            priority: 'MEDIUM',
          });

          this.notificationsService.create({
            userId: commande.brand.userId,
            type: 'COMMANDE_ANNULEE',
            title: '⏰ Commande expirée',
            message: `La commande #${commande.orderNumber} a été annulée automatiquement`,
            data: { commandeId: commande.id },
            priority: 'LOW',
          });
        } catch (error) {
          this.logger.error('Erreur lors de la notification COMMANDE_ANNULEE', error);
        }

        results.push({
          commandeId: commande.id,
          orderNumber: commande.orderNumber,
          success: true,
        });
      } catch (error: any) {
        results.push({
          commandeId: commande.id,
          orderNumber: commande.orderNumber,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      total: commandesExpirees.length,
      annulees: results.filter((r) => r.success).length,
      echecs: results.filter((r) => !r.success).length,
      details: results,
    };
  }

  /**
   * Notifier le CEO d'une nouvelle commande
   */
  private async notifyNewCommande(commande: {
  client: any;
  id: string;
  orderNumber: string;
  brandId: string;
  status: CommandeStatus;
  total: number;
  items: Array<{
    id: string;
    productId: string;
    variantId: string | null;
    productName: string;
    price: number;
    quantity: number;
    size: string | null;
    color: string | null;
  }>;
  brand: {
    id: string;
    name: string;
  };
}) {
  try {
    const brand = await this.prisma.marque.findUnique({
      where: { id: commande.brandId },
      include: { user: true },
    });

    if (!brand) return;

    // ✅ Format en FCFA normal (pas besoin de diviser par 100)
    const montantFormatted = commande.total.toLocaleString('fr-FR');
    const clientName =
      `${commande.client?.firstName || ''} ${commande.client?.lastName || ''}`.trim() ||
      'Client';

     this.notificationsService.create({
      userId: brand.userId,
      type: 'NOUVELLE_COMMANDE',
      title: '💰 Nouvelle commande',
      message: `Nouvelle commande de ${clientName} - ${montantFormatted} FCFA`,
      data: {
        commandeId: commande.id,
      },
      priority: 'HIGH',
    });
  } catch (error) {
    // On log mais on ne casse pas la création de commande si la notif échoue
    this.logger.error('Erreur lors de la notification de nouvelle commande', error);
  }
  }
}
