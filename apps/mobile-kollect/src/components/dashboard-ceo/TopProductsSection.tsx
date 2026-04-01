import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../app/context/ThemeContext';
import { ProduitDto } from '@/features/produits/services/produits.service';

interface TopProductsSectionProps {
  products?: ProduitDto[];
  isLoading: boolean;
}

const MEDALS = [
  { color: '#F59E0B', bg: '#FEF3C7', label: '🥇' },
  { color: '#9CA3AF', bg: '#F3F4F6', label: '🥈' },
  { color: '#B45309', bg: '#FEF3C7', label: '🥉' },
];


function SkeletonRow({ theme }: { theme: any }) {
  return (
    <View style={[styles.skeletonRow, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.skeletonCircle, { backgroundColor: theme.colors.border }]} />
      <View style={[styles.skeletonThumb, { backgroundColor: theme.colors.border }]} />
      <View style={styles.skeletonLines}>
        <View style={[styles.skeletonLine, { backgroundColor: theme.colors.border, width: '60%' }]} />
        <View style={[styles.skeletonLine, { backgroundColor: theme.colors.border, width: '35%', marginTop: 6 }]} />
      </View>
    </View>
  );
}

export const TopProductsSection: React.FC<TopProductsSectionProps> = ({ products, isLoading }) => {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrapper}>
            <Ionicons name="trending-up" size={16} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Top Produits</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Les plus consultés</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.viewAllButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.push('/(ceo)/products')}
          activeOpacity={0.7}
        >
          <Text style={[styles.viewAll, { color: theme.colors.primary }]}>Voir tout</Text>
          <Ionicons name="chevron-forward" size={13} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.listContainer}>
          {[0, 1, 2].map((i) => <SkeletonRow key={i} theme={theme} />)}
        </View>
      ) : products && products.length > 0 ? (
        <View style={styles.listContainer}>
          {(() => {
            const list = products.slice(0, 5);
            const maxViews = Math.max(...list.map(p => p.viewCount ?? 0), 1);
            return list.map((p, index) => {
            const medal = MEDALS[index];
            const barRatio = (p.viewCount ?? 0) / maxViews;
            const isTop3 = index < 3;

            return (
              <MotiView
                key={p.id}
                from={{ opacity: 0, translateX: -16 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 350, delay: index * 70 }}
              >
                <TouchableOpacity
                  style={[
                    styles.productItem,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: isTop3 ? medal.color + '33' : theme.colors.border,
                    },
                  ]}
                  onPress={() => router.push(`/product/${p.id}`)}
                  activeOpacity={0.72}
                >
                  {/* Left accent */}
                  {isTop3 && (
                    <View style={[styles.leftAccent, { backgroundColor: medal.color }]} />
                  )}

                  {/* Rank */}
                  <View
                    style={[
                      styles.rankBadge,
                      {
                        backgroundColor: isTop3 ? medal.bg : theme.colors.card,
                        borderColor: isTop3 ? medal.color + '55' : theme.colors.border,
                      },
                    ]}
                  >
                    {isTop3 ? (
                      <Text style={styles.medalEmoji}>{medal.label}</Text>
                    ) : (
                      <Text style={[styles.rankText, { color: theme.colors.textSecondary }]}>
                        {index + 1}
                      </Text>
                    )}
                  </View>

                  {/* Image */}
                  {p.images?.[0] ? (
                    <Image source={{ uri: p.images[0] }} style={styles.productImage} />
                  ) : (
                    <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.card }]}>
                      <Ionicons name="cube-outline" size={20} color={theme.colors.textSecondary} />
                    </View>
                  )}

                  {/* Info */}
                  <View style={styles.productInfo}>
                    <Text
                      style={[styles.productName, { color: theme.colors.text }]}
                      numberOfLines={1}
                    >
                      {p.name}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={[styles.productPrice, { color: theme.colors.textSecondary }]}>
                        {p.price.toLocaleString()} FCFA
                      </Text>
                      <View style={styles.viewsTag}>
                        <Ionicons name="eye-outline" size={11} color={theme.colors.textSecondary} />
                        <Text style={[styles.viewsText, { color: theme.colors.textSecondary }]}>
                          {(p.viewCount ?? 0).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    {/* Popularity bar — basée sur le vrai viewCount */}
                    <View style={[styles.popularityTrack, { backgroundColor: theme.colors.border }]}>
                      <MotiView
                        from={{ width: '0%' }}
                        animate={{ width: `${barRatio * 100}%` }}
                        transition={{ type: 'timing', duration: 600, delay: 200 + index * 70 }}
                        style={[
                          styles.popularityFill,
                          { backgroundColor: isTop3 ? medal.color : theme.colors.primary + '99' },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Fire icon */}
                  <Ionicons
                    name="flame"
                    size={16}
                    color={index === 0 ? '#FF9F0A' : theme.colors.textSecondary + '66'}
                  />
                </TouchableOpacity>
              </MotiView>
            );
          });
          })()}
        </View>
      ) : (
        <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
          <Ionicons name="stats-chart-outline" size={32} color={theme.colors.textSecondary} style={{ opacity: 0.4 }} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Aucune donnée de consultation pour le moment
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  viewAll: {
    fontWeight: '600',
    fontSize: 12,
  },
  listContainer: {
    gap: 8,
    marginTop: 12,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    overflow: 'hidden',
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  medalEmoji: {
    fontSize: 16,
    lineHeight: 20,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '700',
  },
  productImage: {
    width: 46,
    height: 46,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    gap: 3,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewsText: {
    fontSize: 11,
    fontWeight: '500',
  },
  popularityTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  popularityFill: {
    height: '100%',
    borderRadius: 2,
  },
  // Skeleton
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    gap: 10,
  },
  skeletonCircle: {
    width: 30,
    height: 30,
    borderRadius: 10,
  },
  skeletonThumb: {
    width: 46,
    height: 46,
    borderRadius: 10,
  },
  skeletonLines: {
    flex: 1,
  },
  skeletonLine: {
    height: 10,
    borderRadius: 5,
  },
  // Empty
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
