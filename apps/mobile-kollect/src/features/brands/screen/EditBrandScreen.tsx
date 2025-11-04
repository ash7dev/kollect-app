// ============================================
// src/screens/ceo/EditBrandScreen.tsx
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUpdateBrand } from '../hooks/useBrandQueries';
import { useBrandStore } from '../store/brandStore';
import { BrandFormInput } from '../components/BrandFormInput';
import { BrandLogoEditor } from './BrandLogoEditor';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { UpdateBrandFormData } from '../services/brand.service';

export const EditBrandScreen = () => {
  const navigation = useNavigation();
  const myBrand = useBrandStore((state) => state.myBrand);
  const { mutate: updateBrand, isPending } = useUpdateBrand();

  // États du formulaire
  const [formData, setFormData] = useState<UpdateBrandFormData>({
    name: myBrand?.name || '',
    bio: myBrand?.bio || '',
    whatsapp: myBrand?.whatsapp || '',
    instagram: myBrand?.instagram || '',
  });

  const [newLogo, setNewLogo] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [shouldRemoveLogo, setShouldRemoveLogo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Synchroniser avec les données de la marque
  useEffect(() => {
    if (myBrand) {
      setFormData({
        name: myBrand.name,
        bio: myBrand.bio || '',
        slug: myBrand.slug || '',
        whatsapp: myBrand.whatsapp || '',
        instagram: myBrand.instagram || '',
      });
    }
  }, [myBrand]);

  // Détecter les changements
  useEffect(() => {
    const hasFormChanges =
      formData.name !== myBrand?.name ||
      formData.bio !== (myBrand?.bio || '')  ||
      formData.whatsapp !== (myBrand?.whatsapp || '') ||
      formData.instagram !== (myBrand?.instagram || '') 


    setHasChanges(hasFormChanges || !!newLogo || shouldRemoveLogo);
  }, [formData, newLogo, shouldRemoveLogo, myBrand]);

  // ========================================
  // VALIDATION
  // ========================================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Nom obligatoire
    if (!formData.name?.trim()) {
      newErrors.name = 'Le nom de la boutique est requis';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Le nom doit contenir au moins 3 caractères';
    }

    // Bio
    if (formData.bio && formData.bio.length > 300) {
      newErrors.bio = 'La bio ne peut pas dépasser 300 caractères';
    }

    // WhatsApp
    if (formData.whatsapp && !/^\+?[0-9]{9,15}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = 'Numéro WhatsApp invalide';
    }

    // Instagram
    if (formData.instagram && !/^[a-zA-Z0-9._]+$/.test(formData.instagram)) {
      newErrors.instagram = 'Nom d\'utilisateur Instagram invalide';
    }

    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================
  // HANDLERS
  // ========================================

  const handleInputChange = (field: keyof UpdateBrandFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogoSelected = (asset: ImagePicker.ImagePickerAsset) => {
    setNewLogo(asset);
    setShouldRemoveLogo(false);
  };

  const handleLogoRemoved = () => {
    setNewLogo(null);
    setShouldRemoveLogo(true);
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Annuler les modifications',
        'Es-tu sûr de vouloir annuler ? Tes modifications seront perdues.',
        [
          { text: 'Continuer l\'édition', style: 'cancel' },
          { text: 'Annuler', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    if (!myBrand) return;

    // Valider le formulaire
    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    // Préparer les données de mise à jour
    const updateData: UpdateBrandFormData = {
      ...formData,
      logo: newLogo || undefined,
      removeLogo: shouldRemoveLogo,
    };

    // Mettre à jour la marque
    updateBrand(
      { brandId: myBrand.id, data: updateData },
      {
        onSuccess: () => {
          Alert.alert(
            '✅ Boutique mise à jour',
            'Tes modifications ont été enregistrées avec succès !',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        },
        onError: (error: any) => {
          console.error('❌ Erreur mise à jour marque:', error);
          Alert.alert(
            'Erreur',
            error?.message || 'Impossible de mettre à jour la boutique'
          );
        },
      }
    );
  };

  // ========================================
  // RENDER
  // ========================================

  if (!myBrand) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Boutique non trouvée</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier ma boutique</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Editor */}
          <BrandLogoEditor
            currentLogo={myBrand.logo}
            newLogo={newLogo}
            shouldRemove={shouldRemoveLogo}
            onLogoSelected={handleLogoSelected}
            onLogoRemoved={handleLogoRemoved}
          />

          {/* Formulaire */}
          <View style={styles.form}>
            {/* Nom */}
            <BrandFormInput
              label="Nom de la boutique"
              placeholder="Ex: Atelier Dakar"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              error={errors.name}
              required
              maxLength={100}
            />

            {/* Slug (non modifiable) */}
            <View style={styles.slugContainer}>
              <Text style={styles.slugLabel}>URL de ta boutique</Text>
              <View style={styles.slugBox}>
                <Text style={styles.slugText}>
                  kollect.app/shop/{myBrand.slug}
                </Text>
              </View>
              <Text style={styles.slugHelper}>
                L&apos;URL ne peut pas être modifiée après la création
              </Text>
            </View>

            {/* Bio */}
            <BrandFormInput
              label="Description courte"
              placeholder="En quelques mots..."
              value={formData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              error={errors.bio}
              multiline
              numberOfLines={3}
              maxLength={300}
              showCharacterCount
            />


            {/* Section Contact */}
            <View style={styles.sectionHeader}>
              <Ionicons name="call-outline" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Contact</Text>
            </View>

            <BrandFormInput
              label="WhatsApp"
              placeholder="+221 77 123 45 67"
              value={formData.whatsapp}
              onChangeText={(value) => handleInputChange('whatsapp', value)}
              error={errors.whatsapp}
              keyboardType="phone-pad"
            />

            {/* Section Réseaux sociaux */}
            <View style={styles.sectionHeader}>
              <Ionicons name="logo-instagram" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Réseaux sociaux</Text>
            </View>

            <BrandFormInput
              label="Instagram"
              placeholder="@atelier_dakar"
              value={formData.instagram}
              onChangeText={(value) => handleInputChange('instagram', value)}
              error={errors.instagram}
              autoCapitalize="none"
            />

            

            

            
          </View>

          {/* Boutons */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
              onPress={handleSubmit}
              disabled={isPending || !hasChanges}
              loading={isPending}
            />

            {hasChanges && (
              <Text style={styles.changesIndicator}>
                ✏️ Des modifications non enregistrées
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  headerPlaceholder: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  form: {
    marginTop: 20,
  },
  slugContainer: {
    marginBottom: 20,
  },
  slugLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  slugBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  slugText: {
    fontSize: 14,
    color: '#666666',
  },
  slugHelper: {
    fontSize: 12,
    color: '#999999',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 30,
  },
  changesIndicator: {
    marginTop: 12,
    fontSize: 12,
    color: '#FF9500',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },
});