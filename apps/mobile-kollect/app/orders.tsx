import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from './context/ThemeContext';
import { commandeService, type Commande } from '../src/features/commandes/services/commande.service';

export default function OrdersScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Commande[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setError(null);
        setLoading(true);
        const res = await commandeService.getMyCommandes({ limit: 20, page: 1 });
        setOrders(res.data || []);
      } catch (e: any) {
        setError(e?.message || 'Erreur lors du chargement des commandes');
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, []);

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'en attente': '#FF9500',
      'confirmée': '#007AFF',
      'annulée': '#FF3B30',
    };
    return statusColors[status.toLowerCase()] || theme.colors.textSecondary;
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      'en attente': 'En attente',
      'confirmée': 'Confirmée',
      'annulée': 'Annulée',
    };
    return statusLabels[status.toLowerCase()] || status;
  };

  const renderItem = ({ item }: { item: Commande }) => {
    const date = new Date(item.createdAt);
    const statusColor = getStatusColor(item.status);
    
    return (
      <TouchableOpacity
        style={[
          styles.orderCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#E5E5E5',
            shadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.15)',
            shadowOffset: { width: 0, height: isDark ? 8 : 6 },
            shadowOpacity: 1,
            shadowRadius: 12,
            elevation: isDark ? 8 : 4,
          },
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.orderInfo}>
            <Text style={[styles.orderNumber, { color: theme.colors.text }]}>
              Commande #{item.orderNumber}
            </Text>
            <Text style={[styles.orderDate, { color: theme.colors.textSecondary }]}>
              {date.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { 
          backgroundColor: isDark ? '#2A2A2A' : '#E5E5E5' 
        }]} />

        <View style={styles.cardFooter}>
          <View style={styles.orderDetails}>
            <View style={styles.detailItem}>
              <Ionicons 
                name="cube-outline" 
                size={16} 
                color={theme.colors.textSecondary} 
              />
              <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                {item.items.length} article{item.items.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
              Total
            </Text>
            <Text style={[styles.totalAmount, { color: theme.colors.accent }]}>
              {item.total.toLocaleString('fr-FR', { 
                style: 'currency', 
                currency: 'XOF',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Chargement des commandes...
        </Text>
      </View>
    );
  }

  const handleBack = () => {
    if (router.canGoBack && router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, {
            backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8',
          }]}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        <View style={styles.headerTextBlock}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Mes commandes
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Historique de vos achats
          </Text>
        </View>
      </View>

      {error && (
        <View style={[styles.errorContainer, {
          backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.08)',
          borderColor: '#FF3B30',
        }]}>
          <Ionicons name="alert-circle-outline" size={18} color="#FF3B30" />
          <Text style={[styles.errorText, { color: '#FF3B30' }]}>{error}</Text>
        </View>
      )}

      {orders.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, {
            backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8',
          }]}>
            <Ionicons 
              name="receipt-outline" 
              size={48} 
              color={theme.colors.textSecondary} 
            />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            Aucune commande
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Vous nqavez pas encore passé de commande. Découvrez nos collections et commencez votre shopping.
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 86,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 38,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextBlock: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: '400',
  },
  list: {
    paddingBottom: 24,
  },
  orderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  orderDate: {
    fontSize: 13,
    fontWeight: '400',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  orderDetails: {
    flex: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '500',
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    gap: 10,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});