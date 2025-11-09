/* eslint-disable import/no-duplicates */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator, Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { CollectionStatus, CollectionDto } from '@/features/collections/services/collections.service';
import { collectionsApi } from '@/features/collections/services/collections.service';
import { AddProductModal } from '@/components/collection/AddProductModal';
// Import nettoyé pour le MVP

const STATUS_CONFIG = {
  [CollectionStatus.TEASER]: {
    label: 'Teaser actif',
    color: '#FF9500', // warning
    icon: 'eye' as const,
  },
  [CollectionStatus.DISPONIBLE]: {
    label: 'Disponible',
    color: '#34C759', // success
    icon: 'flash' as const,
  },
  [CollectionStatus.EPUISEE]: {
    label: 'Épuisée',
    color: '#FF3B30', // error
    icon: 'close-circle' as const,
  },
  [CollectionStatus.TERMINE]: {
    label: 'Terminée',
    color: '#4D4D4D', // textSecondary
    icon: 'checkmark-circle' as const,
  },
};

export default function CollectionDetailScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [collection, setCollection] = useState<CollectionDto | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const videoRef = React.useRef<Video>(null);
  const [videoStatus, setVideoStatus] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  const handleAddProduct = async (productData: any) => {
    try {
      // Logique d'ajout de produit
      console.log('Ajout du produit:', productData);
      // TODO: Implémenter l'appel API pour ajouter le produit
      setShowAddProductModal(false);
      await loadCollection(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le produit');
    }
  };

  useEffect(() => {
    loadCollection();
  }, [id]);

  const loadCollection = async () => {
    try {
      setIsLoading(true);
      const data: any = await collectionsApi.getOne(id, true);
      setCollection(data);
      
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      console.error('Erreur chargement collection:', error);
      Alert.alert('Erreur', 'Impossible de charger la collection');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const openPreview = () => {
    if (!collection) return;
    setIsPreviewOpen(true);
  };

  // Gestion du cycle de vie du modal
  const handleModalClose = () => {
    if (videoRef.current) {
      videoRef.current.pauseAsync()
        .then(() => setVideoStatus('Vidéo en pause'))
        .catch(error => console.error('Erreur lors de la pause:', error));
    }
    setIsPreviewOpen(false);
  };

  // Forcer la lecture de la vidéo
  const handlePlayVideo = useCallback(async () => {
    try {
      if (videoRef.current && collection?.teaserVideo) {
        console.log('Tentative de lecture de la vidéo...');
        setVideoStatus('Chargement...');
        
        // D'abord arrêter toute lecture en cours
        await videoRef.current.pauseAsync();
        
        // Recharger la vidéo
        await videoRef.current.loadAsync(
          { uri: collection.teaserVideo },
          { shouldPlay: true },
          false
        );
        
        // Démarrer la lecture
        await videoRef.current.playAsync();
        setVideoStatus('Lecture en cours');
        console.log('Vidéo en lecture');
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Erreur inconnue';
      console.error('Erreur lors de la lecture:', error);
      setVideoStatus('Erreur: ' + errorMsg);
    }
  }, [collection?.teaserVideo]);

  // Démarrer la lecture quand le modal s'ouvre
  useEffect(() => {
    if (isPreviewOpen && collection?.teaserVideo) {
      const timer = setTimeout(() => {
        handlePlayVideo();
      }, 100); // Petit délai pour s'assurer que le composant est monté
      
      return () => clearTimeout(timer);
    }
  }, [isPreviewOpen, collection?.teaserVideo, handlePlayVideo]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!collection) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <View 
            style={[
              styles.errorIcon,
              { 
                backgroundColor: theme.colors.error + '15',
                borderWidth: 2,
                borderColor: theme.colors.error + '30',
              }
            ]}
          >
            <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
          </View>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Collection non trouvée
          </Text>
          <TouchableOpacity
            style={[
              styles.errorButton, 
              { 
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
            <Text style={styles.errorButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = STATUS_CONFIG[collection.status];
  const isAvailable = collection.status === CollectionStatus.DISPONIBLE;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec image/vidéo BOOM */}
        <View style={styles.headerContainer}>
          {collection.teaserVideo ? (
            <Video
              source={{ uri: collection.teaserVideo }}
              style={styles.headerMedia}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              useNativeControls={false}
              isMuted
            />
          ) : collection.coverImage ? (
            <TouchableOpacity onPress={openPreview} style={styles.coverImageWrapper}>
              <Image
                source={{ uri: collection.coverImage }}
                style={styles.coverImage}
                resizeMode="cover"
              />
              <View style={styles.previewOverlay}>
                <Ionicons name="expand" size={24} color="white" />
                <Text style={styles.previewText}>Appuyez pour prévisualiser</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.headerPlaceholder, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="image-outline" size={64} color={theme.colors.textDisabled} />
            </View>
          )}
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.headerGradient}
          />
          
          {/* Boutons flottants BOOM */}
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.6)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)',
              }
            ]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.editButton,
              {
                backgroundColor: theme.colors.error,
                borderWidth: 1,
                borderColor: theme.colors.error,
              }
            ]}
            onPress={() => {
              Alert.alert(
                'Supprimer la collection ?',
                'Cette action est irréversible. Tous les produits associés seront également supprimés.',
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await collectionsApi.remove(collection.id);
                        Alert.alert('Succès', 'La collection a été supprimée avec succès');
                        router.back();
                      } catch (error) {
                        console.error('Erreur suppression collection:', error);
                        Alert.alert('Erreur', 'Impossible de supprimer la collection');
                      }
                    },
                  },
                ],
              );
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={24} color="#FFF" />
          </TouchableOpacity>

          {/* Titre et statut BOOM */}
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{collection.name}</Text>
            <View 
              style={[
                styles.statusBadge, 
                { 
                  backgroundColor: statusConfig.color + '20',
                  borderWidth: 1,
                  borderColor: statusConfig.color + '40',
                }
              ]}
            >
              <Ionicons name={statusConfig.icon} size={16} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Contenu BOOM */}
        <View style={styles.content}>
          {/* Description */}
          {collection.description && (
            <View 
              style={[
                styles.section, 
                { 
                  backgroundColor: theme.colors.card,
                  borderWidth: 1,
                  borderColor: theme.colors.borderLight,
                  shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 1,
                  shadowRadius: 10,
                  elevation: 4,
                }
              ]}
            >
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Description
              </Text>
              <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                {collection.description}
              </Text>
            </View>
          )}

          {/* Produits BOOM */}
          <View 
            style={[
              styles.section, 
              { 
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
                shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 10,
                elevation: 4,
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Produits
                </Text>
                <View 
                  style={[
                    styles.countBadge,
                    { 
                      backgroundColor: theme.colors.primary + '15',
                      borderWidth: 1,
                      borderColor: theme.colors.primary + '30',
                    }
                  ]}
                >
                  <Text style={[styles.countText, { color: theme.colors.primary }]}>
                    {products.length}
                  </Text>
                </View>
              </View>
              {isModifying && (
                <TouchableOpacity
                  style={[
                    styles.addButton, 
                    { 
                      backgroundColor: theme.colors.accent,
                      shadowColor: theme.colors.accent,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 3,
                    }
                  ]}
                  onPress={() => setShowAddProductModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={20} color="#FFF" />
                  <Text style={styles.addButtonText}>Ajouter</Text>
                </TouchableOpacity>
              )}
            </View>

            {products.length === 0 ? (
              <View style={styles.emptyProducts}>
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
                  <Ionicons name="cube-outline" size={48} color={theme.colors.textDisabled} />
                </View>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  Aucun produit dans cette collection
                </Text>
                {isModifying && (
                  <TouchableOpacity
                    style={[
                      styles.addButtonEmpty,
                      { 
                        backgroundColor: theme.colors.accent,
                        shadowColor: theme.colors.accent,
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                      }
                    ]}
                    onPress={() => setShowAddProductModal(true)}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#FFF" />
                    <Text style={styles.addButtonEmptyText}>Ajouter un produit</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <FlatList
                data={products}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View 
                    style={[
                      styles.productCard, 
                      { 
                        backgroundColor: theme.colors.surface,
                        borderWidth: 1,
                        borderColor: theme.colors.borderLight,
                        shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.8,
                        shadowRadius: 6,
                        elevation: 2,
                      }
                    ]}
                  >
                    {item.images && item.images.length > 0 && (
                      <Image
                        source={{ uri: item.images[0] }}
                        style={[
                          styles.productImage,
                          {
                            borderWidth: 1,
                            borderColor: theme.colors.borderLight,
                          }
                        ]}
                      />
                    )}
                    <View style={styles.productInfo}>
                      <Text style={[styles.productName, { color: theme.colors.text }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.productPrice, { color: theme.colors.accent }]}>
                        {item.price.toLocaleString('fr-FR')} FCFA
                      </Text>
                      {!isAvailable && (
                        <View 
                          style={[
                            styles.unavailableBadge, 
                            { 
                              backgroundColor: theme.colors.error + '15',
                              borderWidth: 1,
                              borderColor: theme.colors.error + '30',
                            }
                          ]}
                        >
                          <Ionicons name="lock-closed" size={14} color={theme.colors.error} />
                          <Text style={[styles.unavailableText, { color: theme.colors.error }]}>
                            Non disponible
                          </Text>
                        </View>
                      )}
                    </View>
                    {isModifying && (
                      <TouchableOpacity
                        style={[
                          styles.deleteButton,
                          {
                            backgroundColor: theme.colors.error + '15',
                            borderWidth: 1,
                            borderColor: theme.colors.error + '30',
                          }
                        ]}
                        onPress={() => {
                          Alert.alert('Supprimer', `Supprimer ${item.name} ?`);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              />
            )}
          </View>

          {/* Boutons d'action */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton, 
                { 
                  backgroundColor: theme.colors.accent,
                  shadowColor: theme.colors.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 10,
                  elevation: 6,
                }
              ]}
              onPress={() => setIsModifying(!isModifying)}
              activeOpacity={0.85}
            >
              <Ionicons name="pencil" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>
                {isModifying ? 'Terminer la modification' : 'Modifier les produits'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal ajout produit */}
      <AddProductModal
        visible={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSubmit={handleAddProduct}
        collectionName={collection.name}
      />

      {/* Modal de prévisualisation plein écran */}
      <Modal
        visible={isPreviewOpen}
        transparent={false}
        statusBarTranslucent
        onRequestClose={handleModalClose}
      >
        <View style={styles.fullscreenContainer}>
          {collection?.teaserVideo ? (
            <>
              <Video
                ref={videoRef}
                source={{ uri: collection.teaserVideo }}
                style={styles.fullscreenVideo}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={false}
                isLooping
                useNativeControls
                onLoadStart={() => {
                  console.log('Début du chargement de la vidéo');
                  setVideoStatus('Chargement...');
                }}
                onLoad={() => {
                  console.log('Vidéo chargée');
                  setVideoStatus('Prête à lire');
                  handlePlayVideo();
                }}
                onError={(error: any) => {
                  const errorMsg = error?.nativeEvent?.error || error?.message || 'Erreur inconnue';
                  console.error('Erreur vidéo:', errorMsg);
                  setVideoStatus('Erreur: ' + errorMsg);
                }}
              />
              <Text style={styles.videoStatusText}>{videoStatus}</Text>
              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayVideo}
              >
                <Ionicons name="play" size={40} color="white" />
              </TouchableOpacity>
            </>
          ) : collection?.coverImage ? (
            <Image
              source={{ uri: collection.coverImage }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          ) : null}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsPreviewOpen(false)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Styles pour la prévisualisation
  coverImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  previewText: {
    color: 'white',
    marginTop: 8,
    fontWeight: '500',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  fullscreenVideo: {
    width: '100%',
    height: '80%',
    backgroundColor: 'black',
    alignSelf: 'center',
  },
  videoStatusText: {
    color: 'white',
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 5,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { 
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 24,
  },
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { 
    fontSize: 20, 
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  errorButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  headerContainer: {
    width: '100%',
    height: 320,
    position: 'relative',
  },
  headerMedia: {
    width: '100%',
    height: '100%',
  },
  headerPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  section: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  emptyProducts: {
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  addButtonEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  addButtonEmptyText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  productCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  unavailableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 4,
  },
  unavailableText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});