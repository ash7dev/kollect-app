// src/components/product/CreateProductModalStepper.tsx
import React, { useState } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { useTheme } from '../../../app/context/ThemeContext';
import { AddProductModal } from '@/components/collection/AddProductModal';
import { AddProductStep3 } from '../product/AddProductModalStep3';
import { CollectionDto } from '@/features/collections/services/collections.service';
import { ProductDraft } from '@/utils/storage';

interface CreateProductModalStepperProps {
  visible: boolean;
  onClose: () => void;
  collections: CollectionDto[];
  onSubmit: (product: ProductDraft, collectionId: string) => Promise<void>;
}

export const CreateProductModalStepper: React.FC<CreateProductModalStepperProps> = ({
  visible,
  onClose,
  collections,
  onSubmit,
}) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [productData, setProductData] = useState<ProductDraft | null>(null);

  const handleProductSubmit = async (product: ProductDraft): Promise<void> => {
    setProductData(product);
    setCurrentStep(2); // Passer à l'étape de sélection de la collection
    return Promise.resolve();
  };

  const handleCollectionSelect = async (product: ProductDraft, collectionId: string): Promise<void> => {
    await onSubmit(product, collectionId);
    resetAndClose();
  };

  const resetAndClose = () => {
    setCurrentStep(1);
    setProductData(null);
    onClose();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      resetAndClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={resetAndClose}
      transparent={false}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {currentStep === 1 && (
          <AddProductModal
            visible={true}
            onClose={handleBack}
            onSubmit={handleProductSubmit}
            collectionName="Nouveau produit"
            autoCloseOnSuccess={false}
            embedded
          />
        )}

        {currentStep === 2 && productData && (
          <AddProductStep3
            product={productData}
            collections={collections}
            onSubmit={handleCollectionSelect}
            onBack={() => setCurrentStep(1)}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CreateProductModalStepper;
