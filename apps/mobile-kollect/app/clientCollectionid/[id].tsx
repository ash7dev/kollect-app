import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { collectionsApi, CollectionStatus, type CollectionDto } from '../../src/features/collections/services/collections.service';
import TrendingGrid from '../../src/components/clients/TrendingGrid';
import { useCartStore } from '../../src/store/cartStore';
import { formatPrice } from '@/features/commandes/types/commande.types';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ClientCollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();

  const [collection, setCollection] = useState<CollectionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addItemToCart = useCartStore((s) => s.addItem);

  useEffect(() => {
    let isMounted = true;

    const fetchCollection = async () => {
      if (!id) return;
      try {
        setError(null);
        setLoading(true);
        const res = await collectionsApi.getPublic(String(id), true);
        if (isMounted) {
          setCollection(res);
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e?.message || 'Collection non disponible');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCollection();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const isTeaser = collection?.status === CollectionStatus.TEASER;
  const isAvailable = collection?.status === CollectionStatus.DISPONIBLE;

  const mappedProducts = useMemo(() => {
    if (!collection?.products) return [];
    return collection.products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      images: p.images || [],
      brandId: collection.brandId,
      brandName: collection.brand?.name || 'Sans marque',
      brandLogo: collection.brand?.logo || undefined,
      stock: p.stock,
      colors: p.colors,
      sizes: p.sizes,
      isNew: isTeaser,
      discount: undefined,
    }));
  }, [collection, isTeaser]);

  const handleAddToCart = (product: any) => {
    if (!isAvailable) return;

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
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Chargement de la collection...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !collection) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <View style={[styles.errorIconContainer, { backgroundColor: theme.colors.error + '15' }]}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          </View>
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Oups!</Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            Cette collection n&pos;est pas disponible pour le moment
          </Text>
          <TouchableOpacity
            style={[styles.errorButton, { backgroundColor: theme.colors.primary }]}
            activeOpacity={0.85}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={18} color="#FFF" />
            <Text style={styles.errorButtonText}>Retour aux collections</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero Header avec image/vidéo */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={
              collection.coverImage
                ? { uri: collection.coverImage }
                : collection.teaserVideo
                ? { uri: collection.teaserVideo }
                : undefined
            }
            style={styles.heroImage}
            imageStyle={styles.heroImageStyle}
          >
            {/* Gradient overlay pour meilleure lisibilité */}
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
              locations={[0, 0.5, 1]}
              style={styles.heroGradient}
            />

            {/* Bouton retour glassmorphism */}
            <View style={styles.headerTopRow}>
              <TouchableOpacity
                style={styles.glassButton}
                activeOpacity={0.8}
                onPress={() => router.back()}
              >
                <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                  <Ionicons name="chevron-back" size={24} color="#FFF" />
                </BlurView>
              </TouchableOpacity>
            </View>

            {/* Icône play pour vidéo teaser */}
            {collection.teaserVideo && !collection.coverImage && (
              <View style={styles.playIconContainer}>
                <View style={styles.playIconRing}>
                  <Ionicons name="play" size={32} color="#FFF" />
                </View>
              </View>
            )}

            {/* Contenu hero */}
            <View style={styles.heroContent}>
              {/* Badge de statut moderne */}
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.modernBadge,
                    isTeaser && styles.teaserModernBadge,
                    isAvailable && styles.availableModernBadge,
                  ]}
                >
                  <View style={styles.badgeDot} />
                  <Text style={styles.modernBadgeText}>
                    {isTeaser ? 'Bientôt disponible' : isAvailable ? 'Disponible maintenant' : 'Collection'}
                  </Text>
                </View>
              </View>

              {/* Brand et nom */}
              {collection.brand && (
                <Text style={styles.heroBrandName}>{collection.brand.name.toUpperCase()}</Text>
              )}
              <Text style={styles.heroCollectionName}>{collection.name}</Text>

              {/* Date de lancement */}
              {collection.launchDate && (
                <View style={styles.launchDateContainer}>
                  <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.heroLaunchDate}>
                    Lancement le {new Date(collection.launchDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
              )}
            </View>
          </ImageBackground>
        </View>

        {/* Description avec carte élégante */}
        {collection.description && (
          <View style={[styles.descriptionCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.descriptionHeader}>
              <View style={[styles.decorativeLine, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.descriptionTitle, { color: theme.colors.text }]}>
                À propos de la collection
              </Text>
            </View>
            <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
              {collection.description}
            </Text>
          </View>
        )}

        {/* Banner info pour teaser */}
        {isTeaser && (
          <View style={[styles.teaserBanner, { backgroundColor: theme.colors.warning + '15' }]}>
            <View style={[styles.teaserIconContainer, { backgroundColor: theme.colors.warning }]}>
              <Ionicons name="time-outline" size={20} color="#FFF" />
            </View>
            <View style={styles.teaserTextContainer}>
              <Text style={[styles.teaserTitle, { color: theme.colors.text }]}>
                Avant-première exclusive
              </Text>
              <Text style={[styles.teaserDescription, { color: theme.colors.textSecondary }]}>
                Découvrez en exclusivité les pièces de cette collection. Disponible à l&apos;achat très bientôt.
              </Text>
            </View>
          </View>
        )}

        {/* Section produits */}
        <View style={styles.productsSection}>
          <View style={styles.productsSectionHeader}>
            <View>
              <Text style={[styles.productsSectionTitle, { color: theme.colors.text }]}>
                Pièces de la collection
              </Text>
              <Text style={[styles.productsSectionSubtitle, { color: theme.colors.textSecondary }]}>
                {mappedProducts.length} {mappedProducts.length > 1 ? 'articles' : 'article'}
              </Text>
            </View>
            {mappedProducts.length > 0 && (
              <View style={[styles.productsCountBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.productsCountText, { color: theme.colors.primary }]}>
                  {mappedProducts.length}
                </Text>
              </View>
            )}
          </View>

          {mappedProducts.length > 0 ? (
            <TrendingGrid
              products={mappedProducts as any}
              onProductPress={
                isAvailable
                  ? (product) => router.push(`/clientProductid/${product.id}`)
                  : undefined
              }
              onAddToCart={isAvailable ? handleAddToCart : undefined}
              onLike={() => {}}
              contentContainerStyle={{ paddingHorizontal: 0 }}
            />
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name="cube-outline" size={36} color={theme.colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                Bientôt disponible
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Les pièces de cette collection seront bientôt ajoutées. Revenez plus tard!
              </Text>
            </View>
          )}
        </View>

        {/* Espace en bas */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  errorIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  heroContainer: {
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: 440,
    justifyContent: 'flex-end',
  },
  heroImageStyle: {
    resizeMode: 'cover',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerTopRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  glassButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  statusContainer: {
    marginBottom: 16,
  },
  modernBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    gap: 6,
  },
  teaserModernBadge: {
    backgroundColor: 'rgba(234,179,8,0.95)',
  },
  availableModernBadge: {
    backgroundColor: 'rgba(34,197,94,0.95)',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  modernBadgeText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heroBrandName: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroCollectionName: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  launchDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroLaunchDate: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500',
  },
  descriptionCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  decorativeLine: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  teaserBanner: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 14,
  },
  teaserIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teaserTextContainer: {
    flex: 1,
  },
  teaserTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  teaserDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  productsSection: {
    paddingHorizontal: 16,
  },
  productsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  productsSectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  productsSectionSubtitle: {
    fontSize: 14,
  },
  productsCountBadge: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  productsCountText: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 32,
  },
});