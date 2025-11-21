import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { OrderForm } from '../../src/components/clients/OrderForm';
import { useCartStore, type OrderCustomerInfo } from '../../src/store/cartStore';
import { commandeService, type CreateCommandeDto } from '../../src/features/commandes/services/commande.service';

export default function CheckoutScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async (info: OrderCustomerInfo) => {
    if (!items.length) {
      Alert.alert('Panier vide', 'Ajoutez des articles avant de valider votre commande.');
      return;
    }

    const fullName = `${info.firstName} ${info.lastName}`.trim() || 'Client';

    const dto: CreateCommandeDto = {
      items: items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        size: it.size,
        color: it.color,
      })),
      adresseLivraison: {
        nom: fullName,
        adresse: info.address,
        ville: info.city,
        telephone: info.phone,
      },
      notes: info.additionalInfo || undefined,
    };

    try {
      setSubmitting(true);
      await commandeService.createCommande(dto);
      clear();
      Alert.alert('Commande créée', 'Votre commande a été enregistrée avec succès.', [
        {
          text: 'OK',
          onPress: () => router.replace('/(client)'),
        },
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || "Impossible de créer la commande.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <Ionicons
          name="chevron-back"
          size={22}
          color={theme.colors.text}
          onPress={() => router.back()}
        />
        <Text style={[styles.title, { color: theme.colors.text }]}>Finaliser la commande</Text>
        <View style={{ width: 22 }} />
      </View>

      <OrderForm
        onConfirm={handleConfirm}
        buttonLabel="Confirmer la commande"
        submitting={submitting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
});
