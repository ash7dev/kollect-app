import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  index: number;
  chartData: number[];
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend,
  iconName,
  color,
  index,
  chartData,
}) => {
  const isPositive = trend === 'up';
  const chartWidth = width - 100;
  const chartHeight = 60;
  const maxValue = Math.max(...chartData);

  // Generate mini chart path
  const generateMiniPath = () => {
    const points = chartData.map((val, idx) => {
      const x = (idx / (chartData.length - 1)) * chartWidth;
      const y = chartHeight - (val / maxValue) * (chartHeight - 10);
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      
      path += ` Q ${controlX} ${current.y}, ${controlX} ${(current.y + next.y) / 2}`;
      path += ` Q ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }
    
    return path;
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.85, translateY: 50 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{
        type: 'spring',
        damping: 18,
        stiffness: 100,
        delay: index * 120,
      }}
      style={styles.cardWrapper}
    >
      {/* Animated gradient background */}
      <MotiView
        from={{ opacity: 0.2 }}
        animate={{ opacity: 0.5 }}
        transition={{
          type: 'timing',
          duration: 2500,
          loop: true,
          repeatReverse: true,
        }}
        style={[styles.gradientBg, { backgroundColor: `${color}15` }]}
      />

      {/* Floating particles effect */}
      <MotiView
        from={{ translateY: 0, opacity: 0.6 }}
        animate={{ translateY: -20, opacity: 0 }}
        transition={{
          type: 'timing',
          duration: 3000,
          loop: true,
          delay: index * 300,
        }}
        style={[styles.particle, { backgroundColor: color, top: 60, left: 30 }]}
      />

      <MotiView
        from={{ translateY: 0, opacity: 0.6 }}
        animate={{ translateY: -25, opacity: 0 }}
        transition={{
          type: 'timing',
          duration: 3500,
          loop: true,
          delay: index * 300 + 500,
        }}
        style={[styles.particle, { backgroundColor: color, top: 70, right: 40 }]}
      />

      <View style={styles.glassCard}>
        {/* Header with icon animation */}
        <MotiView
          from={{ translateX: -20, opacity: 0 }}
          animate={{ translateX: 0, opacity: 1 }}
          transition={{
            type: 'spring',
            delay: index * 120 + 200,
            damping: 15,
          }}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <MotiView
              from={{ scale: 0, rotate: '-180deg' }}
              animate={{ scale: 1, rotate: '0deg' }}
              transition={{
                type: 'spring',
                delay: index * 120 + 300,
                damping: 10,
              }}
              style={[styles.iconContainer, { backgroundColor: `${color}20` }]}
            >
              <Ionicons name={iconName} size={22} color={color} />
            </MotiView>
          </View>
        </MotiView>

        {/* Value with count-up effect */}
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            delay: index * 120 + 400,
            damping: 12,
          }}
        >
          <Text style={styles.value}>{value}</Text>
        </MotiView>

        {/* Change badge */}
        <MotiView
          from={{ translateX: -30, opacity: 0 }}
          animate={{ translateX: 0, opacity: 1 }}
          transition={{
            type: 'spring',
            delay: index * 120 + 500,
            damping: 15,
          }}
        >
          <View style={styles.changeContainer}>
            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor: isPositive ? '#10b98115' : '#ef444415',
                },
              ]}
            >
              <Ionicons
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={14}
                color={isPositive ? '#10B981' : '#EF4444'}
              />
              <Text
                style={[
                  styles.change,
                  { color: isPositive ? '#10B981' : '#EF4444' },
                ]}
              >
                {change}
              </Text>
            </View>
            <MotiView
              from={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 1.3, opacity: 1 }}
              transition={{
                type: 'timing',
                duration: 1500,
                loop: true,
                repeatReverse: true,
              }}
              style={[
                styles.pulseDot,
                { backgroundColor: isPositive ? '#10B981' : '#EF4444' },
              ]}
            />
          </View>
        </MotiView>

        {/* Mini chart */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            delay: index * 120 + 600,
            duration: 800,
          }}
          style={styles.chartContainer}
        >
          <Svg width={chartWidth} height={chartHeight}>
            <Defs>
              <LinearGradient
                id={`gradient-${index}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <Stop offset="0%" stopColor={color} stopOpacity="0.4" />
                <Stop offset="100%" stopColor={color} stopOpacity="0.05" />
              </LinearGradient>
            </Defs>

            {/* Gradient fill */}
            <Path
              d={`${generateMiniPath()} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
              fill={`url(#gradient-${index})`}
            />

            {/* Line */}
            <Path
              d={generateMiniPath()}
              stroke={color}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
            />

            {/* Points */}
            {chartData.map((val, idx) => {
              const x = (idx / (chartData.length - 1)) * chartWidth;
              const y = chartHeight - (val / maxValue) * (chartHeight - 10);
              return (
                <Circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#fff"
                  stroke={color}
                  strokeWidth="2"
                />
              );
            })}
          </Svg>
        </MotiView>

        {/* Bottom indicator */}
        <MotiView
          from={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            type: 'spring',
            delay: index * 120 + 800,
            damping: 20,
          }}
          style={[styles.bottomIndicator, { backgroundColor: color }]}
        />
      </View>
    </MotiView>
  );
};

export const AnimatedStatCards: React.FC = () => {
  const statsData = [
    {
      title: 'Revenus totaux',
      value: '2.4M FCFA',
      change: '+12.5%',
      trend: 'up' as const,
      iconName: 'cash-outline' as keyof typeof Ionicons.glyphMap,
      color: '#6366f1',
      chartData: [30, 45, 35, 60, 55, 75, 70],
    },
    {
      title: 'Commandes',
      value: '1,248',
      change: '+8.2%',
      trend: 'up' as const,
      iconName: 'cart-outline' as keyof typeof Ionicons.glyphMap,
      color: '#8b5cf6',
      chartData: [40, 35, 50, 45, 60, 65, 55],
    },
    {
      title: 'Clients actifs',
      value: '892',
      change: '+15.3%',
      trend: 'up' as const,
      iconName: 'people-outline' as keyof typeof Ionicons.glyphMap,
      color: '#ec4899',
      chartData: [25, 40, 30, 55, 50, 70, 65],
    },
    {
      title: 'Taux conversion',
      value: '3.2%',
      change: '-2.1%',
      trend: 'down' as const,
      iconName: 'trending-up-outline' as keyof typeof Ionicons.glyphMap,
      color: '#14b8a6',
      chartData: [60, 55, 50, 45, 40, 35, 30],
    },
    {
      title: 'Panier moyen',
      value: '45K FCFA',
      change: '+5.7%',
      trend: 'up' as const,
      iconName: 'wallet-outline' as keyof typeof Ionicons.glyphMap,
      color: '#f59e0b',
      chartData: [35, 40, 45, 50, 55, 60, 58],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Animated background */}
      <MotiView
        from={{ opacity: 0.4 }}
        animate={{ opacity: 0.7 }}
        transition={{
          type: 'timing',
          duration: 3000,
          loop: true,
          repeatReverse: true,
        }}
        style={styles.backgroundGradient}
      />

      {/* Floating orbs */}
      <MotiView
        from={{ translateX: -40, translateY: -40, scale: 1 }}
        animate={{ translateX: 40, translateY: 40, scale: 1.2 }}
        transition={{
          type: 'timing',
          duration: 7000,
          loop: true,
          repeatReverse: true,
        }}
        style={[styles.floatingOrb, { backgroundColor: '#6366f140', top: 60, left: 20 }]}
      />

      <MotiView
        from={{ translateX: 40, translateY: 40, scale: 1.2 }}
        animate={{ translateX: -40, translateY: -40, scale: 1 }}
        transition={{
          type: 'timing',
          duration: 9000,
          loop: true,
          repeatReverse: true,
        }}
        style={[
          styles.floatingOrb,
          { backgroundColor: '#ec489940', bottom: 80, right: 30 },
        ]}
      />

      {/* Title */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', delay: 100 }}
        style={styles.titleContainer}
      >
        <Text style={styles.mainTitle}>Statistiques</Text>
        <Text style={styles.subtitle}>Aperçu en temps réel</Text>
      </MotiView>

      {/* Scrollable cards */}
      <View style={{ width: '100%' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
          snapToInterval={width * 0.9}
          snapToAlignment="start"
          style={{ width: '100%' }}
        >
        {statsData.map((stat, index) => (
          <StatCard key={stat.title} {...stat} index={index} />
        ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 20,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f1f5f9',
  },
  floatingOrb: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.4,
  },
  titleContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardWrapper: {
    width: width - 40,
    marginRight: 20,
    position: 'relative',
  },
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
  },
  glassCard: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
    letterSpacing: -1,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  change: {
    fontSize: 14,
    fontWeight: '700',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartContainer: {
    marginTop: 8,
  },
  bottomIndicator: {
    height: 4,
    borderRadius: 2,
    marginTop: 16,
  },
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
});