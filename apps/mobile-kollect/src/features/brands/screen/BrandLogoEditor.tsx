// ============================================
// src/components/brands/BrandLogoEditor.tsx
// ============================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface BrandLogoEditorProps {
  currentLogo?: string; // URL du logo actuel depuis le backend
  newLogo: ImagePicker.ImagePickerAsset | null; // Nouveau logo sélectionné
  shouldRemove: boolean; // Flag pour supprimer le logo
  onLogoSelected: (asset: ImagePicker.ImagePickerAsset) => void;
  onLogoRemoved: () => void;
}

export const BrandLogoEditor: React.FC<BrandLogoEditorProps> = ({
  currentLogo,
  newLogo,
  shouldRemove,
  onLogoSelected,
  onLogoRemoved,
}) => {
  // ========================================
  // HANDLERS
  // ========================================

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Kollect a besoin d\'accéder à ta galerie pour modifier ton logo.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Paramètres',
            onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync(),
          },
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
      'Es-tu sûr de vouloir supprimer le logo de ta boutique ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: onLogoRemoved,
        },
      ]
    );
  };

  const handleCancelChange = () => {
    onLogoSelected(null as any); // Reset le nouveau logo
  };

  // ========================================
  // RENDER
  // ========================================

  // Déterminer quelle image afficher
  const displayLogo = newLogo?.uri || (shouldRemove ? null : currentLogo);
  const hasLogo = !!displayLogo;
  const hasChanges = !!newLogo || shouldRemove;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Logo de la boutique</Text>
        {hasChanges && (
          <View style={styles.changesBadge}>
            <Text style={styles.changesBadgeText}>Modifié</Text>
          </View>
        )}
      </View>

      <View style={styles.editorContainer}>
        {hasLogo ? (
          // Logo présent
          <View style={styles.logoContainer}>
            <Image source={{ uri: displayLogo }} style={styles.logo} />
            
            {/* Badge "Nouveau" si nouveau logo sélectionné */}
            {newLogo && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>Nouveau</Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={pickImage}
                activeOpacity={0.7}
              >
                <Ionicons name="camera" size={20} color="#007AFF" />
                <Text style={styles.actionButtonText}>Changer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonDanger]}
                onPress={handleRemoveLogo}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
                  Supprimer
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bouton d'annulation si changement en cours */}
            {hasChanges && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelChange}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Annuler les modifications</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // Pas de logo
          <View style={styles.noLogoContainer}>
            <View style={styles.noLogoIconContainer}>
              <Ionicons name="image-outline" size={48} color="#CCCCCC" />
            </View>
            <Text style={styles.noLogoText}>Aucun logo</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.uploadButtonText}>Ajouter un logo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Helper text */}
      <Text style={styles.helperText}>
        Le logo représente ta marque. Choisis une image carrée de bonne qualité (max 5 MB).
      </Text>
    </View>
  );
};

// ========================================
// STYLES
// ========================================

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
    color: '#1A1A1A',
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
  editorContainer: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    marginBottom: 20,
  },
  newBadge: {
    position: 'absolute',
    top: 30,
    right: '30%',
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    gap: 6,
  },
  actionButtonDanger: {
    backgroundColor: '#FFF0F0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  actionButtonTextDanger: {
    color: '#FF3B30',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#999999',
    textDecorationLine: 'underline',
  },
  noLogoContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noLogoIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noLogoText: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
    paddingHorizontal: 4,
    lineHeight: 16,
  },
});