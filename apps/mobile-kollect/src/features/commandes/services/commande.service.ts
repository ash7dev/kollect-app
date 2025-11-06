/* eslint-disable @typescript-eslint/array-type */
// src/features/commandes/services/commande.service.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ============================================
// TYPES
// ============================================

const API_URL = 'https://maurice-unfelicitous-semisuccessfully.ngrok-free.dev/api';

export interface CommandeItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  price: number;
  quantity: number;
  size: string | null;
  color: string | null;
  product?: {
    name: string;
    images: string[];
  };
}


interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Commande {
  montantTotal: any;
  dateCreation: string | number | Date;
  lignesCommande: any;
  adresseLivraison: any;
  data: any;
  id: string;
  orderNumber: string;
  clientId: string;
  brandId: string;
  status: CommandeStatus;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingPhone: string;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: CommandeItem[];
  brand?: {
    id: string;
    name: string;
    logo: string | null;
    slug: string;
  };
  client?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  statusHistory?: StatusHistoryItem[];
}

export interface StatusHistoryItem {
  id: string;
  status: CommandeStatus;
  details: string | null;
  createdAt: Date;
  changedById: string | null;
}

export type CommandeStatus = 
  | 'EN_ATTENTE' 
  | 'CONFIRMEE' 
  | 'ANNULEE';

export interface CreateCommandeDto {
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
  adresseLivraison: {
    adresse: string;
    ville: string;
    telephone: string;
  };
  codePromo?: string;
}

export interface QueryCommandesDto {
  status?: CommandeStatus;
  page?: number;
  limit?: number;
}

export interface CommandesResponse {
  data: Commande[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateStatusDto {
  notes?: string;
}

// ============================================
// AXIOS INSTANCE
// ============================================

const commandeApi = axios.create({
  baseURL: `${API_URL}/commandes`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
commandeApi.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
commandeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message;
    console.error('❌ [Commande API Error]:', message);
    return Promise.reject(new Error(message));
  }
);
export const mapApiStatusToFrontend = (apiStatus: CommandeStatus): 'en attente' | 'confirmée' | 'annulée' => {
  const statusMap: Record<CommandeStatus, 'en attente' | 'confirmée' | 'annulée'> = {
    'EN_ATTENTE': 'en attente',
    'CONFIRMEE': 'confirmée',
    'ANNULEE': 'annulée',
  };
  return statusMap[apiStatus];
};

export const mapFrontendStatusToApi = (frontendStatus: 'en attente' | 'confirmée' | 'annulée'): CommandeStatus => {
  const statusMap: Record<'en attente' | 'confirmée' | 'annulée', CommandeStatus> = {
    'en attente': 'EN_ATTENTE',
    'confirmée': 'CONFIRMEE',
    'annulée': 'ANNULEE',
  };
  return statusMap[frontendStatus];
};

const transformCommande = (apiCommande: any): Commande => ({
  ...apiCommande,
  status: mapApiStatusToFrontend(apiCommande.status),
});

// ============================================
// SERVICE
// ============================================

class CommandeService {
  /**
   * 🛍️ Créer une nouvelle commande
   */
  async createCommande(dto: CreateCommandeDto): Promise<Commande> {
    console.log('📦 [Commande] Création commande:', dto);
    const { data } = await commandeApi.post<Commande>('/', dto);
    return data;
  }

  /**
   * 📋 Récupérer mes commandes (Client)
   */
  async getMyCommandes(query?: QueryCommandesDto): Promise<CommandesResponse> {
  console.log('📋 [Commande] Récupération mes commandes:', query);
  const { data } = await commandeApi.get<{ data: any[]; meta: any }>('/me', {
    params: query,
  });
  
  // ✅ Transformer les données
  return {
    data: data.data.map(transformCommande),
    meta: data.meta,
  };
}

  /**
   * 🏪 Récupérer les commandes de ma boutique (CEO)
   */
  async getBoutiqueCommandes(
  query?: QueryCommandesDto
): Promise<{ data: Commande[]; meta: PaginationMeta }> {
  const { data } = await commandeApi.get<{ data: any[]; meta: PaginationMeta }>('/boutique/me', {
    params: query,
  });
  
  // ✅ Transformer les données
  return {
    data: data.data.map(transformCommande),
    meta: data.meta,
  };
}
  /**
   * 🔍 Récupérer une commande par ID
   */
  async getCommandeById(id: string): Promise<Commande> {
  console.log('🔍 [Commande] Récupération commande:', id);
  const { data } = await commandeApi.get<any>(`/${id}`);
  return transformCommande(data);
}

  // Modifier confirmerCommande
async confirmerCommande(id: string, notes?: string): Promise<Commande> {
  console.log('✅ [Commande] Confirmation commande:', id);
  const { data } = await commandeApi.patch<any>(
    `/${id}/confirmer`,
    { notes }
  );
  return transformCommande(data);
}

// Modifier annulerCommande
async annulerCommande(id: string, notes?: string): Promise<Commande> {
  console.log('❌ [Commande] Annulation commande:', id);
  const { data } = await commandeApi.patch<any>(
    `/${id}/annuler`,
    { notes }
  );
  return transformCommande(data);
}

  /**
   * 📊 Statistiques des commandes (pour dashboard CEO)
   */
  async getCommandeStats(): Promise<{
  total: number;
  enAttente: number;
  confirmees: number;
  annulees: number;
  revenueTotal: number;
}> {
  // Récupérer toutes les commandes
  const response = await this.getBoutiqueCommandes({ limit: 1000 });
  const commandes = response.data; // Accès aux données de la réponse
  
  // Calculer les statistiques
  const enAttente = commandes.filter(c => c.status === 'EN_ATTENTE').length;
  const confirmees = commandes.filter(c => c.status === 'CONFIRMEE').length;
  const annulees = commandes.filter(c => c.status === 'ANNULEE').length;
  
  // Calculer le revenu total des commandes confirmées
  const revenueTotal = commandes
    .filter(c => c.status === 'CONFIRMEE')
    .reduce((sum, c) => sum + c.total, 0);

  return {
    total: response.meta.total, // Utiliser le total de la pagination
    enAttente,
    confirmees,
    annulees,
    revenueTotal,
  };
}
}

export const commandeService = new CommandeService();