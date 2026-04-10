// Service API pour les routes admin centralisées

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les entités
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  isClient: boolean;
  isCEO: boolean;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  brand?: {
    id: string;
    name: string;
    isVerified: boolean;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  brand: {
    id: string;
    name: string;
    logo?: string;
  };
  status: 'EN_ATTENTE' | 'CONFIRMEE' | 'LIVREE' | 'ANNULEE';
  paymentStatus: 'EN_ATTENTE' | 'VALIDEE' | 'ECHOUEE' | 'REMBOURSEE' | 'ANNULEE';
  paymentMethod: 'OM' | 'WAVE' | 'FREE_MONEY' | 'CARTE' | 'ESPECES';
  total: number;
  itemCount: number;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingNumber?: string;
}

export interface OrderStats {
  total: number;
  totalRevenue: number;
  pending: number;
  delivered: number;
}

export interface UserStats {
  total: number;
  clients: number;
  ceos: number;
  admins: number;
  active: number;
  inactive: number;
}

export interface BrandStats {
  total: number;
  active: number;
  verified: number;
  pending: number;
}

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  averageRating: number;
  verifiedPurchases: number;
}

export interface GlobalStats {
  period: '7days' | '30days' | '90days';
  users: {
    total: number;
    active: number;
    growth: number;
  };
  brands: BrandStats;
  orders: OrderStats;
  reviews: ReviewStats;
  platform: {
    revenue: number;
  };
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  isVerified: boolean;
  isApproved: boolean;
  response?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  product: {
    id: string;
    name: string;
    images: string[];
  };
  brand: {
    id: string;
    name: string;
  };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  bio?: string;
  instagram?: string;
  whatsapp?: string;
  website?: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  isActive: boolean;
  isVerified: boolean;
  followerCount: number;
  productCount: number;
  orderCount: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

type RawPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type RawStats = {
  period: '7days' | '30days' | '90days';
  users: {
    total: number;
    active: number;
    growth: number;
  };
  brands: {
    total: number;
    verified: number;
    pending: number;
  };
  orders: {
    total: number;
    pending: number;
    delivered: number;
    revenue: number;
  };
  reviews: {
    total: number;
    pending: number;
    approved: number;
  };
};

type RawUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatar?: string | null;
  isClient: boolean;
  isCEO: boolean;
  isAdmin: boolean;
  isActive?: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  brand?: {
    id: string;
    name: string;
    isVerified: boolean;
  } | null;
};

type RawOrder = {
  id: string;
  orderNumber: string;
  client: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
  };
  brand: {
    id: string;
    name: string;
    logo?: string | null;
  };
  status: Order['status'];
  paymentStatus: Order['paymentStatus'];
  paymentMethod: Order['paymentMethod'];
  total: number;
  createdAt: string;
  paidAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  trackingNumber?: string | null;
  items?: unknown[];
};

type RawReview = {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  images: string[];
  isVerified: boolean;
  isApproved: boolean;
  response?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
  };
  product: {
    id: string;
    name: string;
    images: string[];
  };
  brand: {
    id: string;
    name: string;
  };
};

type RawBrand = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  coverImage?: string | null;
  bio?: string | null;
  instagram?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  userId: string;
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
  };
  isActive: boolean;
  isVerified: boolean;
  revenue: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products?: number;
    commandes?: number;
    favoris?: number;
  };
};

function fullName(firstName?: string | null, lastName?: string | null) {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim() || 'Utilisateur';
}

function normalizeStats(raw: RawStats): GlobalStats {
  const revenue = raw.orders?.revenue ?? 0;
  return {
    period: raw.period,
    users: raw.users,
    brands: {
      total: raw.brands.total,
      active: raw.brands.total - raw.brands.pending,
      verified: raw.brands.verified,
      pending: raw.brands.pending,
    },
    orders: {
      total: raw.orders.total,
      totalRevenue: revenue,
      pending: raw.orders.pending,
      delivered: raw.orders.delivered,
    },
    reviews: {
      total: raw.reviews.total,
      pending: raw.reviews.pending,
      approved: raw.reviews.approved,
      averageRating: 0,
      verifiedPurchases: 0,
    },
    platform: {
      revenue,
    },
  };
}

