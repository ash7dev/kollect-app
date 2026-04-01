import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
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

export function ClientHomeLoading() {
  const { theme, isDark } = useTheme();
  const [showSkeleton, setShowSkeleton] = useState(false);

  const spinnerOpacity = useRef(new Animated.Value(1)).current;
  const skeletonOpacity = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  // Rotation continue du logo
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  // Transition spinner → skeleton
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

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>

      {/* Phase 1 — Logo spinner */}
      {!showSkeleton && (
        <Animated.View style={[styles.spinnerLayer, { opacity: spinnerOpacity }]} pointerEvents="none">
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Logo size={52} />
          </Animated.View>
        </Animated.View>
      )}

      {/* Phase 2 — Skeleton */}
      <Animated.View style={[styles.skeletonLayer, { opacity: skeletonOpacity }]}>

        {/* Header */}
        <View style={[
          styles.header,
          {
            backgroundColor: theme.colors.card,
            borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          },
        ]}>
          <View style={styles.headerRow}>
            <SkeletonBox w={100} h={26} radius={8} />
            <View style={styles.headerIcons}>
              <SkeletonBox w={38} h={38} radius={19} />
              <SkeletonBox w={38} h={38} radius={19} />
            </View>
          </View>
        </View>

        {/* Stories */}
        <View style={styles.storiesRow}>
          {[...Array(5)].map((_, i) => (
            <View key={i} style={styles.storyItem}>
              <SkeletonBox w={62} h={62} radius={31} />
              <SkeletonBox w={44} h={10} radius={5} style={{ marginTop: 7 }} />
            </View>
          ))}
        </View>

        {/* Brand chips */}
        <View style={styles.chipsRow}>
          {[88, 70, 100, 76, 84].map((cw, i) => (
            <SkeletonBox key={i} w={cw} h={32} radius={16} style={{ marginRight: 10 }} />
          ))}
        </View>

        {/* Big featured card */}
        <SkeletonBox w={width - 32} h={210} radius={20} style={styles.bigCard} />

        {/* Section label */}
        <SkeletonBox w={130} h={16} radius={6} style={styles.sectionLabel} />

        {/* Product cards row */}
        <View style={styles.cardsRow}>
          {[...Array(3)].map((_, i) => {
            const cardW = (width - 56) / 2.3;
            return (
              <View key={i} style={styles.card}>
                <SkeletonBox w={cardW} h={160} radius={16} />
                <SkeletonBox w={cardW * 0.7} h={12} radius={5} style={{ marginTop: 10 }} />
                <SkeletonBox w={cardW * 0.45} h={10} radius={5} style={{ marginTop: 6 }} />
              </View>
            );
          })}
        </View>
      </Animated.View>
    </View>
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
  skeletonLayer: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcons: { flexDirection: 'row', gap: 10 },
  storiesRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    gap: 16,
  },
  storyItem: { alignItems: 'center' },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bigCard: { marginHorizontal: 16, marginBottom: 24 },
  sectionLabel: { marginHorizontal: 16, marginBottom: 16 },
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  card: { alignItems: 'flex-start' },
});
