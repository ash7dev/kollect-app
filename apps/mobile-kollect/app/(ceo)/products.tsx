/* eslint-disable @typescript-eslint/no-unused-vars */
import { View, Text, StyleSheet, TextInput, ActivityIndicator, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { CreateProductModalStepper } from '@/components/product/CreateProductModalStepper';
import { useState, useEffect, useMemo } from 'react';
import { ProductDraft } from '@/utils/storage';
import { useAuthStore } from '@/store/authStore';
import { useCollectionsStore } from '@/features/collections/store/collectionStore';
import { CollectionStatus } from '@/features/collections/services/collections.service';
import { formatPrice } from '@/features/commandes/types/commande.types';
import { useProducts } from '@/features/produits/hooks/useProducts';
import { ProduitDto } from '@/features/produits/services/produits.service';
import { useProduitsStore } from '@/features/produits/store/produitsStore';

type GroupByOption = 'none' | 'collection';

export default function ProductsScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');
  
  const { user } = useAuthStore();
  const { collections, loading: loadingCollections } = useCollectionsStore();
  const brandId = user?.brand?.id;

  // Récupérer tous les produits de la marque
  const { data: productsData, isLoading: loadingProducts, refetch, isRefetching } = useProducts();
  const products = productsData?.data || [];

  // Synchroniser avec le store
  const { setProduits } = useProduitsStore();
  useEffect(() => {
    if (products.length > 0) {
      setProduits(products);
    }
  }, [products, setProduits]);

  // Filtrer les collections disponibles
  const availableCollections = collections.filter(
    collection => collection.status === CollectionStatus.DISPONIBLE || 
                collection.status === CollectionStatus.TEASER
  );

  const handleAddProduct = async (product: ProductDraft, collectionId: string): Promise<void> => {
    try {
      if (!brandId) {
        throw new Error('Aucune marque associée à cet utilisateur');
      }
      await refetch();
      return Promise.resolve();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      return Promise.reject(error);
    }
  };

  // Filtrer et grouper les produits
  const filteredAndGroupedProducts = useMemo(() => {
    let filtered = products;

    // Filtre de recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query)
      );
    }

    // Grouper par collection si demandé
    if (groupBy === 'collection') {
      const grouped: Record<string, ProduitDto[]> = {};
      filtered.forEach(product => {
        const collectionId = product.collectionId || 'sans-collection';
        if (!grouped[collectionId]) {
          grouped[collectionId] = [];
        }
        grouped[collectionId].push(product);
      });
      return grouped;
    }

    return filtered;
  }, [products, searchQuery, groupBy]);

  // Fonction pour déterminer le statut du stock
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'out', label: 'Épuisé', color: '#EF4444' };
    if (stock <= 5) return { status: 'low', label: 'Stock faible', color: '#F59E0B' };
    if (stock <= 10) return { status: 'limited', label: 'Stock limité', color: '#EAB308' };
    return { status: 'available', label: 'En stock', color: '#10B981' };
  };

  // Afficher le loader pendant le chargement initial
  if (loadingCollections || (loadingProducts && products.length === 0)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Chargement des produits...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderProductCard = ({ item }: { item: ProduitDto }) => {
    const collection = collections.find(c => c.id === item.collectionId);
    const stockStatus = getStockStatus(item.stock);
    const isOutOfStock = item.stock === 0;
    const isLowStock = item.stock > 0 && item.stock <= 5;
    
    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.borderLight,
            shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
            shadowOffset: { width: 0, height: isDark ? 4 : 2 },
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: isDark ? 4 : 2,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        {/* Image avec overlay si épuisé */}
        <View style={styles.imageContainer}>
          {item.images && item.images.length > 0 ? (
            <Image 
              source={{ uri: item.images[0] }} 
              style={[styles.productImage, isOutOfStock && styles.imageOutOfStock]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImagePlaceholder, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="image-outline" size={32} color={theme.colors.textDisabled} />
            </View>
          )}
          
          {/* Badge épuisé */}
          {isOutOfStock && (
            <View style={[styles.outOfStockBadge, { backgroundColor: 'rgba(0, 0, 0, 0.75)' }]}>
              <Text style={styles.outOfStockText}>ÉPUISÉ</Text>
            </View>
          )}

          {/* Badge stock faible */}
          {isLowStock && (
            <View style={[styles.urgencyBadge, { backgroundColor: stockStatus.color }]}>
              <Ionicons name="flame" size={12} color="#FFF" />
              <Text style={styles.urgencyText}>Plus que {item.stock} !</Text>
            </View>
          )}

          {/* Badge collection */}
          {collection && (
            <View style={[styles.collectionTopBadge, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}>
              <Ionicons name="folder" size={10} color="#FFF" />
              <Text style={styles.collectionTopText} numberOfLines={1}>
                {collection.name}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          {/* Nom du produit */}
          <Text style={[styles.productName, { color: theme.colors.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          
          {/* SKU si disponible */}
          {item.sku && (
            <Text style={[styles.productSku, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              SKU: {item.sku}
            </Text>
          )}
          
          {/* Prix et stock */}
          <View style={styles.productFooter}>
            <View style={styles.priceContainer}>
              <Text style={[styles.productPrice, { color: theme.colors.primary }]}>
                {formatPrice(item.price)}
              </Text>
            </View>
            
            <View style={[styles.stockBadge, { 
              backgroundColor: `${stockStatus.color}15`,
              borderColor: stockStatus.color,
            }]}>
              <View style={[styles.stockDot, { backgroundColor: stockStatus.color }]} />
              <Text style={[styles.stockBadgeText, { color: stockStatus.color }]}>
                {item.stock}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroupedSection = (collectionId: string, items: ProduitDto[]) => {
    const collection = collections.find(c => c.id === collectionId);
    const collectionName = collection?.name || 'Sans collection';
    const totalStock = items.reduce((sum, item) => sum + item.stock, 0);

    return (
      <View key={collectionId} style={styles.groupSection}>
        <View style={styles.groupHeader}>
          <View>
            <Text style={[styles.groupTitle, { color: theme.colors.text }]}>
              {collectionName}
            </Text>
            <Text style={[styles.groupSubtitle, { color: theme.colors.textSecondary }]}>
              {items.length} produit{items.length > 1 ? 's' : ''} • {totalStock} en stock
            </Text>
          </View>
        </View>
        <FlatList
          data={items}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="cube-outline" size={64} color={theme.colors.textDisabled} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        Aucun produit
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {searchQuery 
          ? 'Aucun produit ne correspond à votre recherche'
          : 'Créez votre premier produit pour commencer'
        }
      </Text>
    </View>
  );

  const isGrouped = groupBy === 'collection' && typeof filteredAndGroupedProducts === 'object';
  const flatProducts = !isGrouped ? (filteredAndGroupedProducts as ProduitDto[]) : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Produits
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {products.length} produit{products.length > 1 ? 's' : ''} au total
          </Text>
        </View>
      </View>
      
      <View style={styles.controlsContainer}>
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Rechercher un produit..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.groupByContainer}>
          <TouchableOpacity
            style={[
              styles.groupByButton,
              {
                backgroundColor: groupBy === 'none' ? theme.colors.primary : theme.colors.card,
                borderColor: theme.colors.borderLight,
              },
            ]}
            onPress={() => setGroupBy('none')}
          >
            <Ionicons 
              name="grid-outline" 
              size={18} 
              color={groupBy === 'none' ? '#FFF' : theme.colors.textSecondary} 
            />
            <Text
              style={[
                styles.groupByText,
                { color: groupBy === 'none' ? '#FFF' : theme.colors.text },
              ]}
            >
              Liste
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.groupByButton,
              {
                backgroundColor: groupBy === 'collection' ? theme.colors.primary : theme.colors.card,
                borderColor: theme.colors.borderLight,
              },
            ]}
            onPress={() => setGroupBy('collection')}
          >
            <Ionicons 
              name="folder-outline" 
              size={18} 
              color={groupBy === 'collection' ? '#FFF' : theme.colors.textSecondary} 
            />
            <Text
              style={[
                styles.groupByText,
                { color: groupBy === 'collection' ? '#FFF' : theme.colors.text },
              ]}
            >
              Collections
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isGrouped ? (
        <FlatList
          key="flatlist-grouped"
          data={Object.entries(filteredAndGroupedProducts as Record<string, ProduitDto[]>)}
          renderItem={({ item: [collectionId, items] }) => renderGroupedSection(collectionId, items)}
          keyExtractor={([collectionId]) => collectionId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
            />
          }
        />
      ) : (
        <FlatList
          key={`flatlist-grid-2`}
          data={flatProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
      
      <CreateProductModalStepper
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        collections={availableCollections}
        onSubmit={handleAddProduct}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  titleContainer: {
    marginBottom: 16,
    marginTop: 42,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  controlsContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  searchIcon: {
    marginRight: 0,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  groupByContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  groupByButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  groupByText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageOutOfStock: {
    opacity: 0.5,
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -15 }],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  outOfStockText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  urgencyBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  urgencyText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  collectionTopBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
    maxWidth: '60%',
  },
  collectionTopText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  productInfo: {
    padding: 14,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  productSku: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 10,
    opacity: 0.7,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceContainer: {
    flex: 1,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  groupSection: {
    marginBottom: 28,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  groupTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: 2,
  },
  groupSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  horizontalList: {
    gap: 12,
    paddingRight: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});