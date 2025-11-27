/* eslint-disable no-unused-expressions */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSuiviStore } from '../../src/features/suivi/store/suiviStore';
import { produitsService, type ProduitDto } from '../../src/features/produits/services/produits.service';
import { useCartStore } from '../../src/store/cartStore';
import { useAuthStore } from '../../src/store/authStore';
import { formatPrice } from '@/features/commandes/types/commande.types';

const { width } = Dimensions.get('window');

export default function ClientProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [product, setProduct] = useState<ProduitDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState(1); // width / height
  const addItemToCart = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const isCEOOrAdmin = !!user && (user.isCEO || user.isAdmin);
  const { followingProducts, fetchProductFollowState, followProduct, unfollowProduct } = useSuiviStore();

  // 🔥 Couleurs dynamiques centralisées
  const colors = {
    // Backgrounds
    background: theme.colors.background,
    card: theme.colors.card,
    surface: theme.colors.surface,
    imageBg: isDark ? '#1a1a1a' : '#f5f5f5',
    
    // Textes
    text: theme.colors.text,
    textSecondary: theme.colors.textSecondary,
    textMuted: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
    
    // Bordures
    border: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.borderLight,
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'transparent',
    
    // Shadows
    shadowOpacity: isDark ? 0.4 : 0.05,
    footerShadowOpacity: isDark ? 0.5 : 0.1,
    
    // Chips inactifs
    chipBg: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.background,
    chipBorder: isDark ? 'rgba(255,255,255,0.15)' : theme.colors.borderLight,
    
    // Badges
    brandBadgeBg: isDark 
      ? 'rgba(255,255,255,0.1)' 
      : theme.colors.primary + '15',
    
    // Overlays pour boutons navigation image
    overlay: 'rgba(0,0,0,0.6)',
    overlayLight: 'rgba(0,0,0,0.55)',
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setError(null);
        setLoading(true);
        const res = await produitsService.getPublic(String(id));
        if (isMounted) setProduct(res);
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Produit non disponible');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProduct();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    if (!product) return;
    if (product.colors?.length && !selectedColor) setSelectedColor(product.colors[0]);
    if (product.sizes?.length && !selectedSize) setSelectedSize(product.sizes[0]);
  }, [product, selectedColor, selectedSize]);

  useEffect(() => {
    if (product) void fetchProductFollowState(product.id);
  }, [product, fetchProductFollowState]);

  // Met à jour le ratio de l'image affichée quand le produit ou l'index change
  useEffect(() => {
    if (!product || !product.images || product.images.length === 0) return;

    const images = product.images;
    const uri = images[currentImageIndex] || images[0];
    if (!uri) return;

    Image.getSize(
      uri,
      (imgWidth, imgHeight) => {
        if (imgWidth > 0 && imgHeight > 0) {
          setImageAspectRatio(imgWidth / imgHeight);
        }
      },
      () => {
        // Fallback carré en cas d'erreur
        setImageAspectRatio(1);
      }
    );
  }, [product, currentImageIndex]);

  const handleAddToCart = () => {
    if (!product) return;
    void addItemToCart(
      {
        productId: product.id,
        name: product.name,
        image: product.images?.[0] ?? null,
        price: product.price,
        brandId: product.brandId,
        stock: product.stock,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      },
      async (newBrandName, currentBrandName) => {
        return await new Promise((resolve) => {
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

  const handleBuyNow = () => {
    if (!product) return;
    void addItemToCart(
      {
        productId: product.id,
        name: product.name,
        image: product.images?.[0] ?? null,
        price: product.price,
        brandId: product.brandId,
        stock: product.stock,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      },
      async (newBrandName, currentBrandName) => {
        return await new Promise((resolve) => {
          Alert.alert(
            'Changer de marque ?',
            `Tu as déjà des articles de ${currentBrandName} dans ton panier.`,
            [
              { text: 'Voir mon panier', onPress: () => { resolve(false); router.push('/(client)'); } },
              { text: 'Vider & ajouter', style: 'destructive', onPress: () => resolve(true) },
              { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
            ],
            { cancelable: true },
          );
        });
      },
    );
    router.push('/checkout');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement du produit...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Produit non disponible
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.accent }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const images = product.images || [];
  const currentImage = images[currentImageIndex] || images[0];
  const isLowStock = product.stock < 10;
  const isLiked = !!followingProducts[product.id];

  const handleToggleFavorite = () => {
    if (!product) return;
    isLiked ? void unfollowProduct(product.id) : void followProduct(product.id);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Image carousel */}
        <View
          style={[
            styles.imageContainer,
            {
              backgroundColor: colors.imageBg,
              height: width / imageAspectRatio,
            },
          ]}
        >
          {currentImage ? (
            <>
              <Image
                source={{ uri: currentImage }}
                style={styles.mainImage}
                resizeMode="contain"
              />
              
              {/* Bouton favoris */}
              <TouchableOpacity
                style={[styles.favoriteButton, { backgroundColor: isLiked ? theme.colors.accent : colors.overlayLight }]}
                activeOpacity={0.85}
                onPress={handleToggleFavorite}
              >
                <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color="white" />
              </TouchableOpacity>
              
              {/* Badge de stock */}
              {isLowStock && (
                <View style={[styles.stockBadge, { backgroundColor: theme.colors.error }]}>
                  <Ionicons name="flame" size={14} color="white" />
                  <Text style={styles.stockBadgeText}>Stock limité</Text>
                </View>
              )}

              {/* Navigation images */}
              {images.length > 1 && (
                <>
                  {currentImageIndex > 0 && (
                    <TouchableOpacity
                      style={[styles.imageNavButton, styles.imageNavButtonLeft, { backgroundColor: colors.overlay }]}
                      onPress={() => setCurrentImageIndex((prev) => Math.max(0, prev - 1))}
                    >
                      <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                  )}
                  {currentImageIndex < images.length - 1 && (
                    <TouchableOpacity
                      style={[styles.imageNavButton, styles.imageNavButtonRight, { backgroundColor: colors.overlay }]}
                      onPress={() => setCurrentImageIndex((prev) => Math.min(images.length - 1, prev + 1))}
                    >
                      <Ionicons name="chevron-forward" size={24} color="white" />
                    </TouchableOpacity>
                  )}

                  <View style={[styles.imageCounter, { backgroundColor: colors.overlay }]}>
                    <Text style={styles.imageCounterText}>{currentImageIndex + 1} / {images.length}</Text>
                  </View>

                  <View style={styles.imageIndicators}>
                    {images.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.indicator,
                          {
                            backgroundColor: index === currentImageIndex ? theme.colors.accent : 'rgba(255,255,255,0.5)',
                            width: index === currentImageIndex ? 24 : 8,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </>
              )}
            </>
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                {
                  backgroundColor: colors.surface,
                  height: width / imageAspectRatio,
                },
              ]}
            >
              <Ionicons name="image-outline" size={64} color={colors.textSecondary} />
            </View>
          )}
        </View>

        {/* Contenu principal */}
        <View style={styles.content}>
          {/* Card: Info principale */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowOpacity: colors.shadowOpacity }]}>
            {product.brand && (
              <View style={[styles.brandBadge, { backgroundColor: colors.brandBadgeBg }]}>
                <Ionicons name="star" size={14} color={isDark ? theme.colors.accent : theme.colors.primary} />
                <Text style={[styles.brandName, { color: isDark ? theme.colors.accent : theme.colors.primary }]}>
                  {product.brand.name}
                </Text>
              </View>
            )}

            <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>

            <View style={styles.priceRow}>
              <Text style={[styles.productPrice, { color: colors.text }]}>
                {formatPrice(product.price)}
              </Text>
              <View style={[styles.stockIndicator, { 
                backgroundColor: isLowStock 
                  ? (isDark ? 'rgba(255,59,48,0.2)' : theme.colors.error + '15')
                  : (isDark ? 'rgba(52,199,89,0.2)' : theme.colors.success + '15')
              }]}>
                <View style={[styles.stockDot, { backgroundColor: isLowStock ? theme.colors.error : theme.colors.success }]} />
                <Text style={[styles.stockText, { color: isLowStock ? theme.colors.error : theme.colors.success }]}>
                  {product.stock} en stock
                </Text>
              </View>
            </View>
          </View>

          {/* Card: Description */}
          {product.description && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowOpacity: colors.shadowOpacity }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle" size={20} color={isDark ? theme.colors.accent : theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
              </View>
              <Text style={[styles.sectionText, { color: colors.textMuted }]}>{product.description}</Text>
            </View>
          )}

          {/* Card: Couleurs */}
          {product.colors && product.colors.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowOpacity: colors.shadowOpacity }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="color-palette" size={20} color={isDark ? theme.colors.accent : theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Couleur</Text>
              </View>
              <View style={styles.chipRow}>
                {product.colors.map((color, index) => {
                  const isActive = color === selectedColor;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.chip,
                        styles.colorChip,
                        {
                          backgroundColor: isActive ? theme.colors.accent : colors.chipBg,
                          borderColor: isActive ? theme.colors.accent : colors.chipBorder,
                        },
                      ]}
                      onPress={() => setSelectedColor(color)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, { color: isActive ? 'white' : colors.text }]}>{color}</Text>
                      {isActive && <Ionicons name="checkmark-circle" size={16} color="white" style={{ marginLeft: 4 }} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Card: Tailles */}
          {product.sizes && product.sizes.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowOpacity: colors.shadowOpacity }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="resize" size={20} color={isDark ? theme.colors.accent : theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Taille</Text>
              </View>
              <View style={styles.chipRow}>
                {product.sizes.map((size, index) => {
                  const isActive = size === selectedSize;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.chip,
                        styles.sizeChip,
                        {
                          backgroundColor: isActive ? theme.colors.accent : colors.chipBg,
                          borderColor: isActive ? theme.colors.accent : colors.chipBorder,
                        },
                      ]}
                      onPress={() => setSelectedSize(size)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, styles.sizeChipText, { color: isActive ? 'white' : colors.text }]}>{size}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            shadowOpacity: colors.footerShadowOpacity,
          },
        ]}
      >
        {!isCEOOrAdmin && (
          <TouchableOpacity
            style={[
              styles.footerButton,
              styles.secondaryButton,
              { 
                borderColor: isDark ? theme.colors.accent : theme.colors.primary,
                backgroundColor: isDark ? 'rgba(255,59,48,0.1)' : 'transparent',
              },
            ]}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={20} color={isDark ? theme.colors.accent : theme.colors.primary} />
            <Text style={[styles.secondaryButtonText, { color: isDark ? theme.colors.accent : theme.colors.primary }]}>
              Ajouter
            </Text>
          </TouchableOpacity>
        )}

        {!isCEOOrAdmin && (
          <TouchableOpacity
            style={[styles.footerButton, styles.primaryButton, { backgroundColor: theme.colors.accent }]}
            onPress={handleBuyNow}
            activeOpacity={0.9}
          >
            <Ionicons name="flash" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Acheter</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  loadingText: { fontSize: 16, fontWeight: '500' },
  errorText: { fontSize: 18, fontWeight: '600', marginTop: 12, textAlign: 'center' },
  backButton: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  backButtonText: { color: 'white', fontSize: 15, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  imageContainer: { width, height: width * 1.1, position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  imagePlaceholder: { width, height: width * 1.1, alignItems: 'center', justifyContent: 'center' },
  stockBadge: { position: 'absolute', top: 16, left: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, gap: 4 },
  stockBadgeText: { color: 'white', fontSize: 12, fontWeight: '700' },
  favoriteButton: { position: 'absolute', top: 16, right: 16, width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  imageNavButton: { position: 'absolute', top: '50%', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginTop: -22 },
  imageNavButtonLeft: { left: 16 },
  imageNavButtonRight: { right: 16 },
  imageCounter: { position: 'absolute', top: 16, right: 74, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  imageCounterText: { color: 'white', fontSize: 12, fontWeight: '600' },
  imageIndicators: { position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  indicator: { height: 8, borderRadius: 4 },
  content: { padding: 16, gap: 16 },
  card: { borderRadius: 16, padding: 20, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  brandBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginBottom: 12, gap: 4 },
  brandName: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  productName: { fontSize: 26, fontWeight: '800', marginBottom: 16, lineHeight: 32 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  productPrice: { fontSize: 28, fontWeight: '800' },
  stockIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, gap: 6 },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  sectionText: { fontSize: 15, lineHeight: 22 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 2, flexDirection: 'row', alignItems: 'center' },
  colorChip: { minWidth: 80, justifyContent: 'center' },
  sizeChip: { minWidth: 60, justifyContent: 'center', alignItems: 'center' },
  chipText: { fontSize: 14, fontWeight: '600' },
  sizeChipText: { textTransform: 'uppercase', letterSpacing: 0.5 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16, gap: 12, borderTopWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowRadius: 8, elevation: 10 },
  footerButton: { flex: 1, flexDirection: 'row', paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryButton: { borderWidth: 2 },
  secondaryButtonText: { fontSize: 15, fontWeight: '700' },
  primaryButton: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  primaryButtonText: { fontSize: 15, fontWeight: '700', color: 'white' },
});