function normalizeUsers(raw: { users: RawUser[]; pagination: RawPagination }): PaginatedResponse<User> {
  return {
    data: raw.users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      phone: user.phone ?? undefined,
      avatar: user.avatar ?? undefined,
      isClient: user.isClient,
      isCEO: user.isCEO,
      isAdmin: user.isAdmin,
      isActive: user.isActive ?? true,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt ?? undefined,
      brand: user.brand ?? undefined,
    })),
    pagination: raw.pagination,
  };
}

function normalizeOrders(raw: { orders: RawOrder[]; pagination: RawPagination }): PaginatedResponse<Order> {
  return {
    data: raw.orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      client: {
        id: order.client.id,
        name: fullName(order.client.firstName, order.client.lastName),
        email: order.client.email,
        phone: order.client.phone ?? '',
      },
      brand: {
        id: order.brand.id,
        name: order.brand.name,
        logo: order.brand.logo ?? undefined,
      },
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      total: order.total,
      itemCount: order.items?.length ?? 0,
      createdAt: order.createdAt,
      paidAt: order.paidAt ?? undefined,
      shippedAt: order.shippedAt ?? undefined,
      deliveredAt: order.deliveredAt ?? undefined,
      trackingNumber: order.trackingNumber ?? undefined,
    })),
    pagination: raw.pagination,
  };
}

function normalizeReviews(raw: { reviews: RawReview[]; pagination: RawPagination }): PaginatedResponse<Review> {
  return {
    data: raw.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title ?? undefined,
      comment: review.comment ?? undefined,
      images: review.images,
      isVerified: review.isVerified,
      isApproved: review.isApproved,
      response: review.response ?? undefined,
      respondedAt: review.respondedAt ?? undefined,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: {
        id: review.user.id,
        name: fullName(review.user.firstName, review.user.lastName),
        email: review.user.email,
        avatar: review.user.avatar ?? undefined,
      },
      product: review.product,
      brand: review.brand,
    })),
    pagination: raw.pagination,
  };
}

function normalizeBrands(raw: { brands: RawBrand[]; pagination: RawPagination }): PaginatedResponse<Brand> {
  return {
    data: raw.brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo ?? undefined,
      coverImage: brand.coverImage ?? undefined,
      bio: brand.bio ?? undefined,
      instagram: brand.instagram ?? undefined,
      whatsapp: brand.whatsapp ?? undefined,
      website: brand.website ?? undefined,
      userId: brand.userId,
      user: {
        id: brand.user.id,
        name: fullName(brand.user.firstName, brand.user.lastName),
        email: brand.user.email,
        phone: brand.user.phone ?? '',
      },
      isActive: brand.isActive,
      isVerified: brand.isVerified,
      followerCount: brand._count?.favoris ?? 0,
      productCount: brand._count?.products ?? 0,
      orderCount: brand._count?.commandes ?? 0,
      revenue: brand.revenue,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    })),
    pagination: raw.pagination,
  };
}


function cleanQuery(params: any) {
  const cleaned: any = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleaned[key] = params[key];
    }
  });
  return cleaned;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  transform?: (payload: any) => T,
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();

  return {
    success: true,
    data: transform ? transform(payload) : payload,
  };
}

