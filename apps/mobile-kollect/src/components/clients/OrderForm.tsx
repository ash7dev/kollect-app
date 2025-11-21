import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
  const { theme, isDark } = useTheme();
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

  const [focusedField, setFocusedField] = useState<string | null>(null);

  function update<K extends keyof OrderCustomerInfo>(key: K, value: OrderCustomerInfo[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit() {
    setCustomer(form);
    onConfirm?.(form);
  }

  const isFormValid = 
    form.firstName.trim() !== '' &&
    form.lastName.trim() !== '' &&
    form.phone.trim() !== '' &&
    form.address.trim() !== '' &&
    form.city.trim() !== '';

  const renderInput = (
    icon: keyof typeof Ionicons.glyphMap,
    placeholder: string,
    value: string | undefined,
    onChangeText: (text: string) => void,
    field: string,
    keyboardType?: 'default' | 'phone-pad' | 'email-address',
    multiline = false
  ) => {
    const isFocused = focusedField === field;
    const displayValue = value ?? '';
    
    return (
      <View style={styles.inputWrapper}>
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
              borderColor: isFocused
                ? theme.colors.primary
                : isDark
                ? 'rgba(255,255,255,0.1)'
                : '#e8e8e8',
              borderWidth: isFocused ? 2 : 1,
            },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f8f8f8' }]}>
            <Ionicons
              name={icon}
              size={20}
              color={isFocused ? theme.colors.primary : isDark ? '#888' : '#999'}
            />
          </View>
          <TextInput
            placeholder={placeholder}
            placeholderTextColor={isDark ? '#666' : '#999'}
            value={displayValue}
            onChangeText={onChangeText}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            style={[
              styles.input,
              {
                color: isDark ? '#fff' : '#000',
                minHeight: multiline ? 80 : undefined,
                textAlignVertical: multiline ? 'top' : 'center',
              },
            ]}
          />
          {displayValue.trim() !== '' && (
            <TouchableOpacity
              onPress={() => onChangeText('')}
              style={styles.clearBtn}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="close-circle" size={18} color={isDark ? '#666' : '#999'} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
            <Ionicons name="location" size={28} color={theme.colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>
            Informations de livraison
          </Text>
          <Text style={[styles.headerSubtitle, { color: isDark ? '#888' : '#666' }]}>
            Complétez vos coordonnées pour finaliser votre commande
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Section: Identité */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person" size={18} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
                Identité
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                {renderInput(
                  'person-outline',
                  'Prénom',
                  form.firstName,
                  (v) => update('firstName', v),
                  'firstName'
                )}
              </View>
              <View style={styles.halfInput}>
                {renderInput(
                  'person-outline',
                  'Nom',
                  form.lastName,
                  (v) => update('lastName', v),
                  'lastName'
                )}
              </View>
            </View>
            {renderInput(
              'call-outline',
              'Numéro de téléphone',
              form.phone,
              (v) => update('phone', v),
              'phone',
              'phone-pad'
            )}
          </View>

          {/* Section: Adresse */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="home" size={18} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
                Adresse de livraison
              </Text>
            </View>
            {renderInput(
              'location-outline',
              'Adresse complète',
              form.address,
              (v) => update('address', v),
              'address'
            )}
            {renderInput(
              'business-outline',
              'Ville',
              form.city,
              (v) => update('city', v),
              'city'
            )}
          </View>

          {/* Section: Informations complémentaires */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbox" size={18} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
                Notes (optionnel)
              </Text>
            </View>
            {renderInput(
              'create-outline',
              'Instructions de livraison, étage, code...',
              form.additionalInfo,
              (v) => update('additionalInfo', v),
              'additionalInfo',
              'default',
              true
            )}
          </View>
        </View>

        {/* Summary (sans livraison) */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f8ff',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : `${theme.colors.primary}20`,
            },
          ]}
        >
          <View style={styles.summaryHeader}>
            <Ionicons name="cart" size={20} color={theme.colors.primary} />
            <Text style={[styles.summaryTitle, { color: isDark ? '#fff' : '#000' }]}>
              Récapitulatif
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <Ionicons name="cube-outline" size={16} color={isDark ? '#888' : '#666'} />
              <Text style={[styles.summaryLabel, { color: isDark ? '#aaa' : '#666' }]}>
                Articles
              </Text>
            </View>
            <Text style={[styles.summaryValue, { color: isDark ? '#fff' : '#000' }]}>
              {totalQty}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <Ionicons name="cash-outline" size={16} color={isDark ? '#888' : '#666'} />
              <Text style={[styles.summaryLabel, { color: isDark ? '#aaa' : '#666' }]}>
                Total
              </Text>
            </View>
            <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
              {formatPrice(subtotal)}
            </Text>
          </View>
        </View>

        {/* Info Banner */}
        <View
          style={[
            styles.infoBanner,
            {
              backgroundColor: isDark ? 'rgba(76, 175, 80, 0.1)' : '#e8f5e9',
              borderColor: isDark ? 'rgba(76, 175, 80, 0.3)' : '#81c784',
            },
          ]}
        >
          <Ionicons name="shield-checkmark" size={20} color="#4caf50" />
          <Text style={[styles.infoText, { color: isDark ? '#81c784' : '#2e7d32' }]}>
            Paiement sécurisé à la livraison
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Action Buttons */}
      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: isDark ? '#000' : '#fff',
            borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0',
          },
        ]}
      >
        {onCancel && (
          <TouchableOpacity
            onPress={onCancel}
            style={[
              styles.cancelButton,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0',
              },
            ]}
            disabled={submitting}
          >
            <Ionicons name="close" size={20} color={isDark ? '#aaa' : '#666'} />
            <Text style={[styles.cancelText, { color: isDark ? '#aaa' : '#666' }]}>
              {cancelLabel}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={onSubmit}
          style={[
            styles.submitButton,
            { opacity: !isFormValid || submitting ? 0.5 : 1 },
          ]}
          disabled={!isFormValid || submitting}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primary + 'dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitGradient}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={styles.submitText}>{buttonLabel}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  formSection: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputWrapper: {
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 12,
  },
  clearBtn: {
    padding: 8,
  },
  summaryCard: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(128,128,128,0.2)',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    flex: 0.8,
  },
  cancelText: {
    fontWeight: '700',
    fontSize: 15,
  },
  submitButton: {
    flex: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  submitText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});