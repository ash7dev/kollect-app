/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MotiView } from 'moti';
import Svg, { Path, Line, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useBrandId, useBrandStore } from '../../features/brands/store/brandStore';
import { useBrandStats, useSalesData } from '../../features/brands/hooks/useBrandQueries';
import { useTheme } from '../../../app/context/ThemeContext';

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 32;
const Y_AXIS_OFFSET = 35;
const CHART_WIDTH = Math.max(200, width - HORIZONTAL_PADDING - Y_AXIS_OFFSET);
const CHART_HEIGHT = 180;

// Composant pour les cartes de statistiques
const StatCard = ({ 
  title, 
  value, 
  change, 
  icon 
}: { 
  title: string; 
  value: string; 
  change: string; 
  icon: any;
}) => {
  const { theme } = useTheme();
  const isPositive = change.startsWith('+');
  
  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
      <View style={[styles.statIconContainer, { backgroundColor: `${theme.colors.accent}1A` }]}>
        <Ionicons name={icon} size={20} color={theme.colors.accent} />
      </View>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
      <Text style={[
        styles.statChange,
        { color: isPositive ? theme.colors.success : theme.colors.error }
      ]}>
        {change}
      </Text>
    </View>
  );
};

// 🆕 Composant Empty State
const EmptyState = () => {
  const { theme } = useTheme();
  
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 400 }}
      style={[styles.container, { backgroundColor: theme.colors.card }]}
    >
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconContainer, { backgroundColor: `${theme.colors.accent}1A` }]}>
          <Ionicons name="rocket-outline" size={64} color={theme.colors.accent} />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          Lancez votre première Drop ! 🚀
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
          Créez votre première collection et commencez à vendre
        </Text>
        
        <TouchableOpacity style={[styles.emptyButton, { backgroundColor: theme.colors.accent }]}>
          <Ionicons name="add-circle" size={20} color="#FFF" />
          <Text style={styles.emptyButtonText}>Créer une Drop</Text>
        </TouchableOpacity>

        <View style={styles.emptyStats}>
          <View style={styles.emptyStatItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={[styles.emptyStatText, { color: theme.colors.textSecondary }]}>
              Configuration rapide
            </Text>
          </View>
          <View style={styles.emptyStatItem}>
            <Ionicons name="trending-up" size={20} color={theme.colors.success} />
            <Text style={[styles.emptyStatText, { color: theme.colors.textSecondary }]}>
              Vendez en 24h
            </Text>
          </View>
        </View>
      </View>
    </MotiView>
  );
};

type ModernSalesChartProps = {
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
};

