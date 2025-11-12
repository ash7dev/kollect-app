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
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Image } from 'expo-image';
import { produitsService, type ProduitDto } from '../../src/features/produits/services/produits.service';
import { collectionsApi, type HomePageResponse, type CollectionDto } from '../../src/features/collections/services/collections.service';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import DepthCarousel from '../../src/components/clients/DepthCarousel';


export default function ClientHomeScreen() {
  const { theme, isDark } = useTheme();
  const colorScheme = useColorScheme();
  const [featuredCollections, setFeaturedCollections] = useState<CollectionDto[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<ProduitDto[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProduitDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      // Récupérer les collections en vedette
      const collectionsResponse = await collectionsApi.getFeatured(6);
      
      // Log des données des collections pour le débogage
      console.log('Collections reçues:', collectionsResponse);
      collectionsResponse.forEach((collection, index) => {
        console.log(`Collection ${index + 1}:`, {
          name: collection.name,
          coverImage: collection.coverImage,
          teaserVideo: collection.teaserVideo,
          brand: collection.brand
        });
      });
      
      // Ajouter l'URL de base aux images si nécessaire
      const API_URL = 'https://maurice-unfelicitous-semisuccessfully.ngrok-free.dev';
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
      
      // Récupérer les produits tendance
      // À implémenter: Remplacer par l'appel API correct pour les produits tendance
      // Pour l'instant, on utilise un tableau vide
      setTrendingProducts([]);
      
      // Récupérer les nouvelles arrivées
      // À implémenter: Remplacer par l'appel API correct pour les nouvelles arrivées
      // Pour l'instant, on utilise un tableau vide
      setNewArrivals([]);
      
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Chargement en cours...
        </Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="warning-outline" size={50} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.text }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={fetchData}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header avec logo et icônes */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: theme.colors.card,
          borderBottomColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
          shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
        }
      ]}>
        <View style={styles.topBar}>
          {/* Logo Kollect style Instagram */}
          <View style={styles.logoContainer}>
            <Text style={[styles.logo, { color: theme.colors.text }]}>Kollect</Text>
          </View>
          
          {/* Icônes à droite */}
          <View style={styles.iconsContainer}>
            {/* Bouton de notification */}
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons 
                name="notifications-outline" 
                size={26} 
                color={theme.colors.text} 
              />
              <View style={[styles.notificationBadge, { backgroundColor: theme.colors.accent }]}>
                <Text style={styles.notificationText}>3</Text>
              </View>
            </TouchableOpacity>
            
            {/* Bouton panier */}
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons 
                name="cart-outline" 
                size={26} 
                color={theme.colors.text} 
              />
              <View style={[styles.cartBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.cartText, { color: isDark ? theme.colors.text : '#FFFFFF' }]}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Barre de recherche en dessous */}
        <View style={[
          styles.searchContainer, 
          { 
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.surface,
            borderWidth: 1,
            borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
          }
        ]}>
          <Ionicons 
            name="search" 
            size={18} 
            color={theme.colors.textSecondary} 
            style={styles.searchIcon} 
          />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Rechercher..."
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
      </View>
      
      {/* Contenu principal */}
      <ScrollView 
        style={styles.scrollView}
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
          {/* Collections en vedette avec accordéon horizontal */}
          {featuredCollections.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Collections en vedette
              </Text>
              
              <DepthCarousel 
                data={featuredCollections
                  .filter(collection => collection.coverImage) // Ne garder que les collections avec une image
                  .map(collection => ({
                    id: collection.id,
                    title: collection.name,
                    image: collection.coverImage as string, // On est sûr que coverImage n'est pas null grâce au filtre
                    brandName: collection.brand?.name,
                    brandLogo: collection.brand?.logo || undefined, // Logo de la marque (optionnel)
                    status: collection.status,
                    viewCount: collection._count?.views || 0,
                    productCount: collection._count?.products || 0,
                    description: collection.description || 'Découvrez cette collection exclusive avec des produits de qualité supérieure.'
                  }))} 
              />
            </View>
          )}
          
          {/* Produits tendance */}
          {trendingProducts.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Tendance du moment
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
              >
                {trendingProducts.map(product => (
                  <View 
                    key={product.id} 
                    style={[styles.productCard, { backgroundColor: theme.colors.card }]}
                  >
                    <Text style={[styles.productName, { color: theme.colors.text }]}>
                      {product.name}
                    </Text>
                    <Text style={[styles.productPrice, { color: theme.colors.primary }]}>
                      {product.price} CFA
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
          
          {/* Section vide si pas de collections */}
          {featuredCollections.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Aucune collection disponible pour le moment
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    fontSize: 36,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'cursive',
    fontStyle: 'italic',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 16,
  },
  horizontalScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  productCard: {
    width: 160,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  accordionContent: {
    paddingVertical: 8,
  },
  collectionDescription: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  productsGrid: {
    marginBottom: 16,
  },
  productsLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});