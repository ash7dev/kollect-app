/* eslint-disable @typescript-eslint/no-unused-vars */
import { View, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useProduitsStore } from '@/features/produits/store/produitsStore';
import { CreateCollectionFAB } from '@/components/collection/CreateCollectionFAB';
import { CreateProductModalStepper } from '@/components/product/CreateProductModalStepper';
import { useState } from 'react';
import { ProduitDto } from '@/features/produits/services/produits.service';
import { ProductDraft } from '@/utils/storage';
import { useAuthStore } from '@/store/authStore';
import { useCollectionsStore } from '@/features/collections/store/collectionStore';
import { CollectionStatus } from '@/features/collections/services/collections.service';

export default function ProductsScreen() {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const { 
    produits, 
    addProduit, 
    updateProduit, 
    removeProduit,
    getProduitById,
    getProduitsByCollection 
  } = useProduitsStore();
  
  const { user } = useAuthStore();
  const { collections, loading: loadingCollections } = useCollectionsStore();
  const brandId = user?.brand?.id;

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

      const newProduct: ProduitDto = {
        id: Date.now().toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        sku: product.sku || `PROD-${Date.now()}`,
        images: product.images,
        sizes: product.sizes || [],
        colors: product.colors || [],
        collectionId: collectionId,
        brandId: brandId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addProduit(newProduct);
      return Promise.resolve();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      return Promise.reject(error);
    }
  };

  // Afficher le loader pendant le chargement des collections
  if (loadingCollections) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: theme.colors.background 
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Produits
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Gérez votre catalogue de produits
          </Text>
        </View>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Rechercher un produit..."
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <CreateCollectionFAB onPress={() => setModalVisible(true)} />
      
      <CreateProductModalStepper
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        collections={availableCollections}
        onSubmit={handleAddProduct}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    marginBottom: 16,
    marginTop: 42,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
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
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
});