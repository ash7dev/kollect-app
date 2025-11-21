/* eslint-disable import/no-duplicates */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  FlatList
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { MotiView } from 'moti';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Image } from 'react-native';

import { 
  NotificationButton, 
  ModernSalesChart,
  PrimaryActionButton,
  QuickActionCard,
  OrderCard,
} from '../../src/components/dashboard-ceo';
import { CheckCommandeModal } from '../../src/components/dashboard-ceo/check-commande-modal';
import { useAuthStore } from '@/store/authStore';
import { useBrandStore } from '@/features/brands/store/brandStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useBrandStats } from '@/features/brands/hooks/useBrandQueries';
import { useBoutiqueCommandes, useConfirmerCommande } from '@/features/commandes/hooks/useCommandeQueries';
import { usePendingOrderCount } from '@/features/commandes/store/commandeStore';
import { Commande } from '@/features/commandes/services/commande.service';
import { mapApiStatusToFrontend } from '@/features/commandes/services/commande.service';
import { useNotificationsStore } from '@/features/notifications/services/notificationsStore';

// Type pour les commandes
type Order = {
  id: string;
  customer: string;
  amount: number;
  status: 'en attente' | 'confirmée' | 'annulée';
  date: string;
  itemsCount: number;
  phone: string;
  address: string;
};

