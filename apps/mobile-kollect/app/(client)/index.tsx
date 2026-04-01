/* eslint-disable @typescript-eslint/no-unused-vars */
import { 
  View, 
  Text, 
  StyleSheet, 
  useColorScheme, 
  TextInput, 
  TouchableOpacity, 
  Platform,
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import { Image } from 'expo-image';
import { produitsService, type ProduitDto } from '../../src/features/produits/services/produits.service';
import { collectionsApi, type CollectionDto } from '../../src/features/collections/services/collections.service';
import { brandService, type Brand } from '../../src/features/brands/services/brand.service';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback, useMemo } from 'react';
import DepthCarousel from '../../src/components/clients/DepthCarousel';
import CartModal from '../../src/components/clients/CartModal';
import CheckoutModal from '../../src/components/clients/CheckoutModal';
import { useCartStore } from '../../src/store/cartStore';
import { useNotificationsStore } from '../../src/features/notifications/services/notificationsStore';
import { useSuiviStore } from '../../src/features/suivi/store/suiviStore';
import DropCountdown from '../../src/components/clients/DropCountdown';
import TrendingGrid from '../../src/components/clients/TrendingGrid';
import BrandSpotlight from '../../src/components/clients/BrandSpotlight';
import JustLaunchedDrop from '../../src/components/clients/JustLaunchedDrop';
import StoryBanner from '../../src/components/clients/StoryBanner';
import LiveDropIndicator from '../../src/components/clients/LiveDropIndicator';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { apiBaseUrl } from '@/config/env';
import { ClientHomeLoading } from '@/components/ui/ClientHomeLoading';

const API_URL = apiBaseUrl;