export const ModernSalesChart = ({ refreshing=false, onRefresh }: ModernSalesChartProps) => {
  const { theme, isDark } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '90days'>('7days');
  
  // Récupérer la marque complète et son état de chargement
  const { myBrand, isLoading: isLoadingBrand } = useBrandStore();
  const brandId = myBrand?.id || '';
  console.log('Brand ID:', brandId);
  console.log('Brand Data:', myBrand);
  console.log('Is Loading Brand:', isLoadingBrand);

  // 🔥 Charger les stats et les données de ventes
  const { data: stats, isLoading: loadingStats, error: statsError } = useBrandStats(
    brandId || '',
    selectedPeriod,
  );
  const {
    data: salesData,
    isLoading: loadingSales,
    error: salesError,
    refetch: refetchSales,
  } = useSalesData(brandId || '', selectedPeriod);

  useEffect(() => {
    if (!refreshing) return;

    const runRefresh = async () => {
      try {
        // Laisser le parent rafraîchir la marque / stats
        if (onRefresh) {
          await onRefresh();
        }
        // Et ici on force le refetch des données de ventes
        await refetchSales();
      } catch (e) {
        console.error(e);
      }
    };

    void runRefresh();
  }, [refreshing, onRefresh, refetchSales]);
  console.log('Stats:', stats);
  console.log('Sales Data:', salesData);
  console.log('Loading Stats:', loadingStats);
  console.log('Loading Sales:', loadingSales);
  console.log('Stats Error:', statsError);
  console.log('Sales Error:', salesError);

  // Formater les montants
  const formatValue = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val);
  };

  // Formater les valeurs abrégées (K pour milliers)
  const formatAbbreviated = (val: number): string => {
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return String(val);
  };

  const hasCollections =
    (myBrand?._count?.collections ?? 0) > 0 ||
    (stats?.totalCollections ?? 0) > 0;

  if (!brandId && isLoadingBrand) {
    return (
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 200 }}
        style={[styles.container, { backgroundColor: theme.colors.card }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Chargement des données...
          </Text>
        </View>
      </MotiView>
    );
  }

  if (!brandId && !isLoadingBrand) {
    return <EmptyState />;
  }

  // ❌ Afficher un message d'erreur
  if (statsError || salesError) {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 400 }}
        style={[styles.container, { backgroundColor: theme.colors.card }]}
      >
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Impossible de charger les données
          </Text>
          <Text style={[styles.errorSubtext, { color: theme.colors.textSecondary }]}>
            {statsError?.message || salesError?.message || 'Une erreur est survenue'}
          </Text>
        </View>
      </MotiView>
    );
  }

  console.log('💡 Debug ModernSalesChart:', {
    hasStats: !!stats,
    hasSalesData: !!salesData,
    salesDataLength: salesData?.length,
    salesDataSample: salesData?.slice(0, 2) // Afficher les 2 premières entrées pour inspection
  });

  // Afficher EmptyState seulement si la marque n'a aucune collection
  if (!hasCollections && !loadingStats && !loadingSales) {
    return <EmptyState />;
  }

  if (!stats || !salesData) {
    return (
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 200 }}
        style={[styles.container, { backgroundColor: theme.colors.card }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Chargement des statistiques...
          </Text>
        </View>
      </MotiView>
    );
  }

  // 🔥 Préparer les données des cartes avec les vraies stats
  const statsCards = {
    orders: {
      value: formatAbbreviated(stats.ordersThisPeriod || 0),
      change: `${stats.ordersChange > 0 ? '+' : ''}${stats.ordersChange || 0}%`,
      icon: 'cart-outline' as const
    },
    followers: {
      value: formatAbbreviated(stats.totalFollowers),
      change: `${stats.followersChange > 0 ? '+' : ''}${stats.followersChange || 0}%`,
      icon: 'people-outline' as const
    },
    conversion: {
      value: `${stats.conversionRate}%`,
      change: '—',
      icon: 'trending-up-outline' as const
    }
  };

  // 🔥 Utiliser les vraies données de ventes
  const data = salesData || [];
  const values = data.map(d => d.value);
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const range = Math.max(1, maxValue - minValue);

  // Courbe fluide
  const createSmoothPath = () => {
    if (!data || data.length === 0) return '';
    
    const points = data.map((item: { value: number; }, i: number) => ({
      x: (i / Math.max(1, data.length - 1)) * CHART_WIDTH,
      y: CHART_HEIGHT - ((item.value - minValue) / Math.max(1, range)) * (CHART_HEIGHT - 30),
    }));

    // Si toutes les valeurs sont à 0, on dessine une ligne droite en bas
    if (maxValue === 0) {
      return `M 0 ${CHART_HEIGHT} L ${CHART_WIDTH} ${CHART_HEIGHT}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cx = (curr.x + next.x) / 2;
      path += ` Q ${cx} ${curr.y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const path = createSmoothPath();

  // Axe Y gradué (4 niveaux)
  const yLabels = Array.from({ length: 4 }, (_, i) => {
    // Si maxValue est 0, on affiche des valeurs fixes pour l'échelle
    const val = maxValue > 0 
      ? maxValue - (range / 3) * i 
      : 3 - i; // Affiche 3, 2, 1, 0 si toutes les valeurs sont à 0
    const y = ((val - minValue) / Math.max(1, range)) * (CHART_HEIGHT - 30);
    return { 
      val: Math.round(val * 100) / 100, // Arrondir à 2 décimales
      y: CHART_HEIGHT - y 
    };
  });

  // Total et tendance
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const variation = stats.ordersChange;

  // Couleur de la ligne de grille selon le thème
  const gridLineColor = isDark ? theme.colors.border : '#E5E7EB';

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 400 }}
      style={[styles.container, { backgroundColor: theme.colors.card }]}
    >
      {/* En-tête avec titre et contrôles */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Ventes</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Performances des ventes
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Sélecteur période */}
          <View style={[
            styles.periodSelector,
            { backgroundColor: isDark ? theme.colors.surface : '#f3f4f6' }
          ]}>
            {[
              { key: '7days', label: '7J' },
              { key: '30days', label: '30J' },
              { key: '90days', label: '90J' },
            ].map(period => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && [
                    styles.periodButtonActive,
                    { backgroundColor: theme.colors.card }
                  ],
                ]}
                onPress={() => setSelectedPeriod(period.key as any)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    { color: theme.colors.textSecondary },
                    selectedPeriod === period.key && [
                      styles.periodButtonTextActive,
                      { color: theme.colors.accent }
                    ],
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bouton partage */}
          <TouchableOpacity style={[
            styles.shareButton,
            { backgroundColor: isDark ? theme.colors.surface : '#f3f4f6' }
          ]}>
            <Ionicons 
              name="share-social-outline" 
              size={18} 
              color={theme.colors.text} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Cartes de statistiques */}
      <View style={styles.statsContainer}>
        <StatCard 
          title="Commandes" 
          value={statsCards.orders.value} 
          change={statsCards.orders.change} 
          icon={statsCards.orders.icon} 
        />
        <StatCard 
          title="Abonnés" 
          value={statsCards.followers.value} 
          change={statsCards.followers.change} 
          icon={statsCards.followers.icon} 
        />
        <StatCard 
          title="Taux de conversion" 
          value={statsCards.conversion.value} 
          change={statsCards.conversion.change} 
          icon={statsCards.conversion.icon} 
        />
      </View>

      {/* Valeur principale */}
      <Text style={[styles.mainValue, { color: theme.colors.text }]}>
        {formatValue(total)} <Text style={[styles.currency, { color: theme.colors.accent }]}>FCFA</Text>
      </Text>

      {/* Tendance */}
      <View style={styles.trendContainer}>
        <View style={[
          styles.trendBadge,
          { backgroundColor: variation >= 0 
            ? `${theme.colors.success}1A` 
            : `${theme.colors.error}1A` 
          }
        ]}>
          <Ionicons 
            name={variation >= 0 ? "trending-up" : "trending-down"} 
            size={14} 
            color={variation >= 0 ? theme.colors.success : theme.colors.error} 
          />
          <Text style={[
            styles.trendText,
            { color: variation >= 0 ? theme.colors.success : theme.colors.error }
          ]}>
            {variation > 0 ? '+' : ''}{variation}%
          </Text>
        </View>
        <Text style={[styles.trendDescription, { color: theme.colors.textSecondary }]}>
          vs période précédente
        </Text>
      </View>

      {/* CHART */}
      <View style={styles.chartWrapper}>
        {/* Axe Y */}
        <View style={styles.yAxis}>
          {yLabels.map((label, i) => (
            <Text 
              key={i} 
              style={[
                styles.yAxisLabel, 
                { top: label.y - 8, color: theme.colors.textSecondary }
              ]}
            >
              {formatValue(label.val)}
            </Text>
          ))}
        </View>

        {/* SVG Graph */}
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={theme.colors.accent} stopOpacity="0.25" />
              <Stop offset="100%" stopColor={theme.colors.accent} stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {/* Lignes horizontales */}
          {yLabels.map((label, i) => (
            <Line
              key={i}
              x1="0"
              y1={label.y}
              x2={CHART_WIDTH}
              y2={label.y}
              stroke={gridLineColor}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          ))}

          {/* Zone sous la courbe */}
          {path && (
            <Path d={`${path} L ${CHART_WIDTH} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`} fill="url(#gradient)" />
          )}

          {/* Courbe principale */}
          {path && (
            <Path
              d={path}
              stroke={theme.colors.accent}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          )}

          {/* Points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * CHART_WIDTH;
            const y = CHART_HEIGHT - ((point.value - minValue) / range) * (CHART_HEIGHT - 30);
            return (
              <Circle 
                key={index} 
                cx={x} 
                cy={y} 
                r="4" 
                fill={theme.colors.accent} 
                stroke={theme.colors.card} 
                strokeWidth="2" 
              />
            );
          })}
        </Svg>

        {/* Labels X */}
        <View style={styles.xAxis}>
          {data.map((point: { label: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, i: React.Key | null | undefined) => (
            <Text key={i} style={[styles.xLabel, { color: theme.colors.textSecondary }]}>
              {point.label}
            </Text>
          ))}
        </View>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  // Styles pour les cartes de statistiques
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 0,
    flexWrap: 'nowrap',
    gap: 8,
    width: '100%',
  },
  statCard: {
    minWidth: 100,
    flex: 1,
    maxWidth: '32%',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
    textAlign: 'center',
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
    width: '100%',
  },
  statTitle: {
    fontSize: 11,
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
  },
  statChange: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  
  container: {
    borderRadius: 16,
    padding: 16,
    margin: 0,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: { 
    flex: 1,
    marginRight: 12,
  },
  headerTitle: { fontWeight: '600', fontSize: 14 },
  headerSubtitle: { fontSize: 11 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  periodSelector: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 3,
    gap: 3,
  },
  periodButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  periodButtonActive: { elevation: 2 },
  periodButtonText: { fontSize: 12, fontWeight: '500' },
  periodButtonTextActive: { fontWeight: '700' },

  shareButton: {
    padding: 6,
    borderRadius: 8,
  },

  mainValue: { fontSize: 36, fontWeight: '700', marginTop: 10 },
  currency: { fontSize: 18 },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  trendText: { fontWeight: '600', fontSize: 12 },
  trendDescription: { fontSize: 11 },

  chartWrapper: { 
    position: 'relative', 
    marginTop: 10, 
    marginLeft: Y_AXIS_OFFSET,
    width: CHART_WIDTH,
    maxWidth: '100%',
    alignSelf: 'center',
  },
  yAxis: { position: 'absolute', left: -Y_AXIS_OFFSET, top: 0 },
  yAxisLabel: { position: 'absolute', fontSize: 11 },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 4,
    width: CHART_WIDTH,
    maxWidth: '100%',
    alignSelf: 'center',
  },
  xLabel: { fontSize: 10 },

  // 🆕 Styles Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStats: {
    flexDirection: 'row',
    gap: 16,
  },
  emptyStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyStatText: {
    fontSize: 13,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
  },

  // Styles erreur
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  errorSubtext: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ModernSalesChart
