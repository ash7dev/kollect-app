import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { brandService, type Brand } from '../../src/features/brands/services/brand.service';
import type { ProduitDto } from '../../src/features/produits/services/produits.service';
import { collectionsApi, type CollectionDto } from '../../src/features/collections/services/collections.service';
import BrandSpotlight from '../../src/components/clients/BrandSpotlight';
import TrendingGrid from '../../src/components/clients/TrendingGrid';
import DropCountdown from '../../src/components/clients/DropCountdown';
import { useCartStore } from '../../src/store/cartStore';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';

const API_URL = 'https://maurice-unfelicitous-semisuccessfully.ngrok-free.dev';

type TabKey = 'products' | 'collections';

export default function BrandDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<ProduitDto[]>([]);
  const [collections, setCollections] = useState<CollectionDto[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('products');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItemToCart = useCartStore((s) => s.addItem);
  const scrollY = new Animated.Value(0);

  const handleAddToCart = useCallback(
    (product: any) => {
      const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : undefined;
      const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;

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
                {
                  text: 'Voir mon panier',
                  onPress: () => {
                    resolve(false);
                    router.push('/(client)?openCart=1');
                  },
                },
                {
                  text: 'Vider & ajouter',
                  style: 'destructive',
                  onPress: () => resolve(true),
                },
                {
                  text: 'Annuler',
                  style: 'cancel',
                  onPress: () => resolve(false),
                },
              ],
              { cancelable: true },
            );
          });
        },
      );
    },
    [addItemToCart, router],
  );

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      setLoading(true);

      const slug = String(id);
      const brandData = await brandService.getBrandBySlug(slug);

      setBrand(brandData as any);
      setProducts(((brandData as any).products || []) as ProduitDto[]);
      const rawCollections = (((brandData as any).collections || []) as CollectionDto[]);

      // Filtrer les collections pour ne garder que celles qui ont au moins 1 produit public non supprimé
      const visibleCollections: CollectionDto[] = [];
      for (const col of rawCollections) {
        try {
          const res = await collectionsApi.getPublic(col.id, true);
          const products = (res as any).products || [];
          const count = Array.isArray(products) ? products.length : 0;

          if (count > 0) {
            // Attacher un compteur de produits visibles pour l'affichage
            (col as any).visibleProductCount = count;
            visibleCollections.push(col);
          }
        } catch (e) {
          // En cas d'erreur sur une collection, on la skip sans bloquer le reste
          console.log('[ClientBrand] ERREUR getPublic collection', col.id, e instanceof Error ? e.message : e);
        }
      }

      const normalizedCollections = visibleCollections.map((col) => ({
        ...col,
        coverImage: col.coverImage
          ? col.coverImage.startsWith('http')
            ? col.coverImage
            : `${API_URL}${col.coverImage.startsWith('/') ? '' : '/'}${col.coverImage}`
          : null,
        teaserVideo: col.teaserVideo
          ? col.teaserVideo.startsWith('http')
            ? col.teaserVideo
            : `${API_URL}${col.teaserVideo.startsWith('/') ? '' : '/'}${col.teaserVideo}`
          : null,
      }));

      setCollections(normalizedCollections);
    } catch (e: any) {
      setError(e?.message || 'Impossible de charger la marque');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    void fetchData();
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.surface }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Chargement de la marque...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <View style={[styles.errorIconContainer, { backgroundColor: theme.colors.error + '15' }]}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          </View>
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Erreur</Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => fetchData()}
          >
            <Ionicons name="refresh" size={18} color="#FFF" />
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!brand) {
    return null;
  }

  const firstCollectionWithCover = collections.find((c) => c.coverImage || c.teaserVideo);

  const spotlightBrand = {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo || '',
    // Si la marque n'a qu'un teaser vidéo (sans cover image), BrandSpotlight pourra l'afficher
    teaserVideo: (brand as any).teaserVideo || undefined,
    coverImage:
      brand.coverImage ||
      (firstCollectionWithCover?.coverImage || firstCollectionWithCover?.teaserVideo || ''),
    description:
      brand.description ||
      brand.bio ||
      `Découvrez l'univers de ${brand.name}`,
    stats: {
      followers: brand.followerCount ?? 0,
      collections: brand._count?.collections ?? 0,
      products: brand._count?.products ?? brand.productCount ?? 0,
    },
    tags: ['créateur', 'local'],
    verified: brand.isVerified,
    isFollowing: false,
    instagram: brand.instagram,
    website: brand.website,
    whatsapp: brand.whatsapp,
  } as any;

  const mappedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    images: p.images || [],
    brandId: p.brandId,
    brandName: brand.name,
    brandLogo: brand.logo || undefined,
    stock: p.stock,
    colors: p.colors,
    sizes: p.sizes,
    isNew: false,
    discount: undefined,
  }));

  const upcomingCollections = collections.filter((c) => {
    if (!c.launchDate) return false;
    if (c.status !== 'TEASER') return false;
    const launchTime = new Date(c.launchDate).getTime();
    return launchTime > Date.now();
  });

  const nextCollection = upcomingCollections[0];

  const brandLogoFull = brand.logo
    ? brand.logo.startsWith('http')
      ? brand.logo
      : `${API_URL}${brand.logo.startsWith('/') ? '' : '/'}${brand.logo}`
    : '';

  const nextCoverFull = nextCollection?.coverImage
    ? nextCollection.coverImage
    : nextCollection?.teaserVideo
      ? nextCollection.teaserVideo
      : (firstCollectionWithCover?.coverImage || firstCollectionWithCover?.teaserVideo || brand.coverImage || '');

  const nextTeaserVideoFull = nextCollection?.teaserVideo ?? undefined;

  const renderCollectionCard = (item: CollectionDto, index: number) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.collectionCard, { backgroundColor: theme.colors.card }]}
      activeOpacity={0.85}
      onPress={() => router.push(`/clientCollectionid/${item.id}`)}
    >
      <View style={styles.collectionImageWrapper}>
        {item.teaserVideo && item.teaserVideo.trim() !== '' ? (
          <>
            <Video
              source={{ uri: item.teaserVideo }}
              style={styles.collectionImage}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isMuted
              useNativeControls={false}
              isLooping={false}
            />
            <View style={styles.collectionVideoIndicator}>
              <Ionicons name="play-circle" size={34} color="rgba(255,255,255,0.95)" />
            </View>
          </>
        ) : item.coverImage ? (
          <Image 
            source={{ uri: item.coverImage }} 
            style={styles.collectionImage} 
            contentFit="cover" 
          />
        ) : (
          <View style={[styles.collectionImagePlaceholder, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="images-outline" size={40} color={theme.colors.textSecondary} />
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.collectionGradient}
        />
        
        {/* Collection Info Overlay */}
        <View style={styles.collectionOverlay}>
          <Text style={styles.collectionName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.collectionMeta}>
            <View style={styles.collectionMetaItem}>
              <Ionicons name="cube-outline" size={14} color="#FFF" />
              <Text style={styles.collectionMetaText}>
                {((item as any).visibleProductCount ?? item._count?.products ?? 0)} {(((item as any).visibleProductCount ?? item._count?.products ?? 0) > 1 ? 'pièces' : 'pièce')}
              </Text>
            </View>
            {item.launchDate && (
              <View style={styles.collectionMetaItem}>
                <Ionicons name="calendar-outline" size={14} color="#FFF" />
                <Text style={styles.collectionMetaText}>
                  {new Date(item.launchDate).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Status Badge */}
        {item.status && (
          <View style={[
            styles.collectionStatusBadge,
            item.status === 'TEASER' && styles.teaserBadge,
            item.status === 'DISPONIBLE' && styles.availableBadge,
          ]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>
              {item.status === 'TEASER' ? 'Bientôt' : 'Disponible'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Fixed Header */}
      <Animated.View 
        style={[
          styles.fixedHeader,
          { 
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.headerBackButton, { backgroundColor: theme.colors.surface }]}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {brand.name}
        </Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Brand Spotlight */}
        <View style={styles.spotlightWrapper}>
          <BrandSpotlight
            brand={spotlightBrand}
            onFollow={() => {}}
            showSocialLinks
          />
        </View>

        {nextCollection && (
          <View style={styles.dropCountdownWrapper}>
            <DropCountdown
              collectionId={nextCollection.id}
              collectionName={nextCollection.name}
              brandName={brand.name}
              brandLogo={brandLogoFull}
              coverImage={nextCoverFull}
              teaserVideo={nextTeaserVideoFull}
              launchDate={new Date(nextCollection.launchDate as any)}
              onPreview={() => router.push(`/clientCollectionid/${nextCollection.id}`)}
            />
          </View>
        )}

        {/* Tabs avec design amélioré */}
        <View style={[styles.tabsWrapper, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.tabsContainer, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'products' && [styles.activeTab, { backgroundColor: theme.colors.primary }],
              ]}
              onPress={() => setActiveTab('products')}
            >
              <Ionicons 
                name="cube-outline" 
                size={18} 
                color={activeTab === 'products' ? '#FFF' : theme.colors.textSecondary} 
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeTab === 'products' ? '#FFF' : theme.colors.textSecondary },
                  activeTab === 'products' && styles.activeTabLabel,
                ]}
              >
                Produits
              </Text>
              {products.length > 0 && (
                <View style={[
                  styles.tabBadge,
                  { backgroundColor: activeTab === 'products' ? 'rgba(255,255,255,0.25)' : theme.colors.primary + '20' }
                ]}>
                  <Text style={[
                    styles.tabBadgeText,
                    { color: activeTab === 'products' ? '#FFF' : theme.colors.primary }
                  ]}>
                    {products.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'collections' && [styles.activeTab, { backgroundColor: theme.colors.primary }],
              ]}
              onPress={() => setActiveTab('collections')}
            >
              <Ionicons 
                name="albums-outline" 
                size={18} 
                color={activeTab === 'collections' ? '#FFF' : theme.colors.textSecondary} 
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeTab === 'collections' ? '#FFF' : theme.colors.textSecondary },
                  activeTab === 'collections' && styles.activeTabLabel,
                ]}
              >
                Collections
              </Text>
              {collections.length > 0 && (
                <View style={[
                  styles.tabBadge,
                  { backgroundColor: activeTab === 'collections' ? 'rgba(255,255,255,0.25)' : theme.colors.primary + '20' }
                ]}>
                  <Text style={[
                    styles.tabBadgeText,
                    { color: activeTab === 'collections' ? '#FFF' : theme.colors.primary }
                  ]}>
                    {collections.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentWrapper}>
          {activeTab === 'products' ? (
            mappedProducts.length > 0 ? (
              <TrendingGrid
                products={mappedProducts as any}
                onAddToCart={handleAddToCart}
                onProductPress={(product) => router.push(`/clientProductid/${product.id}`)}
                onLike={() => {}}
              />
            ) : (
              <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Ionicons name="cube-outline" size={48} color={theme.colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                  Aucun produit
                </Text>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  Cette marque n&apos;a pas encore de produits disponibles.
                </Text>
              </View>
            )
          ) : collections.length > 0 ? (
            <View style={styles.collectionsGrid}>
              {collections.map((item, index) => renderCollectionCard(item, index))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name="albums-outline" size={48} color={theme.colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                Aucune collection
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Cette marque n&apos;a pas encore créé de collections.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingContainer: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    gap: 16,
  },
  errorIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  fixedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  headerSpacer: {
    width: 40,
  },
  spotlightWrapper: {
    marginTop: 8,
  },
  dropCountdownWrapper: {
    marginTop: 8,
    marginBottom: 4,
  },
  tabsWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 6,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabLabel: {
    fontWeight: '700',
  },
  tabBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contentWrapper: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  emptyState: {
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  collectionsGrid: {
    paddingHorizontal: 16,
    gap: 16,
  },
  collectionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  collectionImageWrapper: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  collectionImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionVideoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -17,
    marginTop: -17,
  },
  collectionGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  collectionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  collectionName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 26,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  collectionMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  collectionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  collectionMetaText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 13,
    fontWeight: '500',
  },
  collectionStatusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  teaserBadge: {
    backgroundColor: 'rgba(234,179,8,0.95)',
  },
  availableBadge: {
    backgroundColor: 'rgba(34,197,94,0.95)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bottomSpacer: {
    height: 32,
  },
});