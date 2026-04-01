import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../../app/context/ThemeContext';

const { width } = Dimensions.get('window');

interface JustLaunchedDropProps {
  collection: {
    id: string;
    name: string;
    description?: string | null;
    coverImage?: string | null;
    teaserVideo?: string | null;
    launchedAt?: string | Date | null;
    brand?: {
      id: string;
      name: string;
      logo?: string | null;
    } | null;
    _count?: { products?: number };
  };
  onPress?: (id: string) => void;
}

function getTimeAgo(input?: string | Date | null): string | null {
  if (!input) return null;
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return 'quelques instants';
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return 'à l\'instant';
  if (mins < 60) return `${mins} min`;
  if (hours < 24) return `${hours} h`;
  if (days < 7) return `${days} j`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} sem`;
  return `${Math.floor(days / 30)} mois`;
}

// Dot pulsant pour le badge live
function PulseDot({ color }: { color: string }) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);
  return (
    <View style={{ width: 8, height: 8, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
          opacity: anim,
          transform: [{ scale: anim }],
        }}
      />
      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color }} />
    </View>
  );
}

export default function JustLaunchedDrop({ collection, onPress }: JustLaunchedDropProps) {
  const { theme, isDark } = useTheme();

  const productCount =
    (collection as any).visibleProductCount ?? collection._count?.products ?? 0;
  const launchedLabel = getTimeAgo(collection.launchedAt);
  const accent = theme.colors.accent; // #FF3B30

  const handlePress = () => onPress?.(collection.id);

  return (
    <TouchableOpacity
      activeOpacity={0.93}
      onPress={handlePress}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
          shadowColor: isDark ? accent : '#000',
        },
      ]}
    >
      {/* ── MEDIA ── */}
      <View style={styles.mediaWrap}>
        {collection.teaserVideo ? (
          <Video
            source={{ uri: collection.teaserVideo }}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted
            volume={0}
          />
        ) : collection.coverImage ? (
          <Image
            source={{ uri: collection.coverImage }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.noMedia]}>
            <Ionicons name="image-outline" size={36} color="rgba(255,255,255,0.3)" />
          </View>
        )}

        {/* Gradient overlay — du bas vers le haut */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.72)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* ── TOP ROW : badge DROP + timer ── */}
        <View style={styles.topRow}>
          {/* Badge DROP */}
          <BlurView
            intensity={isDark ? 50 : 70}
            tint="dark"
            style={styles.dropBadge}
          >
            <PulseDot color={accent} />
            <Text style={styles.dropBadgeText}>NEW DROP</Text>
          </BlurView>

          {/* Timer */}
          {launchedLabel && (
            <BlurView intensity={50} tint="dark" style={styles.timerPill}>
              <Ionicons name="time-outline" size={11} color="rgba(255,255,255,0.75)" />
              <Text style={styles.timerText}>{launchedLabel}</Text>
            </BlurView>
          )}
        </View>

        {/* ── BOTTOM OVERLAY : brand + nom ── */}
        <View style={styles.mediaBottom}>
          {collection.brand && (
            <View style={styles.brandRow}>
              {collection.brand.logo && (
                <Image
                  source={{ uri: collection.brand.logo }}
                  style={styles.brandLogo}
                  contentFit="cover"
                />
              )}
              <Text style={styles.brandName}>
                {collection.brand.name.toUpperCase()}
              </Text>
            </View>
          )}

          <Text style={styles.collectionName} numberOfLines={2}>
            {collection.name}
          </Text>
        </View>
      </View>

      {/* ── BARRE ACCENT ── */}
      <View style={[styles.accentLine, { backgroundColor: accent }]} />

      {/* ── FOOTER ── */}
      <View
        style={[
          styles.footer,
          { backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF' },
        ]}
      >
        {/* Stats */}
        <View style={styles.stats}>
          {/* Produits */}
          <View style={styles.statChip}>
            <Ionicons
              name="layers-outline"
              size={14}
              color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
            />
            <Text style={[styles.statLabel, { color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)' }]}>
              {productCount} pièce{productCount > 1 ? 's' : ''}
            </Text>
          </View>

          {/* Séparateur */}
          <View style={[styles.sep, { backgroundColor: isDark ? '#2A2A2A' : '#E8E8E8' }]} />

          {/* Exclusif */}
          <View style={styles.statChip}>
            <Ionicons
              name="ribbon-outline"
              size={14}
              color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
            />
            <Text style={[styles.statLabel, { color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)' }]}>
              Exclusif
            </Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePress}
          style={[styles.cta, { backgroundColor: accent }]}
        >
          <Text style={styles.ctaText}>VOIR LA COLLECTION</Text>
          <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const CARD_RADIUS = 22;
const MEDIA_HEIGHT = width * 0.62;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },

  /* MEDIA */
  mediaWrap: {
    width: '100%',
    height: MEDIA_HEIGHT,
    backgroundColor: '#111',
    position: 'relative',
  },
  noMedia: {
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* TOP ROW */
  topRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  dropBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  timerText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.82)',
  },

  /* BOTTOM MEDIA */
  mediaBottom: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    gap: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  brandName: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
  },
  collectionName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 28,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  /* ACCENT LINE */
  accentLine: {
    height: 2,
    width: '100%',
  },

  /* FOOTER */
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  sep: {
    width: 1,
    height: 16,
  },

  /* CTA */
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
});