// src/components/product/AddProductModalStep3.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useTheme } from '../../../app/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { CollectionStatus } from '@/features/collections/services/collections.service';

interface Collection {
  id: string;
  name: string;
  status: CollectionStatus;
  // Autres propriétés si nécessaire
}

interface AddProductStep3Props {
  product: any; // Type à remplacer par votre type de produit
  collections: Collection[];
  onSubmit: (product: any, collectionId: string) => Promise<void>;
  onBack: () => void;
}

export const AddProductStep3: React.FC<AddProductStep3Props> = ({
  product,
  collections,
  onSubmit,
  onBack,
}) => {
  const { theme, isDark } = useTheme();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Log pour déboguer les collections reçues
  useEffect(() => {
    console.log('Collections reçues dans AddProductStep3:', collections);
  }, [collections]);

  // ⚠️ Ne pas re‑filtrer ici : le parent (écran CEO) fournit déjà les collections autorisées
  const availableCollections = collections;

  const handleCollectionSelect = (collectionId: string) => {
    console.log('Sélection de la collection:', collectionId);
    setSelectedCollectionId(collectionId);
    // Forcer un re-render immédiat
    setImmediate(() => {
      console.log('État après mise à jour:', { selectedCollectionId, collectionId });
    });
  };

  const handleSubmit = async () => {
    console.log('Début de la soumission', { selectedCollectionId });
    
    if (!selectedCollectionId) {
      console.error('Aucune collection sélectionnée');
      Alert.alert('Erreur', 'Veuillez sélectionner une collection');
      return;
    }

    console.log('Tentative de soumission avec la collection:', selectedCollectionId);
    setIsSubmitting(true);
    
    try {
      await onSubmit(product, selectedCollectionId);
      console.log('Soumission réussie');
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le produit à la collection');
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[
        styles.loadingContainer, 
        { backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.background }
      ]}>
        <ActivityIndicator 
          size="large" 
          color={isDark ? theme.colors.textDark : theme.colors.primary} 
        />
      </View>
    );
  }

  return (
    <View style={[
      styles.container, 
      { backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.background }
    ]}>
      {/* Header avec style BOOM */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[
            styles.title, 
            { color: isDark ? theme.colors.textDark : theme.colors.text }
          ]}>
            Sélectionnez une collection
          </Text>
          <Text style={[
            styles.subtitle, 
            { color: isDark ? theme.colors.textSecondaryDark : theme.colors.textSecondary }
          ]}>
            Choisissez la collection pour votre produit
          </Text>
        </View>
        
        {/* Indicateur de sélection */}
        {selectedCollectionId && (
          <View style={[
            styles.selectionBadge,
            {
              backgroundColor: isDark ? theme.colors.highlightDark : theme.colors.highlight,
              borderWidth: 1,
              borderColor: theme.colors.accent,
            }
          ]}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent} />
            <Text style={[styles.selectionBadgeText, { color: theme.colors.accent }]}>
              Sélectionné
            </Text>
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.collectionsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {availableCollections.length > 0 ? (
          <View style={styles.collectionsGrid}>
            {availableCollections.map(collection => {
              const isSelected = selectedCollectionId === collection.id;
              const isAvailable = collection.status === CollectionStatus.DISPONIBLE;
              
              return (
                <TouchableOpacity
                  key={collection.id}
                  style={[
                    styles.collectionCard,
                    {
                      backgroundColor: isDark ? theme.colors.cardDark : theme.colors.card,
                      borderWidth: 1,
                      borderColor: isSelected 
                        ? theme.colors.accent
                        : isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
                      shadowColor: isSelected 
                        ? theme.colors.accent
                        : isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
                      shadowOffset: { width: 0, height: isSelected ? 8 : 4 },
                      shadowOpacity: isSelected ? 0.4 : 1,
                      shadowRadius: isSelected ? 16 : 12,
                      elevation: isSelected ? 10 : isDark ? 8 : 4,
                      transform: [{ scale: isSelected ? 1 : 1 }],
                    },
                    isSelected && styles.collectionCardSelected,
                  ]}
                  onPress={() => handleCollectionSelect(collection.id)}
                  disabled={isSubmitting}
                  activeOpacity={0.7}
                >
                  {/* Badge de statut */}
                  <View style={[
                    styles.statusBadge,
                    {
                      backgroundColor: isAvailable 
                        ? 'rgba(52, 199, 89, 0.15)'
                        : 'rgba(255, 149, 0, 0.15)',
                    }
                  ]}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: isAvailable ? theme.colors.success : theme.colors.warning }
                    ]} />
                    <Text style={[
                      styles.statusText,
                      { color: isAvailable ? theme.colors.success : theme.colors.warning }
                    ]}>
                      {isAvailable ? 'Disponible' : 'Teaser'}
                    </Text>
                  </View>

                  {/* Icône de la collection */}
                  <View style={[
                    styles.collectionIconContainer,
                    {
                      backgroundColor: isDark 
                        ? theme.colors.surfaceDark 
                        : theme.colors.surface,
                    }
                  ]}>
                    <Ionicons 
                      name="folder" 
                      size={32} 
                      color={isSelected ? theme.colors.accent : (isDark ? theme.colors.textSecondaryDark : theme.colors.textSecondary)} 
                    />
                  </View>

                  {/* Nom de la collection */}
                  <View style={styles.collectionInfo}>
                    <Text 
                      style={[
                        styles.collectionName, 
                        { color: isDark ? theme.colors.textDark : theme.colors.text }
                      ]}
                      numberOfLines={2}
                    >
                      {collection.name}
                    </Text>
                  </View>

                  {/* Checkmark si sélectionné */}
                  {isSelected && (
                    <View style={[
                      styles.checkmarkContainer,
                      { backgroundColor: theme.colors.accent }
                    ]}>
                      <Ionicons name="checkmark" size={20} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={[
              styles.emptyIconContainer,
              { 
                backgroundColor: isDark 
                  ? theme.colors.surfaceDark 
                  : theme.colors.surface 
              }
            ]}>
              <Ionicons 
                name="folder-open-outline" 
                size={64} 
                color={isDark ? theme.colors.textDisabledDark : theme.colors.textDisabled} 
              />
            </View>
            <Text style={[
              styles.emptyStateTitle, 
              { color: isDark ? theme.colors.textDark : theme.colors.text }
            ]}>
              Aucune collection disponible
            </Text>
            <Text style={[
              styles.emptyStateText, 
              { color: isDark ? theme.colors.textSecondaryDark : theme.colors.textSecondary }
            ]}>
              Créez d&apos;abord une collection pour ajouter des produits
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer avec boutons BOOM */}
      <View style={[
        styles.footer,
        {
          backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
          shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 1,
          shadowRadius: 12,
          elevation: 12,
        }
      ]}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.backButton,
            {
              backgroundColor: isDark ? theme.colors.surfaceDark : theme.colors.surface,
              borderWidth: 1,
              borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
            }
          ]}
          onPress={onBack}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="arrow-back" 
            size={20} 
            color={isDark ? theme.colors.textDark : theme.colors.text} 
          />
          <Text style={[
            styles.buttonText, 
            { color: isDark ? theme.colors.textDark : theme.colors.text }
          ]}>
            Retour
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button, 
            styles.submitButton,
            {
              backgroundColor: theme.colors.accent,
              shadowColor: theme.colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            },
            (!selectedCollectionId || isSubmitting) && styles.buttonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!selectedCollectionId || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={[styles.buttonText, styles.submitButtonText]}>
                Ajout en cours...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={[styles.buttonText, styles.submitButtonText]}>
                Ajouter le produit
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
  },
  headerContent: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 45,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  selectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  selectionBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  collectionsContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  collectionsGrid: {
    gap: 16,
  },
  collectionCard: {
    padding: 20,
    borderRadius: 16,
    position: 'relative',
    minHeight: 140,
  },
  collectionCardSelected: {
    // Styles supplémentaires pour la sélection si nécessaire
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    marginBottom: 16,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  collectionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  backButton: {
    // Styles spécifiques au bouton retour
  },
  submitButton: {
    // Styles spécifiques au bouton submit
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  submitButtonText: {
    color: '#FFF',
  },
});