import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView, AnimatePresence } from 'moti';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { CurvedTransition } from 'react-native-reanimated';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

async function normalizeImage(uri: string): Promise<string> {
  const isHeic = /\.heic?$/i.test(uri);
  if (isHeic) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { format: ImageManipulator.SaveFormat.JPEG },
    );
    return result.uri;
  }
  return uri;
}
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { storage, ProductDraft } from '../../utils/storage';
import { PRODUCT_COLORS } from '../../constants/productColors';
import { PRODUCT_TYPES, GENDER_OPTIONS, PRODUCT_TYPE_CONFIG } from '../../constants/productOptions';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (product: ProductDraft) => Promise<void>;
  collectionName: string;
  autoCloseOnSuccess?: boolean;
  embedded?: boolean;
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

export function AddProductModal({
  visible,
  onClose,
  onSubmit,
  collectionName,
  autoCloseOnSuccess = true,
  embedded = false,
}: AddProductModalProps) {
  const { theme, isDark } = useTheme();

  // États du formulaire
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [images, setImages] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [productType, setProductType] = useState<string>('');
  const [gender, setGender] = useState<string>('UNISEXE');
  const [weight, setWeight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const slideAnim = useState(new Animated.Value(SCREEN_HEIGHT))[0];

  // Toggle functions
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

  // Animation d'entrée/sortie
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [slideAnim, visible]);

  // Sélection d'images
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
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const oversized = result.assets.filter(a => a.fileSize && a.fileSize > MAX_IMAGE_SIZE_BYTES);
      if (oversized.length > 0) {
        Alert.alert(
          'Image trop lourde',
          `${oversized.length} image(s) dépassent 10 MB et ont été ignorées.`,
        );
      }
      const valid = result.assets.filter(a => !a.fileSize || a.fileSize <= MAX_IMAGE_SIZE_BYTES);
      const uris = await Promise.all(valid.map(a => normalizeImage(a.uri)));
      setImages(prev => [...prev, ...uris].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Validation
  const validateForm = (): string | null => {
    if (!name.trim()) return 'Le nom du produit est requis';
    if (name.length < 3) return 'Le nom doit contenir au moins 3 caractères';
    if (!description.trim()) return 'La description est requise';
    if (description.length < 10) return 'La description doit contenir au moins 10 caractères';
    if (!price || parseFloat(price) <= 0) return 'Le prix doit être supérieur à 0';
    if (!Number.isInteger(Number(price))) return 'Le prix doit être un entier';
    if (images.length === 0) return 'Ajoute au moins 1 image';
    if (!stock || parseInt(stock, 10) < 0) return 'Le stock doit être positif';
    
    // Dynamic Validation
    const config = productType ? PRODUCT_TYPE_CONFIG[productType] : null;
    if (config?.showSizes && selectedSizes.length === 0) return 'Sélectionne au moins une taille';
    if (config?.showColors && selectedColors.length === 0) return 'Sélectionne au moins une couleur';
    if (config?.showWeight && (!weight || parseFloat(weight) <= 0)) return 'Le poids est requis (supérieur à 0)';

    if (!productType) return 'Sélectionne un type de produit';
    if (!gender) return 'Sélectionne un genre';
    return null;
  };

  // Génération d'un SKU simple
  const generateSKU = () => {
    const prefix = name
      .substring(0, 4)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, 'X');
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${timestamp}-${random}`;
  };

  // Soumission + sauvegarde dans localStorage
  const handleSubmit = async () => {
    console.log('🔄 Début de la soumission du produit...');
    
    const error = validateForm();
    if (error) {
      Alert.alert('Validation', error);
      return;
    }

    setIsLoading(true);

    try {
      const sku = generateSKU();
      
      const product: ProductDraft = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        sku,
        images,
        sizes: selectedSizes,
        colors: selectedColors,
        productType,
        gender,
        weight: weight ? parseFloat(weight) : undefined,
      };

      console.log('📦 Produit créé:', {
        ...product,
        imagesCount: product.images.length,
        sizesCount: product.sizes.length,
        colorsCount: product.colors.length,
      });

      const saved = await storage.addProductToDraft(product);
      
      if (!saved) {
        throw new Error("Échec de la sauvegarde dans le brouillon");
      }

      console.log('✅ Produit sauvegardé dans le brouillon');

      await onSubmit(product);

      if (autoCloseOnSuccess) {
        Alert.alert(
          'Succès ✅',
          `Le produit "${name}" a été ajouté à la collection !`,
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                onClose();
              }
            }
          ]
        );
      } else {
        resetForm();
      }
    } catch (err) {
      console.error('❌ Erreur lors de la sauvegarde du produit:', err);
      Alert.alert(
        'Erreur',
        err instanceof Error ? err.message : 'Impossible de sauvegarder le produit'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setStock('10');
    setImages([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setProductType('');
    setGender('UNISEXE');
    setWeight('');
  };

  const handleClose = () => {
    if (name || description || images.length > 0) {
      Alert.alert(
        'Annuler ?',
        'Les données non sauvegardées seront perdues.',
        [
          { text: 'Rester', style: 'cancel' },
          {
            text: 'Quitter',
            style: 'destructive',
            onPress: () => {
              resetForm();
              onClose();
            }
          }
        ]
      );
    } else {
      onClose();
    }
  };

  const setAsMain = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [movedItem] = newImages.splice(index, 1);
    newImages.unshift(movedItem);
    setImages(newImages);
    // Petit feedback haptique si dispo (optionnel)
  };

  const modalBody = (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.card,
          borderTopWidth: 2,
          borderLeftWidth: 2,
          borderRightWidth: 2,
          borderColor: theme.colors.borderLight,
          // BOOM: Ombre forte
          shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 1,
          shadowRadius: 16,
          elevation: 12,
        }
      ]}
    >
      <LinearGradient
        colors={[`${theme.colors.accent}08`, 'transparent']}
        style={styles.gradient}
      />

            {/* Header avec BOOM */}
            <View 
              style={[
                styles.header, 
                { 
                  borderBottomColor: theme.colors.borderLight,
                  borderBottomWidth: 1,
                }
              ]}
            >
              <View>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  Nouveau produit
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  {collectionName}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={handleClose} 
                style={[
                  styles.closeBtn,
                  { 
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.borderLight,
                  }
                ]}
              >
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              {/* Nom */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Nom *</Text>
                <View style={[
                  styles.inputWrapper,
                  { 
                    borderColor: name ? theme.colors.accent : theme.colors.borderLight,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                  }
                ]}>
                  <Ionicons name="pricetag-outline" size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="T-shirt Logo"
                    placeholderTextColor={theme.colors.textDisabled}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              {/* Description */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Description *</Text>
                <View style={[
                  styles.textArea,
                  { 
                    borderColor: description ? theme.colors.accent : theme.colors.borderLight,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                  }
                ]}>
                  <TextInput
                    style={[styles.textAreaInput, { color: theme.colors.text }]}
                    placeholder="Décris le produit en détail..."
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
                            backgroundColor: isSelected ? theme.colors.accent : theme.colors.surface,
                            borderColor: isSelected ? theme.colors.accent : theme.colors.borderLight,
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
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight }
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
                      backgroundColor: theme.colors.surface,
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
                      backgroundColor: theme.colors.surface,
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
                      backgroundColor: theme.colors.surface,
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
                  {images.length}/5 images • La première sera l&apos;image principale
                </Text>
                <View style={styles.imageGrid}>
                  <AnimatePresence>
                    {images.map((uri, i) => (
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
                          onPress={() => removeImage(i)}
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
                      </MotiView>
                    ))}
                  </AnimatePresence>
                  {images.length < 5 && (
                    <TouchableOpacity 
                      style={[
                        styles.addBtn,
                        {
                          borderColor: theme.colors.borderLight,
                          backgroundColor: theme.colors.surface,
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
                  <View style={styles.optionsContainer}>
                  {AVAILABLE_SIZES.map(size => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <TouchableOpacity
                        key={size}
                        style={[
                          styles.option,
                          {
                            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                            borderColor: isSelected ? theme.colors.primary : theme.colors.borderLight,
                            borderWidth: isSelected ? 2 : 1,
                            // BOOM: Mini ombre si selected
                            shadowColor: isSelected ? theme.colors.primary : 'transparent',
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
                            styles.optionText,
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
                <View style={styles.optionsContainer}>
                  {PRODUCT_COLORS.map(color => {
                    const isSelected = selectedColors.includes(color.value);
                    return (
                      <TouchableOpacity
                        key={`${color.value}-${color.name}`}
                        style={[
                          styles.colorOption,
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
                          <View style={styles.checkmarkContainer}>
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
                styles.footer, 
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
                  styles.cancelBtn,
                  {
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.borderLight,
                  }
                ]}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 15 }}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  { 
                    backgroundColor: theme.colors.accent,
                    opacity: isLoading ? 0.7 : 1,
                    // BOOM: Ombre forte sur CTA
                    shadowColor: theme.colors.accent,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 6,
                  }
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={22} color="#fff" />
                    <Text style={styles.submitText}>Ajouter le produit</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
    </View>
  );

  if (embedded) {
    return (
      <View style={[styles.embeddedWrapper, { backgroundColor: theme.colors.background }]}>
        <Animated.View style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}>
          {modalBody}
        </Animated.View>
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <BlurView 
        intensity={isDark ? 60 : 80} 
        tint={isDark ? 'dark' : 'light'} 
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <Animated.View style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}>
          {modalBody}
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  embeddedWrapper: { flex: 1, justifyContent: 'flex-end' },
  modal: { height: '92%' },
  container: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 20, paddingBottom: 40 },
  field: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, letterSpacing: -0.2 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '500' },
  textArea: {
    minHeight: 100,
    borderRadius: 12,
    padding: 14,
  },
  textAreaInput: { fontSize: 15, lineHeight: 22, minHeight: 80, fontWeight: '500' },
  hint: { fontSize: 12, marginTop: 6, fontWeight: '500' },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  imageItem: { 
    width: 100, 
    height: 100, 
    borderRadius: 12, 
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
  mainBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mainText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  addBtn: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  optionText: {
    fontSize: 14,
    letterSpacing: -0.2,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 22,
  },
  // Nouveaux styles BOOM
  typeCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 110,
    justifyContent: 'center',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  genderContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    gap: 6,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: -0.2 },
});