export default function CeoDashboardScreen() {
  const { theme } = useTheme();
  const [period] = useState('30days');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isConfirmingState, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['50%', '75%'], []);
  const { user } = useAuthStore();
  
  const { myBrand, loadMyBrand, isLoading: isLoadingBrand } = useBrandStore();
  const pendingOrderCount = usePendingOrderCount();
  const { unreadCount, fetchMyNotifications } = useNotificationsStore();

  // Responsive + Greeting
  const { width } = Dimensions.get('window');
  const isSmallDevice = width < 380;
  const hours = new Date().getHours();
  const greeting = hours < 12 ? 'Bonjour' : 'Bonsoir';

  // Stats et commandes avec états de chargement explicites
  const {
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useBrandStats(myBrand?.id || '');
  const {
    data,
    isLoading: isLoadingOrders,
    isError,
    refetch,
    isFetching,
  } = useBoutiqueCommandes();

  // L'API getBoutiqueCommandes renvoie déjà un objet transformé pour le CEO :
  // { id, orderNumber, customer, amount, status, date, itemsCount, phone, address }
  // On mappe directement ces champs vers le type Order utilisé par OrderCard.
  const transformCommandeToOrder = (commande: any): Order => ({
    id: commande.id,
    customer: commande.customer || 'Client inconnu',
    amount: typeof commande.amount === 'number' ? commande.amount : 0,
    status: (commande.status as 'en attente' | 'confirmée' | 'annulée') || 'en attente',
    date: commande.date,
    itemsCount: commande.itemsCount ?? 0,
    phone: commande.phone || 'Non fourni',
    address: commande.address || 'Adresse non fournie',
  });

  useEffect(() => {
    loadMyBrand();
    void fetchMyNotifications();
  }, [loadMyBrand, fetchMyNotifications]);
  
  // Fonction de rafraîchissement (pull-to-refresh)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadMyBrand(),          // Infos marque
        refetchStats(),         // Statistiques ventes
        refetch(),              // Commandes récentes
        fetchMyNotifications(), // Notifications CEO
      ]);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadMyBrand, refetchStats, refetch, fetchMyNotifications]);

  // Fonction pour ouvrir le modal
  const handlePresentModalPress = useCallback((order: Order) => {
    setSelectedOrder(order);
    setIsConfirming(false);
    setIsConfirmed(false);
    bottomSheetModalRef.current?.present();
  }, []);

  // Hook pour confirmer une commande
  const { mutate: confirmerCommande, isPending: isConfirmingMutation } = useConfirmerCommande();
  const isConfirming = isConfirmingState || isConfirmingMutation;

  // Navigation vers l'écran de détail de la commande (écran /commande/[id])
  const handleViewOrderDetails = useCallback(
    (orderId: string) => {
      bottomSheetModalRef.current?.dismiss();
      router.push(`/commande/${orderId}` as any);
      setSelectedOrder(null);
    },
    [],
  );
  
  // Fonction pour confirmer la commande
  const handleConfirmOrder = useCallback((orderId: string) => {
    confirmerCommande({ id: orderId }, {
      onSuccess: () => {},
      onError: (error) => {
        console.error('Erreur lors de la confirmation de la commande:', error);
      }
    });
  }, [confirmerCommande]);

  // Rendu du backdrop pour le modal
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  // Rendu du handle du modal
  const renderHandle = useCallback(
    (props: any) => (
      <View style={[styles.handleContainer, { backgroundColor: theme.colors.card }]}>
        <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
      </View>
    ),
    [theme.colors]
  );

  function handleRefresh(): void {
    refetch();
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}> 
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
          />
        }
      >
        {/* Carte combinée En-tête + Marque */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={[styles.combinedCard, { backgroundColor: theme.colors.card }]}
        >
          {/* En-tête */}
          <View style={styles.headerGreeting}>
            <MotiView
              from={{ opacity: 0, translateY: -8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400 }}
              style={styles.greetingRow}
            >
              <Text style={styles.emojiWave}>👋</Text>
              <View style={styles.greetingTextContainer}>
                <Text style={[styles.greetingTitle, { color: theme.colors.text }]}>
                  {greeting}, {user?.firstName} {user?.lastName}
                </Text>
                <Text style={[styles.greetingSubtitle, { color: theme.colors.textSecondary }]}>
                  Bienvenue dans votre espace CEO
                </Text>
              </View>
            </MotiView>
            
            <NotificationButton 
              count={unreadCount} 
              onPress={() => router.push('/ceoNotifications')} 
            />
          </View>

          {/* Section Marque */}
          <View style={styles.brandSection}>
            <View style={styles.brandHeader}>
              <View style={styles.brandLeft}>
                {myBrand?.logo ? (
                  <Image 
                    source={{ uri: myBrand.logo }} 
                    style={styles.brandLogo}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[
                    styles.brandLogo, 
                    styles.brandLogoPlaceholder,
                    { borderColor: theme.colors.border }
                  ]}>
                    <Ionicons name="storefront" size={24} color={theme.colors.textSecondary} />
                  </View>
                )}
                <View>
                  <Text style={[styles.brandName, { color: theme.colors.text }]}>
                    {myBrand?.name || 'Ma Marque'}
                  </Text>
                  <Text style={[styles.brandSlug, { color: theme.colors.textSecondary }]}>
                    {myBrand?.slug || 'ma-marque'}--Kollect 👋
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.shareButton, { backgroundColor: theme.colors.surface }]}
                onPress={() => {
                  if (myBrand?.slug) {
                    const shareUrl = `https://kollect.sn/boutique/${myBrand.slug}`;
                    Share.share({
                      message: `Découvrez ma boutique ${myBrand.name} sur Kollect : ${shareUrl}`,
                      url: shareUrl,
                      title: `Découvrir ${myBrand.name}`
                    }).catch(error => console.log('Erreur lors du partage :', error));
                  }
                }}
              >
                <Ionicons name="share-social-outline" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>

        {/* Contenu */}
        <View style={styles.content}>

          {/* Graphique des Ventes Moderne */}
          <ModernSalesChart 
            refreshing={refreshing || isLoadingBrand || isStatsLoading}
            onRefresh={onRefresh}
          />

          {/* Actions Rapides */}
          <View style={[styles.section, { 
            backgroundColor: theme.colors.card,
            marginTop: 27,  // Augmentation de la marge supérieure
          }]}> 
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}> 
              Actions rapides
            </Text>
            
            <View style={styles.quickActionsGrid}>
              <QuickActionCard
                title="Commandes à traiter"
                count={
                  isLoadingBrand || isStatsLoading
                    ? '...'
                    : pendingOrderCount.toString()
                }
                iconName="cube-outline"
                onPress={() => router.push('/(ceo)/orders')}
              />
              <QuickActionCard
                title="Produits"
                count={
                  isLoadingBrand || isStatsLoading
                    ? '...'
                    : (stats?.totalProducts ?? myBrand?.productCount ?? 0).toString()
                }
                iconName="pricetag-outline"
                onPress={() => router.push('/(ceo)/products')}
              />
            </View>

            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: 150 }}
            >
              <View style={styles.primaryActionsContainer}>
                <View style={styles.primaryActionsRow}> 
                  <View style={styles.primaryActionHalf}> 
                    <PrimaryActionButton
                      label="Nouvelle Drop"
                      iconName="add-circle-outline"
                      onPress={() => console.log('Nouvelle collection')}
                    />
                  </View>
                  <View style={styles.primaryActionHalf}>
                    <PrimaryActionButton
                      label="Lancer un Teaser"
                      iconName="add-circle-outline"
                      onPress={() => console.log('Nouveau produit')}
                    />
                  </View>
                </View>
                <View style={[styles.primaryActionFull, { marginTop: 6 }]}>
                  <PrimaryActionButton
                    label="Ajouter un produit"
                    iconName="add-circle-outline"
                    onPress={() => console.log('Nouveau produit')}
                  />
                </View>
              </View>
            </MotiView>
          </View>

          {/* Commandes Récentes */}
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}> 
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}> 
              Commandes récentes
            </Text>
            
            <FlatList
              data={isLoadingOrders ? [] : data?.data || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <OrderCard
                  order={transformCommandeToOrder(item)}
                  onPress={() => handlePresentModalPress(transformCommandeToOrder(item))}
                  index={index}
                />
              )}
              contentContainerStyle={styles.listContent}
              scrollEnabled={false}
              ListEmptyComponent={
                isLoadingOrders || isFetching ? (
                  <View style={styles.emptyContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                      Chargement des commandes...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                      Aucune commande
                    </Text>
                  </View>
                )
              }
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              © 2025 Kollect. Tous droits réservés.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal des détails de commande */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: theme.colors.card }}
      >
        {selectedOrder && (
          <CheckCommandeModal
            visible={!!selectedOrder}
            order={{
              ...selectedOrder,
              clientName: selectedOrder.customer,
              total: selectedOrder.amount,
              itemsCount: selectedOrder.itemsCount,
              status: selectedOrder.status as any,
              phone: selectedOrder.phone,
              address: selectedOrder.address
            }}
            onClose={() => setSelectedOrder(null)}
            onProcessOrder={() => {
              if (selectedOrder) {
                handleViewOrderDetails(selectedOrder.id);
              }
            }}
          />
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  
  // Carte combinée
  combinedCard: {
    borderRadius: 16,
    margin: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  
  // Header Greeting
  headerGreeting: {
    padding: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  emojiWave: {
    fontSize: 28,
  },
  greetingTextContainer: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },

  // Content
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },

  // Brand Section
  brandSection: {
    padding: 16,
    paddingTop: 32,
  },
  brandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandLogo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  brandLogoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  brandSlug: {
    fontSize: 13,
  },
  shareButton: {
    padding: 10,
    borderRadius: 12,
  },

  // Section
  section: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  // Primary Actions
  primaryActionsContainer: {
    gap: 8,
  },
  primaryActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryActionHalf: {
    flex: 1,
  },
  primaryActionFull: {
    width: '100%',
  },

  // List
  listContent: {
    gap: 0,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
  },

  // Footer
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },

  // Modal
  handleContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 50,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
  },
});