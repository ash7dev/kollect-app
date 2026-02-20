import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../../../app/context/ThemeContext';
import { useCartStore } from '../../store/cartStore';
import { router } from 'expo-router';
import { formatPrice } from '../../features/commandes/types/commande.types';
import { Ionicons } from '@expo/vector-icons';

type Product = {
  id: string;
  name: string;
  price: number;
  images?: string[];
  stock?: number;
  brand?: {
    id: string;
    name: string;
    logo?: string | null;
    slug?: string;
  };
};

type Props = {
  product: Product;
  onPressBrand?: () => void;
};

export function ProductPostCard({ product, onPressBrand }: Props) {
  const { theme } = useTheme();
  const addItem = useCartStore((s) => s.addItem);
  const [addedAnimation] = useState(new Animated.Value(0));
  const [showAdded, setShowAdded] = useState(false);

  const image = product.images?.[0];

  function handleAdd() {
    if (product.price <= 0 || product.stock === 0) return;
    
    // Animation de feedback
    setShowAdded(true);
    Animated.sequence([
      Animated.timing(addedAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(addedAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    addItem({
      productId: product.id,
      name: product.name,
      image: image,
      price: product.price,
      brandId: product.brand?.id || 'unknown',
      brandSlug: product.brand?.slug,
      stock: product.stock,
    });

    setTimeout(() => setShowAdded(false), 2000);
  }

  function openBrand() {
    const slug = product.brand?.slug;
    if (slug) {
      router.push(`/brand/${slug}`);
    }
  }

  const scaleAnim = addedAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock && product.stock < 10;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      {/* Header brand */}
      <TouchableOpacity 
        style={styles.header} 
        onPress={onPressBrand || openBrand}
        activeOpacity={0.7}
      >
        {product.brand?.logo ? (
          <Image source={{ uri: product.brand.logo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: theme.colors.overlayLight }]}>
            <Text style={[styles.avatarText, { color: theme.colors.textSecondary }]}>
              {product.brand?.name?.charAt(0) || 'M'}
            </Text>
          </View>
        )}
        <View style={styles.brandInfo}>
          <Text style={[styles.brandName, { color: theme.colors.text }]}>
            {product.brand?.name || 'Marque'}
          </Text>
          <Text style={[styles.brandMeta, { color: theme.colors.textSecondary }]}>
            Collection • Nouveau
          </Text>
        </View>
      </TouchableOpacity>

      {/* Image avec badge stock */}
      <TouchableOpacity activeOpacity={0.9} onPress={openBrand}>
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={[styles.imageFallback, { backgroundColor: theme.colors.overlay }]}>
              <Ionicons name="image-outline" size={48} color={theme.colors.textSecondary} />
            </View>
          )}
          
          {/* Badge stock */}
          {isLowStock && !isOutOfStock && (
            <View style={[styles.stockBadge, { backgroundColor: 'rgba(239, 68, 68, 0.95)' }]}>
              <Text style={styles.stockBadgeText}>
                Plus que {product.stock} en stock
              </Text>
            </View>
          )}
          
          {isOutOfStock && (
            <View style={[styles.stockBadge, { backgroundColor: 'rgba(107, 114, 128, 0.95)' }]}>
              <Text style={styles.stockBadgeText}>Rupture de stock</Text>
            </View>
          )}

          {/* Overlay gradient subtil */}
          <View style={styles.imageGradient} />
        </View>
      </TouchableOpacity>

      {/* Footer avec info produit et CTA */}
      <View style={styles.footer}>
        <View style={styles.productInfo}>
          <TouchableOpacity onPress={openBrand} activeOpacity={0.8}>
            <Text numberOfLines={2} style={[styles.productName, { color: theme.colors.text }]}>
              {product.name}
            </Text>
          </TouchableOpacity>
          
          {product.price > 0 ? (
            <Text style={[styles.price, { color: theme.colors.text }]}>
              {formatPrice(product.price)}
            </Text>
          ) : (
            <Text style={[styles.priceUnavailable, { color: theme.colors.textSecondary }]}>
              Prix sur demande
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {product.price > 0 && !isOutOfStock ? (
            <>
              {/* Bouton ajouter au panier principal */}
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity 
                  onPress={handleAdd} 
                  style={[
                    styles.addToCartButton, 
                    { 
                      backgroundColor: showAdded ? theme.colors.accent : theme.colors.primary 
                    }
                  ]}
                  activeOpacity={0.8}
                >
                  {showAdded ? (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color={theme.colors.background} />
                      <Text style={[styles.addToCartText, { color: theme.colors.background }]}>
                        Ajouté au panier !
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="cart" size={20} color={theme.colors.background} />
                      <Text style={[styles.addToCartText, { color: theme.colors.background }]}>
                        Ajouter au panier
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
              
              {/* Bouton secondaire "Voir détails" */}
              <TouchableOpacity
                onPress={openBrand}
                style={[styles.detailsButton, { borderColor: theme.colors.border }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.detailsText, { color: theme.colors.textSecondary }]}>
                  Voir les détails
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={openBrand}
              style={[styles.unavailableButton, { borderColor: theme.colors.primary }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.unavailableText, { color: theme.colors.primary }]}>
                {isOutOfStock ? 'Me notifier' : 'Voir la collection'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  brandInfo: {
    flex: 1,
    gap: 2,
  },
  brandName: {
    fontWeight: '700',
    fontSize: 14,
  },
  brandMeta: {
    fontSize: 11,
    fontWeight: '500',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  imageFallback: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'transparent',
  },
  stockBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  stockBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    padding: 14,
    gap: 12,
  },
  productInfo: {
    gap: 6,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
  },
  priceUnavailable: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  actions: {
    gap: 8,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addToCartText: {
    fontWeight: '700',
    fontSize: 15,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  detailsText: {
    fontWeight: '600',
    fontSize: 14,
  },
  unavailableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  unavailableText: {
    fontWeight: '700',
    fontSize: 14,
  },
});