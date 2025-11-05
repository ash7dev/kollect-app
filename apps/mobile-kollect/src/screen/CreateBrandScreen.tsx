/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCreateBrand } from '../features/brands/hooks/useBrandQueries';
import { BrandFormInput } from '../features/brands/components/BrandFormInput';
import { BrandLogoUploader } from '../features/brands/components/BrandLogoUploader';
import { PrimaryButton } from '../features/brands/components/common/PrimaryButton';
import { CreateBrandFormData } from '../features/brands/services/brand.service';
import { useTheme } from '../../app/context/ThemeContext';
import { useAuthStore } from '../../src/store/authStore';

export const CreateBrandScreen = () => {
  const { theme, isDark } = useTheme();
  const { mutate: createBrand, isPending } = useCreateBrand();

  // États du formulaire
  const [formData, setFormData] = useState<CreateBrandFormData>({
    name: '',
    slug: '',
    bio: '',
    whatsapp: '',
    instagram: '',
  });

  const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD') // Normaliser les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/[^\w\-]+/g, '') // Supprimer les caractères non alphanumériques
    .replace(/\-\-+/g, '-') // Remplacer les tirets multiples par un seul
    .replace(/^-+/, '') // Supprimer les tirets du début
    .replace(/-+$/, ''); // Supprimer les tirets de fin
};

  const [logo, setLogo] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ========================================
  // VALIDATION
  // ========================================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la boutique est requis';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Le nom doit contenir au moins 3 caractères';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Le slug est requis';
    } else if (!createSlug(formData.slug)) {
      newErrors.slug = 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets';
    }

    if (formData.bio && formData.bio.length > 300) {
      newErrors.bio = 'La bio ne peut pas dépasser 300 caractères';
    }

    if (formData.whatsapp && !/^\+?[0-9]{9,15}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = 'Numéro WhatsApp invalide (ex: +221771234567)';
    }

    if (formData.instagram && !/^[a-zA-Z0-9._]+$/.test(formData.instagram)) {
      newErrors.instagram = 'Nom d\'utilisateur Instagram invalide';
    }

    if (!logo) {
      newErrors.logo = 'Le logo est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================
  // HANDLERS
  // ========================================

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, name: value }));
    
    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);

    setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: '' }));
    }
  };

  const handleSlugChange = (value: string) => {
    const cleanedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    
    setFormData((prev) => ({ ...prev, slug: cleanedSlug }));
    
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: '' }));
    }
  };

  const handleInputChange = (field: keyof CreateBrandFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogoSelected = (asset: ImagePicker.ImagePickerAsset) => {
    setLogo(asset);
    if (errors.logo) {
      setErrors((prev) => ({ ...prev, logo: '' }));
    }
  };

  const handleLogoRemoved = () => {
    setLogo(null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    // ✅ Créer un objet PROPRE avec UNIQUEMENT les champs autorisés
    const brandData: CreateBrandFormData = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
    };

    // Ajouter les champs optionnels UNIQUEMENT s'ils sont remplis
    if (formData.bio?.trim()) {
      brandData.bio = formData.bio.trim();
    }

    if (formData.instagram?.trim()) {
      brandData.instagram = formData.instagram.trim();
    }

    if (formData.whatsapp?.trim()) {
      brandData.whatsapp = formData.whatsapp.trim();
    }

    if (formData.website?.trim()) {
      brandData.website = formData.website.trim();
    }

    if (logo) {
      brandData.logo = logo;
    }

    console.log('🔍 [CreateBrand] Données à envoyer:', Object.keys(brandData));

    try {
      // Créer la marque
      await new Promise((resolve, reject) => {
        createBrand(
          {
            ...brandData,
            logo: logo || undefined
          },
          {
            onSuccess: (brand) => {
              console.log('✅ [CreateBrand] Marque créée:', brand);
              resolve(brand);
            },
            onError: (error) => {
              console.error('❌ [CreateBrand] Erreur création marque:', error);
              reject(error);
            },
          }
        );
      });

      Alert.alert(
        '🎉 Félicitations !',
        `Ta boutique "${formData.name}" est créée avec succès !`,
        [
          {
            text: 'Découvrir mon espace',
            onPress: async () => {
              console.log('🚀 [CreateBrand] Mise à jour du user et navigation vers CEO');
              await useAuthStore.getState().refreshAuth();
              // Naviguer vers l'espace CEO; le layout CEO acceptera myBrand (store)
              router.replace('/(ceo)');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating brand:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création de la marque');
    }
  };

  // ========================================
  // STYLES
  // ========================================

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 50,
    },
    header: {
      marginTop: 24,
      marginBottom: 32,
    },
    headerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    badgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1.2,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      letterSpacing: -0.5,
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      letterSpacing: -0.2,
    },
    form: {
      marginTop: 8,
    },
    formSection: {
      padding: 20,
      borderRadius: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginBottom: 20,
    },
    divider: {
      height: 1,
      marginVertical: 8,
    },
    actions: {
      marginTop: 24,
    },
    termsText: {
      marginTop: 20,
      fontSize: 13,
      fontWeight: '400',
      textAlign: 'center',
      lineHeight: 20,
      letterSpacing: -0.1,
    },
    termsLink: {
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
  });

  // ========================================
  // RENDER
  // ========================================

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header avec style streetwear */}
          <View style={styles.header}>
            <View style={styles.headerBadge}>
              <View style={[styles.badgeDot, { backgroundColor: theme.colors.accent }]} />
              <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
                NOUVELLE MARQUE
              </Text>
            </View>
            
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Lance ta marque
            </Text>
            
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
               Rejoins les créateurs qui façonnent la culture streetwear et inspire ta communauté.
            </Text>
          </View>

          {/* Logo Uploader */}
          <BrandLogoUploader
            logo={logo}
            onLogoSelected={handleLogoSelected}
            onLogoRemoved={handleLogoRemoved}
            error={errors.logo}
          />

          {/* Formulaire avec séparation visuelle */}
          <View style={styles.form}>
            <View style={[styles.formSection, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Informations principales
              </Text>

              <BrandFormInput
                label="Nom de la boutique"
                placeholder="Ex: Atelier Dakar"
                value={formData.name}
                onChangeText={handleNameChange}
                error={errors.name}
                required
                maxLength={100}
              />

              <BrandFormInput
                label="URL de ta boutique"
                placeholder="atelier-dakar"
                value={formData.slug}
                onChangeText={handleSlugChange}
                error={errors.slug}
                required
                helperText="kollect.app/shop/atelier-dakar"
                autoCapitalize="none"
                maxLength={50}
              />

              <BrandFormInput
                label="Description"
                placeholder="Décris ta boutique et tes créations..."
                value={formData.bio}
                onChangeText={(value) => handleInputChange('bio', value)}
                error={errors.bio}
                multiline
                numberOfLines={4}
                maxLength={300}
                showCharacterCount
              />
            </View>

            {/* Séparateur */}
            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

            {/* Section contact */}
            <View style={[styles.formSection, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Contact & Réseaux
              </Text>

              <BrandFormInput
                label="WhatsApp"
                placeholder="+221 77 123 45 67"
                value={formData.whatsapp}
                onChangeText={(value) => handleInputChange('whatsapp', value)}
                error={errors.whatsapp}
                keyboardType="phone-pad"
                helperText="Numéro pour être contacté par tes clients"
              />

              <BrandFormInput
                label="Instagram (optionnel)"
                placeholder="@atelier_dakar"
                value={formData.instagram}
                onChangeText={(value) => handleInputChange('instagram', value)}
                error={errors.instagram}
                autoCapitalize="none"
                helperText="Ton nom d'utilisateur Instagram"
              />
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <PrimaryButton
              title={isPending ? 'Création en cours...' : 'Créer ma boutique'}
              onPress={handleSubmit}
              disabled={isPending}
              loading={isPending}
              variant="accent"
            />

            <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
              En créant ta boutique, tu acceptes nos{' '}
              <Text style={[styles.termsLink, { color: theme.colors.accent }]}>
                Conditions d&apos;utilisation
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
