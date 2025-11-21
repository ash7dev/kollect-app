import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../app/context/ThemeContext';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface JustLaunchedDropProps {
  collection: {
    id: string;
    name: string;
    description?: string | null;
    coverImage?: string | null;
    launchedAt?: string | Date | null;
    brand?: {
      id: string;
      name: string;
      logo?: string | null;
    } | null;
    _count?: {
      products?: number;
    };
  };
  onPress?: (id: string) => void;
}

function getTimeAgo(input?: string | Date | null): string | null {
  if (!input) return null;
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return 'quelques instants';

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'quelques secondes';
  if (diffMinutes < 60) return `${diffMinutes} min`;
  if (diffHours < 24) return `${diffHours} h`;
  if (diffDays < 7) return `${diffDays} j`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks} sem`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} mois`;
}

export default function JustLaunchedDrop({ collection, onPress }: JustLaunchedDropProps) {
  const { theme, isDark } = useTheme();

  const productCount = collection._count?.products ?? 0;
  const launchedLabel = getTimeAgo(collection.launchedAt);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(collection.id)}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
          shadowColor: isDark ? '#000' : theme.colors.shadowLight,
        },
      ]}
    >
      {/* Image principale */}
      <View style={styles.imageContainer}>
        {collection.coverImage && (
          <>
            <Image
              source={{ uri: collection.coverImage }}
              style={styles.coverImage}
              contentFit="cover"
            />
            {/* Dégradé simple pour lisibilité des badges */}
            <LinearGradient
              colors={['rgba(0, 0, 0, 0.4)', 'transparent', 'transparent', 'rgba(0, 0, 0, 0.3)']}
              locations={[0, 0.25, 0.75, 1]}
              style={styles.imageOverlay}
            />
          </>
        )}
        
        {/* Badge "NOUVEAU DROP" - Style streetwear */}
        <View style={styles.newBadge}>
          <View style={[styles.newBadgeInner, { backgroundColor: theme.colors.accent }]}>
            <Ionicons name="flash" size={14} color="#FFFFFF" />
            <Text style={styles.newBadgeText}>NOUVEAU DROP</Text>
          </View>
        </View>

        {/* Timer - Coin supérieur droit */}
        {launchedLabel && (
          <View style={[styles.timerBadge, { 
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)' 
          }]}>
            <Ionicons name="time-outline" size={12} color="#FFFFFF" />
            <Text style={styles.timerText}>il y a {launchedLabel}</Text>
          </View>
        )}
      </View>

      {/* Barre accent rouge */}
      <View style={[styles.accentBar, { backgroundColor: theme.colors.accent }]} />

      {/* Contenu */}
      <View style={styles.content}>
        {/* Brand + Titre */}
        <View style={styles.header}>
          {collection.brand && (
            <View style={styles.brandRow}>
              {collection.brand.logo && (
                <View style={[styles.brandLogoContainer, {
                  borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
                }]}>
                  <Image
                    source={{ uri: collection.brand.logo }}
                    style={styles.brandLogo}
                    contentFit="cover"
                  />
                </View>
              )}
              <View style={styles.brandInfo}>
                <Text style={[styles.brandLabel, { color: theme.colors.textSecondary }]}>
                  BY
                </Text>
                <Text style={[styles.brandName, { color: theme.colors.text }]} numberOfLines={1}>
                  {collection.brand.name}
                </Text>
              </View>
            </View>
          )}
          
          <Text style={[styles.collectionName, { color: theme.colors.text }]} numberOfLines={2}>
            {collection.name}
          </Text>
        </View>

        {/* Description */}
        {collection.description && (
          <Text
            style={[styles.description, { color: theme.colors.textSecondary }]}
            numberOfLines={2}
          >
            {collection.description}
          </Text>
        )}

        {/* Stats avec cube glow en arrière-plan */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            {/* Glow effect en arrière-plan */}
            <View style={styles.statIconContainer}>
              <View style={[styles.glowBackground, {
                backgroundColor: isDark 
                  ? theme.colors.primary + '40'
                  : theme.colors.primary + '20',
              }]} />
              <View style={[styles.statIcon, {
                backgroundColor: isDark 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.05)',
              }]}>
                <Ionicons 
                  name="cube-outline" 
                  size={18} 
                  color={theme.colors.text} 
                />
              </View>
            </View>
            <Text style={[styles.statText, { color: theme.colors.text }]}>
              {productCount} produit{productCount > 1 ? 's' : ''}
            </Text>
          </View>

          <View style={[styles.statDivider, {
            backgroundColor: isDark 
              ? theme.colors.borderDarkSubtle 
              : theme.colors.borderLight,
          }]} />

          <View style={styles.statItem}>
            {/* Glow effect en arrière-plan */}
            <View style={styles.statIconContainer}>
              <View style={[styles.glowBackground, {
                backgroundColor: theme.colors.accent + '30',
              }]} />
              <View style={[styles.statIcon, {
                 backgroundColor: isDark 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.05)',
              }]}>
                <Ionicons 
                  name="flame" 
                  size={18} 
                  color={theme.colors.text}
                />
              </View>
            </View>
            <Text style={[styles.statText, { color: theme.colors.text }]}>
              Exclusif
            </Text>
          </View>
        </View>

        {/* CTA Button - Mix Noir/Rouge pour le HYPE */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onPress?.(collection.id)}
          style={styles.ctaWrapper}
        >
          <View
            style={[
              styles.ctaButton,
              {
                backgroundColor: theme.colors.accent,
              },
            ]}
          >
            <Text style={[styles.ctaText, { color: '#FFFFFF' }]}>DÉCOUVRIR LA COLLECTION</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Bordure subtile */}
      <View style={[styles.borderOverlay, {
        borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
      }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  imageContainer: {
    width: '100%',
    height: width * 0.5,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  newBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  newBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
    gap: 5,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  timerBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 4,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
  content: {
    padding: 20,
    gap: 14,
  },
  header: {
    gap: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  brandLogoContainer: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 2,
  },
  brandLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  brandInfo: {
    gap: -2,
  },
  brandLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '700',
  },
  collectionName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statIconContainer: {
    position: 'relative',
    width: 32,
    height: 32,
  },
  glowBackground: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    top: -4,
    left: -4,
    opacity: 0.6,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  ctaWrapper: {
    marginTop: 2,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  borderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    pointerEvents: 'none',
  },
});