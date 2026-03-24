/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';
import { ShareButton } from '../ui/ShareButton';
import { ShareService, ShareType } from '../../features/share/services/share.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = 480;

interface CarouselItem {
  id: string;
  image: string;
  title: string;
  brandName?: string;
  brandLogo?: string;
  brandSlug?: string;
  productCount?: number;
  viewCount?: number;
  description?: string;
}

interface DepthCarouselProps {
  data: CarouselItem[];
  onBrandPress?: (slug?: string) => void;
  onCollectionPress?: (id: string) => void;
}

export default function DepthCarousel({ data, onBrandPress, onCollectionPress }: DepthCarouselProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Carousel
        width={CARD_WIDTH + 24}
        height={CARD_HEIGHT}
        data={data}
        loop
        autoPlay={false}
        scrollAnimationDuration={900}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.92,
          parallaxScrollingOffset: 44,
        }}
        style={{ overflow: 'visible' }}
        pagingEnabled
        renderItem={({ item, animationValue }) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const animatedStyle = useAnimatedStyle(() => {
            const scale = interpolate(animationValue.value, [-1, 0, 1], [0.9, 1, 0.9]);
            const opacity = interpolate(animationValue.value, [-1, 0, 1], [0.55, 1, 0.55]);
            return { transform: [{ scale }], opacity };
          });

          return (
            <Animated.View style={[{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              borderRadius: 24,
              overflow: 'hidden',
              marginHorizontal: 12,
              // Shadow premium
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: isDark ? 0.6 : 0.22,
              shadowRadius: 24,
              elevation: isDark ? 14 : 8,
            }, animatedStyle]}>

              {/* ════ IMAGE FULL-BLEED ════ */}
              <Image
                source={{ uri: item.image }}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
              />

              {/* ════ GRADIENT TOP → pour lire le brand ════ */}
              <LinearGradient
                colors={['rgba(0,0,0,0.55)', 'transparent']}
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: 140,
                }}
                pointerEvents="none"
              />

              {/* ════ GRADIENT BOTTOM → pour lire le titre/CTA ════ */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.82)']}
                style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  height: 220,
                }}
                pointerEvents="none"
              />

              {/* ════ OVERLAY TOP: Brand + Share ════ */}
              <View style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 18,
                paddingTop: 18,
                paddingBottom: 8,
              }}>
                {/* Brand pill */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onBrandPress?.(item.brandSlug)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderRadius: 40,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    // Glassmorphism
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.25)',
                  }}
                >
                  {item.brandLogo ? (
                    <Image
                      source={{ uri: item.brandLogo }}
                      style={{ width: 28, height: 28, borderRadius: 14 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={{
                      width: 28, height: 28, borderRadius: 14,
                      backgroundColor: theme.colors.accent,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>
                        {item.brandName?.charAt(0)?.toUpperCase() ?? 'K'}
                      </Text>
                    </View>
                  )}
                  {item.brandName && (
                    <Text style={{
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: '700',
                      letterSpacing: 0.2,
                    }}>
                      {item.brandName}
                    </Text>
                  )}
                  <Ionicons name="checkmark-circle" size={14} color={theme.colors.accent} />
                </TouchableOpacity>

                {/* Share button */}
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
                  style={{ opacity: 0.9 }}
                />
              </View>

              {/* ════ OVERLAY BOTTOM: Titre + Stats + CTA ════ */}
              <View style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                paddingHorizontal: 18,
                paddingBottom: 20,
                gap: 14,
              }}>

                {/* Titre de la collection */}
                <View style={{ gap: 4 }}>
                  <Text style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: 10,
                    fontWeight: '700',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                  }}>
                    Collection
                  </Text>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 26,
                      fontWeight: '800',
                      letterSpacing: -0.5,
                      lineHeight: 30,
                    }}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                </View>

                {/* Stats inline + CTA */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>

                  {/* Stats pills */}
                  {(item.productCount ?? 0) > 0 && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      borderRadius: 20,
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                    }}>
                      <Ionicons name="cube-outline" size={13} color="rgba(255,255,255,0.8)" />
                      <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' }}>
                        {item.productCount} pièces
                      </Text>
                    </View>
                  )}

                  {(item.viewCount ?? 0) > 0 && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      borderRadius: 20,
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                    }}>
                      <Ionicons name="eye-outline" size={13} color="rgba(255,255,255,0.8)" />
                      <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' }}>
                        {item.viewCount}
                      </Text>
                    </View>
                  )}

                  {/* Spacer */}
                  <View style={{ flex: 1 }} />

                  {/* CTA — flèche dans un cercle accent */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      if (onCollectionPress) onCollectionPress(item.id);
                      else onBrandPress?.(item.brandSlug);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: theme.colors.accent,
                      borderRadius: 22,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      shadowColor: theme.colors.accent,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.5,
                      shadowRadius: 10,
                      elevation: 6,
                    }}
                  >
                    <Text style={{
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: '800',
                      letterSpacing: 0.3,
                    }}>
                      Explorer
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});