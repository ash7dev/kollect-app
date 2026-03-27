import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';
import { CreationStepper } from './CreationStepper';
import CollectionProductsScreen from './CollectionProductsScreen';
import { CollectionTeaserStep, CollectionTeaserData } from './CollectionTeaserStep';
import { CollectionConfirmationStep } from './CollectionConfirmationStep';
import { storage } from '@/utils/storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CreateCollectionStepperModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (collection: {
    name: string;
    description: string;
    teaserType: 'photo' | 'video';
    teaserUri: string | null;
    launchDate: Date;
    launchTime: Date;
  }) => Promise<void>;
  brandId: string;
}

export function CreateCollectionStepperModal({
  visible,
  onClose,
  onSubmit,
  brandId,
}: CreateCollectionStepperModalProps) {
  const { theme, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [teaserData, setTeaserData] = useState<CollectionTeaserData>({
    name: '',
    description: '',
    teaserType: 'photo',
    teaserUri: null,
    launchDate: new Date(Date.now() + 2 * 86400000), // +48h pour plus de sécurité
    launchTime: new Date(Date.now() + 2 * 86400000),
  });
  const slideAnim = useState(new Animated.Value(SCREEN_HEIGHT))[0];

  const resetStepper = useCallback(() => {
    setCurrentStep(0);
    setTeaserData({
      name: '',
      description: '',
      teaserType: 'photo',
      teaserUri: null,
      launchDate: new Date(Date.now() + 2 * 86400000),
      launchTime: new Date(Date.now() + 2 * 86400000),
    });
  }, []);

  // Animation d'entrée/sortie
  React.useEffect(() => {
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
      // Réinitialiser le stepper quand le modal est fermé
      setTimeout(() => resetStepper(), 300);
    }
  }, [visible, slideAnim, resetStepper]);

  const handleClose = async () => {
    // Vérifier s'il y a des données non sauvegardées
    const draft = await storage.getDraftCollection();
    const hasData = 
      currentStep > 0 || 
      teaserData.name || 
      teaserData.description || 
      teaserData.teaserUri ||
      (draft?.products && draft.products.length > 0);

    if (hasData) {
      Alert.alert(
        'Confirmer',
        'Voulez-vous vraiment annuler ? Toutes les données seront perdues.',
        [
          { text: 'Non', style: 'cancel' },
          {
            text: 'Oui',
            style: 'destructive',
            onPress: async () => {
              await storage.clearDraftCollection();
              resetStepper();
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  const handleNext = async () => {
    console.log('🔄 Passage à l\'étape suivante...');
    
    // Vérifier qu'on peut passer à l'étape suivante
    if (currentStep === 0) {
      // Vérifier qu'il y a au moins un produit dans le draft
      const draft = await storage.getDraftCollection();
      const productsCount = draft?.products?.length || 0;
      
      console.log('📦 Nombre de produits:', productsCount);
      
      if (productsCount === 0) {
        Alert.alert(
          'Produits requis', 
          'Tu dois ajouter au moins un produit avant de continuer.'
        );
        return;
      }
    }
    
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      console.log('✅ Étape suivante:', currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      console.log('⬅️ Étape précédente:', currentStep - 1);
    }
  };

  const handleStepChange = (step: number) => {
    // Ne permettre de changer d'étape que vers les étapes déjà complétées
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const handleCreate = async () => {
    try {
      console.log('🚀 Création de la collection...');
      
      // Vérifier les données du teaser
      if (!teaserData.name.trim()) {
        Alert.alert('Erreur', 'Le nom de la collection est requis');
        return;
      }

      // Vérifier qu'il y a des produits
      const draft = await storage.getDraftCollection();
      const productsCount = draft?.products?.length || 0;
      
      if (productsCount === 0) {
        Alert.alert('Erreur', 'Aucun produit trouvé. Retourne à l\'étape 1.');
        return;
      }

      console.log('📤 Envoi des données:', {
        name: teaserData.name,
        description: teaserData.description,
        productsCount,
        teaserType: teaserData.teaserType,
        hasMedia: !!teaserData.teaserUri,
      });

      // Appel direct à onSubmit avec les données du teaser
      // Le service s'occupe de récupérer les produits du draft
      await onSubmit({
        name: teaserData.name.trim(),
        description: teaserData.description.trim(),
        teaserType: teaserData.teaserType,
        teaserUri: teaserData.teaserUri,
        launchDate: teaserData.launchDate,
        launchTime: teaserData.launchTime,
      });

      console.log('✅ Collection créée avec succès');

      // Nettoyer le draft après succès
      await storage.clearDraftCollection();

      Alert.alert(
        'Succès',
        `🎉 Collection "${teaserData.name}" créée avec ${productsCount} produit(s) !`,
        [
          {
            text: 'OK',
            onPress: () => {
              resetStepper();
              onClose();
            },
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Échec de la création de la collection';
      
      Alert.alert('Erreur', errorMessage);
    }
  };

  const steps = [
    {
      key: 'products',
      title: 'Produits',
      icon: 'cube-outline' as const,
      component: (
        <CollectionProductsScreen
          onNext={handleNext}
          canProceed={true}
        />
      ),
    },
    {
      key: 'teaser',
      title: 'Teaser',
      icon: 'eye-outline' as const,
      component: (
        <CollectionTeaserStep
          data={teaserData}
          onDataChange={setTeaserData}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      ),
    },
    {
      key: 'confirmation',
      title: 'Lancement',
      icon: 'rocket-outline' as const,
      component: (
        <CollectionConfirmationStep
          teaserData={teaserData}
          onLaunch={handleCreate}
          onPrevious={handlePrevious}
          brandId={brandId}
        />
      ),
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <BlurView 
        intensity={isDark ? 60 : 80} 
        tint={isDark ? 'dark' : 'light'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        
        <Animated.View 
          style={[
            styles.modalWrapper,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View 
            style={[
              styles.modalContainer, 
              { 
                backgroundColor: theme.colors.card,
                borderTopWidth: 2,
                borderLeftWidth: 2,
                borderRightWidth: 2,
                borderColor: theme.colors.borderLight,
                // BOOM: Ombre massive
                shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
                shadowOffset: { width: 0, height: -8 },
                shadowOpacity: 1,
                shadowRadius: 20,
                elevation: 24,
              }
            ]}
          >
            {/* Header BOOM */}
            <View 
              style={[
                styles.modalHeader, 
                { 
                  borderBottomColor: theme.colors.borderLight,
                  borderBottomWidth: 1,
                }
              ]}
            >
              <View>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Nouveau Drop
                </Text>
                <View style={styles.subtitleContainer}>
                  <View 
                    style={[
                      styles.stepBadge,
                      { 
                        backgroundColor: theme.colors.accent + '15',
                        borderWidth: 1,
                        borderColor: theme.colors.accent + '30',
                      }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.stepBadgeText,
                        { color: theme.colors.accent }
                      ]}
                    >
                      {currentStep + 1}/3
                    </Text>
                  </View>
                  <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                    {steps[currentStep].title}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={handleClose} 
                style={[
                  styles.closeButton, 
                  { 
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.borderLight,
                  }
                ]}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Stepper BOOM */}
            <CreationStepper
              currentStep={currentStep}
              steps={steps}
              onStepChange={handleStepChange}
            />
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  modalWrapper: { height: '92%' },
  modalContainer: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  modalTitle: { 
    fontSize: 28, 
    fontWeight: '700', 
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  modalSubtitle: { 
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});