import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MetricsService } from '../metrics/metrics.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  DROPS_QUEUE,
  ORDERS_QUEUE,
  NOTIFICATIONS_QUEUE,
  ANALYTICS_QUEUE,
  DEADLETTER_QUEUE,
} from '../queues/constants/queue.constants';
import {
  GetUsersDto,
  UpdateUserRoleDto,
  GetOrdersDto,
  GetReviewsDto,
  ReviewModerationDto,
  BrandVerificationDto,
  GetGlobalStatsDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly metricsService: MetricsService,
    @InjectQueue(DROPS_QUEUE) private readonly dropsQueue: Queue,
    @InjectQueue(ORDERS_QUEUE) private readonly ordersQueue: Queue,
    @InjectQueue(NOTIFICATIONS_QUEUE) private readonly notificationsQueue: Queue,
    @InjectQueue(ANALYTICS_QUEUE) private readonly analyticsQueue: Queue,
    @InjectQueue(DEADLETTER_QUEUE) private readonly deadletterQueue: Queue,
  ) {}

  // ========================================
  // STATISTIQUES GLOBALES
  // ========================================

  async getGlobalStats(query: GetGlobalStatsDto) {
    const { period = '30days' } = query;
    
    // Calculer les dates selon la période
    const now = new Date();
    const periodMap = {
      '7days': 7,
      '30days': 30,
      '90days': 90,
    };
    const daysAgo = periodMap[period];
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      totalBrands,
      verifiedBrands,
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      totalReviews,
      pendingReviews,
    ] = await Promise.all([
      this.prisma.utilisateur.count(),
      this.prisma.utilisateur.count({
        where: {
          lastLoginAt: { gte: startDate },
        },
      }),
      this.prisma.marque.count(),
      this.prisma.marque.count({
        where: { isVerified: true },
      }),
      this.prisma.commande.count({
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.commande.aggregate({
        where: { 
          createdAt: { gte: startDate },
          status: { not: 'ANNULEE' },
        },
        _sum: { total: true },
      }),
      this.prisma.commande.count({
        where: { 
          status: 'EN_ATTENTE',
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.commande.count({
        where: { 
          status: 'LIVREE',
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.review.count({
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.review.count({
        where: { 
          isApproved: false,
          createdAt: { gte: startDate },
        },
      }),
    ]);

    return {
      period,
      users: {
        total: totalUsers,
        active: activeUsers,
        growth: 0, // TODO: Calculer par rapport à période précédente
      },
      brands: {
        total: totalBrands,
        verified: verifiedBrands,
        pending: totalBrands - verifiedBrands,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        delivered: deliveredOrders,
        revenue: totalRevenue._sum.total || 0,
      },
      reviews: {
        total: totalReviews,
        pending: pendingReviews,
        approved: totalReviews - pendingReviews,
      },
    };
  }

  async getAnalytics(period: '7days' | '30days' | '90days') {
    const now = new Date();
    const periodMap = {
      '7days': 7,
      '30days': 30,
      '90days': 90,
    };
    const daysAgo = periodMap[period];
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Analytics par jour
    const dailyStats = await this.prisma.commande.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: { id: true },
      _sum: { total: true },
    });

    // Top brands
    const topBrands = await this.prisma.commande.groupBy({
      by: ['brandId'],
      where: {
        createdAt: { gte: startDate },
        status: { not: 'ANNULEE' },
      },
      _count: { id: true },
      _sum: { total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 10,
    });

    // Récupérer les noms des marques
    const brandIds = topBrands.map(b => b.brandId);
    const brands = await this.prisma.marque.findMany({
      where: { id: { in: brandIds } },
      select: { id: true, name: true },
    });

    const brandMap = brands.reduce((acc, brand) => {
      acc[brand.id] = brand.name;
      return acc;
    }, {});

    return {
      dailyStats: dailyStats.map(stat => ({
        date: stat.createdAt,
        orders: stat._count.id,
        revenue: stat._sum.total || 0,
      })),
      topBrands: topBrands.map(stat => ({
        brandId: stat.brandId,
        brandName: brandMap[stat.brandId] || 'Unknown',
        orders: stat._count.id,
        revenue: stat._sum.total || 0,
      })),
    };
  }

  // ========================================
  // GESTION DES UTILISATEURS
  // ========================================

  async getUsers(query: GetUsersDto) {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtres
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where[role] = true;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [users, total] = await Promise.all([
      this.prisma.utilisateur.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              isVerified: true,
            },
          },
        },
      }),
      this.prisma.utilisateur.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id },
      include: {
        brand: {
          include: {
            commandes: {
              take: 10,
              orderBy: { createdAt: 'desc' },
              include: {
                client: true, // Pour afficher qui a acheté
              }
            },
            _count: {
              select: {
                products: true,
                commandes: true,
                favoris: true,
              }
            }
          }
        },
        commandes: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            product: true,
          },
        },
      },
    });

    if (!user) return null;

    const fullUser = user as any;
    let brandWithRevenue = fullUser.brand ? { ...fullUser.brand, revenue: 0, receivedOrders: fullUser.brand.commandes || [] } : null;
    
    if (fullUser.isCEO && fullUser.brand) {
      const revenueData = await this.prisma.commande.aggregate({
        where: {
          brandId: fullUser.brand.id,
          status: { not: 'ANNULEE' },
        },
        _sum: { total: true },
      });
      brandWithRevenue = {
        ...fullUser.brand,
        revenue: revenueData._sum.total || 0,
        receivedOrders: fullUser.brand.commandes || [],
      };
    }

    return {
      ...user,
      brand: brandWithRevenue,
    };
  }

  async updateUserRole(id: string, updateRoleDto: UpdateUserRoleDto, adminId: string) {
    const { isClient, isCEO, isAdmin } = updateRoleDto;

    const user = await this.prisma.utilisateur.update({
      where: { id },
      data: {
        isClient,
        isCEO,
        isAdmin,
        updatedAt: new Date(),
      },
    });

    // Log l'action
    await this.logAdminAction('UPDATE_USER_ROLE', adminId, {
      targetUserId: id,
      newRoles: { isClient, isCEO, isAdmin },
    });

    return user;
  }

  async deactivateUser(id: string, adminId: string) {
    const user = await this.prisma.utilisateur.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    await this.logAdminAction('DEACTIVATE_USER', adminId, { targetUserId: id });

    return user;
  }

  async reactivateUser(id: string, adminId: string) {
    const user = await this.prisma.utilisateur.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    await this.logAdminAction('REACTIVATE_USER', adminId, { targetUserId: id });

    return user;
  }

  // ========================================
  // GESTION DES COMMANDES GLOBALES
  // ========================================

  async getAllOrders(query: GetOrdersDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      paymentStatus,
      brandId,
      period = '30days',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    // Période
    if (period !== 'all') {
      const periodMap = {
        '7days': 7,
        '30days': 30,
        '90days': 90,
      };
      const daysAgo = periodMap[period];
      const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: startDate };
    }

    // Filtres
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { client: { email: { contains: search, mode: 'insensitive' } } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (brandId) where.brandId = brandId;

    const [orders, total] = await Promise.all([
      this.prisma.commande.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          client: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      this.prisma.commande.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(id: string) {
    return await this.prisma.commande.findUnique({
      where: { id },
      include: {
        client: true,
        brand: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        statusHistory: {
          include: {
            changedBy: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async confirmOrder(id: string, notes?: string, adminId?: string) {
    const order = await this.prisma.commande.update({
      where: { id },
      data: {
        status: 'CONFIRMEE',
        confirmedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Ajouter à l'historique
    await this.prisma.historiqueStatutCommande.create({
      data: {
        commandeId: id,
        status: 'CONFIRMEE',
        details: notes || 'Commande confirmée par l\'administrateur',
        changedById: adminId,
      },
    });

    // Notifier le client
    await this.notifications.sendPushNotification({
      userId: order.clientId,
      title: 'Commande confirmée',
      body: `Votre commande ${order.orderNumber} a été confirmée et est en préparation.`,
      data: { commandeId: id },
      type: 'COMMANDE_CONFIRMEE',
    });

    if (adminId) {
      await this.logAdminAction('CONFIRM_ORDER', adminId, { orderId: id, notes });
    }

    return order;
  }

  async cancelOrder(id: string, reason: string, adminId: string) {
    const order = await this.prisma.commande.update({
      where: { id },
      data: {
        status: 'ANNULEE',
        cancelledAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Ajouter à l'historique
    await this.prisma.historiqueStatutCommande.create({
      data: {
        commandeId: id,
        status: 'ANNULEE',
        details: reason,
        changedById: adminId,
      },
    });

    // Notifier le client et le vendeur
    await Promise.all([
      this.notifications.sendPushNotification({
        userId: order.clientId,
        title: 'Commande annulée',
        body: `Votre commande ${order.orderNumber} a été annulée. Raison: ${reason}`,
        data: { commandeId: id },
        type: 'COMMANDE_ANNULEE',
      }),
      this.notifications.sendPushNotification({
        userId: order.brandId,
        title: 'Commande annulée',
        body: `La commande ${order.orderNumber} a été annulée par l'administrateur. Raison: ${reason}`,
        data: { commandeId: id },
        type: 'COMMANDE_ANNULEE',
      }),
    ]);

    await this.logAdminAction('CANCEL_ORDER', adminId, { orderId: id, reason });

    return order;
  }

  // ========================================
  // MODÉRATION DES AVIS
  // ========================================

  async getReviews(query: GetReviewsDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      rating,
      verified,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { comment: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status === 'pending') {
      where.isApproved = false;
    } else if (status === 'approved') {
      where.isApproved = true;
    }

    if (rating) where.rating = rating;
    if (verified === 'true') where.isVerified = true;
    if (verified === 'false') where.isVerified = false;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async moderateReview(id: string, action: 'approved' | 'rejected', adminId: string, reason?: string) {
    const review = await this.prisma.review.update({
      where: { id },
      data: {
        isApproved: action === 'approved',
        updatedAt: new Date(),
      },
    });

    await this.logAdminAction('MODERATE_REVIEW', adminId, {
      reviewId: id,
      action,
      reason,
    });

    return review;
  }

  async deleteReview(id: string, adminId: string) {
    await this.prisma.review.delete({
      where: { id },
    });

    await this.logAdminAction('DELETE_REVIEW', adminId, { reviewId: id });
  }

  // ========================================
  // GESTION DES MARQUES
  // ========================================

  async getBrands(query: GetUsersDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status === 'active') where.isActive = true;
    else if (status === 'inactive') where.isActive = false;

    // Note: Le paramètre verification sera géré via un DTO séparé si nécessaire
    // Pour l'instant, on retourne toutes les marques selon le statut actif/inactif

    const isRevenueSort = sortBy === 'revenue';
    const dbSortBy = isRevenueSort ? 'createdAt' : sortBy;

    const [brands, total] = await Promise.all([
      this.prisma.marque.findMany({
        where,
        ...(!isRevenueSort && { skip, take: limit }),
        orderBy: { [dbSortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          _count: {
            select: {
              products: true,
              commandes: true,
              favoris: true,
            },
          },
        },
      }),
      this.prisma.marque.count({ where }),
    ]);

    // Calculer les revenus pour chaque marque
    const brandIds = brands.map(b => b.id);
    const revenues = await this.prisma.commande.groupBy({
      by: ['brandId'],
      where: {
        brandId: { in: brandIds },
        status: { not: 'ANNULEE' },
      },
      _sum: { total: true },
    });

    const revenueMap = revenues.reduce((acc, rev) => {
      acc[rev.brandId] = rev._sum.total || 0;
      return acc;
    }, {});

    const brandsWithRevenue = brands.map(brand => ({
      ...brand,
      revenue: revenueMap[brand.id] || 0,
      orderCount: brand._count?.commandes || 0,
    }));

    if (isRevenueSort) {
      brandsWithRevenue.sort((a, b) => sortOrder === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue);
    }

    const finalBrands = isRevenueSort ? brandsWithRevenue.slice(skip, skip + limit) : brandsWithRevenue;

    return {
      brands: finalBrands,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTopProducts(limit: number = 5) {
    const products = await this.prisma.produit.findMany({
      where: { isDeleted: false },
      orderBy: { viewCount: 'desc' },
      take: limit,
      include: {
        brand: {
          select: { name: true }
        }
      }
    });

    return products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      viewCount: p.viewCount,
      stock: p.stock,
      brandName: p.brand.name
    }));
  }

  async verifyBrand(id: string, body: BrandVerificationDto, adminId: string) {
    const { verified, notes } = body;

    const brand = await this.prisma.marque.update({
      where: { id },
      data: {
        isVerified: verified,
        updatedAt: new Date(),
      },
    });

    // Notifier le CEO
    await this.notifications.sendPushNotification({
      userId: brand.userId,
      title: verified ? 'Marque vérifiée' : 'Vérification refusée',
      body: verified 
        ? `Félicitations ! Votre marque ${brand.name} a été vérifiée par l'équipe Kollect.`
        : `Votre demande de vérification pour la marque ${brand.name} a été refusée. ${notes ? `Raison: ${notes}` : ''}`,
      data: { brandId: id },
      type: verified ? 'MARQUE_VERIFIEE' : 'MARQUE_NON_VERIFIEE',
    });

    await this.logAdminAction('VERIFY_BRAND', adminId, {
      brandId: id,
      verified,
      notes,
    });

    return brand;
  }

  async unverifyBrand(id: string, reason: string, adminId: string) {
    const brand = await this.prisma.marque.update({
      where: { id },
      data: {
        isVerified: false,
        updatedAt: new Date(),
      },
    });

    // Notifier le CEO
    await this.notifications.sendPushNotification({
      userId: brand.userId,
      title: 'Vérification révoquée',
      body: `La vérification de votre marque ${brand.name} a été révoquée. Raison: ${reason}`,
      data: { brandId: id },
      type: 'MARQUE_NON_VERIFIEE',
    });

    await this.logAdminAction('UNVERIFY_BRAND', adminId, {
      brandId: id,
      reason,
    });

    return brand;
  }

  async deleteBrand(id: string, adminId: string) {
    // TODO: Implémenter la suppression en cascade avec toutes les dépendances
    await this.prisma.marque.delete({
      where: { id },
    });

    await this.logAdminAction('DELETE_BRAND', adminId, { brandId: id });
  }

  // ============================================
  // UTILITAIRE - CRÉATION ADMIN
  // ============================================

  /**
   * 🔧 Créer un utilisateur admin (endpoint utilitaire)
   */
  async createAdminSimple(body: {
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
  }) {
    const { email, firstName, lastName, password } = body;

    try {
      console.log("🔍 Vérification si l'utilisateur existe déjà...");

      // Vérifier si l'utilisateur existe déjà dans la base de données
      const existingUser = await this.prisma.utilisateur.findUnique({
        where: { email },
      });

      if (existingUser) {
        console.log('⚠️  Un utilisateur avec cet email existe déjà');
        
        // Mettre à jour les rôles si nécessaire
        if (!existingUser.isAdmin) {
          await this.prisma.utilisateur.update({
            where: { id: existingUser.id },
            data: {
              isAdmin: true,
              isCEO: false,
              isClient: true,
              updatedAt: new Date(),
            },
          });
          console.log('✅ Rôles mis à jour: utilisateur est maintenant admin');
        } else {
          console.log("✅ L'utilisateur est déjà admin");
        }

        return {
          success: true,
          message: 'Utilisateur admin mis à jour avec succès',
          user: {
            id: existingUser.id,
            email: existingUser.email,
            isAdmin: existingUser.isAdmin,
          },
        };
      }

      // Créer l'utilisateur dans la base de données (sans Supabase pour le moment)
      const dbUser = await this.prisma.utilisateur.create({
        data: {
          email,
          firstName,
          lastName,
          isAdmin: true,
          isCEO: false,
          isClient: true,
          has_seen_creator_prompt: true,
        },
      });

      console.log('🎉 Utilisateur admin créé avec succès!');

      return {
        success: true,
        message: 'Utilisateur admin créé avec succès',
        user: {
          id: dbUser.id,
          email: dbUser.email,
          isAdmin: dbUser.isAdmin,
        },
        note: "L'utilisateur a été créé dans la base de données. Vous devrez le créer manuellement dans Supabase pour l'authentification.",
      };

    } catch (error) {
      console.error("❌ Erreur lors de la création de l'admin:", error);
      throw new Error(`Erreur lors de la création de l'admin: ${error.message}`);
    }
  }

  async sendGlobalNotification(body: any, adminId: string) {
    const { title, message, data, priority = 'MEDIUM' } = body;

    // Récupérer tous les utilisateurs
    const users = await this.prisma.utilisateur.findMany({
      select: { id: true },
    });

    // Envoyer à tous les utilisateurs
    const notifications = users.map(user =>
      this.notifications.sendPushNotification({
        userId: user.id,
        title,
        body: message,
        data,
        priority: priority as any,
        type: 'MAINTENANCE',
      })
    );

    await Promise.all(notifications);

    await this.logAdminAction('SEND_GLOBAL_NOTIFICATION', adminId, {
      title,
      message,
      recipientCount: users.length,
    });

    return {
      sent: users.length,
      title,
      message,
    };
  }

  async sendPushNotificationByRole(body: any, adminId: string) {
    const { role, title, message, data } = body;

    const users = await this.prisma.utilisateur.findMany({
      where: { [role]: true },
      select: { id: true },
    });

    const notifications = users.map(user =>
      this.notifications.sendPushNotification({
        userId: user.id,
        title,
        body: message,
        data,
        type: 'MAINTENANCE',
      })
    );

    await Promise.all(notifications);

    await this.logAdminAction('SEND_NOTIFICATION_BY_ROLE', adminId, {
      role,
      title,
      message,
      recipientCount: users.length,
    });

    return {
      sent: users.length,
      role,
      title,
      message,
    };
  }

  // ========================================
  // EXPORTS & RAPPORTS
  // ========================================

  async exportData(type: string, format: string, filters: any) {
    // TODO: Implémenter l'export de données selon le type et format
    return {
      type,
      format,
      filters,
      downloadUrl: `https://api.kollect.sn/exports/${type}.${format}`,
    };
  }

  async getActivityReport(period: string) {
    // TODO: Implémenter le rapport d'activité détaillé
    return {
      period,
      data: 'Rapport à implémenter',
    };
  }

  // ========================================
  // UTILITAIRES
  // ========================================

  private async logAdminAction(action: string, adminId: string, details: any) {
    // TODO: Implémenter un système de log pour les actions admin
    console.log(`Admin Action: ${action} by ${adminId}`, details);
  }

  // ========================================
  // SYSTEM HEALTH & QUEUES
  // ========================================

  async getSystemMetrics() {
    const rawMetrics = await this.metricsService.getMetrics();
    return {
      rawMetrics,
    };
  }

  async getSystemQueues() {
    const fetchQueueState = async (queue: Queue) => {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
      ]);
      return {
        name: queue.name,
        waiting,
        active,
        completed,
        failed,
        delayed,
      };
    };

    const queues = await Promise.all([
      fetchQueueState(this.dropsQueue),
      fetchQueueState(this.ordersQueue),
      fetchQueueState(this.notificationsQueue),
      fetchQueueState(this.analyticsQueue),
    ]);

    const deadletters = await this.deadletterQueue.getJobs(['waiting', 'active', 'delayed', 'failed'], 0, 50, false);

    return {
      queues,
      deadletters: deadletters.map(job => ({
        id: job.id,
        name: job.name,
        data: job.data,
        failedAt: job.timestamp,
        error: job.failedReason,
      })),
    };
  }

  async retryDeadletterJob(jobId: string) {
    const job = await this.deadletterQueue.getJob(jobId);
    if (!job) throw new Error('Job not found in deadletter queue');
    await job.retry();
    return { success: true };
  }

  // ========================================
  // BRAND PERFORMANCE ANALYTICS
  // ========================================

  async getBrandPerformance(brandId: string) {
    const brand = await this.prisma.marque.findUnique({
      where: { id: brandId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        products: {
          select: { id: true, name: true, viewCount: true, price: true, stock: true },
          where: { isDeleted: false },
          orderBy: { viewCount: 'desc' },
          take: 10
        },
        commandes: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          where: { status: { not: 'ANNULEE' } },
          include: {
            client: { select: { id: true, email: true, firstName: true, lastName: true } }
          }
        }
      }
    });

    if (!brand) throw new Error('Brand not found');

    const ordersStat = await this.prisma.commande.aggregate({
      where: { brandId, status: { not: 'ANNULEE' } },
      _sum: { total: true },
      _count: { id: true }
    });

    const followersCount = await this.prisma.favori.count({
      where: { type: 'BRAND', brandId }
    });

    const sharesCount = await this.prisma.shareAction.count({
      where: { type: 'BRAND', targetId: brandId }
    });

    const productsViewCount = brand.products.reduce((acc, p) => acc + p.viewCount, 0);
    const revenue = ordersStat._sum.total || 0;
    const estimatedCommission = Math.floor(revenue * 0.10);

    return {
      brand: {
        id: brand.id,
        name: brand.name,
        logo: brand.logo,
        coverImage: brand.coverImage,
        followerCount: followersCount,
        sharesCount: sharesCount,
        owner: brand.user,
      },
      sales: {
        ordersCount: ordersStat._count.id,
        revenue: revenue,
        estimatedCommission: estimatedCommission,
        recentOrders: brand.commandes,
      },
      engagement: {
        totalProductViews: productsViewCount,
      },
      topProducts: brand.products
    };
  }
}
