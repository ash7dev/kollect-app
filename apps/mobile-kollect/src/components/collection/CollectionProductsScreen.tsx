import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';
import { AddProductModal } from '@/components/collection/AddProductModal';
import { storage, ProductDraft } from '@/utils/storage';

interface CollectionProductsScreenProps {
  onNext?: () => void;
  canProceed?: boolean;
}

export default function CollectionProductsScreen({ 
  onNext, 
  canProceed 
}: CollectionProductsScreenProps) {
  const { theme, isDark } = useTheme();
  const [products, setProducts] = useState<ProductDraft[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les produits au montage du composant
  const loadProducts = async () => {
    try {
      console.log('📦 Chargement des produits...');
      setIsLoading(true);
      
      const draft = await storage.getDraftCollection();
      const loadedProducts = draft?.products || [];
      
      console.log('✅ Produits chargés:', loadedProducts.length);
      setProducts(loadedProducts);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des produits:', error);
      Alert.alert('Erreur', 'Impossible de charger les produits');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Gérer l'ajout d'un nouveau produit
  const handleAddProduct = async (product: ProductDraft) => {
    try {
      console.log('➕ Ajout du produit:', product.name);
      
      // Le produit est déjà sauvegardé dans le draft par AddProductModal
      // On recharge juste la liste
      await loadProducts();
      
      console.log('✅ Produit ajouté avec succès');
      setModalVisible(false);
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du produit:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le produit');
    }
  };

  // Supprimer un produit
  const handleDeleteProduct = async (productSku: string) => {
    Alert.alert(
      'Supprimer le produit',
      'Es-tu sûr de vouloir supprimer ce produit ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Suppression du produit:', productSku);
              
              const draft = await storage.getDraftCollection();
              if (!draft) return;

              // Filtrer les produits
              const updatedProducts = draft.products.filter(
                p => p.sku !== productSku
              );

              // Sauvegarder le draft mis à jour
              await storage.saveDraftCollection({
                ...draft,
                products: updatedProducts,
              });

              // Recharger la liste
              await loadProducts();
              
              console.log('✅ Produit supprimé');
            } catch (error) {
              console.error('❌ Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le produit');
            }
          },
        },
      ]
    );
  };

  // Card d'un produit avec effet BOOM
  const renderProductCard = ({ item }: { item: ProductDraft }) => (
    <View 
      style={[
        styles.productCard, 
        { 
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.borderLight,
          // BOOM: Ombre forte
          shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
          shadowOffset: { width: 0, height: isDark ? 6 : 4 },
          shadowOpacity: 1,
          shadowRadius: 10,
          elevation: isDark ? 6 : 4,
        }
      ]}
    >
      {/* Image du produit */}
      <View 
        style={[
          styles.imageBox,
          { 
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.borderLight,
          }
        ]}
      >
        {item.images?.[0] ? (
          <Image 
            source={{ uri: item.images[0] }} 
            style={styles.productImage}
          />
        ) : (
          <Ionicons 
            name="image-outline" 
            size={28} 
            color={theme.colors.textDisabled} 
          />
        )}
      </View>

      {/* Infos du produit */}
      <View style={{ flex: 1 }}>
        <Text 
          style={[styles.productName, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text style={[styles.productPrice, { color: theme.colors.accent }]}>
          {item.price.toLocaleString('fr-FR')} FCFA
        </Text>
        <View style={styles.productMeta}>
          <View style={styles.metaItem}>
            <Ionicons 
              name="cube-outline" 
              size={14} 
              color={theme.colors.textSecondary} 
            />
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              Stock: {item.stock}
            </Text>
          </View>
          {item.sizes && item.sizes.length > 0 && (
            <View style={styles.metaItem}>
              <Ionicons 
                name="resize-outline" 
                size={14} 
                color={theme.colors.textSecondary} 
              />
              <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                {item.sizes.length} taille{item.sizes.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Bouton supprimer */}
      <TouchableOpacity
        style={[
          styles.deleteButton, 
          { 
            backgroundColor: theme.colors.error + '15',
            borderWidth: 1,
            borderColor: theme.colors.error + '30',
          }
        ]}
        onPress={() => handleDeleteProduct(item.sku)}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  // État vide avec BOOM
  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View 
        style={[
          styles.emptyIcon, 
          { 
            backgroundColor: theme.colors.surface,
            borderWidth: 2,
            borderColor: theme.colors.borderLight,
          }
        ]}
      >
        <Ionicons name="shirt-outline" size={64} color={theme.colors.textDisabled} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        Aucun produit
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        Tu dois ajouter au moins un produit avant de continuer.
      </Text>
      <TouchableOpacity
        style={[
          styles.addButtonEmpty, 
          { 
            backgroundColor: theme.colors.accent,
            // BOOM: Ombre forte sur CTA
            shadowColor: theme.colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 6,
          }
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFF" />
        <Text style={styles.addButtonText}>Ajouter un produit</Text>
      </TouchableOpacity>
    </View>
  );

  const hasProducts = products.length > 0;

  // État de chargement
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Chargement des produits...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Crée d&apos;abord ce que tu vas proposer.
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {products.length > 0 
              ? `${products.length} produit${products.length > 1 ? 's' : ''} ajouté${products.length > 1 ? 's' : ''}`
              : 'Ajoute au moins un produit pour continuer'}
          </Text>
        </View>
        {hasProducts && (
          <TouchableOpacity
            style={[
              styles.addButtonHeader, 
              { 
                backgroundColor: theme.colors.primary,
                borderWidth: 1,
                borderColor: isDark ? theme.colors.borderDark : theme.colors.border,
                // BOOM: Mini ombre
                shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
                elevation: 2,
              }
            ]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.addButtonHeaderText}>Ajouter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Liste des produits */}
      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={item => item.sku}
        ListEmptyComponent={renderEmpty()}
        contentContainerStyle={[
          !hasProducts && { flex: 1, justifyContent: 'center' },
          hasProducts && { paddingBottom: 100 }
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB - Bouton flottant avec BOOM */}
      {hasProducts && (
        <TouchableOpacity
          style={[
            styles.fab, 
            { 
              backgroundColor: theme.colors.accent,
              // BOOM: Ombre forte FAB
              shadowColor: theme.colors.accent,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }
          ]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* Bouton Suivant avec BOOM */}
      {onNext && (
        <View 
          style={[
            styles.footer, 
            { 
              backgroundColor: theme.colors.card,
              borderTopWidth: 1,
              borderTopColor: theme.colors.borderLight,
              // BOOM: Ombre subtile
              shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: hasProducts 
                  ? theme.colors.accent
                  : theme.colors.textDisabled,
                opacity: hasProducts ? 1 : 0.5,
                // BOOM: Ombre sur CTA actif
                shadowColor: hasProducts ? theme.colors.accent : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: hasProducts ? 0.3 : 0,
                shadowRadius: 8,
                elevation: hasProducts ? 4 : 0,
              },
            ]}
            onPress={onNext}
            disabled={!hasProducts}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              Suivant • Configurer le teaser
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Modal d'ajout de produit */}
      <AddProductModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddProduct}
        collectionName="Nouvelle collection"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  subtitle: { 
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
    lineHeight: 20,
  },
  addButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addButtonHeaderText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  productCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 12,
    alignItems: 'center',
  },
  imageBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productName: { 
    fontSize: 16, 
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  productPrice: { 
    fontSize: 15, 
    fontWeight: '700',
    marginBottom: 6,
  },
  productMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: { 
    alignItems: 'center', 
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  emptyText: { 
    fontSize: 15, 
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  addButtonEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});