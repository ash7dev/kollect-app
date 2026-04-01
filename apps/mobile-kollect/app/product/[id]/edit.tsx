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
import { LinearGradient } from 'expo-linear-gradient';
import { useProductDetails } from '@/features/produits/hooks/useProducts';
import { useUpdateProduct } from '@/features/produits/hooks/useProductMutations';
import { MotiView, AnimatePresence } from 'moti';
import { CurvedTransition } from 'react-native-reanimated';
import { UpdateProduitPayload } from '@/features/produits/services/produits.service';
import { PRODUCT_COLORS } from '@/constants/productColors';
import { PRODUCT_TYPES, GENDER_OPTIONS, PRODUCT_TYPE_CONFIG } from '@/constants/productOptions';

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
  const [productType, setProductType] = useState<string>('');
  const [gender, setGender] = useState<string>('UNISEXE');
  const [weight, setWeight] = useState<string>('');
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
      if (product.productType) setProductType(product.productType);
      if (product.gender) setGender(product.gender);
      if (product.weight) setWeight(product.weight.toString());
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

    // Dynamic Validation
    const config = productType ? PRODUCT_TYPE_CONFIG[productType] : null;
    if (config?.showSizes && selectedSizes.length === 0) return 'Sélectionne au moins une taille';
    if (config?.showColors && selectedColors.length === 0) return 'Sélectionne au moins une couleur';
    if (config?.showWeight && (!weight || parseFloat(weight) <= 0)) return 'Le poids est requis (supérieur à 0)';

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
        productType,
        gender,
        weight: weight ? parseFloat(weight) : undefined,
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

  const setAsMain = (totalIndex: number) => {
    if (totalIndex === 0) return;
    
    const newExisting = [...images];
    const newLocals = [...newImageUris];
    
    if (totalIndex < images.length) {
      const [item] = newExisting.splice(totalIndex, 1);
      newExisting.unshift(item);
    } else {
      const localIndex = totalIndex - images.length;
      const [item] = newLocals.splice(localIndex, 1);
      newLocals.unshift(item);
      // NOTE: Dans handleSubmit, on s'assurera que l'ordre est préservé.
    }
    
    setImages(newExisting);
    setNewImageUris(newLocals);
  };

  const allImages = [...images, ...newImageUris];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header avec BOOM */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[`${theme.colors.accent}15`, 'transparent']}
          style={styles.headerGradientFill}
        />
        
        <TouchableOpacity
          style={[
            styles.backButtonBoom,
            { 
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              borderColor: theme.colors.borderLight 
            }
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTextWrapper}>
          <Text style={[styles.headerTitleBoom, { color: theme.colors.text }]}>
            Modifier le produit
          </Text>
          <Text style={[styles.headerSubtitleBoom, { color: theme.colors.textSecondary }]}>
            ID: {id?.slice(-8).toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Nom */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Nom *</Text>
          <View style={[
            styles.inputWrapper,
            { 
              borderColor: name ? theme.colors.accent : theme.colors.borderLight,
              backgroundColor: theme.colors.card,
              borderWidth: 1,
            }
          ]}>
            <Ionicons name="pricetag-outline" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Nom du produit"
              placeholderTextColor={theme.colors.textDisabled}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
          <View style={[
            styles.textArea,
            { 
              borderColor: description ? theme.colors.accent : theme.colors.borderLight,
              backgroundColor: theme.colors.card,
              borderWidth: 1,
            }
          ]}>
            <TextInput
              style={[styles.textAreaInput, { color: theme.colors.text }]}
              placeholder="Décris le produit..."
              placeholderTextColor={theme.colors.textDisabled}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          </View>
          <Text style={[styles.hint, { color: theme.colors.textDisabled }]}>
            {description.length}/500 caractères
          </Text>
        </View>

        {/* Type de produit (BOOM Modern) */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Type de produit *</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
          >
            {PRODUCT_TYPES.map((item) => {
              const isSelected = productType === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setProductType(item.id)}
                  style={[
                    styles.typeCard,
                    {
                      backgroundColor: isSelected ? theme.colors.accent : theme.colors.card,
                      borderColor: isSelected ? theme.colors.accent : theme.colors.borderLight,
                      borderWidth: isSelected ? 2 : 1,
                      // BOOM: Ombre si selected
                      shadowColor: isSelected ? theme.colors.accent : 'transparent',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isSelected ? 0.3 : 0,
                      shadowRadius: 8,
                      elevation: isSelected ? 4 : 0,
                    }
                  ]}
                >
                  <Ionicons 
                    name={item.icon as any} 
                    size={22} 
                    color={isSelected ? '#FFFFFF' : theme.colors.textSecondary} 
                  />
                  <Text style={[
                    styles.typeLabel, 
                    { color: isSelected ? '#FFFFFF' : theme.colors.text }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Genre (BOOM Modern) */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Genre *</Text>
          <View style={[
            styles.genderContainer,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }
          ]}>
            {GENDER_OPTIONS.map((item) => {
              const isSelected = gender === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setGender(item.id)}
                  style={[
                    styles.genderOption,
                    {
                      backgroundColor: isSelected ? theme.colors.accent : 'transparent',
                    }
                  ]}
                >
                  <Ionicons 
                    name={item.icon as any} 
                    size={18} 
                    color={isSelected ? '#FFFFFF' : theme.colors.textSecondary} 
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[
                    styles.genderLabel,
                    { color: isSelected ? '#FFFFFF' : theme.colors.text }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Prix & Stock */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Prix (FCFA) *</Text>
            <View style={[
              styles.inputWrapper,
              { 
                borderColor: price ? theme.colors.accent : theme.colors.borderLight,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
              }
            ]}>
              <Ionicons name="cash-outline" size={20} color={theme.colors.accent} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="15000"
                placeholderTextColor={theme.colors.textDisabled}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Stock *</Text>
            <View style={[
              styles.inputWrapper, 
              { 
                borderColor: theme.colors.borderLight,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
              }
            ]}>
              <Ionicons name="cube-outline" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="10"
                placeholderTextColor={theme.colors.textDisabled}
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Poids conditionnel */}
        {productType && PRODUCT_TYPE_CONFIG[productType]?.showWeight && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Poids (kg) *</Text>
            <View style={[
              styles.inputWrapper, 
              { 
                borderColor: weight ? theme.colors.accent : theme.colors.borderLight,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
              }
            ]}>
              <Ionicons name="barbell-outline" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="0.5"
                placeholderTextColor={theme.colors.textDisabled}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>
          </View>
        )}

        {/* Images avec BOOM */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Photos *</Text>
          <Text style={[styles.hint, { color: theme.colors.textSecondary, marginBottom: 12 }]}>
            {allImages.length}/10 images • La première sera l&apos;image principale
          </Text>
          <View style={styles.imageGrid}>
            <AnimatePresence>
              {allImages.map((uri, i) => {
                const isNew = i >= images.length;
                return (
                  <MotiView 
                    key={uri} 
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring' }}
                    layout={CurvedTransition}
                    style={[
                      styles.imageItem,
                      {
                        borderWidth: 1,
                        borderColor: theme.colors.borderLight,
                        // BOOM: Mini ombre
                        shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.8,
                        shadowRadius: 4,
                        elevation: 2,
                      }
                    ]}
                  >
                    <Image source={{ uri }} style={styles.image} />
                    <TouchableOpacity
                      style={[styles.removeBtn, { backgroundColor: theme.colors.error }]}
                      onPress={() => {
                        if (isNew) {
                          removeNewImage(i - images.length);
                        } else {
                          removeExistingImage(i);
                        }
                      }}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>

                    {i > 0 && (
                      <TouchableOpacity
                        style={[styles.starBtn, { backgroundColor: 'rgba(0,0,0,0.4)', borderColor: theme.colors.borderLight }]}
                        onPress={() => setAsMain(i)}
                      >
                        <Ionicons name="star-outline" size={16} color="#FFD700" />
                      </TouchableOpacity>
                    )}

                    {i === 0 && (
                      <View style={[styles.mainBadge, { backgroundColor: theme.colors.success }]}>
                        <Text style={styles.mainText}>Principal</Text>
                      </View>
                    )}
                    {isNew && (
                      <View style={[styles.newBadgeEdit, { backgroundColor: theme.colors.accent }]}>
                        <Text style={styles.newBadgeTextEdit}>Nouveau</Text>
                      </View>
                    )}
                  </MotiView>
                );
              })}
            </AnimatePresence>
            {allImages.length < 10 && (
              <TouchableOpacity 
                style={[
                  styles.addBtn,
                  {
                    borderColor: theme.colors.borderLight,
                    backgroundColor: theme.colors.card,
                  }
                ]} 
                onPress={pickImages}
              >
                <Ionicons name="camera" size={32} color={theme.colors.accent} />
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                  Ajouter
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tailles avec BOOM */}
        {productType && PRODUCT_TYPE_CONFIG[productType]?.showSizes && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {PRODUCT_TYPE_CONFIG[productType].sizeLabel} *
            </Text>
            <View style={styles.optionsContainerBoom}>
              {AVAILABLE_SIZES.map(size => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.optionBoom,
                      {
                        backgroundColor: isSelected ? theme.colors.accent : theme.colors.card,
                        borderColor: isSelected ? theme.colors.accent : theme.colors.borderLight,
                        borderWidth: isSelected ? 2 : 1,
                        // BOOM: Mini ombre si selected
                        shadowColor: isSelected ? theme.colors.accent : 'transparent',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isSelected ? 0.3 : 0,
                        shadowRadius: 4,
                        elevation: isSelected ? 2 : 0,
                      }
                    ]}
                    onPress={() => toggleSize(size)}
                  >
                    <Text
                      style={[
                        styles.optionTextBoom,
                        { 
                          color: isSelected ? '#FFFFFF' : theme.colors.text,
                          fontWeight: isSelected ? '700' : '600',
                        },
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Couleurs avec BOOM */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {productType && PRODUCT_TYPE_CONFIG[productType]?.colorLabel ? PRODUCT_TYPE_CONFIG[productType].colorLabel : 'Couleurs disponibles'} *
          </Text>
          <View style={styles.optionsContainerBoom}>
            {PRODUCT_COLORS.map(color => {
              const isSelected = selectedColors.includes(color.value);
              return (
                <TouchableOpacity
                  key={`${color.value}-${color.name}`}
                  style={[
                    styles.colorOptionBoom,
                    {
                      backgroundColor: color.value,
                      borderColor: isSelected ? theme.colors.accent : theme.colors.borderLight,
                      borderWidth: isSelected ? 3 : 2,
                      // BOOM: Ombre si selected
                      shadowColor: isSelected ? color.value : 'transparent',
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: isSelected ? 0.5 : 0,
                      shadowRadius: 6,
                      elevation: isSelected ? 3 : 0,
                    }
                  ]}
                  onPress={() => toggleColor(color.value)}
                >
                  {isSelected && (
                    <View style={styles.checkmarkContainerBoom}>
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer avec BOOM */}
      <View 
        style={[
          styles.footerBoom, 
          { 
            borderTopColor: theme.colors.borderLight,
            borderTopWidth: 1,
            backgroundColor: theme.colors.card,
            // BOOM: Ombre subtile
            shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.cancelBtnBoom,
            {
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.borderLight,
            }
          ]}
          onPress={() => router.back()}
          disabled={isSubmitting}
        >
          <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 15 }}>
            Annuler
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitBtnBoom,
            { 
              backgroundColor: theme.colors.accent,
              opacity: isSubmitting ? 0.7 : 1,
              // BOOM: Ombre forte sur CTA
              shadowColor: theme.colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 6,
            }
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.submitTextBoom}>Enregistrer</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  
  // Header BOOM
  headerContainer: {
    height: 120,
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerGradientFill: {
    ...StyleSheet.absoluteFillObject,
  },
  backButtonBoom: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 10,
  },
  headerTextWrapper: {
    marginTop: 4,
  },
  headerTitleBoom: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  headerSubtitleBoom: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },

  // Form Fields
  field: { marginBottom: 24 },
  label: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: -0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 18,
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 140,
    borderRadius: 18,
    padding: 16,
  },
  textAreaInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  hint: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'right',
    marginRight: 4,
  },

  // Cards (Type & Gender)
  typeCard: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 120,
    justifyContent: 'center',
  },
  typeLabel: { fontSize: 15, fontWeight: '700', letterSpacing: -0.3 },
  genderContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    gap: 6,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderLabel: { fontSize: 15, fontWeight: '700', letterSpacing: -0.3 },

  // Photos Grid
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageItem: {
    width: (width - 64) / 3,
    aspectRatio: 1,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  starBtn: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
  },
  addBtn: {
    width: (width - 64) / 3,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  mainBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    alignItems: 'center',
  },
  mainText: { color: '#FFF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  newBadgeEdit: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeTextEdit: { color: '#FFF', fontSize: 10, fontWeight: '800' },

  // Options (Sizes & Colors)
  optionsContainerBoom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionBoom: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    minWidth: 55,
    alignItems: 'center',
  },
  optionTextBoom: { fontSize: 15 },
  colorOptionBoom: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainerBoom: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 24,
  },

  // Footer BOOM
  footerBoom: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 34,
    gap: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cancelBtnBoom: {
    flex: 1,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnBoom: {
    flex: 2,
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  submitTextBoom: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
  },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  backButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 24 },
  backButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  errorText: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 16 },
});