export default function ClientHomeScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { openCart } = useLocalSearchParams<{ openCart?: string }>();
  const totalCartQty = useCartStore((s) => s.totalQuantity());
  const addItemToCart = useCartStore((s) => s.addItem);
  const { unreadCount, fetchMyNotifications } = useNotificationsStore();
  const { fetchAllProductFavorites } = useSuiviStore();
  
  // États pour les données
  const [featuredCollections, setFeaturedCollections] = useState<CollectionDto[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<ProduitDto[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProduitDto[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProduitDto[]>([]);
  const [trendingCollections, setTrendingCollections] = useState<CollectionDto[]>([]);
  const [newCollections, setNewCollections] = useState<CollectionDto[]>([]);
  const [comingSoonCollections, setComingSoonCollections] = useState<CollectionDto[]>([]);
  const [verifiedBrands, setVerifiedBrands] = useState<Brand[]>([]);
  
  // États UI
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      const [collectionsResponse, trendingCols, newCols, comingSoonCols] = await Promise.all([
        collectionsApi.getFeatured(6),
        collectionsApi.getTrending(6),
        collectionsApi.getNew(6),
        collectionsApi.getComingSoon(6),
      ]);
      
      const normalizeCollection = (collection: CollectionDto) => ({
        ...collection,
        coverImage: collection.coverImage 
          ? collection.coverImage.startsWith('http') 
            ? collection.coverImage 
            : `${API_URL}${collection.coverImage.startsWith('/') ? '' : '/'}${collection.coverImage}`
          : null,
        teaserVideo: collection.teaserVideo
          ? collection.teaserVideo.startsWith('http')
            ? collection.teaserVideo
            : `${API_URL}${collection.teaserVideo.startsWith('/') ? '' : '/'}${collection.teaserVideo}`
          : null,
        brand: collection.brand ? {
          ...collection.brand,
          logo: collection.brand.logo 
            ? collection.brand.logo.startsWith('http')
              ? collection.brand.logo
              : `${API_URL}${collection.brand.logo.startsWith('/') ? '' : '/'}${collection.brand.logo}`
            : null
        } : null
      });
      
      const processedCollections = collectionsResponse.map(normalizeCollection);
      const processedNewCollections = (newCols || []).map(normalizeCollection);

      console.log('[Home] /collections/new brut:', {
        rawCount: (newCols || []).length,
        ids: (newCols || []).map((c: any) => ({ id: c.id, status: c.status, launchedAt: c.launchedAt })),
      });

      setFeaturedCollections(processedCollections);
      setTrendingCollections(trendingCols || []);

      // Filtrer des "new collections" pour ne garder que celles qui ont au moins 1 produit non supprimé
      const nonEmptyNewCollections: CollectionDto[] = [];
      for (const col of processedNewCollections) {
        try {
          // Utilisation de la route publique des collections avec includeProducts=true
          const res = await collectionsApi.getPublic(col.id, true);
          const products = (res as any).products || [];
          const count = Array.isArray(products) ? products.length : 0;
          console.log('[Home] getPublic collection', col.id, '=>', count, 'produit(s)');
          if (count > 0) {
            // Attachement du nombre de produits visibles pour que JustLaunchedDrop n'utilise pas _count obsolète
            (col as any).visibleProductCount = count;
            nonEmptyNewCollections.push(col);
          } else {
            console.log('[Home] SKIP collection sans produits visibles:', col.id);
          }
        } catch (e) {
          console.log('[Home] ERREUR getByCollection pour', col.id, e instanceof Error ? e.message : e);
          // En cas d'erreur sur une collection, on la skip sans bloquer le reste
        }
      }
      console.log('[Home] newCollections filtrées (non vides):', nonEmptyNewCollections.map(c => c.id));
      setNewCollections(nonEmptyNewCollections);
      setComingSoonCollections(comingSoonCols || []);
      
      try {
        const popularRes = await produitsService.getPopular(20, 30);
        const popularProducts = (popularRes as any).data ?? popularRes ?? [];
        if (Array.isArray(popularProducts) && popularProducts.length > 0) {
          setTrendingProducts(popularProducts as ProduitDto[]);
        } else {
          const randomRes = await produitsService.getRandom({ limit: 20 });
          setTrendingProducts(randomRes.data || []);
        }
      } catch {
        const randomRes = await produitsService.getRandom({ limit: 20 });
        setTrendingProducts(randomRes.data || []);
      }

      try {
        const brands = await brandService.getAllBrands({ isActive: true, isVerified: true });
        setVerifiedBrands(brands || []);
      } catch {}
      
    } catch (err) {
      setError('Impossible de charger les données. Veuillez réessayer.');
      Alert.alert('Erreur', 'Impossible de charger les données. Veuillez vérifier votre connexion.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Gérer le focus de l'écran pour contrôler DropCountdown (son/lecture)
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => setIsScreenFocused(false);
    }, []),
  );

  useEffect(() => {
    void fetchMyNotifications();
    void fetchAllProductFavorites();
  }, [fetchMyNotifications, fetchAllProductFavorites]);

  useEffect(() => {
    if (openCart === '1') setCartOpen(true);
  }, [openCart]);
  
  if (loading && !refreshing) {
    return <ClientHomeLoading />;
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.errorIconContainer, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.08)' }]}>
          <Ionicons name="cloud-offline-outline" size={40} color={theme.colors.error || '#EF4444'} />
        </View>
        <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
          Connexion impossible
        </Text>
        <Text style={[styles.errorSubtitle, { color: theme.colors.textSecondary }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={fetchData}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddToCart = (product: any) => {
    const defaultColor = product.colors?.[0];
    const defaultSize = product.sizes?.[0];
    void addItemToCart(
      {
        productId: product.id,
        name: product.name,
        image: product.images?.[0] ?? null,
        price: product.price,
        brandId: product.brandId,
        stock: product.stock,
        size: defaultSize,
        color: defaultColor,
      },
      async (newBrandName, currentBrandName) => {
        return await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Changer de marque ?',
            `Tu as déjà des articles de ${currentBrandName} dans ton panier.\n\nSouhaites-tu vider ton panier pour ajouter ${newBrandName} ?`,
            [
              { text: 'Voir mon panier', onPress: () => { setCartOpen(true); resolve(false); } },
              { text: 'Vider & ajouter', style: 'destructive', onPress: () => resolve(true) },
              { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
            ],
            { cancelable: true },
          );
        });
      },
    );
  };

  const upcomingDrop = comingSoonCollections[0];
  const dropData = upcomingDrop?.brand
    ? {
        collectionId: upcomingDrop.id,
        collectionName: upcomingDrop.name,
        brandName: upcomingDrop.brand.name,
        brandLogo: upcomingDrop.brand.logo
          ? upcomingDrop.brand.logo.startsWith('http')
            ? upcomingDrop.brand.logo
            : `${API_URL}${upcomingDrop.brand.logo.startsWith('/') ? '' : '/'}${upcomingDrop.brand.logo}`
          : '',
        coverImage: upcomingDrop.coverImage
          ? upcomingDrop.coverImage.startsWith('http')
            ? upcomingDrop.coverImage
            : `${API_URL}${upcomingDrop.coverImage.startsWith('/') ? '' : '/'}${upcomingDrop.coverImage}`
          : '',
        teaserVideo: upcomingDrop.teaserVideo
          ? upcomingDrop.teaserVideo.startsWith('http')
            ? upcomingDrop.teaserVideo
            : `${API_URL}${upcomingDrop.teaserVideo.startsWith('/') ? '' : '/'}${upcomingDrop.teaserVideo}`
          : undefined,
        launchDate: new Date(upcomingDrop.launchDate as unknown as string),
      }
    : null;

  // Live Drop logic: si une 'newCollections' a été lancée il y a moins de 24h
  const liveCollection = newCollections.find(c => {
    if (!c.launchDate) return false;
    const launchTime = new Date(c.launchDate as unknown as string).getTime();
    const now = new Date().getTime();
    const hoursSinceLaunch = (now - launchTime) / (1000 * 60 * 60);
    return hoursSinceLaunch >= 0 && hoursSinceLaunch <= 24;
  });

  const liveDropData = liveCollection?.brand
    ? {
        id: liveCollection.id,
        collectionName: liveCollection.name,
        brandName: liveCollection.brand.name,
        brandLogo: liveCollection.brand.logo
          ? liveCollection.brand.logo.startsWith('http')
            ? liveCollection.brand.logo
            : `${API_URL}${liveCollection.brand.logo.startsWith('/') ? '' : '/'}${liveCollection.brand.logo}`
          : '',
        viewers: Math.floor(Math.random() * 500) + 1200, // Simuler des viewers live
        stockRemaining: 15,
        totalStock: 50,
        startTime: new Date(liveCollection.launchDate as unknown as string),
      }
    : null;

  // Fonction helper pour obtenir l'image d'une collection
  const getCollectionImage = (collection: any) => {
    // 1. Utiliser coverImage si disponible
    if (collection.coverImage) {
      return collection.coverImage;
    }
    
    // 2. Sinon, utiliser la première image du premier produit
    if (collection.products && collection.products.length > 0) {
      const firstProduct = collection.products[0];
      if (firstProduct.images && firstProduct.images.length > 0) {
        return firstProduct.images[0];
      }
    }
    
    // 3. En dernier recours, utiliser un placeholder avec le nom de la collection
    return `https://via.placeholder.com/400x300/1a1a1a/ffffff?text=${encodeURIComponent(collection.name || 'Collection')}`;
  };

  // Génération des stories à partir des produits tendance ou marques (groupées par marque)
  const stories = Object.values(
    trendingProducts.slice(0, 15).reduce((acc: any, product) => {
      const brand = product.brand as any;
      if (!brand) return acc;
      
      const brandId = brand.id;
      if (!acc[brandId]) {
        const logo = brand.logo 
          ? (brand.logo.startsWith('http') ? brand.logo : `${API_URL}${brand.logo.startsWith('/') ? '' : '/'}${brand.logo}`)
          : 'https://via.placeholder.com/150';
          
        acc[brandId] = {
          id: brandId,
          brandName: brand.name || 'Créateur',
          brandSlug: brand.slug,
          brandLogo: logo,
          items: [],
          type: 'drop' as const,
          viewed: Object.keys(acc).length > 2 // Les 3 premières marques sont "non vues"
        };
      }
      
      // Limiter à 4 "stories" (produits) par marque
      if (acc[brandId].items.length < 4) {
        acc[brandId].items.push({
          id: product.id,
          coverImage: product.images?.[0] || `https://via.placeholder.com/400x800/1a1a1a/ffffff?text=Produit`
        });
      }
      
      return acc;
    }, {})
  ) as any[];

  // Déterminer la collection de référence pour le "Créateur en vedette"
  const spotlightSource = (() => {
    if (verifiedBrands.length === 0) return null;
    // Sélectionner aléatoirement une marque parmi les vérifiées (ou changer la logique métier si on veut la mettre en avant manuellement)
    const seed = new Date().getDay(); // Change tous les jours ou on peut laisser random pur
    return verifiedBrands[seed % verifiedBrands.length];
  })();

  const spotlightCollection = (() => {
    if (!spotlightSource) return featuredCollections[0];
    return featuredCollections.find(c => c.brand?.id === spotlightSource.id) || featuredCollections[0];
  })();

  const totalProductsForBrand = spotlightSource
    ? featuredCollections
        .filter((c) => c.brand?.id === spotlightSource.id)
        .reduce((sum, c) => sum + (c._count?.products || 0), 0)
    : 0;

  const spotlightTags = Array.isArray((spotlightSource as any)?.tags) && (spotlightSource as any).tags.length > 0 
    ? (spotlightSource as any).tags 
    : ['sénégal', 'créateur', 'streetwear'];

  const spotlightBrand = spotlightSource && spotlightCollection
    ? {
        id: spotlightSource.id,
        name: spotlightSource.name,
        slug: spotlightSource.slug,
        logo: spotlightSource.logo || '',
        coverImage: getCollectionImage(spotlightCollection),
        description:
          (spotlightSource as any).description ||
          (spotlightSource as any).bio ||
          spotlightCollection.description ||
          `Découvrez l'univers de ${spotlightSource.name}`,
        stats: {
          followers: (spotlightSource as any).followerCount ?? 0,
          collections: (spotlightSource as any)._count?.collections ?? 0,
          products:
            (spotlightSource as any)._count?.products ??
            totalProductsForBrand ??
            0,
        },
        tags: spotlightTags,
        verified: spotlightSource.isVerified ?? false,
        isFollowing: false,
      }
    : null;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header amélioré */}
      <View style={[styles.header, { 
        backgroundColor: theme.colors.card,
        borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      }]}>
          <View style={styles.topBar}>
          <View style={styles.logoContainer}>
            <Text style={[styles.logo, { color: theme.colors.text }]}>Kollect</Text>
          </View>
          
          <View style={styles.iconsContainer}>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
              activeOpacity={0.7}
              onPress={() => router.push('/clientNotification')}
            >
              <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.colors.accent || '#EF4444' }]}> 
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
              activeOpacity={0.7}
              onPress={toggleTheme}
            >
              <Ionicons
                name={isDark ? 'moon' : 'sunny-outline'}
                size={20}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.content}>
          
          {/* Stories Banner */}
          {stories.length > 0 && (
            <StoryBanner 
              stories={stories} 
              onCtaPress={(story: any, item: any) => {
                // Navigation vers le produit
                router.push(`/clientProductid/${item.id}`)
              }} 
            />
          )}

          {/* Marques vérifiées - Design professionnel */}
          {verifiedBrands.length > 0 && (
            <View style={styles.brandsSection}>
              <View style={styles.brandsSectionHeader}>
                <Text style={[styles.brandsSectionTitle, { color: theme.colors.textSecondary }]}>
                  Marques vérifiées
                </Text>
                <View style={styles.brandsSectionLine} />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.brandsStrip}
              >
                {verifiedBrands.map((brand) => (
                  <TouchableOpacity
                    key={brand.id}
                    style={[
                      styles.brandChip,
                      { 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                      }
                    ]}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/ClientbrandId/${brand.slug}`)}
                  >
                    <View style={styles.brandChipContent}>
                      {brand.logo ? (
                        <Image
                          source={{ uri: brand.logo }}
                          style={styles.brandChipLogo}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={[styles.brandChipLogoPlaceholder, { backgroundColor: theme.colors.primary }]}>
                          <Text style={styles.brandChipLogoText}>
                            {brand.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.brandChipInfo}>
                        <Text
                          style={[styles.brandChipName, { color: theme.colors.text }]}
                          numberOfLines={1}
                        >
                          {brand.name}
                        </Text>
                        <View style={styles.verifiedRow}>
                          <Ionicons 
                            name="checkmark-circle" 
                            size={12} 
                            color="#34C759" 
                          />
                          <Text style={[styles.verifiedText, { color: theme.colors.textSecondary }]}>
                            Vérifié
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Live Drop Indicator (montré seulement s'il y a un drop Live récent) */}
          {liveDropData && (
            <LiveDropIndicator 
              drop={liveDropData} 
              onPress={() => router.push(`/clientCollectionid/${liveDropData.id}`)} 
            />
          )}

          {/* Drop Countdown */}
          {dropData && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <View style={[styles.sectionIndicator, { backgroundColor: theme.colors.accent || '#EF4444' }]} />
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Drop à venir
                  </Text>
                </View>
                <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/orders')}>
                  <Text style={[styles.sectionLink, { color: theme.colors.accent }]}>Voir tout</Text>
                </TouchableOpacity>
              </View>
              <DropCountdown 
                {...dropData}
                isActive={isScreenFocused}
                onNotifyMe={() => console.log('Notify me')}
                onPreview={() => router.push(`/clientCollectionid/${dropData.collectionId}`)}
              />
            </View>
          )}

          {/* Nouveaux drops disponibles */}
          {newCollections.slice(0, 3).map((collection, index) => (
            (collection.coverImage || (collection as any).teaserVideo) ? (
              <View key={collection.id} style={[styles.section, index > 0 && { marginTop: 16 }]}>
                {index === 0 && (
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                      <View style={[styles.sectionIndicator, { backgroundColor: '#10B981' }]} />
                      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Nouveaux drops récents
                      </Text>
                    </View>
                  </View>
                )}
                <JustLaunchedDrop
                  collection={collection}
                  onPress={(id) => router.push(`/clientCollectionid/${id}`)}
                />
              </View>
            ) : null
          ))}

          {/* Collections en vedette */}
          {featuredCollections.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <View style={[styles.sectionIndicator, { backgroundColor: theme.colors.primary }]} />
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Collections en vedette
                  </Text>
                </View>
                <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(client)/search')}>
                  <Text style={[styles.sectionLink, { color: theme.colors.accent }]}>Explorer</Text>
                </TouchableOpacity>
              </View>
              <DepthCarousel 
                data={featuredCollections.map(collection => ({
                  id: collection.id,
                  title: collection.name,
                  image: getCollectionImage(collection),
                  brandName: collection.brand?.name,
                  brandLogo: collection.brand?.logo || undefined,
                  brandSlug: collection.brand?.slug,
                  status: collection.status,
                  viewCount: collection._count?.views || 0,
                  productCount: collection._count?.products || 0,
                  description: collection.description || 'Découvrez cette collection exclusive.'
                }))} 
                onBrandPress={(slug) => slug && router.push(`/ClientbrandId/${slug}`)}
              />
            </View>
          )}

          {/* Brand Spotlight */}
          {spotlightBrand && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <View style={[styles.sectionIndicator, { backgroundColor: '#F59E0B' }]} />
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Créateur en vedette
                  </Text>
                </View>
              </View>
              <BrandSpotlight 
                brand={spotlightBrand}
                showHomeButton={true}
                onHome={() => router.push(`/ClientbrandId/${spotlightBrand.slug}`)}
                onFollow={() => console.log('Follow brand')}
              />
            </View>
          )}

          {/* Produits tendance */}
          {trendingProducts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <View style={[styles.sectionIndicator, { backgroundColor: '#8B5CF6' }]} />
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Tendance du moment
                  </Text>
                </View>
                <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(client)/search')}>
                  <Text style={[styles.sectionLink, { color: theme.colors.accent }]}>Voir tout</Text>
                </TouchableOpacity>
              </View>
              <TrendingGrid 
                products={trendingProducts.map(p => ({
                  ...p,
                  brandId: p.brandId,
                  brandName: p.brand?.name || 'Sans marque',
                  brandLogo: undefined,
                  isNew: false,
                }))}
                onProductPress={(product) => router.push(`/clientProductid/${product.id}`)}
                onAddToCart={handleAddToCart}
                onLike={(productId) => console.log('Like product:', productId)}
              />
            </View>
          )}

          {/* État vide */}
          {featuredCollections.length === 0 && trendingProducts.length === 0 && (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}>
                <Ionicons name="cube-outline" size={48} color={theme.colors.textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                Aucun contenu disponible
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                Revenez bientôt pour découvrir les dernières collections
              </Text>
            </View>
          )}

          {/* Espacement pour la bottom navigation */}
          <View style={styles.bottomNavSpacer} />
        </View>
      </ScrollView>

      <CartModal
        visible={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
      />
      <CheckoutModal
        visible={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => setCheckoutOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: -0.5,
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'cursive',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 15,
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Scroll
  scrollView: { flex: 1 },
  content: { flexGrow: 1, paddingTop: 12 },

  // Brands Section
  brandsSection: {
    marginBottom: 28,
  },
  brandsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  brandsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  brandsSectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(128,128,128,0.15)',
  },
  brandsStrip: {
    paddingHorizontal: 16,
    gap: 12,
  },
  brandChip: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  brandChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 12,
  },
  brandChipLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  brandChipLogoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandChipLogoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  brandChipInfo: {
    gap: 2,
  },
  brandChipName: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 100,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Sections
  section: {
    marginBottom: 32,
  },
  
  // Espacement pour bottom navigation
  bottomNavSpacer: {
    height: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
})
