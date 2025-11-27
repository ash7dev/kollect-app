import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform, 
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';
import { useCartStore } from '../../store/cartStore';
import { OrderForm } from './OrderForm';
import { useCreateCommande } from '../../features/commandes/hooks/useCommandeQueries';
import { formatPrice } from '../../features/commandes/types/commande.types';

export type CheckoutModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (orderId: string) => void;
};

export default function CheckoutModal({ visible, onClose, onSuccess }: CheckoutModalProps) {
  const { theme, isDark } = useTheme();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const totalQty = useCartStore((s) => s.totalQuantity());
  const clear = useCartStore((s) => s.clear);

  const createCommande = useCreateCommande();
  const [submitting, setSubmitting] = useState(false);

  // 🔥 Couleurs dynamiques
  const colors = {
    // Overlay
    overlay: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.5)',
    
    // Sheet
    sheetBg: theme.colors.background,
    sheetBorder: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.borderLight,
    
    // Header
    handleBar: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
    
    // Close button
    closeBg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    
    // Summary box
    summaryBg: isDark ? 'rgba(255,255,255,0.06)' : theme.colors.surface,
    summaryBorder: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderLight,
    
    // Textes
    text: theme.colors.text,
    textSecondary: theme.colors.textSecondary,
    
    // Divider
    divider: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.divider,
  };

  async function handleConfirm(form: { 
    firstName: string; 
    lastName: string; 
    phone: string; 
    address: string; 
    city: string; 
    additionalInfo?: string; 
  }) {
    if (items.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez des articles avant de passer commande.');
      return;
    }

    try {
      setSubmitting(true);
      const dto = {
        items: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
        })),
        adresseLivraison: {
          nom: `${form.firstName} ${form.lastName}`.trim() || 'Client',
          telephone: form.phone,
          adresse: form.address,
          ville: form.city,
          quartier: form.additionalInfo?.trim() || form.city,
        },
      };

      const order = await createCommande.mutateAsync(dto);
      clear();
      onSuccess?.(order.id);
      Alert.alert('Commande créée', `Votre commande ${order.orderNumber} a été créée.`);
      onClose();
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Impossible de créer la commande');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.sheet, { backgroundColor: colors.sheetBg, borderTopColor: colors.sheetBorder }]}>
          {/* Handle bar */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleBar, { backgroundColor: colors.handleBar }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Finaliser la commande</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {totalQty} article{totalQty > 1 ? 's' : ''} dans votre panier
              </Text>
            </View>
            <TouchableOpacity 
              onPress={onClose} 
              style={[styles.closeBtn, { backgroundColor: colors.closeBg }]}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Récap panier */}
          <View style={[styles.summaryBox, { backgroundColor: colors.summaryBg, borderColor: colors.summaryBorder }]}>
            <View style={styles.summaryHeader}>
              <Ionicons name="cart-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.summaryTitle, { color: colors.text }]}>Récapitulatif</Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Articles</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{totalQty}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Sous-total</Text>
              <Text style={[styles.totalValue, { color: theme.colors.accent }]}>{formatPrice(subtotal)}</Text>
            </View>
          </View>

          {/* Formulaire client */}
          <OrderForm
            onConfirm={handleConfirm}
            submitting={submitting}
            buttonLabel={submitting ? 'Envoi en cours...' : 'Confirmer la commande'}
            onCancel={onClose}
            cancelLabel="Annuler"
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    maxHeight: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  
  // Handle
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  closeBtn: { 
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Summary
  summaryBox: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: { 
    fontSize: 14,
  },
  summaryValue: { 
    fontSize: 14, 
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});