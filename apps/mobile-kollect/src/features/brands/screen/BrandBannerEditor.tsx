import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/context/ThemeContext';

interface BrandBannerEditorProps {
  currentBanner?: string; // URL de la bannière actuelle
  newBanner: ImagePicker.ImagePickerAsset | null; // Nouvelle bannière sélectionnée
  shouldRemove: boolean; // Flag pour supprimer la bannière
  onBannerSelected: (asset: ImagePicker.ImagePickerAsset | null) => void;
  onBannerRemoved: () => void;
}

export const BrandBannerEditor: React.FC<BrandBannerEditorProps> = ({
  currentBanner,
  newBanner,
  shouldRemove,
  onBannerSelected,
  onBannerRemoved,
}) => {
  const { isDark } = useTheme();

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Kollect a besoin d\'accéder à ta galerie pour modifier ta bannière.',
        [{ text: 'OK' }]
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
        allowsEditing: false, // Pas de rognage forcé comme demandé
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('Fichier trop volumineux', 'La bannière ne doit pas dépasser 5 MB');
          return;
        }
        onBannerSelected(asset);
      }
    } catch (error) {
      console.error('❌ Erreur sélection image:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'image');
    }
  };

  const displayBanner = newBanner?.uri || (shouldRemove ? null : currentBanner);
  const hasBanner = !!displayBanner;
  const hasChanges = !!newBanner || shouldRemove;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
          Bannière de la boutique
        </Text>
        {hasChanges && (
          <View style={styles.changesBadge}>
            <Text style={styles.changesBadgeText}>Modifié</Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[
          styles.bannerWrapper, 
          { 
            backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
            borderColor: isDark ? '#333333' : '#E5E5E5' 
          }
        ]}
        onPress={pickImage}
        activeOpacity={0.9}
      >
        {hasBanner ? (
          <Image source={{ uri: displayBanner }} style={styles.bannerImage} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={40} color={isDark ? '#444' : '#CCC'} />
            <Text style={[styles.placeholderText, { color: isDark ? '#666' : '#999' }]}>
              Ajouter une bannière
            </Text>
          </View>
        )}
        
        <View style={styles.editOverlay}>
          <View style={styles.editButton}>
            <Ionicons name="camera" size={20} color="#FFFFFF" />
          </View>
        </View>

        {hasChanges && (
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => onBannerSelected(null)}
          >
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {hasBanner && (
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={onBannerRemoved}
        >
          <Ionicons name="trash-outline" size={16} color="#FF3B30" />
          <Text style={styles.removeButtonText}>Supprimer la bannière</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.helperText}>
        La bannière s&apos;affiche en haut de ta page boutique. Utilisez une image de haute qualité.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  changesBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changesBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bannerWrapper: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '500',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  removeButtonText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
    lineHeight: 16,
  },
});
