/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { useTheme } from '../context/ThemeContext';
import { CreateCollectionStepperModal } from '@/components/collection/CreateCollectionStepperModal';
import { CreateCollectionFAB } from '@/components/collection/CreateCollectionFAB';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { CollectionStatus, CreateCollectionPayload, CollectionDto } from '@/features/collections/services/collections.service';
import { useCollectionsStore } from '@/features/collections/store/collectionStore';
import { storage } from '@/utils/storage';

type TabType = 'all' | CollectionStatus;
type Collection = CollectionDto;

// ============================================
// HELPERS
// ============================================
const calculateTimeRemaining = (targetDate: string) => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
    isExpired: false,
  };
};

const formatTimeRemaining = (time: ReturnType<typeof calculateTimeRemaining>): string => {
  if (time.isExpired) return 'Lancé !';
  if (time.days > 0) return `${time.days}j ${time.hours}h`;
  if (time.hours > 0) return `${time.hours}h ${time.minutes}min`;
  return `${time.minutes}min`;
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function CollectionScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [countdowns, setCountdowns] = useState<Record<string, ReturnType<typeof calculateTimeRemaining>>>({});
  const { user } = useAuthStore();

  const { 
    collections: storeCollections, 
    loading, 
    error,
    fetchCollections,
    createCollection,
    activateTeaser,
    launchCollection,
  } = useCollectionsStore();

  // Config des statuts avec les couleurs du thème
  const STATUS_CONFIG = {
    [CollectionStatus.TEASER]: {
      label: 'Teaser actif',
      color: theme.colors.warning,
      icon: 'eye' as const,
    },
    [CollectionStatus.DISPONIBLE]: {
      label: 'Disponible',
      color: theme.colors.success,
      icon: 'flash' as const,
    },
    [CollectionStatus.EPUISEE]: {
      label: 'Épuisée',
      color: theme.colors.error,
      icon: 'close-circle' as const,
    },
    [CollectionStatus.TERMINE]: {
      label: 'Terminée',
      color: theme.colors.textSecondary,
      icon: 'checkmark-circle' as const,
    },
  };

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    if (storeCollections.length > 0) {
    }
  }, [storeCollections]);

  useEffect(() => {
    if (error) {
      console.error('=== ERREUR COLLECTIONS ===', error);
    }
  }, [error]);

  const tabs = [
    { id: 'all' as TabType, label: 'Toutes', icon: 'grid-outline' },
    { id: CollectionStatus.TEASER, label: 'Teasers', icon: 'eye-outline' },
    { id: CollectionStatus.DISPONIBLE, label: 'Actives', icon: 'flash-outline' },
    { id: CollectionStatus.TERMINE, label: 'Terminées', icon: 'checkmark-circle-outline' },
  ];

  // ============================================
  // AFFICHAGE DU COMPTE À REBOURS (lecture seule)
  // Le lancement automatique est géré côté serveur
  // ============================================
  useEffect(() => {
    const teaserCollections = storeCollections.filter(
      (c: Collection) => c.status === CollectionStatus.TEASER && c.launchDate
    );

    if (teaserCollections.length === 0) return;

    const interval = setInterval(() => {
      const newCountdowns: Record<string, ReturnType<typeof calculateTimeRemaining>> = {};
      
      teaserCollections.forEach((collection: Collection) => {
        if (collection.launchDate) {
          newCountdowns[collection.id] = calculateTimeRemaining(collection.launchDate);
        }
      });
      
      setCountdowns(prevCountdowns => ({
        ...prevCountdowns,
        ...newCountdowns
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [storeCollections]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleCreateCollection = async (collectionData: any) => {
    try {
      console.log('🚀 Début de la création de collection...');

      const brandId = user?.brand?.id;
      
      if (!brandId) {
        Alert.alert('Erreur', 'Impossible de récupérer votre marque. Veuillez vous reconnecter.');
        return;
      }

      const draft = await storage.getDraftCollection();
      
      if (!draft) {
        Alert.alert('Erreur', 'Aucun brouillon trouvé. Veuillez réessayer.');
        return;
      }

      const products = draft.products || [];

      if (products.length === 0) {
        Alert.alert(
          'Produits manquants', 
          'Vous devez ajouter au moins un produit avant de créer la collection.'
        );
        return;
      }

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (!product.images || product.images.length === 0) {
          Alert.alert(
            'Images manquantes',
            `Le produit "${product.name}" doit avoir au moins une image`
          );
          return;
        }
      }

      const payload: CreateCollectionPayload = {
        name: collectionData.name.trim(),
        description: collectionData.description?.trim() || '',
        launchDate: collectionData.launchDate
          ? collectionData.launchDate.toISOString()
          : undefined,
        isFeatured: Boolean(collectionData.isFeatured),
        coverImage: collectionData.teaserType === 'photo'
          ? collectionData.teaserUri
          : undefined,
        teaserVideo: collectionData.teaserType === 'video'
          ? collectionData.teaserUri
          : undefined,
        products: products.map(product => ({
          name: product.name,
          description: product.description || '',
          price: Number(product.price),
          stock: Number(product.stock),
          sku: product.sku,
          images: product.images,
          sizes: product.sizes || ['M'],
          colors: product.colors || ['black'],
        })),
        brandId: brandId
      };

      const result = await createCollection(payload);

      await storage.clearDraftCollection();

      Alert.alert(
        'Succès ✨', 
        `Collection "${collectionData.name}" créée avec ${products.length} produit(s) !`,
        [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              fetchCollections();
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error);
      
      let errorMessage = 'Impossible de créer la collection.';
      
      if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert('Erreur', errorMessage, [{ text: 'OK' }]);
    }
  };

  const handleActivateTeaser = async (collectionId: string) => {
    Alert.alert(
      'Activer le teaser ?',
      'Le compte à rebours sera lancé et tes followers seront notifiés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Activer',
          style: 'default',
          onPress: async () => {
            try {
              await activateTeaser(collectionId, {});
              Alert.alert('Succès', '🎉 Teaser activé ! Le countdown est lancé.');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible d\'activer le teaser');
            }
          },
        },
      ]
    );
  };

  const handleLaunchCollection = (collectionId: string) => {
    Alert.alert(
      'Lancer le drop ?',
      'Les produits deviendront immédiatement disponibles à l\'achat.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Lancer',
          style: 'default',
          onPress: async () => {
            try {
              await launchCollection(collectionId);
              Alert.alert('Succès', '🚀 Drop lancé ! Les achats sont maintenant possibles.');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de lancer le drop');
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    await fetchCollections();
  };

  const filteredCollections = storeCollections.filter((collection: Collection) => {
    if (activeTab === 'all') return true;
    return collection.status === activeTab;
  });

  // ============================================
  // RENDER FUNCTIONS
  // ============================================
  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Mes Drops
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {storeCollections.length} collection{storeCollections.length > 1 ? 's' : ''}
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
          const count = item.id === 'all'
            ? storeCollections.length
            : storeCollections.filter((c: CollectionDto) => c.status === item.id).length;

          const isActive = activeTab === item.id;

          return (
            <TouchableOpacity
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.card,
                  borderColor: isActive ? theme.colors.primary : theme.colors.borderLight,
                  // BOOM: Ombre forte pour tab active
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

  const renderCollectionCard = ({ item }: { item: Collection }) => {
    const statusConfig = STATUS_CONFIG[item.status];
    const productCount = item.products
      ? item.products.filter((p: any) => !p.isDeleted).length
      : item._count?.products || 0;
    const countdown = countdowns[item.id];
    
    // Le bouton "Lancer maintenant" n'est plus nécessaire car le lancement est géré par le serveur
    // On garde uniquement l'affichage du compte à rebours pour l'information

    return (
      <TouchableOpacity
        style={[
          styles.collectionCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.borderLight,
            // BOOM: Ombre forte selon mode
            shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
            shadowOffset: { width: 0, height: isDark ? 8 : 6 },
            shadowOpacity: 1,
            shadowRadius: 12,
            elevation: isDark ? 8 : 4,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => router.push(`/collection/${item.id}`)}
      >
        {/* Image/Vidéo de couverture */}
        <View style={styles.cardImageContainer}>
          {item.teaserVideo && item.teaserVideo.trim() !== '' ? (
            <>
              <Video
                source={{ uri: item.teaserVideo }}
                style={[styles.cardImage, { backgroundColor: '#000' }]}
                resizeMode={ResizeMode.COVER}
                shouldPlay={false}
                useNativeControls={false}
                isMuted
                isLooping={false}
                usePoster={false}
              />
              <View style={styles.videoIndicator}>
                <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.9)" />
              </View>
            </>
          ) : item.coverImage && item.coverImage.trim() !== '' ? (
            <Image 
              source={{ uri: item.coverImage }} 
              style={styles.cardImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cardImagePlaceholder, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="image-outline" size={48} color={theme.colors.textDisabled} />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.cardGradient}
          />
          {item.isFeatured && (
            <View style={[styles.featuredBadge, { backgroundColor: theme.colors.accent }]}>
              <Ionicons name="star" size={14} color="#FFF" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>

        {/* Contenu */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusConfig.color + '15',
                  borderWidth: 1,
                  borderColor: statusConfig.color + '40',
                },
              ]}
            >
              <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {item.description && (
            <Text
              style={[styles.cardDescription, { color: theme.colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          )}

          {/* Stats */}
          <View style={styles.cardFooter}>
            <View style={styles.cardInfo}>
              <Ionicons name="cube-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.cardInfoText, { color: theme.colors.textSecondary }]}>
                {productCount} produit{productCount > 1 ? 's' : ''}
              </Text>
            </View>

            {item.launchDate && (
              <View style={styles.cardInfo}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.cardInfoText, { color: theme.colors.textSecondary }]}>
                  {new Date(item.launchDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
            )}

            <View style={styles.cardInfo}>
              <Ionicons name="eye-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.cardInfoText, { color: theme.colors.textSecondary }]}>
                {item.viewCount} vues
              </Text>
            </View>
          </View>

          {/* Bouton Lancer maintenant pour les TEASER */}
          {item.status === CollectionStatus.TEASER && (
            <View style={{ gap: 8 }}>
              {/* Bouton Lancer maintenant */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.accent,
                    shadowColor: theme.colors.accent,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  },
                ]}
                onPress={() => handleLaunchCollection(item.id)}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Ionicons name="rocket" size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {loading ? 'Lancement...' : 'Lancer le drop maintenant'}
                </Text>
              </TouchableOpacity>

              {/* Compte à rebours */}
              {countdown && !countdown.isExpired && (
                <View
                  style={[
                    styles.countdownBanner,
                    {
                      backgroundColor: theme.colors.warning + '15',
                      borderWidth: 1,
                      borderColor: theme.colors.warning + '30',
                    },
                  ]}
                >
                  <Ionicons name="time-outline" size={16} color={theme.colors.warning} />
                  <Text style={[styles.countdownText, { color: theme.colors.warning }]}>
                    Lancement dans {formatTimeRemaining(countdown)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Bannière de confirmation après lancement automatique */}
          {item.status === CollectionStatus.DISPONIBLE && (
            <View
              style={[
                styles.successBanner,
                {
                  backgroundColor: theme.colors.success + '15',
                  borderWidth: 1,
                  borderColor: theme.colors.success + '30',
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={[styles.successText, { color: theme.colors.success }]}>
                Drop actif • Achats possibles
              </Text>
            </View>
          )}
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
        <Ionicons name="cube-outline" size={64} color={theme.colors.textDisabled} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {activeTab === 'all' ? 'Aucun drop' : `Aucun drop ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}`}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {activeTab === 'all'
          ? 'Crée ton premier drop pour générer du hype'
          : 'Change de filtre pour voir tes autres collections'}
      </Text>
      {activeTab === 'all' && (
        <TouchableOpacity
          style={[
            styles.emptyButton,
            {
              backgroundColor: theme.colors.accent,
              shadowColor: theme.colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            },
          ]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.emptyButtonText}>Créer un drop</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ============================================
  // AFFICHAGE DU LOADER
  // ============================================
  if (loading && storeCollections.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Chargement des collections...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {renderHeader()}
      {renderTabs()}

      <FlatList
        data={filteredCollections}
        renderItem={renderCollectionCard}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredCollections.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState()}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={theme.colors.accent}
            colors={[theme.colors.accent]}
          />
        }
      />

      <CreateCollectionFAB onPress={() => setModalVisible(true)} />

      <CreateCollectionStepperModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateCollection}
        brandId={user?.brand?.id ?? ''}
      />
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
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
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
  collectionCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardImageContainer: { 
    width: '100%', 
    height: 200, 
    position: 'relative' 
  },
  cardImage: { 
    width: '100%', 
    height: '100%' 
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -16,
    marginTop: -16,
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  featuredText: { 
    color: '#FFF', 
    fontSize: 12, 
    fontWeight: '700' 
  },
  cardContent: { padding: 16 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  cardTitle: { 
    flex: 1, 
    fontSize: 20, 
    fontWeight: '700', 
    letterSpacing: -0.4 
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  statusText: { 
    fontSize: 12, 
    fontWeight: '600' 
  },
  cardDescription: { 
    fontSize: 14, 
    lineHeight: 20, 
    marginBottom: 12 
  },
  cardFooter: { 
    flexDirection: 'row', 
    gap: 16, 
    flexWrap: 'wrap' 
  },
  cardInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },
  cardInfoText: { 
    fontSize: 13, 
    fontWeight: '500' 
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  actionButtonText: { 
    color: '#FFFFFF', 
    fontSize: 15, 
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
  },
  countdownText: { 
    fontSize: 14, 
    fontWeight: '700' 
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
  },
  successText: { 
    fontSize: 14, 
    fontWeight: '700' 
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
    letterSpacing: -0.5 
  },
  emptySubtitle: { 
    fontSize: 15, 
    textAlign: 'center', 
    lineHeight: 22, 
    marginBottom: 24 
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  emptyButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});