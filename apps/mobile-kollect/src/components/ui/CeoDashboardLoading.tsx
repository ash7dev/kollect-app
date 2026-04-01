import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { useTheme } from '../../../app/context/ThemeContext';
import { Logo } from './Logo';

const { width } = Dimensions.get('window');
const SPINNER_DURATION = 1200;

function SkeletonBox({
  w,
  h,
  radius = 8,
  style,
}: {
  w: number | string;
  h: number;
  radius?: number;
  style?: object;
}) {
  const { isDark } = useTheme();
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const bg = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';

  return (
    <Animated.View
      style={[
        { width: w as any, height: h, borderRadius: radius, backgroundColor: bg, opacity: pulse },
        style,
      ]}
    />
  );
}

export function CeoDashboardLoading() {
  const { theme, isDark } = useTheme();
  const [showSkeleton, setShowSkeleton] = useState(false);

  const spinnerOpacity = useRef(new Animated.Value(1)).current;
  const skeletonOpacity = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(spinnerOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(skeletonOpacity, { toValue: 1, duration: 350, delay: 150, useNativeDriver: true }),
      ]).start(() => setShowSkeleton(true));
    }, SPINNER_DURATION);
    return () => clearTimeout(timer);
  }, [spinnerOpacity, skeletonOpacity]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const cardBg = theme.colors.card;
  const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>

      {/* Phase 1 — Logo spinner */}
      {!showSkeleton && (
        <Animated.View style={[styles.spinnerLayer, { opacity: spinnerOpacity }]} pointerEvents="none">
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Logo size={52} />
          </Animated.View>
        </Animated.View>
      )}

      {/* Phase 2 — Skeleton */}
      <Animated.ScrollView
        style={{ opacity: skeletonOpacity }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Combined card : greeting + brand */}
        <View style={[styles.combinedCard, { backgroundColor: cardBg }, cardShadow]}>
          {/* Greeting row */}
          <View style={styles.greetingRow}>
            <View style={styles.greetingLeft}>
              <SkeletonBox w={32} h={32} radius={16} />
              <View style={{ gap: 7, flex: 1 }}>
                <SkeletonBox w="70%" h={16} radius={6} />
                <SkeletonBox w="50%" h={12} radius={5} />
              </View>
            </View>
            <SkeletonBox w={38} h={38} radius={19} />
          </View>

          {/* Brand row */}
          <View style={[styles.brandRow, {
            borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          }]}>
            <View style={styles.brandLeft}>
              <SkeletonBox w={50} h={50} radius={12} />
              <View style={{ gap: 7 }}>
                <SkeletonBox w={100} h={16} radius={6} />
                <SkeletonBox w={70} h={12} radius={5} />
              </View>
            </View>
            <SkeletonBox w={38} h={38} radius={10} />
          </View>
        </View>

        <View style={styles.content}>
          {/* Chart card */}
          <View style={[styles.card, { backgroundColor: cardBg }, cardShadow]}>
            <SkeletonBox w={120} h={16} radius={6} style={{ marginBottom: 20 }} />
            <SkeletonBox w="100%" h={160} radius={14} />
          </View>

          {/* Quick actions card */}
          <View style={[styles.card, { backgroundColor: cardBg }, cardShadow]}>
            <SkeletonBox w={130} h={16} radius={6} style={{ marginBottom: 16 }} />
            {/* 2 stat tiles */}
            <View style={styles.tilesRow}>
              <SkeletonBox w={(width - 80) / 2} h={80} radius={12} />
              <SkeletonBox w={(width - 80) / 2} h={80} radius={12} />
            </View>
            {/* Action buttons */}
            <SkeletonBox w="100%" h={48} radius={12} style={{ marginTop: 12 }} />
            <SkeletonBox w="100%" h={48} radius={12} style={{ marginTop: 10 }} />
          </View>

          {/* Orders card */}
          <View style={[styles.card, { backgroundColor: cardBg }, cardShadow]}>
            <SkeletonBox w={150} h={16} radius={6} style={{ marginBottom: 16 }} />
            {[...Array(3)].map((_, i) => (
              <View key={i} style={[styles.orderRow, {
                borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                borderBottomWidth: i < 2 ? 1 : 0,
              }]}>
                <View style={{ gap: 7, flex: 1 }}>
                  <SkeletonBox w="55%" h={13} radius={5} />
                  <SkeletonBox w="35%" h={11} radius={5} />
                </View>
                <View style={{ alignItems: 'flex-end', gap: 7 }}>
                  <SkeletonBox w={60} h={13} radius={5} />
                  <SkeletonBox w={72} h={22} radius={8} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  spinnerLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  combinedCard: {
    borderRadius: 16,
    margin: 16,
    marginBottom: 0,
    overflow: 'hidden',
  },
  greetingRow: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  brandRow: {
    padding: 16,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
});
