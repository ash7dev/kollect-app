/* eslint-disable no-unused-expressions */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';
import { useSuiviStore } from '../../features/suivi/store/suiviStore';
import { LinearGradient } from 'expo-linear-gradient';
import { formatPrice } from '../../features/commandes/types/commande.types';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  brandId?: string;
  brandName: string;
  brandLogo?: string;
  stock: number;
  colors?: string[];
  sizes?: string[];
  isNew?: boolean;
  discount?: number;
  isVisible?: boolean;
}

interface TrendingGridProps {
  products: Product[];
  onProductPress?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onLike?: (productId: string) => void;
  contentContainerStyle?: any;
}

export default function TrendingGrid({
  products,
  onProductPress,
  onAddToCart,
  onLike,
  contentContainerStyle,
}: TrendingGridProps) {
  const { theme, isDark } = useTheme();
  const { followingProducts, followProduct, unfollowProduct } = useSuiviStore();
  const user = useAuthStore((s) => s.user);
  const isCEOOrAdmin = !!user && (user.isCEO || user.isAdmin);

  // 🔥 Couleurs dynamiques centralisées
  const colors = {
    // Card
    card: theme.colors.card,
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'transparent',
    cardShadowOpacity: isDark ? 0.4 : 0.08,
    
    // Image container
    imageBg: isDark ? theme.colors.surface : '#f5f5f5',
    imageGradient: isDark 
      ? ['transparent', 'rgba(0,0,0,0.4)'] as const
      : ['transparent', 'rgba(0,0,0,0.15)'] as const,
    
    // Like button
    likeBg: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.95)',
    likeBgActive: 'rgba(255, 59, 48, 0.95)',
    
    // Textes
    text: theme.colors.text,
    textSecondary: theme.colors.textSecondary,
    
    // Brand
    brandBg: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.primary + '10',
    brandText: isDark ? theme.colors.accent : theme.colors.primary,
    
    // Prix
    price: isDark ? theme.colors.accent : theme.colors.text,
    
    // Attributs
    attrBg: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.background,
    colorDotBorder: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
    moreIndicatorBorder: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
    
    // Savings
    savingsBg: isDark ? 'rgba(52,199,89,0.25)' : theme.colors.success + '20',
    
    // Out of stock
    outOfStockBadgeBg: isDark ? theme.colors.surface : 'white',
  };

  const handleLike = (productId: string) => {
    const isLiked = !!followingProducts[productId];
    isLiked ? void unfollowProduct(productId) : void followProduct(productId);
    onLike?.(productId);
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const isLiked = !!followingProducts[item.id];
    const hasDiscount = item.discount && item.discount > 0;
    const discountedPrice = hasDiscount ? item.price * (1 - item.discount! / 100) : item.price;
    const isLowStock = item.stock > 0 && item.stock <= 5;
    const isOutOfStock = item.stock === 0;
    const isComingSoon = (item as any)?.isVisible === false;

    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          { 
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            borderWidth: isDark ? 1 : 0,
            opacity: isOutOfStock ? 0.7 : 1,
            shadowOpacity: colors.cardShadowOpacity,
          }
        ]}
        activeOpacity={0.95}
        onPress={() => onProductPress?.(item)}
      >
        {/* Image Container */}
        <View style={[styles.imageContainer, { backgroundColor: colors.imageBg }]}>
          <Image
            source={{ uri: item.images[0] }}
            style={styles.productImage}
            contentFit="cover"
            transition={300}
          />

          <LinearGradient colors={colors.imageGradient} style={styles.imageGradient} />

          {/* Badges */}
          <View style={styles.badges}>
            {item.isNew && (
              <LinearGradient
                colors={['#34C759', '#30D158']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.badge, styles.newBadge]}
              >
                <Ionicons name="sparkles" size={10} color="white" />
                <Text style={styles.badgeText}>NOUVEAU</Text>
              </LinearGradient>
            )}
            {hasDiscount && (
              <LinearGradient
                colors={['#FF3B30', '#FF453A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.badge, styles.discountBadge]}
              >
                <Ionicons name="pricetag" size={10} color="white" />
                <Text style={styles.badgeText}>-{item.discount}%</Text>
              </LinearGradient>
            )}
          </View>

          {/* Like Button */}
          <TouchableOpacity
            style={[
              styles.likeButton,
              { backgroundColor: isLiked ? colors.likeBgActive : colors.likeBg },
            ]}
            onPress={() => handleLike(item.id)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={18}
              color={isLiked ? 'white' : colors.text}
            />
          </TouchableOpacity>

          {/* Stock Indicators */}
          {isLowStock && (
            <View style={styles.stockBadge}>
              <LinearGradient
                colors={['rgba(255, 149, 0, 0.95)', 'rgba(255, 69, 58, 0.95)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.stockGradient}
              >
                <Ionicons name="flame" size={12} color="white" />
                <Text style={styles.stockBadgeText}>Plus que {item.stock} !</Text>
              </LinearGradient>
            </View>
          )}
          
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <View style={[styles.outOfStockBadge, { backgroundColor: colors.outOfStockBadgeBg }]}>
                <Ionicons name="close-circle" size={16} color="#FF3B30" />
                <Text style={styles.outOfStockText}>Épuisé</Text>
              </View>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Brand */}
          {item.brandName && (
            <View style={[styles.brandContainer, { backgroundColor: colors.brandBg }]}>
              {item.brandLogo && (
                <View style={[styles.brandLogoContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.9)' : 'white' }]}>
                  <Image source={{ uri: item.brandLogo }} style={styles.brandLogo} />
                </View>
              )}
              <Text style={[styles.brandName, { color: colors.brandText }]} numberOfLines={1}>
                {item.brandName}
              </Text>
            </View>
          )}

          {/* Product Name */}
          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Teaser label when backend marks product as invisible (coming soon) */}
          {isComingSoon && (
            <View style={[styles.teaserLabel, { backgroundColor: theme.colors.accent + '20' }]}>
              <Ionicons name="time-outline" size={11} color={theme.colors.accent} />
              <Text style={[styles.teaserLabelText, { color: theme.colors.accent }]}>Bientôt disponible</Text>
            </View>
          )}

          {/* Colors & Sizes */}
          <View style={styles.attributesRow}>
            {item.colors && item.colors.length > 0 && (
              <View style={styles.colorsContainer}>
                {item.colors.slice(0, 3).map((color, idx) => (
                  <View
                    key={idx}
                    style={[styles.colorDot, { backgroundColor: color, borderColor: colors.colorDotBorder }]}
                  />
                ))}
                {item.colors.length > 3 && (
                  <View style={[styles.moreIndicator, { backgroundColor: colors.attrBg, borderColor: colors.moreIndicatorBorder }]}>
                    <Text style={[styles.moreText, { color: colors.textSecondary }]}>+{item.colors.length - 3}</Text>
                  </View>
                )}
              </View>
            )}

            {item.sizes && item.sizes.length > 0 && (
              <View style={[styles.sizesIndicator, { backgroundColor: colors.attrBg }]}>
                <Ionicons name="resize-outline" size={12} color={colors.textSecondary} />
                <Text style={[styles.sizesText, { color: colors.textSecondary }]}>{item.sizes.length}</Text>
              </View>
            )}
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: colors.price }]}>
                {formatPrice(discountedPrice)}
              </Text>
              {hasDiscount && (
                <View style={styles.oldPriceContainer}>
                  <Text style={[styles.oldPrice, { color: colors.textSecondary }]}>
                    {formatPrice(item.price)}
                  </Text>
                  <View style={[styles.savingsBadge, { backgroundColor: colors.savingsBg }]}>
                    <Text style={[styles.savingsText, { color: theme.colors.success }]}>
                      -{Math.round(((item.price - discountedPrice) / item.price) * 100)}%
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Quick Add Button (hidden for CEO/Admin) */}
        {!isOutOfStock && !isCEOOrAdmin && (
          <TouchableOpacity
            style={styles.quickAddButton}
            onPress={(e) => { e.stopPropagation(); onAddToCart?.(item); }}
            activeOpacity={0.9}
          >
            <View
              style={[
                styles.quickAddGradient,
                { backgroundColor: theme.colors.accent },
              ]}
            >
              <Ionicons name="add-circle" size={18} color="white" />
              <Text style={styles.quickAddText}>Ajouter au panier</Text>
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={[styles.grid, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  grid: { paddingHorizontal: 16, paddingTop: 8 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  productCard: {
    width: ITEM_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: { width: '100%', height: ITEM_WIDTH * 1.35, position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  imageGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%' },
  badges: { position: 'absolute', top: 10, left: 10, gap: 6, zIndex: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  newBadge: {},
  discountBadge: {},
  badgeText: { color: 'white', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  likeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 2,
  },
  stockBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 },
  stockGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 6, gap: 4 },
  stockBadgeText: { color: 'white', fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  outOfStockOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  outOfStockBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  outOfStockText: { color: '#FF3B30', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  productInfo: { padding: 14, gap: 8 },
  brandContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 5 },
  brandLogoContainer: { width: 16, height: 16, borderRadius: 8, overflow: 'hidden' },
  brandLogo: { width: '100%', height: '100%' },
  brandName: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  productName: { fontSize: 14, fontWeight: '700', lineHeight: 19, minHeight: 38 },
  teaserLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    gap: 4,
  },
  teaserLabelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  attributesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  colorsContainer: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  colorDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  moreIndicator: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  moreText: { fontSize: 8, fontWeight: '700' },
  sizesIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, gap: 3 },
  sizesText: { fontSize: 10, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  priceContainer: { gap: 4 },
  price: { fontSize: 17, fontWeight: '800', letterSpacing: -0.5 },
  oldPriceContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  oldPrice: { fontSize: 12, fontWeight: '600', textDecorationLine: 'line-through' },
  savingsBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  savingsText: { fontSize: 10, fontWeight: '800' },
  quickAddButton: { overflow: 'hidden' },
  quickAddGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  quickAddText: { color: 'white', fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
});