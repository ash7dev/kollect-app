'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export type DashboardPeriod = '7days' | '30days' | '90days';

type BrandIdentity = {
  id: string;
  name: string;
  slug: string;
};

type BrandStats = {
  totalProducts: number;
  totalCollections: number;
  totalOrders: number;
  totalRevenue: number;
  totalFollowers: number;
  period: DashboardPeriod;
  ordersThisPeriod: number;
  ordersChange: number;
  followersChange: number;
  conversionRate: number;
  revenueThisPeriod: number;
  revenueChange: number;
  viewsThisPeriod: number;
};

export type SalesPoint = {
  label: string;
  value: number;
  date?: string;
};

type OrderStats = {
  total: number;
  enAttente: number;
  confirmees: number;
  annulees: number;
  revenueTotal: number;
};

type RecentOrder = {
  id: string;
  orderNumber?: string;
  total: number;
  status: string;
  paymentStatus?: string;
  createdAt: string;
  client?: {
    firstName?: string | null;
    lastName?: string | null;
  };
};

type ProductItem = {
  id: string;
  name: string;
  price: number;
  stock: number;
  viewCount?: number;
  images?: string[];
};

type Paginated<T> = {
  data: T[];
  meta?: {
    total: number;
  };
};

async function fetchBrand(): Promise<BrandIdentity> {
  const { data } = await apiClient.get<BrandIdentity>(API_ENDPOINTS.BRANDS.MY_BRAND);
  return data;
}

export function useCeoDashboardData() {
  const [period, setPeriod] = useState<DashboardPeriod>('30days');

  const brandQuery = useQuery({
    queryKey: ['dashboard', 'brand'],
    queryFn: fetchBrand,
  });

  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats', brandQuery.data?.id, period],
    queryFn: async () => {
      const { data } = await apiClient.get<BrandStats>(
        `${API_ENDPOINTS.BRANDS.STATS(brandQuery.data!.id)}?period=${period}`,
      );
      return data;
    },
    enabled: Boolean(brandQuery.data?.id),
  });

  const salesQuery = useQuery({
    queryKey: ['dashboard', 'sales', brandQuery.data?.id, period],
    queryFn: async () => {
      const { data } = await apiClient.get<SalesPoint[]>(
        API_ENDPOINTS.BRANDS.SALES_DATA(brandQuery.data!.id, period),
      );
      return Array.isArray(data) ? data : [];
    },
    enabled: Boolean(brandQuery.data?.id),
  });

  const orderStatsQuery = useQuery({
    queryKey: ['dashboard', 'order-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<OrderStats>(API_ENDPOINTS.COMMANDES.BOUTIQUE_STATS);
      return data;
    },
    enabled: Boolean(brandQuery.data?.id),
  });

  const recentOrdersQuery = useQuery({
    queryKey: ['dashboard', 'recent-orders'],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<RecentOrder>>(
        API_ENDPOINTS.COMMANDES.BOUTIQUE_LIST(1, 5),
      );
      return data.data ?? [];
    },
    enabled: Boolean(brandQuery.data?.id),
  });

  const productsQuery = useQuery({
    queryKey: ['dashboard', 'top-products'],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<ProductItem>>('/produits?page=1&limit=8');
      return data.data ?? [];
    },
    enabled: Boolean(brandQuery.data?.id),
  });

  const isLoading =
    brandQuery.isLoading ||
    statsQuery.isLoading ||
    salesQuery.isLoading ||
    orderStatsQuery.isLoading;

  const hasError =
    brandQuery.isError ||
    statsQuery.isError ||
    salesQuery.isError ||
    orderStatsQuery.isError;

  const topProducts = useMemo(() => {
    const list = productsQuery.data ?? [];
    return [...list]
      .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
      .slice(0, 5);
  }, [productsQuery.data]);

  return {
    period,
    setPeriod,
    isLoading,
    hasError,
    brand: brandQuery.data ?? null,
    stats: statsQuery.data ?? null,
    salesData: salesQuery.data ?? [],
    orderStats: orderStatsQuery.data ?? null,
    recentOrders: recentOrdersQuery.data ?? [],
    topProducts,
    allProducts: productsQuery.data ?? [],
    productsLoading: productsQuery.isLoading,
  };
}
