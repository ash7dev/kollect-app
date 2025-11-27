import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '../../../app/context/ThemeContext';
import { useProduits } from '@/features/produits/hooks/useProduits';
import { produitsService } from '@/features/produits/services/produits.service';

const AlertsSection: React.FC = () => {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const { data: produits, isLoading: isLoadingProduits } = useProduits();

  const { data: deletedSummary, isLoading: isLoadingDeleted } = useQuery({
    queryKey: ['deletedProductsSummary'],
    queryFn: async () => {
      const res = await produitsService.listDeletedForCEO({ page: 1, limit: 1 });
      const anyRes: any = res as any;
      return anyRes?.meta?.total ?? 0;
    },
  });

  const { lowStockCount, outOfStockCount } = useMemo(() => {
    const list = (produits ?? []) as any[];
    let low = 0;
    let out = 0;
    for (const p of list) {
      if (p.stock === 0) out += 1;
      else if (p.stock > 0 && p.stock <= 5) low += 1;
    }
    return { lowStockCount: low, outOfStockCount: out };
  }, [produits]);

  const hasStockAlerts = lowStockCount > 0 || outOfStockCount > 0;
  const deletedCount = deletedSummary ?? 0;

  if (isLoadingProduits && isLoadingDeleted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <ActivityIndicator size="small" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}> 
      <Text style={[styles.title, { color: theme.colors.text }]}>Alertes</Text>

      <View style={styles.row}>
        {/* Carte Stock */}
        <TouchableOpacity
          style={[styles.card, { borderColor: theme.colors.border }]}
          activeOpacity={0.85}
          onPress={() => router.push('/(ceo)/products')}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(239,68,68,0.08)' }]}> 
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Stock à surveiller</Text>
            <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}
              numberOfLines={2}
            >
              {hasStockAlerts
                ? `${outOfStockCount} épuisé(s) • ${lowStockCount} en stock faible`
                : 'Aucune alerte de stock pour le moment'}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Carte Corbeille */}
        <TouchableOpacity
          style={[styles.card, { borderColor: theme.colors.border }]}
          activeOpacity={0.85}
          onPress={() => router.push('/outil-avances' as any)}
        >
          <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255,159,10,0.12)' : 'rgba(255,159,10,0.08)' }]}> 
            <Ionicons name="trash-outline" size={20} color="#FF9F0A" />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Produits en corbeille</Text>
            <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}
              numberOfLines={2}
            >
              {deletedCount > 0
                ? `${deletedCount} produit${deletedCount > 1 ? 's' : ''} seront purgés après 30 jours`
                : 'Aucun produit en corbeille actuellement'}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AlertsSection;

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 11,
  },
});
