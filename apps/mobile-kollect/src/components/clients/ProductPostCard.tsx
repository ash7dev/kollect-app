import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../../app/context/ThemeContext';
import { useCartStore } from '../../store/cartStore';
import { router } from 'expo-router';
import { formatPrice } from '../../features/commandes/types/commande.types';
import { LinearGradient } from 'expo-linear-gradient'; // Si disponible

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
  onPressBrand?: (slug?: string) => void;
  onPressAdd?: () => void;
};

export function ProductPostCard({ product, onPressBrand }: Props) {
  const { theme } = useTheme();
  const addItem = useCartStore((s) => s.addItem);

  const image = product.images?.[0];

  function handleAdd() {
    if (product.price <= 0) {
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      image: image,
      price: product.price,
      brandId: product.brand?.id || 'unknown',
      brandSlug: product.brand?.slug,
      stock: product.stock,
    });
  }

  function openBrand() {
    const slug = product.brand?.slug;
    if (slug) {
      router.push(`/brand/${slug}`);
    }
  }

  return (
    <View style={[styles.card, { 
      backgroundColor: theme.colors.card, 
      borderColor: theme.colors.border 
    }]}>
      {/* Header brand avec design amélioré */}
      <TouchableOpacity 
        style={styles.header} 
        onPress={onPressBrand || openBrand}
        activeOpacity={0.7}
      >
        <View style={styles.brandContainer}>
          {product.brand?.logo ? (
            <Image source={{ uri: product.brand.logo }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { 
              backgroundColor: theme.colors.primary + '20' 
            }]}>
              <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                {product.brand?.name?.charAt(0) || 'M'}
              </Text>
            </View>
          )}
          <View style={styles.brandInfo}>
            <Text style={[styles.brandName, { color: theme.colors.text }]}>
              {product.brand?.name || 'Marque'}
            </Text>
            {product.stock !== undefined && (
              <Text style={[styles.stockText, { 
                color: product.stock > 0 ? '#10b981' : '#ef4444' 
              }]}>
                {product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Image avec overlay gradient */}
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={openBrand}
        style={styles.imageContainer}
      >
        {image ? (
          <>
            <Image source={{ uri: image }} style={styles.image} />
            {/* Badge "Nouveau" ou "Promo" optionnel */}
            {product.price > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.badgeText, { color: theme.colors.onPrimary }]}>
                  Nouveau
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={[styles.imageFallback, { backgroundColor: theme.colors.overlay }]}>
            <Text style={[styles.imageFallbackText, { color: theme.colors.textSecondary }]}>
              📷
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Footer redesigné */}
      <View style={styles.footer}>
        <View style={styles.productInfo}>
          <Text 
            numberOfLines={2} 
            style={[styles.productName, { color: theme.colors.text }]}
          >
            {product.name}
          </Text>
          {product.price > 0 ? (
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: theme.colors.text }]}>
                {formatPrice(product.price)}
              </Text>
            </View>
          ) : (
            <Text style={[styles.priceUnavailable, { color: theme.colors.textSecondary }]}>
              Prix sur demande
            </Text>
          )}
        </View>
        
        {/* CTA avec design moderne */}
        {product.price > 0 ? (
          <TouchableOpacity 
            onPress={handleAdd} 
            style={[styles.cta, { backgroundColor: theme.colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.ctaText, { color: theme.colors.onPrimary }]}>
              + Panier
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={openBrand}
            style={[styles.secondaryCta, { 
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.primary + '10'
            }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.ctaTextSecondary, { color: theme.colors.primary }]}>
              Détails →
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#ffffff20',
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 15,
    letterSpacing: 0.2,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
  },
  imageFallback: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackText: {
    fontSize: 48,
    opacity: 0.3,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
    letterSpacing: -0.2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  priceUnavailable: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  cta: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  ctaText: {
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  secondaryCta: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTextSecondary: {
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.3,
  },
});