import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../app/context/ThemeContext';
import { useCartStore, OrderCustomerInfo } from '../../store/cartStore';
import { formatPrice } from '../../features/commandes/types/commande.types';

type Props = {
  onConfirm?: (info: OrderCustomerInfo) => void;
  buttonLabel?: string;
  onCancel?: () => void;
  cancelLabel?: string;
  submitting?: boolean;
};

export function OrderForm({
  onConfirm,
  buttonLabel = 'Confirmer la commande',
  onCancel,
  cancelLabel = 'Annuler',
  submitting = false,
}: Props) {
  const { theme } = useTheme();
  const setCustomer = useCartStore((s) => s.setCustomer);
  const subtotal = useCartStore((s) => s.subtotal)();
  const totalQty = useCartStore((s) => s.totalQuantity)();

  const [form, setForm] = useState<OrderCustomerInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    additionalInfo: '',
  });

  function update<K extends keyof OrderCustomerInfo>(key: K, value: OrderCustomerInfo[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit() {
    setCustomer(form);
    onConfirm?.(form);
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Informations de livraison</Text>
      <View style={styles.row}>
        <TextInput
          placeholder="Prénom"
          placeholderTextColor={theme.colors.textSecondary}
          value={form.firstName}
          onChangeText={(v) => update('firstName', v)}
          style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
        />
        <TextInput
          placeholder="Nom"
          placeholderTextColor={theme.colors.textSecondary}
          value={form.lastName}
          onChangeText={(v) => update('lastName', v)}
          style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
        />
      </View>
      <TextInput
        placeholder="Numéro de téléphone"
        placeholderTextColor={theme.colors.textSecondary}
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={(v) => update('phone', v)}
        style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
      />
      <TextInput
        placeholder="Adresse"
        placeholderTextColor={theme.colors.textSecondary}
        value={form.address}
        onChangeText={(v) => update('address', v)}
        style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
      />
      <TextInput
        placeholder="Ville"
        placeholderTextColor={theme.colors.textSecondary}
        value={form.city}
        onChangeText={(v) => update('city', v)}
        style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
      />
      <TextInput
        placeholder="Informations complémentaires (optionnel)"
        placeholderTextColor={theme.colors.textSecondary}
        value={form.additionalInfo}
        onChangeText={(v) => update('additionalInfo', v)}
        style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
      />

      <View style={styles.summary}>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          Articles: {totalQty} • Total: {formatPrice(subtotal)}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        {onCancel && (
          <TouchableOpacity
            onPress={onCancel}
            style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
            disabled={submitting}
          >
            <Text style={[styles.secondaryText, { color: theme.colors.textSecondary }]}>{cancelLabel}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onSubmit}
          style={[styles.submit, { backgroundColor: theme.colors.primary, opacity: submitting ? 0.7 : 1 }]}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <Text style={[styles.submitText, { color: theme.colors.onPrimary }]}>{buttonLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  summary: {
    paddingTop: 8,
  },
  summaryText: {
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  submit: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  submitText: {
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  secondaryText: {
    fontWeight: '600',
    fontSize: 14,
  },
});