// Service Admin API
export const adminApi = {
  // Statistiques globales
  async getStats(period: '7days' | '30days' | '90days' = '30days') {
    return apiRequest<GlobalStats>(`/admin/stats?period=${period}`, {}, normalizeStats);
  },

  async getAnalytics(period: '7days' | '30days' | '90days' = '30days') {
    return apiRequest(`/admin/analytics?period=${period}`);
  },

  // Utilisateurs
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'isClient' | 'isCEO' | 'isAdmin';
    status?: 'active' | 'inactive';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const queryParams = new URLSearchParams(cleanQuery(params)).toString();
    return apiRequest<PaginatedResponse<User>>(`/admin/users?${queryParams}`, {}, normalizeUsers);
  },

  async getUserById(id: string) {
    return apiRequest<User>(`/admin/users/${id}`);
  },

  async updateUserRole(id: string, data: {
    isClient: boolean;
    isCEO: boolean;
    isAdmin: boolean;
  }) {
    return apiRequest<User>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deactivateUser(id: string) {
    return apiRequest<User>(`/admin/users/${id}/deactivate`, {
      method: 'PATCH',
    });
  },

  async reactivateUser(id: string) {
    return apiRequest<User>(`/admin/users/${id}/reactivate`, {
      method: 'PATCH',
    });
  },

  // Commandes
  async getAllOrders(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'EN_ATTENTE' | 'CONFIRMEE' | 'LIVREE' | 'ANNULEE';
    paymentStatus?: 'EN_ATTENTE' | 'VALIDEE' | 'ECHOUEE' | 'REMBOURSEE' | 'ANNULEE';
    brandId?: string;
    period?: '7days' | '30days' | '90days' | 'all';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const queryParams = new URLSearchParams(cleanQuery(params)).toString();
    return apiRequest<PaginatedResponse<Order>>(`/admin/orders?${queryParams}`, {}, normalizeOrders);
  },

  async getOrderById(id: string) {
    return apiRequest<Order>(`/admin/orders/${id}`);
  },

  async confirmOrder(id: string, notes?: string) {
    return apiRequest<Order>(`/admin/orders/${id}/confirm`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  },

  async cancelOrder(id: string, reason: string) {
    return apiRequest<Order>(`/admin/orders/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  // Avis
  async getReviews(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'pending' | 'approved';
    rating?: number;
    verified?: 'true' | 'false';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const queryParams = new URLSearchParams(cleanQuery(params)).toString();
    return apiRequest<PaginatedResponse<Review>>(`/admin/reviews?${queryParams}`, {}, normalizeReviews);
  },

  async approveReview(id: string) {
    return apiRequest<Review>(`/admin/reviews/${id}/approve`, {
      method: 'PATCH',
    });
  },

  async rejectReview(id: string, reason?: string) {
    return apiRequest<Review>(`/admin/reviews/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  async deleteReview(id: string) {
    return apiRequest<void>(`/admin/reviews/${id}`, {
      method: 'DELETE',
    });
  },

  // Marques
  async getBrands(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive';
    verification?: 'verified' | 'unverified';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const queryParams = new URLSearchParams(cleanQuery(params)).toString();
    return apiRequest<PaginatedResponse<Brand>>(`/admin/brands?${queryParams}`, {}, normalizeBrands);
  },

  async verifyBrand(id: string, verified: boolean, notes?: string) {
    return apiRequest<Brand>(`/admin/brands/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verified, notes }),
    });
  },

  async unverifyBrand(id: string, reason: string) {
    return apiRequest<Brand>(`/admin/brands/${id}/unverify`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  async deleteBrand(id: string) {
    return apiRequest<void>(`/admin/brands/${id}`, {
      method: 'DELETE',
    });
  },

  // Notifications
  async sendGlobalNotification(data: {
    title: string;
    message: string;
    data?: any;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }) {
    return apiRequest<void>('/admin/notifications/global', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async sendNotificationByRole(data: {
    role: 'isClient' | 'isCEO' | 'isAdmin';
    title: string;
    message: string;
    data?: any;
  }) {
    return apiRequest<void>('/admin/notifications/by-role', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Exports
  async exportData(type: 'users' | 'orders' | 'brands' | 'reviews', format: 'csv' | 'json' | 'xlsx' = 'csv', filters?: any) {
    const queryParams = new URLSearchParams({ format, ...filters }).toString();
    return apiRequest<{ downloadUrl: string }>(`/admin/export/${type}?${queryParams}`);
  },

  async getActivityReport(period: '7days' | '30days' | '90days' = '30days') {
    return apiRequest<any>(`/admin/reports/activity?period=${period}`);
  },

  // ========================================
  // SYSTEM HEALTH & QUEUES
  // ========================================

  async getSystemMetrics() {
    return apiRequest<{ rawMetrics: string }>('/admin/system/metrics');
  },

  async getSystemQueues() {
    return apiRequest<any>('/admin/system/queues');
  },

  async retryDeadletterJob(jobId: string) {
    return apiRequest<{ success: boolean }>(`/admin/system/queues/retry/${jobId}`, {
      method: 'POST',
    });
  },

  // ========================================
  // BRAND PERFORMANCE ANALYTICS
  // ========================================

  async getBrandPerformance(brandId: string) {
    return apiRequest<any>(`/admin/brands/${brandId}/performance`);
  },

  async getTopProducts(limit: number = 5) {
    return apiRequest<any[]>(`/admin/analytics/top-products?limit=${limit}`);
  },
};
