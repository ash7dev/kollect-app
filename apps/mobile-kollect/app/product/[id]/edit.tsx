import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useProductDetails } from '@/features/produits/hooks/useProducts';
import { useUpdateProduct } from '@/features/produits/hooks/useProductMutations';
import { UpdateProduitPayload } from '@/features/produits/services/produits.service';
import { PRODUCT_COLORS } from '@/constants/productColors';

const { width } = Dimensions.get('window');

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

export default function EditProductScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { data: product, isLoading } = useProductDetails(id || '');
  const updateProduct = useUpdateProduct();

  // États du formulaire
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState<string[]>([]); // URLs existantes + nouvelles URIs locales
  const [newImageUris, setNewImageUris] = useState<string[]>([]); // Nouvelles images à uploader
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pré-remplir les champs avec les données du produit
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setImages(product.images || []);
      setSelectedSizes(product.sizes || []);
      setSelectedColors(product.colors || []);
    }
  }, [product]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const toggleColor = (colorValue: string) => {
    setSelectedColors(prev =>
      prev.includes(colorValue)
        ? prev.filter(c => c !== colorValue)
        : [...prev, colorValue]
    );
  };

  // Ajouter une nouvelle image
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Accès à la galerie nécessaire');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 10 - images.length, // Limite totale de 10 images
    });

    if (!result.canceled) {
      const newUris = result.assets.map(asset => asset.uri);
      setNewImageUris(prev => [...prev, ...newUris].slice(0, 10 - images.length));
    }
  };

  // Supprimer une image existante
  const removeExistingImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Supprimer une nouvelle image (pas encore uploadée)
  const removeNewImage = (index: number) => {
    setNewImageUris(prev => prev.filter((_, i) => i !== index));
  };

  // Vérifier si une image est une URL (existante) ou une URI locale (nouvelle)
  const isLocalUri = (image: string) => {
    return image.startsWith('file://') || image.startsWith('/');
  };

  const validateForm = (): string | null => {
    if (!name.trim()) return 'Le nom du produit est requis';
    if (name.length < 3) return 'Le nom doit contenir au moins 3 caractères';
    if (!price || parseFloat(price) <= 0) return 'Le prix doit être supérieur à 0';
    if (!Number.isInteger(Number(price))) return 'Le prix doit être un entier';
    if (images.length + newImageUris.length === 0) return 'Le produit doit avoir au moins 1 image';
    if (!stock || parseInt(stock, 10) < 0) return 'Le stock doit être positif';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Erreur de validation', validationError);
      return;
    }

    if (!id) {
      Alert.alert('Erreur', 'ID du produit manquant');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: UpdateProduitPayload = {
        name: name.trim(),
         description: description.trim() || undefined,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        sizes: selectedSizes,
        colors: selectedColors,
        ...(images.length > 0 ? { images } : {}),
      };

      // Uploader seulement les nouvelles images
      const imagesToUpload = newImageUris.length > 0 ? newImageUris : undefined;

      await updateProduct.mutateAsync({
        id,
        payload,
        imageUris: imagesToUpload,
      });

      Alert.alert('Succès', 'Produit modifié avec succès', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Chargement du produit...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Produit non trouvé
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const allImages = [...images, ...newImageUris];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: theme.colors.card }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Modifier le produit
        </Text>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Images */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Photos ({allImages.length}/10)
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
            {allImages.map((image, index) => {
              const isNew = index >= images.length;
              const isLocal = isLocalUri(image);
              
              return (
                <View key={index} style={styles.imageWrapper}>
                  <Image
                    source={{ uri: image }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={[styles.removeImageButton, { backgroundColor: theme.colors.error }]}
                    onPress={() => {
                      if (isNew) {
                        removeNewImage(index - images.length);
                      } else {
                        removeExistingImage(index);
                      }
                    }}
                  >
                    <Ionicons name="close" size={16} color="#FFF" />
                  </TouchableOpacity>
                  {isNew && (
                    <View style={[styles.newBadge, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.newBadgeText}>Nouveau</Text>
                    </View>
                  )}
                </View>
              );
            })}
            
            {allImages.length < 10 && (
              <TouchableOpacity
                style={[styles.addImageButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}
                onPress={pickImages}
              >
                <Ionicons name="add" size={32} color={theme.colors.textSecondary} />
                <Text style={[styles.addImageText, { color: theme.colors.textSecondary }]}>
                  Ajouter
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Informations de base */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Informations de base
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Nom du produit *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.borderLight }]}
              value={name}
              onChangeText={setName}
              placeholder="Nom du produit"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.borderLight }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description du produit"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Prix (CFA) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.borderLight }]}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Stock *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.borderLight }]}
                value={stock}
                onChangeText={setStock}
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        {/* Tailles */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Tailles disponibles
          </Text>
          <View style={styles.chipsContainer}>
            {AVAILABLE_SIZES.map(size => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedSizes.includes(size) ? theme.colors.primary : theme.colors.card,
                    borderColor: theme.colors.borderLight,
                  },
                ]}
                onPress={() => toggleSize(size)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: selectedSizes.includes(size) ? '#FFF' : theme.colors.text },
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Couleurs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Couleurs disponibles
          </Text>
          <View style={styles.chipsContainer}>
            {PRODUCT_COLORS.map(color => (
              <TouchableOpacity
                key={`${color.value}-${color.name}`}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedColors.includes(color.value) ? theme.colors.primary : theme.colors.card,
                    borderColor: theme.colors.borderLight,
                  },
                ]}
                onPress={() => toggleColor(color.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: selectedColors.includes(color.value) ? '#FFF' : theme.colors.text },
                  ]}
                >
                  {color.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer avec bouton de sauvegarde */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.borderLight }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSubmit}
          disabled={isSubmitting || updateProduct.isPending}
          activeOpacity={0.8}
        >
          {isSubmitting || updateProduct.isPending ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
            </>
          )}
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
    fontWeight: '600',
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
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  imagesContainer: {
    marginTop: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addImageText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
