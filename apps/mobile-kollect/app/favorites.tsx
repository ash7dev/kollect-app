import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { suiviService } from '../src/features/suivi/services/suivi.service';
import { produitsService, type ProduitDto } from '../src/features/produits/services/produits.service';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function FavoritesScreen() {
  const { theme, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProduitDto[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setError(null);
        setLoading(true);
        const ids = await suiviService.getMyFavoriteProducts();
        if (!ids || ids.length === 0) {
          setProducts([]);
          return;
        }

        const results: ProduitDto[] = [];
        for (const id of ids) {
          try {
            const p = await produitsService.getPublic(id);
            results.push(p);
          } catch (e) {
            console.warn('[Favorites] Impossible de charger le produit', id, e);
          }
        }
        setProducts(results);
      } catch (e: any) {
        setError(e?.message || 'Erreur lors du chargement des favoris');
      } finally {
        setLoading(false);
      }
    };

    void loadFavorites();
  }, []);

  const renderItem = ({ item }: { item: ProduitDto }) => (
    <TouchableOpacity
      style={styles.cardWrapper}
      activeOpacity={0.9}
      onPress={() => router.push(`/clientProductid/${item.id}`)}
    >
      <View style={[
        styles.card, 
        { 
          backgroundColor: theme.colors.card,
          shadowColor: isDark ? '#000' : '#000',
          shadowOpacity: isDark ? 0.4 : 0.1,
        }
      ]}>
        <View style={styles.imageContainer}>
          {item.images?.[0] ? (
            <Image
              source={{ uri: item.images[0] }}
              style={styles.image}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }]}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 32 }}>📦</Text>
            </View>
          )}
          <View style={styles.favoriteIndicator}>
            <Text style={styles.heartIcon}>❤️</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text 
            style={[styles.cardTitle, { color: theme.colors.text }]} 
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <Text style={[styles.cardPrice, { color: theme.colors.primary }]}>
            {item.price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Chargement de tes favoris...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingHorizontal: 20, paddingTop: 60 }]}> 
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 28 }}>
        <TouchableOpacity
          style={[styles.backButton, {
            backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8',
            width: 40,
            height: 40,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
          }]}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>❤️ Mes Favoris</Text>
            {products.length > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.colors.primary, marginLeft: 12 }]}>
                <Text style={styles.badgeText}>{products.length}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary, marginTop: 4 }]}>{/* Changed from 2 to 4 */}
            Tes produits préférés en un coup d'œil
          </Text>
        </View>
      </View>

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: isDark ? 'rgba(255,59,48,0.15)' : 'rgba(255,59,48,0.1)' }]}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        </View>
      )}

      {products.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
            <Text style={styles.emptyIcon}>💝</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            Aucun favori pour le moment
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Explore nos produits et ajoute-les à tes favoris en appuyant sur le cœur
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextBlock: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  badge: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  heartIcon: {
    fontSize: 16,
  },
  cardContent: {
    padding: 12,
    minHeight: 80,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 18,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 'auto',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});