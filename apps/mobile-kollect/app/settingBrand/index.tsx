/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '../context/ThemeContext';
import { useBrandStore } from '../../src/features/brands/store/brandStore';
import {
  useMyBrand as useMyBrandQuery,
  useUpdateBrand,
} from '../../src/features/brands/hooks/useBrandQueries';
import type { UpdateBrandFormData } from '../../src/features/brands/services/brand.service';
import { BrandLogoEditor } from '../../src/features/brands/screen/BrandLogoEditor';

export default function SettingBrandScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const myBrand = useBrandStore((s) => s.myBrand);
  const loadMyBrand = useBrandStore((s) => s.loadMyBrand);

  const { isLoading: isLoadingQuery } = useMyBrandQuery();
  const { mutate: updateBrand, isPending } = useUpdateBrand();

  const [formData, setFormData] = useState<UpdateBrandFormData>({
    name: '',
    bio: '',
    whatsapp: '',
    instagram: '',
    website: '',
  });
  const [newLogo, setNewLogo] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [shouldRemoveLogo, setShouldRemoveLogo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!myBrand) {
      void loadMyBrand();
    } else {
      setFormData({
        name: myBrand.name,
        bio: myBrand.bio || '',
        whatsapp: myBrand.whatsapp || '',
        instagram: myBrand.instagram || '',
        website: myBrand.website || '',
      });
      setNewLogo(null);
      setShouldRemoveLogo(false);
    }
  }, [myBrand, loadMyBrand]);

  useEffect(() => {
    if (!myBrand) return;

    const changed =
      formData.name !== myBrand.name ||
      formData.bio !== (myBrand.bio || '') ||
      formData.whatsapp !== (myBrand.whatsapp || '') ||
      formData.instagram !== (myBrand.instagram || '') ||
      formData.website !== (myBrand.website || '') ||
      !!newLogo ||
      shouldRemoveLogo;

    setHasChanges(changed);
  }, [formData, myBrand, newLogo, shouldRemoveLogo]);

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Le nom de la boutique est requis';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Le nom doit contenir au moins 3 caractères';
    }

    if (formData.bio && formData.bio.length > 300) {
      newErrors.bio = 'La bio ne peut pas dépasser 300 caractères';
    }

    if (formData.whatsapp && !/^\+?[0-9]{9,15}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = 'Numéro WhatsApp invalide';
    }

    if (formData.instagram && !/^[a-zA-Z0-9._]+$/.test(formData.instagram)) {
      newErrors.instagram = "Nom d'utilisateur Instagram invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!myBrand) return;

    if (!validate()) {
      Alert.alert('Erreur', 'Merci de corriger les erreurs du formulaire.');
      return;
    }

    const payload: UpdateBrandFormData = {
      name: (formData.name ?? '').trim(),
      bio: formData.bio?.trim() || undefined,
      whatsapp: formData.whatsapp || undefined,
      instagram: formData.instagram || undefined,
      website: formData.website || undefined,
      logo: newLogo || undefined,
      removeLogo: shouldRemoveLogo || undefined,
    };

    updateBrand(
      { brandId: myBrand.id, data: payload },
      {
        onSuccess: () => {
          Alert.alert('Boutique mise à jour', 'Tes informations ont été enregistrées.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
        onError: (error: any) => {
          Alert.alert('Erreur', error?.message || "Impossible de mettre à jour la boutique");
        },
      },
    );
  };

  const loading = isLoadingQuery && !myBrand;

  const cardStyle = {
    backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? '#333333' : '#E5E5E5',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: isDark ? 8 : 6 },
    shadowOpacity: isDark ? 0.5 : 0.15,
    shadowRadius: 12,
    elevation: isDark ? 8 : 4,
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
        <View style={styles.center}>
          <View style={[styles.loaderContainer, { backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.1)' }]}>
            <ActivityIndicator size="large" color="#FF3B30" />
          </View>
          <Text style={[styles.loadingText, { color: isDark ? '#B0B0B0' : '#4D4D4D' }]}>
            Chargement de ta boutique
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!myBrand) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
        <View style={styles.center}>
          <View style={[styles.emptyIconContainer, { backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.1)' }]}>
            <Ionicons name="storefront-outline" size={48} color="#FF3B30" />
          </View>
          <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Aucune boutique trouvée
          </Text>
          <Text style={[styles.emptySubtitle, { color: isDark ? '#B0B0B0' : '#4D4D4D' }]}>
            Crée d&apos;abord ta boutique pour accéder aux paramètres
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[
          styles.header,
          { 
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#333333' : '#E5E5E5',
          }
        ]}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            activeOpacity={0.6}
          >
            <View style={[
              styles.backButtonCircle,
              { backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.1)' }
            ]}>
              <Ionicons name="arrow-back" size={20} color="#FF3B30" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            PARAMÈTRES
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Editor */}
          <View style={styles.logoSection}>
            <BrandLogoEditor
              currentLogo={myBrand.logo}
              newLogo={newLogo}
              shouldRemove={shouldRemoveLogo}
              onLogoSelected={handleLogoSelected}
              onLogoRemoved={handleLogoRemoved}
            />
          </View>

          {/* Informations générales */}
          <View style={[styles.card, cardStyle]}>
            <View style={styles.cardHeader}>
              <View style={[
                styles.cardIconContainer,
                { backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.1)' }
              ]}>
                <Ionicons name="information-circle-outline" size={18} color="#FF3B30" />
              </View>
              <Text style={[styles.sectionTitle, { color: isDark ? '#ffffffff' : '#1d1d1d' }]}>
                INFORMATIONS GÉNÉRALES
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Nom de la boutique
              </Text>
              <TextInput
                value={formData.name}
                onChangeText={(v) => handleInputChange('name', v)}
                placeholder="Ex: Atelier Dakar"
                placeholderTextColor={isDark ? '#666666' : '#B8B8B8'}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8',
                    color: isDark ? '#FFFFFF' : '#000000',
                    borderColor: errors.name ? '#FF3B30' : (isDark ? '#333333' : '#E5E5E5'),
                  },
                ]}
              />
              {errors.name && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#FF3B30" />
                  <Text style={styles.errorText}>{errors.name}</Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Bio
                </Text>
                <Text style={[styles.labelHint, { color: isDark ? '#666666' : '#B8B8B8' }]}>
                  {formData.bio?.length || 0}/300
                </Text>
              </View>
              <TextInput
                value={formData.bio}
                onChangeText={(v) => handleInputChange('bio', v)}
                placeholder="Présente rapidement ta marque..."
                placeholderTextColor={isDark ? '#666666' : '#B8B8B8'}
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8',
                    color: isDark ? '#FFFFFF' : '#000000',
                    borderColor: errors.bio ? '#FF3B30' : (isDark ? '#333333' : '#E5E5E5'),
                  },
                ]}
                multiline
                maxLength={300}
              />
              {errors.bio && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#FF3B30" />
                  <Text style={styles.errorText}>{errors.bio}</Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                URL de la boutique
              </Text>
              <View style={[
                styles.readonlyBox,
                { 
                  backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8',
                  borderColor: isDark ? '#333333' : '#E5E5E5',
                }
              ]}>
                <Ionicons name="link-outline" size={16} color="#FF3B30" style={{ marginRight: 8 }} />
                <Text style={[styles.readonlyText, { color: isDark ? '#B0B0B0' : '#4D4D4D' }]} numberOfLines={1}>
                  kollect.sn/boutique/{myBrand.slug}
                </Text>
              </View>
            </View>
          </View>

          {/* Contact & réseaux */}
          <View style={[styles.card, cardStyle]}>
            <View style={styles.cardHeader}>
              <View style={[
                styles.cardIconContainer,
                { backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.1)' }
              ]}>
                <Ionicons name="share-social-outline" size={18} color="#FF3B30" />
              </View>
              <Text style={[styles.sectionTitle, { color: isDark ? '#B0B0B0' : '#4D4D4D' }]}>
                CONTACT & RÉSEAUX
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                WhatsApp
              </Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="logo-whatsapp" size={18} color="#25D366" style={styles.inputIcon} />
                <TextInput
                  value={formData.whatsapp}
                  onChangeText={(v) => handleInputChange('whatsapp', v)}
                  placeholder="+221 77 123 45 67"
                  placeholderTextColor={isDark ? '#666666' : '#B8B8B8'}
                  keyboardType="phone-pad"
                  style={[
                    styles.input,
                    styles.inputWithPadding,
                    {
                      backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8',
                      color: isDark ? '#FFFFFF' : '#000000',
                      borderColor: errors.whatsapp ? '#FF3B30' : (isDark ? '#333333' : '#E5E5E5'),
                    },
                  ]}
                />
              </View>
              {errors.whatsapp && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#FF3B30" />
                  <Text style={styles.errorText}>{errors.whatsapp}</Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Instagram
              </Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="logo-instagram" size={18} color="#E4405F" style={styles.inputIcon} />
                <TextInput
                  value={formData.instagram}
                  onChangeText={(v) => handleInputChange('instagram', v)}
                  placeholder="@atelier_dakar"
                  placeholderTextColor={isDark ? '#666666' : '#B8B8B8'}
                  autoCapitalize="none"
                  style={[
                    styles.input,
                    styles.inputWithPadding,
                    {
                      backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8',
                      color: isDark ? '#FFFFFF' : '#000000',
                      borderColor: errors.instagram ? '#FF3B30' : (isDark ? '#333333' : '#E5E5E5'),
                    },
                  ]}
                />
              </View>
              {errors.instagram && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#FF3B30" />
                  <Text style={styles.errorText}>{errors.instagram}</Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Site web
              </Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="globe-outline" size={18} color="#FF3B30" style={styles.inputIcon} />
                <TextInput
                  value={formData.website}
                  onChangeText={(v) => handleInputChange('website', v)}
                  placeholder="https://..."
                  placeholderTextColor={isDark ? '#666666' : '#B8B8B8'}
                  autoCapitalize="none"
                  keyboardType="url"
                  style={[
                    styles.input,
                    styles.inputWithPadding,
                    {
                      backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8',
                      color: isDark ? '#FFFFFF' : '#000000',
                      borderColor: isDark ? '#333333' : '#E5E5E5',
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bouton Enregistrer fixe */}
        <View style={[
          styles.footer,
          { 
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: isDark ? '#333333' : '#E5E5E5',
          }
        ]}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: hasChanges && !isPending ? '#FF3B30' : (isDark ? '#333333' : '#E5E5E5'),
                opacity: isPending ? 0.7 : 1,
                shadowColor: hasChanges ? '#FF3B30' : 'transparent',
              },
            ]}
            onPress={handleSave}
            disabled={!hasChanges || isPending}
            activeOpacity={0.8}
          >
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons 
                  name="checkmark-circle" 
                  size={20} 
                  color={hasChanges ? '#FFFFFF' : (isDark ? '#666666' : '#B8B8B8')} 
                />
                <Text style={[
                  styles.saveButtonText,
                  { color: hasChanges ? '#FFFFFF' : (isDark ? '#666666' : '#B8B8B8') }
                ]}>
                  ENREGISTRER LES MODIFICATIONS
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },
  loaderContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 0,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  logoSection: {
    marginBottom: 24,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  cardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 22,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 6,
    marginBottom: 4,
  },
  labelHint: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: 14,
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  inputWithPadding: {
    paddingLeft: 44,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
  readonlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  readonlyText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
});