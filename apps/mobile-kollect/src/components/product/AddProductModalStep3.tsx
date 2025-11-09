// src/components/product/AddProductModalStep3.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert} from 'react-native';
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
  const { theme } = useTheme();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Log pour déboguer les collections reçues
  useEffect(() => {
    console.log('Collections reçues dans AddProductStep3:', collections);
  }, [collections]);

  const availableCollections = collections.filter(
    collection => collection.status === CollectionStatus.DISPONIBLE || 
                 collection.status === CollectionStatus.TEASER
  );

  // Ajoutez ces logs pour le débogage
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
    // Ne pas fermer le modal en cas d'erreur
    Alert.alert('Erreur', 'Impossible d\'ajouter le produit à la collection');
    return;
  } finally {
    setIsSubmitting(false);
  }
};

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Sélectionnez une collection
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Choisissez la collection pour votre produit
      </Text>

      <View style={styles.collectionsContainer}>
        {availableCollections.length > 0 ? (
          availableCollections.map(collection => (
            <TouchableOpacity
              key={collection.id}
              style={[
                styles.collectionItem,
                selectedCollectionId === collection.id && {
                  borderColor: theme.colors.primary,
                  backgroundColor: `${theme.colors.primary}20`,
                },
              ]}
              onPress={() => handleCollectionSelect(collection.id)}
              disabled={isSubmitting}
            >
              <View style={styles.collectionInfo}>
                <Text style={[styles.collectionName, { color: theme.colors.text }]}>
                  {collection.name}
                </Text>
                <Text style={[styles.collectionStatus, { 
                  color: collection.status === CollectionStatus.DISPONIBLE 
                    ? theme.colors.success 
                    : theme.colors.warning 
                }]}>
                  {collection.status === CollectionStatus.DISPONIBLE ? 'Disponible' : 'En prévisualisation'}
                </Text>
              </View>
              {selectedCollectionId === collection.id && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
              Aucune collection disponible
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={onBack}
          disabled={isSubmitting}
        >
          <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
            Retour
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button, 
            styles.submitButton,
            (!selectedCollectionId || isSubmitting) && { opacity: 0.5 }
          ]}
          onPress={handleSubmit}
          disabled={!selectedCollectionId || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.buttonText, { color: '#fff' }]}>
              Ajouter le produit
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  collectionsContainer: {
    flex: 1,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    marginBottom: 12,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  collectionStatus: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});