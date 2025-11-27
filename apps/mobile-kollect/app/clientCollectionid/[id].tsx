/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { collectionsApi, CollectionStatus, type CollectionDto } from '../../src/features/collections/services/collections.service';
import TrendingGrid from '../../src/components/clients/TrendingGrid';
import { useCartStore } from '../../src/store/cartStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 480;

export default function ClientCollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [collection, setCollection] = useState<CollectionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollY = new Animated.Value(0);
  const [heroMuted, setHeroMuted] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const addItemToCart = useCartStore((s) => s.addItem);

  // 🔥 Couleurs dynamiques
  const colors = {
    bg: theme.colors.background,
    card: theme.colors.card,
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    surface: theme.colors.surface,
    text: theme.colors.text,
    textSecondary: theme.colors.textSecondary,
    textMuted: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
    accent: theme.colors.accent,
    primary: theme.colors.primary,
    shadowOpacity: isDark ? 0.5 : 0.08,
    // Hero gradient
    heroGradient: [
      'rgba(0,0,0,0.1)',
      'rgba(0,0,0,0.05)',
      'rgba(0,0,0,0.6)',
      isDark ? 'rgba(0,0,0,0.98)' : 'rgba(0,0,0,0.85)',
    ] as const,
    // Glass button
    glassBg: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.25)',
    glassBorder: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.2)',
    // Badges
    teaserBg: isDark ? 'rgba(251,191,36,0.2)' : 'rgba(251,191,36,0.15)',
    teaserText: isDark ? '#FBBF24' : '#B45309',
    availableBg: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.15)',
    availableText: isDark ? '#22C55E' : '#15803D',
  };

  useEffect(() => {
    let isMounted = true;
    const fetchCollection = async () => {
      if (!id) return;
      try {
        setError(null);
        setLoading(true);
        const res = await collectionsApi.getPublic(String(id), true);
        if (isMounted) setCollection(res);
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Collection non disponible');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCollection();
    return () => { isMounted = false; };
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
      // On relaie simplement le flag de visibilité backend si présent
      isVisible: (p as any)?.isVisible,
      discount: undefined,
    }));
  }, [collection, isTeaser]);

  const handleAddToCart = (product: any) => {
    if (!isAvailable) return;
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
              { text: 'Voir mon panier', onPress: () => { resolve(false); router.push('/(client)?openCart=1'); } },
              { text: 'Vider & ajouter', style: 'destructive', onPress: () => resolve(true) },
              { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
            ],
            { cancelable: true },
          );
        });
      },
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !collection) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <View style={[styles.errorIcon, { backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)' }]}>
            <Ionicons name="cloud-offline-outline" size={40} color={theme.colors.error} />
          </View>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Collection introuvable</Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Cette collection n&apos;est pas disponible pour le moment
          </Text>
          <TouchableOpacity
            style={[styles.errorButton, { backgroundColor: colors.accent }]}
            activeOpacity={0.85}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={18} color="#FFF" />
            <Text style={styles.errorButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const hasTeaserVideo = !!collection.teaserVideo;
  const heroImage = collection.coverImage || undefined;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* Hero Section (vidéo teaser si disponible, sinon image) */}
        <View style={styles.heroContainer}>
          {hasTeaserVideo ? (
            <Video
              source={{ uri: collection.teaserVideo as string }}
              style={styles.heroImage}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted={heroMuted}
              volume={heroMuted ? 0 : 1}
              posterSource={heroImage ? { uri: heroImage } : undefined}
              usePoster={!!heroImage}
            />
          ) : heroImage ? (
            <Image
              source={{ uri: heroImage }}
              style={styles.heroImage}
              contentFit="cover"
            />
          ) : null}
          
          <LinearGradient colors={colors.heroGradient} locations={[0, 0.3, 0.7, 1]} style={styles.heroGradient} />

          {/* Back Button + Sound Toggle */}
          <SafeAreaView edges={['top']} style={styles.headerAbsolute}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
                activeOpacity={0.8}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={24} color="#FFF" />
              </TouchableOpacity>

              {hasTeaserVideo && (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={[styles.soundButton, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
                    activeOpacity={0.8}
                    onPress={() => setHeroMuted((prev) => !prev)}
                  >
                    <Ionicons
                      name={heroMuted ? 'volume-mute' : 'volume-high'}
                      size={18}
                      color="#FFF"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.soundButton, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
                    activeOpacity={0.8}
                    onPress={() => setIsPreviewOpen(true)}
                  >
                    <Ionicons name="expand" size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </SafeAreaView>

          {/* Hero Content */}
          <View style={styles.heroContent}>
            {/* Status Badge */}
            <View style={[
              styles.statusBadge,
              { backgroundColor: isTeaser ? colors.teaserBg : isAvailable ? colors.availableBg : colors.glassBg }
            ]}>
              <View style={[styles.statusDot, { backgroundColor: isTeaser ? colors.teaserText : colors.availableText }]} />
              <Text style={[styles.statusText, { color: isTeaser ? colors.teaserText : colors.availableText }]}>
                {isTeaser ? 'Bientôt disponible' : isAvailable ? 'Disponible' : 'Collection'}
              </Text>
            </View>

            {/* Brand */}
            {collection.brand && (
              <Text style={styles.heroBrand}>{collection.brand.name}</Text>
            )}

            {/* Collection Name */}
            <Text style={styles.heroTitle}>{collection.name}</Text>

            {/* Launch Date */}
            {collection.launchDate && (
              <View style={styles.launchRow}>
                <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.launchText}>{formatDate(collection.launchDate)}</Text>
              </View>
            )}

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{mappedProducts.length}</Text>
                <Text style={styles.statLabel}>Pièces</Text>
              </View>
              {collection.brand && (
                <>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{collection.brand.name}</Text>
                    <Text style={styles.statLabel}>Marque</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={[styles.mainContent, { backgroundColor: colors.bg }]}>
          {/* Description */}
          {collection.description && (
            <View style={[styles.section, styles.descriptionSection]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>À propos</Text>
              <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                {collection.description}
              </Text>
            </View>
          )}

          {/* Teaser Banner */}
          {isTeaser && (
            <View style={[styles.teaserCard, { backgroundColor: colors.teaserBg, borderColor: isDark ? 'rgba(251,191,36,0.3)' : 'transparent' }]}>
              <View style={[styles.teaserIconBox, { backgroundColor: isDark ? 'rgba(251,191,36,0.3)' : 'rgba(251,191,36,0.2)' }]}>
                <Ionicons name="sparkles" size={20} color={colors.teaserText} />
              </View>
              <View style={styles.teaserContent}>
                <Text style={[styles.teaserTitle, { color: colors.teaserText }]}>Avant-première</Text>
                <Text style={[styles.teaserDesc, { color: colors.textSecondary }]}>
                  Découvrez les pièces en exclusivité. Bientôt disponible à l&apos;achat.
                </Text>
              </View>
            </View>
          )}

          {/* Products Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Pièces</Text>
              <View style={[styles.countBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.surface }]}>
                <Text style={[styles.countText, { color: colors.textSecondary }]}>{mappedProducts.length}</Text>
              </View>
            </View>

            {mappedProducts.length > 0 ? (
              <TrendingGrid
                products={mappedProducts as any}
                // On autorise toujours la consultation de la fiche produit,
                // même en mode teaser
                onProductPress={(p) => router.push(`/clientProductid/${p.id}`)}
                // Mais on ne permet l'ajout au panier que si la collection est disponible
                onAddToCart={isAvailable ? handleAddToCart : undefined}
                onLike={() => {}}
                contentContainerStyle={{ paddingHorizontal: 0 }}
              />
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
                  <Ionicons name="cube-outline" size={32} color={colors.textSecondary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Bientôt disponible</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Les pièces seront ajoutées prochainement
                </Text>
              </View>
            )}
          </View>

          <View style={{ height: 40 }} />
        </View>
      </Animated.ScrollView>

      {/* Modal de prévisualisation plein écran pour le teaser client */}
      <Modal
        visible={isPreviewOpen}
        transparent={false}
        statusBarTranslucent
        onRequestClose={() => setIsPreviewOpen(false)}
      >
        <View style={styles.fullscreenContainer}>
          {hasTeaserVideo ? (
            <Video
              source={{ uri: collection.teaserVideo as string }}
              style={styles.fullscreenVideo}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping
              useNativeControls
            />
          ) : heroImage ? (
            <Image
              source={{ uri: heroImage }}
              style={styles.fullscreenImage}
              contentFit="contain"
            />
          ) : null}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsPreviewOpen(false)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { fontSize: 15, fontWeight: '500', marginTop: 16 },
  
  // Error
  errorIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  errorTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  errorText: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  errorButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  errorButtonText: { color: '#FFF', fontSize: 15, fontWeight: '600' },

  // Hero
  heroContainer: { height: HERO_HEIGHT, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { ...StyleSheet.absoluteFillObject },
  headerAbsolute: { position: 'absolute', top: 0, left: 16, right: 16, zIndex: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  backButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  soundButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  
  // Fullscreen preview
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  fullscreenVideo: {
    width: '100%',
    height: '80%',
    backgroundColor: 'black',
    alignSelf: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 28 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6, marginBottom: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  heroBrand: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  heroTitle: { color: '#FFF', fontSize: 28, fontWeight: '800', lineHeight: 34, marginBottom: 10 },
  launchRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  launchText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500' },
  
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, gap: 16 },
  statItem: { alignItems: 'center' },
  statValue: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '500', marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Main
  mainContent: { marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 24 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { fontSize: 13, fontWeight: '600' },

  // Description
  descriptionSection: { marginBottom: 20 },
  descriptionText: { fontSize: 14, lineHeight: 22 },

  // Teaser
  teaserCard: { marginHorizontal: 16, marginBottom: 24, padding: 16, borderRadius: 16, flexDirection: 'row', gap: 14, borderWidth: 1 },
  teaserIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  teaserContent: { flex: 1 },
  teaserTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  teaserDesc: { fontSize: 13, lineHeight: 18 },

  // Empty
  emptyState: { alignItems: 'center', padding: 40, borderRadius: 16, borderWidth: 1 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyText: { fontSize: 13, textAlign: 'center' },
});