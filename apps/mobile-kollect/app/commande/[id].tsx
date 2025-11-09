/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// eslint-disable-next-line import/no-unresolved
import { useTheme } from '../context/ThemeContext';
import { useCommandeById , useConfirmerCommande, useAnnulerCommande } from '@/features/commandes/hooks/useCommandeQueries';
import { useCommandeHelpers } from '@/features/commandes/store/commandeStore';

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function CommandeDetailScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isProcessing, setIsProcessing] = useState(false);

  const { 
    data: commande, 
    isLoading, 
    error,
    refetch,
  } = useCommandeById(id || '');

  const { getStatusBadgeColor, getStatusLabel } = useCommandeHelpers();
  const { mutate: confirmerCommande, isPending: isConfirming } = useConfirmerCommande();
  const { mutate: annulerCommande, isPending: isCancelling } = useAnnulerCommande();

  const handleConfirm = () => {
    if (!commande) return;

    Alert.alert(
      'Confirmer la commande',
      `Êtes-vous sûr de vouloir confirmer la commande #${commande.orderNumber} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'default',
          onPress: () => {
            setIsProcessing(true);
            confirmerCommande(
              { id: commande.id },
              {
                onSuccess: () => {
                  setIsProcessing(false);
                  Alert.alert('Succès', '✅ Commande confirmée avec succès', [
                    { text: 'OK', onPress: () => router.back() },
                  ]);
                  refetch();
                },
                onError: (error: Error) => {
                  setIsProcessing(false);
                  Alert.alert('Erreur', error.message || 'Impossible de confirmer la commande');
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    if (!commande) return;

    Alert.alert(
      'Annuler la commande',
      `Êtes-vous sûr de vouloir annuler la commande #${commande.orderNumber} ?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: () => {
            setIsProcessing(true);
            annulerCommande(
              { id: commande.id },
              {
                onSuccess: () => {
                  setIsProcessing(false);
                  Alert.alert('Succès', '❌ Commande annulée', [
                    { text: 'OK', onPress: () => router.back() },
                  ]);
                  refetch();
                },
                onError: (error: Error) => {
                  setIsProcessing(false);
                  Alert.alert('Erreur', error.message || 'Impossible d\'annuler la commande');
                },
              }
            );
          },
        },
      ]
    );
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Chargement de la commande...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !commande) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Commande non trouvée
          </Text>
          <TouchableOpacity
            style={[
              styles.errorButton,
              {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
            <Text style={styles.errorButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Le statut est transformé par le service en 'en attente' | 'confirmée' | 'annulée'
  const commandeStatus = commande.status as 'en attente' | 'confirmée' | 'annulée';
  const statusColor = getStatusBadgeColor(commandeStatus);
  const statusLabel = getStatusLabel(commandeStatus);
  const canProcess = commandeStatus === 'en attente' && !isProcessing;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.borderLight }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Commande #{commande.orderNumber}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusColor + '15',
                borderWidth: 1,
                borderColor: statusColor + '40',
              },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Informations client */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Informations client
          </Text>
          {commande.client && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                {commande.client.firstName} {commande.client.lastName}
              </Text>
            </View>
          )}
          {commande.client?.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                {commande.client.phone}
              </Text>
            </View>
          )}
        </View>

        {/* Adresse de livraison */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Adresse de livraison
          </Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={theme.colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                {commande.shippingAddress || 'Non spécifiée'}
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                {commande.shippingCity || ''}
              </Text>
              {commande.shippingPhone && (
                <Text style={[styles.infoText, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                  Tél: {commande.shippingPhone}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Articles */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Articles ({commande.items?.length || 0})
          </Text>
          {commande.items?.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              {item.product?.images?.[0] && (
                <Image
                  source={{ uri: item.product.images[0] }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.colors.text }]}>
                  {item.productName || item.product?.name || 'Produit'}
                </Text>
                {(item.size || item.color) && (
                  <Text style={[styles.itemDetails, { color: theme.colors.textSecondary }]}>
                    {[item.size, item.color].filter(Boolean).join(' • ')}
                  </Text>
                )}
                <Text style={[styles.itemQuantity, { color: theme.colors.textSecondary }]}>
                  Quantité: {item.quantity}
                </Text>
                <Text style={[styles.itemPrice, { color: theme.colors.text }]}>
                  {item.price?.toFixed(2) || '0.00'} €
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
              Total
            </Text>
            <Text style={[styles.totalAmount, { color: theme.colors.text }]}>
              {commande.total?.toFixed(2) || '0.00'} €
            </Text>
          </View>
          {commande.createdAt && (
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
              Commandé le {new Date(commande.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Actions */}
      {canProcess && (
        <View style={[styles.actionsContainer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.borderLight }]}>
          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                backgroundColor: theme.colors.error + '15',
                borderColor: theme.colors.error + '40',
              },
            ]}
            onPress={handleCancel}
            disabled={isProcessing || isCancelling}
            activeOpacity={0.8}
          >
            {isCancelling ? (
              <ActivityIndicator size="small" color={theme.colors.error} />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={20} color={theme.colors.error} />
                <Text style={[styles.cancelButtonText, { color: theme.colors.error }]}>
                  Annuler
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              {
                backgroundColor: theme.colors.success,
                shadowColor: theme.colors.success,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              },
            ]}
            onPress={handleConfirm}
            disabled={isProcessing || isConfirming}
            activeOpacity={0.8}
          >
            {isConfirming ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.confirmButtonText}>
                  Confirmer
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  dateText: {
    fontSize: 14,
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

