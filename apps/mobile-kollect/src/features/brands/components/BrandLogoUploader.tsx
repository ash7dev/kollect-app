 
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/context/ThemeContext';

interface BrandLogoUploaderProps {
  logo: ImagePicker.ImagePickerAsset | null;
  onLogoSelected: (asset: ImagePicker.ImagePickerAsset) => void;
  onLogoRemoved: () => void;
  error?: string;
  isLoading?: boolean;
}

export const BrandLogoUploader: React.FC<BrandLogoUploaderProps> = ({
  logo,
  onLogoSelected,
  onLogoRemoved,
  error,
  isLoading = false,
}) => {
  const { theme, isDark } = useTheme();

  // ========================================
  // HANDLERS
  // ========================================

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Kollect a besoin d\'accéder à ta galerie pour télécharger ton logo.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Paramètres', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() },
        ]
      );
      return false;
    }
    
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('Fichier trop volumineux', 'Le logo ne doit pas dépasser 5 MB');
          return;
        }

        onLogoSelected(asset);
      }
    } catch (error) {
      console.error('❌ Erreur sélection image:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'image');
    }
  };

  const handleRemoveLogo = () => {
    Alert.alert(
      'Supprimer le logo',
      'Es-tu sûr de vouloir supprimer ce logo ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: onLogoRemoved },
      ]
    );
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Logo de la boutique <Text style={[styles.required, { color: theme.colors.accent }]}>*</Text>
        </Text>
      </View>

      {/* Zone d'upload avec design amélioré */}
      <View
        style={[
          styles.uploadArea,
          {
            borderColor: error ? theme.colors.error : theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
          error && styles.uploadAreaError,
        ]}
      >
        {isLoading ? (
          // Loading state
          <View style={styles.loadingContainer}>
            <View style={[styles.loadingCircle, { backgroundColor: theme.colors.card }]}>
              <ActivityIndicator size="large" color={theme.colors.accent} />
            </View>
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Upload en cours...
            </Text>
          </View>
        ) : logo ? (
          // Logo sélectionné avec overlay moderne
          <View style={styles.previewContainer}>
            <View style={styles.logoWrapper}>
              <Image source={{ uri: logo.uri }} style={styles.logoPreview} />
              <View style={[styles.logoOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}>
                <TouchableOpacity
                  style={[styles.overlayButton, { backgroundColor: theme.colors.background }]}
                  onPress={pickImage}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera" size={20} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.overlayButton, { backgroundColor: theme.colors.error }]}
                  onPress={handleRemoveLogo}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={[styles.previewLabel, { color: theme.colors.textSecondary }]}>
              Appuie pour modifier ou supprimer
            </Text>
          </View>
        ) : (
          // État initial avec design streetwear
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickImage}
            activeOpacity={0.9}
          >
            <View
              style={[
                styles.uploadIconContainer,
                { backgroundColor: isDark ? theme.colors.card : theme.colors.primaryLight + '10' },
              ]}
            >
              <Ionicons
                name="camera-outline"
                size={48}
                color={isDark ? theme.colors.text : theme.colors.primary}
              />
            </View>
            
            <Text style={[styles.uploadTitle, { color: theme.colors.text }]}>
              Ajoute ton logo
            </Text>
            
            <Text style={[styles.uploadSubtitle, { color: theme.colors.textSecondary }]}>
              JPG, PNG ou GIF · Max 5 MB · Format carré recommandé
            </Text>

            <View style={[styles.uploadCTA, { backgroundColor: theme.colors.accent }]}>
              <Ionicons name="cloud-upload-outline" size={22} color="#FFFFFF" />
              <Text style={styles.uploadCTAText}>Sélectionner une image</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Message d'erreur avec design amélioré */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '10' }]}>
          <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        </View>
      )}

      {/* Helper text */}
      {!error && (
        <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
          💡 Un logo carré de haute qualité optimise ta visibilité sur Kollect
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  required: {
    fontWeight: '700',
  },
  uploadArea: {
    borderWidth: 2,
    borderRadius: 16,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadAreaError: {
    borderWidth: 2.5,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  uploadButton: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  uploadIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  uploadSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  uploadCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
  },
  uploadCTAText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  logoPreview: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F5F5F5',
  },
  logoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  overlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  helperText: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 10,
    paddingHorizontal: 4,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
});