/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useBoutiqueCommandes } from '@/features/commandes/hooks/useCommandeQueries';
import { useCommandeStore } from '@/features/commandes/store/commandeStore';
import { Commande, QueryCommandesDto } from '@/features/commandes/services/commande.service';

type TabType = 'all' | 'en attente' | 'confirmée' | 'annulée';

// Helper functions pour les statuts (en dehors du composant pour éviter les re-renders)
const getStatusBadgeColor = (status: 'en attente' | 'confirmée' | 'annulée'): string => {
  const colors: Record<'en attente' | 'confirmée' | 'annulée', string> = {
    'en attente': '#FFA500',
    'confirmée': '#2ac00fff',
    'annulée': '#DC143C',
  };
  return colors[status] || '#808080';
};

const getStatusLabel = (status: 'en attente' | 'confirmée' | 'annulée'): string => {
  const labels: Record<'en attente' | 'confirmée' | 'annulée', string> = {
    'en attente': 'En attente',
    'confirmée': 'Confirmée',
    'annulée': 'Annulée',
  };
  return labels[status] || status;
};

// Normalise un status éventuel venant de l'API (par ex. "confirmee" -> "confirmée")
const normalizeStatus = (status: string): 'en attente' | 'confirmée' | 'annulée' => {
  if (status === 'confirmee') return 'confirmée';
  if (status === 'en attente' || status === 'confirmée' || status === 'annulée') return status;
  return 'en attente';
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function OrdersScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const setSelectedStatus = useCommandeStore((state) => state.setSelectedStatus);
  const selectedStatus = useCommandeStore((state) => state.selectedStatus);

  // Initialiser l'onglet actif à 'all' par défaut
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // Mettre à jour le store quand l'onglet change
  // Note: setSelectedStatus est stable (fonction zustand), donc pas besoin de la mettre dans les dépendances
  useEffect(() => {
    const newStatus = activeTab === 'all' ? 'ALL' : activeTab;
    setSelectedStatus(newStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Le hook utilise selectedStatus du store qui est maintenant synchronisé
  const { 
    data: commandesData, 
    isLoading, 
    error,
    refetch,
    isRefetching,
  } = useBoutiqueCommandes();

  const commandes = commandesData?.data || [];

  const tabs = [
    { id: 'all' as TabType, label: 'Toutes', icon: 'grid-outline' },
    { id: 'en attente' as TabType, label: 'En attente', icon: 'time-outline' },
    { id: 'confirmée' as TabType, label: 'Terminée', icon: 'checkmark-circle-outline' },
    { id: 'annulée' as TabType, label: 'Annulée', icon: 'close-circle-outline' },
  ];

  const onRefresh = async () => {
    await refetch();
  };

  // Les commandes sont déjà filtrées par l'API via le store selectedStatus
  // On les utilise directement, mais on peut faire un filtrage supplémentaire côté client si nécessaire
  const filteredCommandes = commandes;

  // ============================================
  // RENDER FUNCTIONS
  // ============================================
  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Commandes
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {commandes.length} commande{commandes.length > 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={tabs}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.tabsList}
        renderItem={({ item }) => {
          // Pour l'onglet actif, on utilise le nombre de commandes filtrées
          // Pour les autres onglets, on compte dans toutes les commandes chargées
          // Note: Pour un comptage précis de tous les onglets, il faudrait charger toutes les commandes
          const count = item.id === activeTab
            ? commandes.length
            : item.id === 'all'
            ? commandes.length // Approximation pour "Toutes"
            : commandes.filter((c: any) => normalizeStatus(c.status as string) === item.id).length;

          const isActive = activeTab === item.id;

          return (
            <TouchableOpacity
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.card,
                  borderColor: isActive ? theme.colors.primary : theme.colors.borderLight,
                  shadowColor: isActive ? theme.colors.shadowLight : 'transparent',
                  shadowOffset: { width: 0, height: isActive ? 4 : 0 },
                  shadowOpacity: isActive ? 1 : 0,
                  shadowRadius: isActive ? 8 : 0,
                  elevation: isActive ? 4 : 0,
                },
              ]}
              onPress={() => setActiveTab(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon as any}
                size={18}
                color={isActive ? '#FFFFFF' : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? '#FFFFFF' : theme.colors.text },
                ]}
              >
                {item.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isActive
                        ? 'rgba(255,255,255,0.25)'
                        : theme.colors.highlight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: isActive ? '#FFFFFF' : theme.colors.accent },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  const renderCommandeCard = ({ item }: { item: any }) => {
    const normalizedStatus = normalizeStatus(item.status as string);
    const statusColor = getStatusBadgeColor(normalizedStatus);
    const statusLabel = getStatusLabel(normalizedStatus);

    // Les données renvoyées par l'API pour le CEO sont déjà transformées côté backend :
    // { id, orderNumber, customer, amount, status, date, itemsCount, phone, address }
    const totalAmount: number =
      typeof item.amount === 'number'
        ? item.amount
        : typeof item.total === 'number'
        ? item.total
        : 0;

    const itemsCount: number =
      typeof item.itemsCount === 'number'
        ? item.itemsCount
        : Array.isArray(item.items)
        ? item.items.length
        : 0;

    const city: string = item.address || item.shippingCity || 'Non spécifié';

    return (
      <TouchableOpacity
        style={[
          styles.commandeCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.borderLight,
            shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
            shadowOffset: { width: 0, height: isDark ? 8 : 6 },
            shadowOpacity: 1,
            shadowRadius: 12,
            elevation: isDark ? 8 : 4,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => router.push(`/commande/${item.id}`)}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={[styles.cardOrderNumber, { color: theme.colors.text }]}>
                #{item.orderNumber}
              </Text>
              <Text style={[styles.cardDate, { color: theme.colors.textSecondary }]}>
                {item.date
                  ? new Date(item.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Date inconnue'}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusColor + '15',
                  borderWidth: 1,
                  borderColor: statusColor + '40',
                },
              ]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          {item.client && (
            <View style={styles.cardInfo}>
              <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.cardInfoText, { color: theme.colors.textSecondary }]}>
                {item.customer || `${item.client.firstName} ${item.client.lastName}`}
              </Text>
            </View>
          )}

          <View style={styles.cardInfo}>
            <Ionicons name="cube-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.cardInfoText, { color: theme.colors.textSecondary }]}>
              {itemsCount} article{itemsCount !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.cardInfo}>
            <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.cardInfoText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {city}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <Text style={[styles.cardTotal, { color: theme.colors.text }]}>
              {totalAmount.toLocaleString('fr-FR')} CFA
            </Text>
            {normalizedStatus === 'en attente' && (
              <TouchableOpacity
                style={[
                  styles.traiterButton,
                  {
                    backgroundColor: theme.colors.accent,
                    shadowColor: theme.colors.accent,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  },
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  router.push(`/commande/${item.id}`);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                <Text style={styles.traiterButtonText}>Traiter</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconContainer,
          {
            backgroundColor: theme.colors.surface,
            borderWidth: 2,
            borderColor: theme.colors.borderLight,
          },
        ]}
      >
        <Ionicons name="receipt-outline" size={64} color={theme.colors.textDisabled} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {activeTab === 'all' 
          ? 'Aucune commande' 
          : `Aucune commande ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}`}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {activeTab === 'all'
          ? 'Les commandes de vos clients apparaîtront ici'
          : 'Changez de filtre pour voir vos autres commandes'}
      </Text>
    </View>
  );

  // ============================================
  // AFFICHAGE DU LOADER
  // ============================================
  if (isLoading && commandes.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Chargement des commandes...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Erreur lors du chargement
          </Text>
          <TouchableOpacity
            style={[
              styles.errorButton,
              {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              },
            ]}
            onPress={() => refetch()}
          >
            <Text style={styles.errorButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {renderHeader()}
      {renderTabs()}

      <FlatList
        data={filteredCommandes}
        renderItem={renderCommandeCard}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredCommandes.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState()}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={theme.colors.accent}
            colors={[theme.colors.accent]}
          />
        }
      />

      {/* Espacement pour la bottom navigation */}
      <View style={{ height: 100 }} />
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: '700', 
    letterSpacing: -0.8 
  },
  headerSubtitle: { 
    fontSize: 15, 
    marginTop: 4,
    fontWeight: '500',
  },
  tabsContainer: { paddingBottom: 16 },
  tabsList: { paddingHorizontal: 24, gap: 8 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    gap: 6,
  },
  tabLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    letterSpacing: -0.2 
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  badgeText: { 
    fontSize: 12, 
    fontWeight: '700' 
  },
  listContent: { 
    paddingHorizontal: 24, 
    paddingBottom: 100 
  },
  listContentEmpty: { flexGrow: 1 },
  commandeCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardContent: { padding: 16 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardOrderNumber: { 
    fontSize: 18, 
    fontWeight: '700', 
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  cardDate: { 
    fontSize: 13, 
    fontWeight: '500' 
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: { 
    fontSize: 12, 
    fontWeight: '600' 
  },
  cardInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    marginBottom: 8,
  },
  cardInfoText: { 
    fontSize: 14, 
    fontWeight: '500',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  cardTotal: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  traiterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  traiterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 8, 
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  emptySubtitle: { 
    fontSize: 15, 
    textAlign: 'center', 
    lineHeight: 22, 
  },
});
