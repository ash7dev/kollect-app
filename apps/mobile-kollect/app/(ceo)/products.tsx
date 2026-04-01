/* eslint-disable react-hooks/exhaustive-deps */

import { View, Text, StyleSheet, TextInput, ActivityIndicator, FlatList, SectionList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { CreateProductModalStepper } from '@/components/product/CreateProductModalStepper';
import { CreateProductFAB } from '@/components/product/CreateProductFAB';
import { useState, useEffect, useMemo } from 'react';
import { ProductDraft } from '@/utils/storage';
import { useAuthStore } from '@/store/authStore';
import { useCollectionsStore } from '@/features/collections/store/collectionStore';
import { formatPrice } from '@/features/commandes/types/commande.types';
import { useProducts, useDeletedProducts } from '@/features/produits/hooks/useProducts';
import { produitsService, ProduitDto } from '@/features/produits/services/produits.service';
import { useProduitsStore } from '@/features/produits/store/produitsStore';

type GroupByOption = 'none' | 'collection';

export default function ProductsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  const { user } = useAuthStore();
  const { collections, loading: loadingCollections, error: collectionsError, fetchCollections } = useCollectionsStore();
  const brandId = user?.brand?.id;

  const { data: productsData, isLoading: loadingProducts, refetch, isRefetching } = useProducts();
  const baseProducts: ProduitDto[] = Array.isArray(productsData)
    ? productsData
    : ((productsData as any)?.data as ProduitDto[]) || [];

  // Produits soft-deleted pour l'onglet "Masqués"
  const { data: deletedProductsData, isLoading: loadingDeleted } = useDeletedProducts();
  const baseDeleted: ProduitDto[] = Array.isArray(deletedProductsData)
    ? deletedProductsData
    : ((deletedProductsData as any)?.data as ProduitDto[]) || [];

  const { setProduits } = useProduitsStore();
  useEffect(() => {
    if (baseProducts.length > 0) {
      setProduits(baseProducts);
    }
  }, [baseProducts, setProduits]);

  // Charger les collections une seule fois au montage de l'écran
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleAddProduct = async (product: ProductDraft, collectionId: string): Promise<void> => {
    try {
      if (!brandId) {
        throw new Error('Aucune marque associée à cet utilisateur');
      }

      await produitsService.create(
        {
          collectionId,
          name: product.name,
          description: product.description,
          price: product.price,
          images: product.images,
          stock: product.stock,
          sizes: product.sizes,
          colors: product.colors,
          sku: product.sku,
        },
        product.images,
      );

      await refetch();
      return Promise.resolve();
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
      return Promise.reject(error);
    }
  };

  const filteredAndGroupedProducts = useMemo(() => {
    const source = visibilityFilter === 'hidden' ? baseDeleted : baseProducts;
    let filtered: ProduitDto[] = source as ProduitDto[];

    if (visibilityFilter === 'visible') {
      filtered = filtered.filter((p: ProduitDto) => (p as any).isVisible !== false);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p: ProduitDto) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query)
      );
    }

    if (groupBy === 'collection') {
      const grouped: Record<string, ProduitDto[]> = {};
      filtered.forEach((product: ProduitDto) => {
        const collectionId = product.collectionId || product.collection?.id || 'sans-collection';
        if (!grouped[collectionId]) {
          grouped[collectionId] = [];
        }
        grouped[collectionId].push(product);
      });

      // Format for SectionList with grouped rows of 2
      const sections: any[] = [];
      Object.entries(grouped).forEach(([collectionId, items]) => {
        const rows: ProduitDto[][] = [];
        for (let i = 0; i < items.length; i += 2) {
          rows.push(items.slice(i, i + 2));
        }

        sections.push({
          collectionId,
          count: items.length,
          totalStock: items.reduce((sum, p) => sum + p.stock, 0),
          data: rows
        });
      });
      return sections;
    }

    return filtered;
  }, [baseProducts, baseDeleted, searchQuery, groupBy, visibilityFilter]);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'out', label: 'Épuisé', color: '#EF4444' };
    if (stock <= 5) return { status: 'low', label: 'Stock faible', color: '#F59E0B' };
    if (stock <= 10) return { status: 'limited', label: 'Stock limité', color: '#EAB308' };
    return { status: 'available', label: 'En stock', color: '#10B981' };
  };

  if (
    loadingCollections ||
    loadingProducts ||
    (visibilityFilter === 'hidden' && loadingDeleted)
  ) {
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
    const isHidden = (item as any).isVisible === false;
    const isOutOfStock = item.stock === 0;
    const isLowStock = item.stock > 0 && item.stock <= 5;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.productCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.borderLight,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        <View style={styles.imageContainer}>
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0] }}
              style={[styles.productImage, isOutOfStock && styles.imageOutOfStock]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImagePlaceholder, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="image-outline" size={40} color={theme.colors.textDisabled} />
            </View>
          )}

          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockText}>ÉPUISÉ</Text>
              </View>
            </View>
          )}

          {isLowStock && (
            <View style={[styles.urgencyBadge, { backgroundColor: stockStatus.color }]}>
              <Ionicons name="alert-circle" size={14} color="#FFF" />
              <Text style={styles.urgencyText}>{item.stock} restant{item.stock > 1 ? 's' : ''}</Text>
            </View>
          )}

          {collection && (
            <View style={styles.collectionTopBadge}>
              <Ionicons name="pricetag" size={10} color="#FFF" />
              <Text style={styles.collectionTopText} numberOfLines={1}>
                {collection.name}
              </Text>
            </View>
          )}

          <View style={[styles.visibilityIndicator, {
            backgroundColor: isHidden ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)'
          }]}>
            <Ionicons
              name={isHidden ? 'eye-off' : 'eye'}
              size={12}
              color="#FFF"
            />
          </View>
        </View>

        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.colors.text }]} numberOfLines={2}>
            {item.name}
          </Text>

          {item.sku && (
            <Text style={[styles.productSku, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {item.sku}
            </Text>
          )}

          <View style={styles.productFooter}>
            <Text style={[styles.productPrice, { color: theme.colors.accent }]}>
              {formatPrice(item.price)}
            </Text>

            <View style={[styles.stockBadge, {
              backgroundColor: `${stockStatus.color}15`,
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

  const renderSectionHeader = (collectionId: string, count: number, totalStock: number) => {
    const collection = collections.find(c => c.id === collectionId);
    const collectionName = collection?.name || 'Sans collection';

    return (
      <View key={`header-${collectionId}`} style={[styles.groupHeader, { marginTop: 20 }]}>
        <View style={styles.groupHeaderLeft}>
          <Text style={[styles.groupTitle, { color: theme.colors.text }]}>
            {collectionName}
          </Text>
          <View style={styles.groupBadgesRow}>
            <View style={[styles.countBadge, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.countBadgeText, { color: theme.colors.textSecondary }]}>
                {count} produit{count > 1 ? 's' : ''}
              </Text>
            </View>
            <View style={[styles.countBadge, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="cube-outline" size={12} color={theme.colors.textSecondary} />
              <Text style={[styles.countBadgeText, { color: theme.colors.textSecondary }]}>
                {totalStock} en stock
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="cube-outline" size={56} color={theme.colors.textDisabled} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {searchQuery ? 'Aucun résultat' : 'Aucun produit'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {searchQuery
          ? 'Essayez avec d\'autres mots-clés'
          : 'Commencez par créer votre premier produit'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.emptyButtonText}>Créer un produit</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const isGrouped = groupBy === 'collection' && typeof filteredAndGroupedProducts === 'object';
  const flatProducts = !isGrouped ? (filteredAndGroupedProducts as ProduitDto[]) : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Produits
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {baseProducts.length} produit{baseProducts.length > 1 ? 's' : ''} • Gérez votre catalogue
        </Text>
      </View>

      <View style={styles.controlsContainer}>
        <View style={[styles.searchContainer, {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.borderLight,
        }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Rechercher par nom, SKU..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filtersRow}>
          <View style={styles.groupByContainer}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                groupBy === 'none' && styles.filterChipActive,
                {
                  backgroundColor: groupBy === 'none' ? theme.colors.primary : theme.colors.card,
                  borderColor: groupBy === 'none' ? theme.colors.primary : theme.colors.borderLight,
                },
              ]}
              onPress={() => setGroupBy('none')}
            >
              <Ionicons
                name="grid-outline"
                size={16}
                color={groupBy === 'none' ? '#FFF' : theme.colors.textSecondary}
              />
              <Text style={[
                styles.filterChipText,
                { color: groupBy === 'none' ? '#FFF' : theme.colors.text },
              ]}>
                Grille
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                groupBy === 'collection' && styles.filterChipActive,
                {
                  backgroundColor: groupBy === 'collection' ? theme.colors.primary : theme.colors.card,
                  borderColor: groupBy === 'collection' ? theme.colors.primary : theme.colors.borderLight,
                },
              ]}
              onPress={() => setGroupBy('collection')}
            >
              <Ionicons
                name="albums-outline"
                size={16}
                color={groupBy === 'collection' ? '#FFF' : theme.colors.textSecondary}
              />
              <Text style={[
                styles.filterChipText,
                { color: groupBy === 'collection' ? '#FFF' : theme.colors.text },
              ]}>
                Collections
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.visibilityContainer}>
            {(['all', 'visible', 'hidden'] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  visibilityFilter === filter && styles.filterChipActive,
                  {
                    backgroundColor: visibilityFilter === filter ? theme.colors.primary : theme.colors.card,
                    borderColor: visibilityFilter === filter ? theme.colors.primary : theme.colors.borderLight,
                  },
                ]}
                onPress={() => setVisibilityFilter(filter)}
              >
                <Ionicons
                  name={
                    filter === 'all' ? 'layers-outline' :
                      filter === 'visible' ? 'eye-outline' : 'eye-off-outline'
                  }
                  size={16}
                  color={visibilityFilter === filter ? '#FFF' : theme.colors.textSecondary}
                />
                <Text style={[
                  styles.filterChipText,
                  { color: visibilityFilter === filter ? '#FFF' : theme.colors.text },
                ]}>
                  {filter === 'all' ? 'Tous' : filter === 'visible' ? 'Visibles' : 'Masqués'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {visibilityFilter === 'hidden' && (
          <View style={styles.infoHiddenRow}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.infoHiddenText, { color: theme.colors.textSecondary }]}>
              Ces produits ont été supprimés et seront définitivement effacés après 30 jours.
            </Text>
          </View>
        )}
      </View>

      {groupBy === 'collection' ? (
        <SectionList
          sections={filteredAndGroupedProducts as any[]}
          renderItem={({ item: rowItems }) => (
            <View style={styles.row}>
              {rowItems.map((p: ProduitDto) => renderProductCard({ item: p }))}
              {rowItems.length === 1 && <View style={{ flex: 1, maxWidth: '48%' }} />}
            </View>
          )}
          renderSectionHeader={({ section }) => (
            renderSectionHeader(section.collectionId, section.count, section.totalStock)
          )}
          keyExtractor={(item, index) => (item[0] as ProduitDto).id + index}
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
          key="grid-list-2"
          data={filteredAndGroupedProducts as ProduitDto[]}
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

      <CreateProductFAB onPress={() => setModalVisible(true)} />

      <CreateProductModalStepper
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        collections={collections}
        onSubmit={handleAddProduct}
      />

      {/* Espacement pour la bottom navigation */}
      <View style={{ height: 100 }} />
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
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  filtersRow: {
    gap: 10,
  },
  infoHiddenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
    marginTop: 4,
  },
  infoHiddenText: {
    fontSize: 11,
    flex: 1,
  },
  groupByContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  visibilityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    flex: 1,
  },
  filterChipActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 0,
  },
  productCard: {
    flex: 1,
    maxWidth: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageOutOfStock: {
    opacity: 0.4,
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  outOfStockText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  urgencyBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  urgencyText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  collectionTopBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
    maxWidth: '70%',
  },
  collectionTopText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  visibilityIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
    height: 36,
  },
  productSku: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.6,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  groupSection: {
    marginBottom: 24,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupHeaderLeft: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  groupBadgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  horizontalList: {
    gap: 12,
    paddingRight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    opacity: 0.7,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 120, // Éviter la bottom navigation
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