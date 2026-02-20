/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';
import { ShareButton } from '../ui/ShareButton';
import { ShareService, ShareType } from '../../features/share/services/share.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const SPACING = 16;

interface CarouselItem {
  id: string;
  image: string;
  title: string;
  brandName?: string;
  brandLogo?: string;
  brandSlug?: string;
  productCount?: number;
  viewCount?: number;
}

interface DepthCarouselProps {
  data: CarouselItem[];
  onBrandPress?: (slug?: string) => void;
  onCollectionPress?: (id: string) => void;
}

export default function DepthCarousel({ data, onBrandPress, onCollectionPress }: DepthCarouselProps) {
  const { theme, isDark } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    card: {
      width: CARD_WIDTH,
      borderRadius: 24,
      backgroundColor: isDark ? theme.colors.cardDark : theme.colors.card,
      marginHorizontal: SPACING,
      borderWidth: 1,
      borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
      shadowColor: isDark ? '#000' : theme.colors.shadowLight,
      shadowOffset: { width: 0, height: isDark ? 12 : 8 },
      shadowOpacity: isDark ? 0.6 : 0.2,
      shadowRadius: 20,
      elevation: isDark ? 12 : 6,
      overflow: 'hidden',
    },
    imageWrapper: {
      position: 'relative',
      width: '100%',
      height: 480,
    },
    imageContainer: {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imageGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '50%',
    },
    // Barre décorative
    accentBar: {
      height: 3,
      width: '100%',
    },
    // Brand header redesign
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
    },
    shareButton: {
      opacity: 0.8,
    },
    brandSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    brandLogoWrapper: {
      position: 'relative',
      marginRight: 12,
    },
    brandLogo: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 2,
      borderColor: isDark ? '#FFFFFF' : '#000000',
    },
    logoRing: {
      position: 'absolute',
      top: -3,
      left: -3,
      right: -3,
      bottom: -3,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: theme.colors.accent + '30',
    },
    brandInfo: {
      flex: 1,
      gap: 2,
    },
    brandLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    },
    brandName: {
      color: isDark ? theme.colors.textDark : theme.colors.text,
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    // Footer content
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 24,
      paddingTop: 16,
      gap: 16,
    },
    titleSection: {
      gap: 8,
    },
    titleLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    title: {
      color: isDark ? theme.colors.textDark : theme.colors.text,
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: -0.2,
      lineHeight: 28,
    },
    // Stats row
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },
    statIconContainer: {
      position: 'relative',
      width: 28,
      height: 28,
    },
    statGlow: {
      position: 'absolute',
      width: 36,
      height: 36,
      borderRadius: 18,
      top: -4,
      left: -4,
      opacity: 0.5,
    },
    statIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? theme.colors.textDark : theme.colors.text,
      flex: 1,
    },
    statDivider: {
      width: 1,
      height: 20,
      backgroundColor: isDark 
        ? theme.colors.borderDarkSubtle 
        : theme.colors.borderLight,
    },
    // CTA Button premium
    ctaWrapper: {
      marginTop: 4,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 14,
      gap: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 15,
      letterSpacing: 0.8,
    },
    buttonIcon: {
      width: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
  
  return (
    <View style={styles.container}>
      <Carousel
        width={CARD_WIDTH + SPACING * 2}
        height={740}
        data={data}
        loop
        autoPlay={false}
        scrollAnimationDuration={1200}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.88,
          parallaxScrollingOffset: 50,
        }}
        style={{ overflow: 'visible' }}
        pagingEnabled={false}
        renderItem={({ item, animationValue }) => {
          const animatedStyle = useAnimatedStyle(() => {
            const scale = interpolate(
              animationValue.value,
              [-1, 0, 1],
              [0.88, 1, 0.88]
            );
            const opacity = interpolate(
              animationValue.value,
              [-1, 0, 1],
              [0.4, 1, 0.4]
            );
            const translateY = interpolate(
              animationValue.value,
              [-1, 0, 1],
              [40, 0, 40]
            );
            const rotateZ = interpolate(
              animationValue.value,
              [-1, 0, 1],
              [-2, 0, 2]
            );
            return {
              transform: [
                { scale }, 
                { translateY },
                { rotateZ: `${rotateZ}deg` }
              ],
              opacity,
            };
          });

          return (
            <Animated.View style={[styles.card, animatedStyle]}>
              {/* Image avec dégradé */}
              <View style={styles.imageWrapper}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                    contentFit="cover"
                  />
                </View>
                {/* Dégradé bottom pour lisibilité */}
                <LinearGradient
                  colors={[
                    'transparent',
                    isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)',
                  ]}
                  style={styles.imageGradient}
                  pointerEvents="none"
                />
              </View>

              {/* Header avec brand */}
              <View style={styles.header}>
                <View style={styles.brandSection}>
                  {item.brandLogo && (
                    <View style={styles.brandLogoWrapper}>
                      <Image
                        source={{ uri: item.brandLogo }}
                        style={styles.brandLogo}
                        contentFit="cover"
                      />
                      <View style={styles.logoRing} />
                    </View>
                  )}
                  {item.brandName && (
                    <View style={styles.brandInfo}>
                      <Text style={styles.brandLabel}>BRAND</Text>
                      <Text style={styles.brandName}>{item.brandName}</Text>
                    </View>
                  )}
                </View>
                
                {/* Bouton de partage */}
                <ShareButton
                  data={{
                    type: ShareType.COLLECTION,
                    id: item.id,
                    name: item.title,
                    brandName: item.brandName,
                    imageUrl: item.image,
                    stats: {
                      viewCount: item.viewCount,
                      productCount: item.productCount,
                    },
                  }}
                  size="small"
                  style={styles.shareButton}
                />
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                {/* Titre */}
                <View style={styles.titleSection}>
                  <Text style={styles.titleLabel}>COLLECTION</Text>
                  <Text style={styles.title}>{item.title}</Text>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <View style={[styles.statGlow, {
                        backgroundColor: theme.colors.accent + '40',
                      }]} />
                      <View style={[styles.statIcon, {
                        backgroundColor: isDark 
                          ? 'rgba(255, 59, 48, 0.15)' 
                          : 'rgba(255, 59, 48, 0.1)',
                      }]}>
                        <Ionicons 
                          name="flame" 
                          size={18} 
                          color={theme.colors.accent} 
                        />
                      </View>
                    </View>
                    <Text style={styles.statText}>Trending</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <View style={[styles.statGlow, {
                        backgroundColor: isDark 
                          ? 'rgba(255, 255, 255, 0.2)'
                          : 'rgba(0, 0, 0, 0.15)',
                      }]} />
                      <View style={[styles.statIcon, {
                        backgroundColor: isDark 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.05)',
                      }]}>
                        <Ionicons 
                          name="eye-outline" 
                          size={18} 
                          color={isDark ? theme.colors.textDark : theme.colors.text} 
                        />
                      </View>
                    </View>
                    <Text style={styles.statText}>Popular</Text>
                  </View>
                </View>

                {/* CTA Button avec dégradé Noir → Rouge */}
                <View style={styles.ctaWrapper}>
                  <TouchableOpacity 
                    activeOpacity={0.85}
                    onPress={() => {
                      if (onCollectionPress) {
                        onCollectionPress(item.id);
                      } else {
                        onBrandPress?.(item.brandSlug);
                      }
                    }}
                  >
                    <LinearGradient
                      colors={[theme.colors.accent, theme.colors.accent]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.button}
                    >
                      <Text style={styles.buttonText}>DÉCOUVRIR LA COLLECTION</Text>
                      <View style={styles.buttonIcon}>
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}