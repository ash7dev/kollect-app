import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useProductDetails } from '@/features/produits/hooks/useProducts';
import { useDeleteProduct } from '@/features/produits/hooks/useProductMutations';
import { useCollectionsStore } from '@/features/collections/store/collectionStore';
import { formatPrice } from '@/features/commandes/types/commande.types';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageAspectRatio, setImageAspectRatio] = useState(1); // width / height

  const { data: product, isLoading, error } = useProductDetails(id || '');
  const deleteProduct = useDeleteProduct();
  const { collections } = useCollectionsStore();

  const collection = product?.collectionId
    ? collections.find(c => c.id === product.collectionId)
    : null;

  const handleDelete = () => {
    if (!id) return;

    Alert.alert(
      'Supprimer le produit',
      'Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct.mutateAsync(id);
              Alert.alert('Succès', 'Produit supprimé avec succès', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error) {
              // L'erreur est déjà gérée dans le hook
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (!id) return;
    router.push(`/product/${id}/edit`);
  };

  if (isLoading) {
    return (
      <SafeAreaView 
        style={[styles.container, { backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.background }]} 
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? theme.colors.textDark : theme.colors.primary} />
          <Text style={[styles.loadingText, { color: isDark ? theme.colors.textSecondaryDark : theme.colors.textSecondary }]}>
            Chargement du produit...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView 
        style={[styles.container, { backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.background }]} 
        edges={['top']}
      >
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: isDark ? theme.colors.textDark : theme.colors.text }]}>
            Produit non trouvé
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.accent }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const images = product.images || [];
  const currentImage = images[currentImageIndex] || images[0];

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.background }]} 
      edges={['top']}
    >
      {/* Header avec bouton retour et suppression */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.headerButton,
            {
              backgroundColor: isDark ? theme.colors.cardDark : theme.colors.card,
              borderWidth: 1,
              borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
              shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
              shadowOffset: { width: 0, height: isDark ? 4 : 2 },
              shadowOpacity: 1,
              shadowRadius: 8,
              elevation: isDark ? 6 : 3,
            }
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? theme.colors.textDark : theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerSpacer} />
        
        <TouchableOpacity
          style={[
            styles.headerButton,
            {
              backgroundColor: isDark ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 59, 48, 0.1)',
              borderWidth: 1,
              borderColor: theme.colors.error,
              shadowColor: theme.colors.error,
              shadowOffset: { width: 0, height: isDark ? 4 : 2 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: isDark ? 6 : 3,
            }
          ]}
          onPress={handleDelete}
          disabled={deleteProduct.isPending}
        >
          {deleteProduct.isPending ? (
            <ActivityIndicator size="small" color={theme.colors.error} />
          ) : (
            <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Images du produit */}
        {currentImage ? (
          <View style={[styles.imageContainer, { height: width / imageAspectRatio }]}>
            <Image
              source={{ uri: currentImage }}
              style={styles.mainImage}
              resizeMode="contain"
            />
            
            {images.length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <TouchableOpacity
                    style={[styles.imageNavButton, styles.imageNavButtonLeft]}
                    onPress={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                  >
                    <Ionicons name="chevron-back" size={24} color="#FFF" />
                  </TouchableOpacity>
                )}
                
                {currentImageIndex < images.length - 1 && (
                  <TouchableOpacity
                    style={[styles.imageNavButton, styles.imageNavButtonRight]}
                    onPress={() => setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1))}
                  >
                    <Ionicons name="chevron-forward" size={24} color="#FFF" />
                  </TouchableOpacity>
                )}
                
                <View style={styles.imageIndicators}>
                  {images.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.indicator,
                        {
                          backgroundColor:
                            index === currentImageIndex ? '#FFF' : 'rgba(255,255,255,0.4)',
                        },
                      ]}
                    />
                  ))}
                </View>
              </>
            )}
          </View>
        ) : (
          <View style={[
            styles.imagePlaceholder, 
            { backgroundColor: isDark ? theme.colors.surfaceDark : theme.colors.surface }
          ]}>
            <Ionicons 
              name="image-outline" 
              size={64} 
              color={isDark ? theme.colors.textDisabledDark : theme.colors.textDisabled} 
            />
          </View>
        )}

        {/* Informations du produit */}
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={[styles.productName, { color: isDark ? theme.colors.textDark : theme.colors.text }]}>
              {product.name}
            </Text>
            <Text style={[styles.productPrice, { color: theme.colors.accent }]}>
              {formatPrice(product.price)}
            </Text>
          </View>

          {collection && (
            <View style={[
              styles.collectionBadge,
              {
                backgroundColor: isDark ? theme.colors.highlightDark : theme.colors.highlight,
                borderWidth: 1,
                borderColor: theme.colors.accent,
              }
            ]}>
              <Ionicons name="folder-outline" size={16} color={theme.colors.accent} />
              <Text style={[styles.collectionText, { color: theme.colors.accent }]}>
                {collection.name}
              </Text>
            </View>
          )}

          {product.description && (
            <View style={styles.descriptionSection}>
              <Text style={[styles.sectionTitle, { color: isDark ? theme.colors.textDark : theme.colors.text }]}>
                Description
              </Text>
              <Text style={[
                styles.description, 
                { color: isDark ? theme.colors.textSecondaryDark : theme.colors.textSecondary }
              ]}>
                {product.description}
              </Text>
            </View>
          )}

          {/* Détails - Cards avec style BOOM */}
          <View style={styles.detailsSection}>
            {/* Stock */}
            <View style={[
              styles.detailCard,
              {
                backgroundColor: isDark ? theme.colors.cardDark : theme.colors.card,
                borderWidth: 1,
                borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
                shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
                shadowOffset: { width: 0, height: isDark ? 6 : 4 },
                shadowOpacity: 1,
                shadowRadius: 12,
                elevation: isDark ? 8 : 4,
              }
            ]}>
              <View style={styles.detailItem}>
                <Ionicons 
                  name="cube-outline" 
                  size={20} 
                  color={isDark ? theme.colors.textSecondaryDark : theme.colors.textSecondary} 
                />
                <View style={styles.detailContent}>
                  <Text style={[
                    styles.detailLabel, 
                    { color: isDark ? theme.colors.textSecondaryDark : theme.colors.textSecondary }
                  ]}>
                    Stock
                  </Text>
                  <Text style={[styles.detailValue, { color: isDark ? theme.colors.textDark : theme.colors.text }]}>
                    {product.stock} unités
                  </Text>
                </View>
              </View>
            </View>

            {/* SKU */}
            {product.sku && (
              <View style={[
                styles.detailCard,
                {
                  backgroundColor: isDark ? theme.colors.cardDark : theme.colors.card,
                  borderWidth: 1,
                  borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
                  shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
                  shadowOffset: { width: 0, height: isDark ? 6 : 4 },
                  shadowOpacity: 1,
                  shadowRadius: 12,
                  elevation: isDark ? 8 : 4,
                }
              ]}>
                <View style={styles.detailItem}>
                  <Ionicons 
                    name="barcode-outline" 
                    size={20} 
                    color={isDark ? theme.colors.textSecondaryDark : theme.colors.textSecondary} 
                  />
                  <View style={styles.detailContent}>
                    <Text style={[
                      styles.detailLabel, 
                      { color: isDark ? theme.colors.textSecondaryDark : theme.colors.textSecondary }
                    ]}>
                      SKU
                    </Text>
                    <Text style={[styles.detailValue, { color: isDark ? theme.colors.textDark : theme.colors.text }]}>
                      {product.sku}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Couleurs */}
            {product.colors && product.colors.length > 0 && (
              <View style={[
                styles.detailCard,
                {
                  backgroundColor: isDark ? theme.colors.cardDark : theme.colors.card,
                  borderWidth: 1,
                  borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
                  shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
                  shadowOffset: { width: 0, height: isDark ? 6 : 4 },
                  shadowOpacity: 1,
                  shadowRadius: 12,
                  elevation: isDark ? 8 : 4,
                }
              ]}>
                <View style={styles.detailItem}>
                  <Ionicons 
                    name="color-palette-outline" 
                    size={20} 
                    color={isDark ? theme.colors.textSecondaryDark : theme.colors.textSecondary} 
                  />
                  <View style={styles.detailContent}>
                    <Text style={[
                      styles.detailLabel, 
                      { color: isDark ? theme.colors.textSecondaryDark : theme.colors.textSecondary }
                    ]}>
                      Couleurs
                    </Text>
                    <View style={styles.colorsContainer}>
                      {product.colors.map((color, index) => (
                        <View
                          key={index}
                          style={[
                            styles.colorChip,
                            {
                              backgroundColor: isDark ? theme.colors.surfaceDark : theme.colors.surface,
                              borderWidth: 1,
                              borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
                            }
                          ]}
                        >
                          <Text style={[styles.colorText, { color: isDark ? theme.colors.textDark : theme.colors.text }]}>
                            {color}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Tailles */}
            {product.sizes && product.sizes.length > 0 && (
              <View style={[
                styles.detailCard,
                {
                  backgroundColor: isDark ? theme.colors.cardDark : theme.colors.card,
                  borderWidth: 1,
                  borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
                  shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
                  shadowOffset: { width: 0, height: isDark ? 6 : 4 },
                  shadowOpacity: 1,
                  shadowRadius: 12,
                  elevation: isDark ? 8 : 4,
                }
              ]}>
                <View style={styles.detailItem}>
                  <Ionicons 
                    name="resize-outline" 
                    size={20} 
                    color={isDark ? theme.colors.textSecondaryDark : theme.colors.textSecondary} 
                  />
                  <View style={styles.detailContent}>
                    <Text style={[
                      styles.detailLabel, 
                      { color: isDark ? theme.colors.textSecondaryDark : theme.colors.textSecondary }
                    ]}>
                      Tailles
                    </Text>
                    <View style={styles.sizesContainer}>
                      {product.sizes.map((size, index) => (
                        <View
                          key={index}
                          style={[
                            styles.sizeChip,
                            {
                              backgroundColor: isDark ? theme.colors.surfaceDark : theme.colors.surface,
                              borderWidth: 1,
                              borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
                            }
                          ]}
                        >
                          <Text style={[styles.sizeText, { color: isDark ? theme.colors.textDark : theme.colors.text }]}>
                            {size}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bouton de modification en bas - Style BOOM */}
      <View style={[
        styles.footer,
        {
          backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
          shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 1,
          shadowRadius: 12,
          elevation: 12,
        }
      ]}>
        <TouchableOpacity
          style={[
            styles.editButton,
            {
              backgroundColor: theme.colors.accent,
              shadowColor: theme.colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }
          ]}
          onPress={handleEdit}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={20} color="#FFF" />
          <Text style={styles.editButtonText}>Modifier le produit</Text>
        </TouchableOpacity>
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: width,
    height: width,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: width,
    height: width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  imageNavButtonLeft: {
    left: 16,
  },
  imageNavButtonRight: {
    right: 16,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  collectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 20,
    gap: 6,
  },
  collectionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  detailsSection: {
    gap: 16,
  },
  detailCard: {
    padding: 16,
    borderRadius: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  colorChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  colorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sizesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  sizeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});