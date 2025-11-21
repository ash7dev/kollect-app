import { 
  View, 
  Text, 
  StyleSheet, 
  useColorScheme, 
  TextInput, 
  TouchableOpacity, 
  Platform,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Image } from 'expo-image';
import { produitsService, type ProduitDto } from '../../src/features/produits/services/produits.service';
import { collectionsApi, type CollectionDto } from '../../src/features/collections/services/collections.service';
import { brandService, type Brand } from '../../src/features/brands/services/brand.service';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import DepthCarousel from '../../src/components/clients/DepthCarousel';
import CartModal from '../../src/components/clients/CartModal';
import CheckoutModal from '../../src/components/clients/CheckoutModal';
import { useCartStore } from '../../src/store/cartStore';
import DropCountdown from '../../src/components/clients/DropCountdown';
import TrendingGrid from '../../src/components/clients/TrendingGrid';
import BrandSpotlight from '../../src/components/clients/BrandSpotlight';
import JustLaunchedDrop from '../../src/components/clients/JustLaunchedDrop';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ClientHomeScreen() {
  const { theme, isDark } = useTheme();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { openCart } = useLocalSearchParams<{ openCart?: string }>();
  const totalCartQty = useCartStore((s) => s.totalQuantity());
  const addItemToCart = useCartStore((s) => s.addItem);
  
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

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const API_URL = 'https://maurice-unfelicitous-semisuccessfully.ngrok-free.dev';
      
      const [collectionsResponse, trendingCols, newCols, comingSoonCols] = await Promise.all([
        collectionsApi.getFeatured(6),
        collectionsApi.getTrending(6),
        collectionsApi.getNew(6),
        collectionsApi.getComingSoon(6),
      ]);
      
      const processedCollections = collectionsResponse.map(collection => ({
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
      }));
      
      setFeaturedCollections(processedCollections);
      setTrendingCollections(trendingCols || []);
      setNewCollections(newCols || []);
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

  useEffect(() => {
    if (openCart === '1') setCartOpen(true);
  }, [openCart]);
  
  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContent}>
          <View style={[styles.loadingSpinner, { borderColor: theme.colors.primary }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
          <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>
            Kollect
          </Text>
          <Text style={[styles.loadingSubtitle, { color: theme.colors.textSecondary }]}>
            Préparation de votre expérience...
          </Text>
        </View>
      </View>
    );
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
  const dropData = upcomingDrop?.brand ? {
    collectionId: upcomingDrop.id,
    collectionName: upcomingDrop.name,
    brandName: upcomingDrop.brand.name,
    brandLogo: upcomingDrop.brand.logo || '',
    coverImage: upcomingDrop.coverImage || '',
    launchDate: new Date(upcomingDrop.launchDate as unknown as string),
  } : null;

  const spotlightSource = verifiedBrands[0];
  const spotlightCollections = spotlightSource
    ? featuredCollections.filter(c => c.brand?.id === spotlightSource.id && c.coverImage)
    : [];
  const spotlightCollection = spotlightCollections[0] || featuredCollections.find(c => c.coverImage);
  const totalProductsForBrand = spotlightSource
    ? featuredCollections.filter(c => c.brand?.id === spotlightSource.id).reduce((sum, c) => sum + (c._count?.products || 0), 0)
    : 0;

  const spotlightBrand = spotlightSource && spotlightCollection ? {
    id: spotlightSource.id,
    name: spotlightSource.name,
    slug: spotlightSource.slug,
    logo: spotlightSource.logo || '',
    coverImage: spotlightCollection.coverImage || '',
    description: (spotlightSource as any).description || (spotlightSource as any).bio || spotlightCollection.description || `Découvrez l'univers de ${spotlightSource.name}`,
    stats: {
      followers: (spotlightSource as any).followerCount ?? 0,
      collections: (spotlightSource as any)._count?.collections ?? 0,
      products: (spotlightSource as any)._count?.products ?? totalProductsForBrand ?? 0,
    },
    tags: ['sénégal', 'créateur', 'local'],
    verified: spotlightSource.isVerified ?? false,
    isFollowing: false,
  } : null;
  
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
            >
              <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
              <View style={[styles.badge, { backgroundColor: theme.colors.accent || '#EF4444' }]}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]} 
              onPress={() => setCartOpen(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="bag-outline" size={22} color={theme.colors.text} />
              {totalCartQty > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.badgeText}>{totalCartQty}</Text>
                </View>
              )}
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
                {verifiedBrands.map((brand, index) => (
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
                            color={theme.colors.primary} 
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
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={[styles.sectionLink, { color: theme.colors.primary }]}>Voir tout</Text>
                </TouchableOpacity>
              </View>
              <DropCountdown 
                {...dropData}
                onNotifyMe={() => console.log('Notify me')}
                onPreview={() => router.push(`/clientCollectionid/${dropData.collectionId}`)}
              />
            </View>
          )}

          {/* Nouveau drop disponible */}
          {newCollections.length > 0 && newCollections[0].coverImage && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <View style={[styles.sectionIndicator, { backgroundColor: '#10B981' }]} />
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Nouveau drop disponible
                  </Text>
                </View>
              </View>
              <JustLaunchedDrop
                collection={newCollections[0]}
                onPress={(id) => router.push(`/clientCollectionid/${id}`)}
              />
            </View>
          )}

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
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={[styles.sectionLink, { color: theme.colors.primary }]}>Explorer</Text>
                </TouchableOpacity>
              </View>
              <DepthCarousel 
                data={featuredCollections
                  .filter(collection => collection.coverImage)
                  .map(collection => ({
                    id: collection.id,
                    title: collection.name,
                    image: collection.coverImage as string,
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
                onFollow={() => console.log('Follow brand')}
                onVisit={() => router.push(`/ClientbrandId/${spotlightBrand.slug}`)}
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
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={[styles.sectionLink, { color: theme.colors.primary }]}>Voir tout</Text>
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

          {/* Spacer pour le bas */}
          <View style={{ height: 40 }} />
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