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
import { LinearGradient } from 'expo-linear-gradient';
 
import { useTheme } from '../context/ThemeContext';
import { useCommandeById, useConfirmerCommande, useAnnulerCommande } from '@/features/commandes/hooks/useCommandeQueries';
import { useCommandeHelpers } from '@/features/commandes/store/commandeStore';

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
  // RENDER - LOADING
  // ============================================
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <View style={[styles.loadingIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Chargement de la commande...
          </Text>
          <Text style={[styles.loadingSubtext, { color: theme.colors.textSecondary }]}>
            Veuillez patienter
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER - ERROR
  // ============================================
  if (error || !commande) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <View style={[styles.errorIcon, { backgroundColor: `${theme.colors.error}15` }]}>
            <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          </View>
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Commande non trouvée
          </Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            Impossible de charger les détails de cette commande
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => router.back()}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.errorButtonGradient}
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.card} />
              <Text style={[styles.errorButtonText, { color: theme.colors.card }]}>Retour</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const commandeStatus = commande.status as 'en attente' | 'confirmée' | 'annulée';
  const statusColor = getStatusBadgeColor(commandeStatus);
  const statusLabel = getStatusLabel(commandeStatus);
  const canProcess = commandeStatus === 'en attente' && !isProcessing;

  // ============================================
  // RENDER - SUCCESS
  // ============================================
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={isDark 
          ? [theme.colors.background, theme.colors.surface]
          : [theme.colors.card, theme.colors.background]
        }
        style={[styles.header, { borderBottomColor: theme.colors.divider }]}
      >
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              #{commande.orderNumber}
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Détails de la commande
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${statusColor}15`,
                borderColor: `${statusColor}40`,
              },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Timeline / Date Card */}
        {commande.createdAt && (
          <View style={[
            styles.timelineCard,
            { 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.borderLight,
              shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
            }
          ]}>
            <View style={[styles.timelineIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Ionicons name="time-outline" size={24} color={theme.colors.accent} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineLabel, { color: theme.colors.textSecondary }]}>
                Date de commande
              </Text>
              <Text style={[styles.timelineDate, { color: theme.colors.text }]}>
                {new Date(commande.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <Text style={[styles.timelineTime, { color: theme.colors.textSecondary }]}>
                {new Date(commande.createdAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        )}

        {/* Informations client */}
        <View style={[
          styles.section,
          { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.borderLight,
            shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
          }
        ]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Ionicons name="person" size={20} color={theme.colors.accent} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Informations client
            </Text>
          </View>
          
          {commande.client && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={[styles.infoIconBg, { backgroundColor: theme.colors.surface }]}>
                  <Ionicons name="person-outline" size={18} color={theme.colors.accent} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                    Nom complet
                  </Text>
                  <Text style={[styles.infoText, { color: theme.colors.text }]}>
                    {commande.client.firstName} {commande.client.lastName}
                  </Text>
                </View>
              </View>
              
              {commande.client?.phone && (
                <View style={styles.infoRow}>
                  <View style={[styles.infoIconBg, { backgroundColor: theme.colors.surface }]}>
                    <Ionicons name="call-outline" size={18} color={theme.colors.textSecondary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                      Téléphone
                    </Text>
                    <Text style={[styles.infoText, { color: theme.colors.text }]}>
                      {commande.client.phone}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Adresse de livraison */}
        <View style={[
          styles.section,
          { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.borderLight,
            shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
          }
        ]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Ionicons name="location" size={20} color={theme.colors.accent} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Adresse de livraison
            </Text>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.addressContainer}>
              <View style={[styles.addressIconBg, { backgroundColor: theme.colors.surface }]}>
                <Ionicons name="location-outline" size={20} color={theme.colors.accent} />
              </View>
              <View style={styles.addressContent}>
                <Text style={[styles.addressText, { color: theme.colors.text }]}>
                  {commande.shippingAddress || 'Non spécifiée'}
                </Text>
                <Text style={[styles.cityText, { color: theme.colors.textSecondary }]}>
                  {commande.shippingCity || ''}
                </Text>
                {commande.shippingPhone && (
                  <View style={styles.phoneRow}>
                    <Ionicons name="call" size={14} color={theme.colors.accent} />
                    <Text style={[styles.phoneText, { color: theme.colors.textSecondary }]}>
                      {commande.shippingPhone}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Articles */}
        <View style={[
          styles.section,
          { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.borderLight,
            shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
          }
        ]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Ionicons name="cart" size={20} color={theme.colors.accent} />
            </View>
            <View style={styles.sectionHeaderContent}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Articles
              </Text>
              <View style={[styles.itemCountBadge, { backgroundColor: `${theme.colors.primary}20` }]}>
                <Text style={[styles.itemCountText, { color: theme.colors.primary }]}>
                  {commande.items?.length || 0}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.itemsList}>
            {commande.items?.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.itemCard,
                  { 
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.borderLight,
                  }
                ]}
              >
                <View style={styles.itemImageContainer}>
                  {item.product?.images?.[0] ? (
                    <Image
                      source={{ uri: item.product.images[0] }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.itemImagePlaceholder, { backgroundColor: theme.colors.surface }]}>
                      <Ionicons name="image-outline" size={32} color={theme.colors.textDisabled} />
                    </View>
                  )}
                  <View style={[styles.quantityBadge, { backgroundColor: theme.colors.primary }]}>
                    <Text style={[styles.quantityText, { color: theme.colors.card }]}>×{item.quantity}</Text>
                  </View>
                </View>
                
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={2}>
                    {item.productName || item.product?.name || 'Produit'}
                  </Text>
                  
                  {(item.size || item.color) && (
                    <View style={styles.itemVariants}>
                      {item.size && (
                        <View style={[styles.variantTag, { backgroundColor: theme.colors.surface }]}>
                          <Text style={[styles.variantText, { color: theme.colors.textSecondary }]}>
                            {item.size}
                          </Text>
                        </View>
                      )}
                      {item.color && (
                        <View style={[styles.variantTag, { backgroundColor: theme.colors.surface }]}>
                          <Text style={[styles.variantText, { color: theme.colors.textSecondary }]}>
                            {item.color}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  
                  <Text style={[styles.itemPrice, { color: theme.colors.accent }]}>
                    {typeof item.price === 'number'
                      ? `${item.price.toLocaleString('fr-FR')} CFA`
                      : '0 CFA'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Total Card */}
        <View style={[
          styles.totalCard,
          { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.accent,
            shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
          }
        ]}>
          <LinearGradient
            colors={[`${theme.colors.accent}10`, theme.colors.card]}
            style={styles.totalGradient}
          >
            <View style={styles.totalHeader}>
              <Ionicons name="wallet" size={24} color={theme.colors.accent} />
              <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
                Total à payer
              </Text>
            </View>
            <Text style={[styles.totalAmount, { color: theme.colors.accent }]}>
              {typeof commande.total === 'number'
                ? `${commande.total.toLocaleString('fr-FR')} CFA`
                : '0 CFA'}
            </Text>
          </LinearGradient>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Fixed Action Buttons */}
      {canProcess && (
        <View
          style={[
            styles.actionsContainer,
            {
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.divider,
              shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                backgroundColor: `${theme.colors.error}15`,
                borderColor: theme.colors.error,
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
                <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                <Text style={[styles.cancelButtonText, { color: theme.colors.error }]}>Annuler</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, { opacity: isProcessing || isConfirming ? 0.7 : 1 }]}
            onPress={handleConfirm}
            disabled={isProcessing || isConfirming}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.success, `${theme.colors.success}dd`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.confirmGradient}
            >
              {isConfirming ? (
                <ActivityIndicator size="small" color={theme.colors.card} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color={theme.colors.card} />
                  <Text style={[styles.confirmButtonText, { color: theme.colors.card }]}>Confirmer</Text>
                </>
              )}
            </LinearGradient>
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
  loadingIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '700',
  },
  loadingSubtext: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  errorIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  errorButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 10,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  timelineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  timelineIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 13,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  itemCountBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  itemCountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoCard: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  addressContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  addressIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressContent: {
    flex: 1,
    gap: 6,
  },
  addressText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  cityText: {
    fontSize: 14,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  phoneText: {
    fontSize: 13,
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  itemImageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  itemImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 8,
  },
  itemVariants: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  variantTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  variantText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  totalCard: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  totalGradient: {
    padding: 24,
    gap: 12,
  },
  totalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
});