import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import { produitsService } from '../../src/features/produits/services/produits.service';

export default function OutilsAvancesScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const qc = useQueryClient();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['deletedProducts'],
    queryFn: () => produitsService.listDeletedForCEO({ page: 1, limit: 50 }).then((r) => r.data),
  });

  const { mutate: restoreProduct, isPending: isRestoring } = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        await produitsService.restore(id);
      }
    },
    onSuccess: async () => {
      setSelectedIds(new Set());
      await qc.invalidateQueries({ queryKey: ['deletedProducts'] });
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRestoreSelected = () => {
    if (selectedIds.size === 0 || isRestoring) return;
    restoreProduct(Array.from(selectedIds));
  };

  const deletedProducts = data ?? [];
  const hasSelection = selectedIds.size > 0;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#F8F9FA' }]}>
        <View style={styles.center}>
          <View style={[styles.loaderContainer, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Chargement des produits supprimés...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#F8F9FA' }]}> 
      {/* Header avec gradient subtil */}
      <View style={[styles.header, { backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF' }]}> 
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <View style={[styles.backButtonCircle, { 
            backgroundColor: isDark ? 'rgba(255, 59, 48, 0.12)' : 'rgba(255, 59, 48, 0.08)',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 59, 48, 0.15)',
          }]}> 
            <Ionicons name="arrow-back" size={22} color="#FF3B30" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            OUTILS AVANCÉS
          </Text>
          {deletedProducts.length > 0 && (
            <View style={[styles.badge, { backgroundColor: isDark ? '#1F1F1F' : '#F3F4F6' }]}>
              <Text style={[styles.badgeText, { color: theme.colors.accent }]}>
                {deletedProducts.length}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.headerRight}>
          {deletedProducts.length > 0 && selectedIds.size > 0 && (
            <View style={[styles.selectedBadge, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}>
              <Text style={[styles.selectedBadgeText, { color: '#FF3B30' }]}>
                {selectedIds.size}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Info bar améliorée */}
      <View style={[styles.infoBar, { 
        backgroundColor: isDark ? 'rgba(255, 152, 0, 0.08)' : 'rgba(255, 152, 0, 0.06)',
        borderLeftWidth: 3,
        borderLeftColor: '#FF9500',
      }]}>
        <View style={[styles.infoIconContainer, { backgroundColor: isDark ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.12)' }]}>
          <Ionicons name="time-outline" size={16} color="#FF9500" />
        </View>
        <Text style={[styles.infoText, { color: isDark ? '#E5E5E5' : '#1F2937' }]}>
          Les produits supprimés sont définitivement effacés au bout de <Text style={{ fontWeight: '700' }}>30 jours</Text>.
        </Text>
      </View>

      {/* Liste */}
      {deletedProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { 
            backgroundColor: isDark ? 'rgba(52, 199, 89, 0.1)' : 'rgba(52, 199, 89, 0.08)',
          }]}>
            <Ionicons name="checkmark-circle" size={64} color="#34C759" />
          </View>
          <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Tout est propre !
          </Text>
          <Text style={[styles.emptySubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Aucun produit supprimé dans la corbeille.
          </Text>
        </View>
      ) : (
        <FlatList
          data={deletedProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor={theme.colors.accent}
            />
          }
          renderItem={({ item }) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <TouchableOpacity
                onPress={() => toggleSelect(item.id)}
                activeOpacity={0.7}
                style={[
                  styles.item,
                  {
                    backgroundColor: isSelected
                      ? (isDark ? 'rgba(255, 59, 48, 0.12)' : 'rgba(255, 59, 48, 0.05)')
                      : (isDark ? '#151515' : '#FFFFFF'),
                    borderColor: isSelected
                      ? '#FF3B30'
                      : (isDark ? '#252525' : '#E5E7EB'),
                    shadowColor: isSelected ? '#FF3B30' : '#000',
                    shadowOpacity: isSelected ? 0.15 : (isDark ? 0 : 0.05),
                    shadowRadius: isSelected ? 8 : 4,
                    shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
                    elevation: isSelected ? 6 : 2,
                  },
                ]}
              >
                <View style={styles.itemLeft}>
                  <View style={[
                    styles.itemAvatar, 
                    { 
                      backgroundColor: isSelected 
                        ? (isDark ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 59, 48, 0.12)')
                        : (isDark ? '#1F1F1F' : '#F9FAFB'),
                      borderWidth: 2,
                      borderColor: isSelected ? '#FF3B30' : 'transparent',
                    }
                  ]}> 
                    <Ionicons 
                      name={isSelected ? 'checkmark-circle' : 'cube-outline'} 
                      size={24} 
                      color={isSelected ? '#FF3B30' : (isDark ? '#9CA3AF' : '#6B7280')} 
                    />
                  </View>
                  <View style={styles.itemTextContainer}>
                    <Text
                      style={[styles.itemTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <View style={styles.itemMetaRow}>
                      <View style={[styles.collectionTag, { 
                        backgroundColor: isDark ? '#1F1F1F' : '#F3F4F6',
                      }]}>
                        <Ionicons name="folder-outline" size={12} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        <Text
                          style={[styles.itemSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
                          numberOfLines={1}
                        >
                          {item.collection?.name || 'Sans collection'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  <View style={[styles.stockBadge, { 
                    backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.1)',
                  }]}>
                    <Ionicons name="cube" size={14} color="#FF3B30" />
                    <Text style={[styles.itemPrice, { color: '#FF3B30' }]}>
                      {item.stock}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Footer action amélioré */}
      {deletedProducts.length > 0 && (
        <View
          style={[styles.footer, {
            backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderTopWidth: 1,
            borderTopColor: isDark ? '#252525' : '#E5E7EB',
          }]}
        >
          <TouchableOpacity
            style={[
              styles.restoreButton,
              {
                backgroundColor: hasSelection ? '#FF3B30' : (isDark ? '#1F1F1F' : '#F3F4F6'),
                shadowColor: hasSelection ? '#FF3B30' : 'transparent',
                shadowOpacity: hasSelection ? 0.3 : 0,
                shadowRadius: hasSelection ? 12 : 0,
                shadowOffset: { width: 0, height: 4 },
                elevation: hasSelection ? 8 : 0,
                transform: [{ scale: hasSelection ? 1 : 0.98 }],
              },
            ]}
            onPress={handleRestoreSelected}
            disabled={!hasSelection || isRestoring}
            activeOpacity={0.85}
          >
            {isRestoring ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <View style={[styles.buttonIconContainer, {
                  backgroundColor: hasSelection ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                }]}>
                  <Ionicons
                    name="refresh-circle"
                    size={22}
                    color={hasSelection ? '#FFFFFF' : (isDark ? '#6B7280' : '#9CA3AF')}
                  />
                </View>
                <Text
                  style={[
                    styles.restoreButtonText,
                    { color: hasSelection ? '#FFFFFF' : (isDark ? '#6B7280' : '#9CA3AF') },
                  ]}
                >
                  {hasSelection 
                    ? `Restaurer ${selectedIds.size} produit${selectedIds.size > 1 ? 's' : ''}` 
                    : 'Sélectionne des produits'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loaderContainer: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  backButton: {
    padding: 0,
  },
  backButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerRight: {
    minWidth: 48,
    alignItems: 'flex-end',
  },
  selectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemTextContainer: {
    flex: 1,
    gap: 6,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemRight: {
    marginLeft: 12,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  buttonIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});