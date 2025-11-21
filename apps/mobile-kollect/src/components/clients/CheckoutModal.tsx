import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
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

  async function handleConfirm(form: { firstName: string; lastName: string; phone: string; address: string; city: string; additionalInfo?: string; }) {
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
          quartier: (form.additionalInfo && form.additionalInfo.trim()) ? form.additionalInfo.trim() : form.city,
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
      <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)' }]}>
        <View style={[styles.sheet, { backgroundColor: theme.colors.background, borderTopColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight }]}> 
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Passer la commande</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Récap panier */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Articles</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{totalQty}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Sous-total</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{formatPrice(subtotal)}</Text>
            </View>
          </View>

          {/* Formulaire client */}
          <OrderForm
            onConfirm={handleConfirm}
            submitting={submitting}
            buttonLabel={submitting ? 'Envoi...' : 'Confirmer la commande'}
            onCancel={onClose}
            cancelLabel="Retour"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '90%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: { padding: 6 },
  summaryBox: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 15, fontWeight: '600' },
});
