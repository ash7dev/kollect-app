/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useTheme } from '../../../app/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const SPACING = 18;

interface CarouselItem {
  id: string;
  image: string;
  title: string;
  brandName?: string;
  brandLogo?: string;
}

interface DepthCarouselProps {
  data: CarouselItem[];
}

export default function DepthCarousel({ data }: DepthCarouselProps) {
  const { theme, isDark } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    card: {
      width: CARD_WIDTH,
      borderRadius: 16,
      backgroundColor: isDark ? theme.colors.cardDark : theme.colors.card,
      marginHorizontal: SPACING,
      borderWidth: 1,
      borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
      // Ombres "BOOM" - Forte élévation premium
      shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
      shadowOffset: { width: 0, height: isDark ? 8 : 6 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: isDark ? 8 : 4,
      overflow: 'hidden',
    },
    imageContainer: {
      width: '100%',
      height: 500,
      borderRadius: 12,
      overflow: 'hidden',
      margin: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
    },
    brandLogo: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
      borderWidth: 2,
      borderColor: isDark ? theme.colors.borderDark : theme.colors.border,
      backgroundColor: isDark ? theme.colors.surfaceDark : theme.colors.surface,
    },
    brandName: {
      color: isDark ? theme.colors.textDark : theme.colors.text,
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 24,
      paddingTop: 8,
    },
    title: {
      color: isDark ? theme.colors.textDark : theme.colors.text,
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 20,
      lineHeight: 28,
      letterSpacing: -0.5,
    },
    button: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.accent,
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.accent,
      // Ombre rouge pour le CTA
      shadowColor: theme.colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 15,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
  });
  
  return (
    <View style={styles.container}>
      <Carousel
        width={CARD_WIDTH + SPACING * 2}
        height={660}
        data={data}
        loop
        autoPlay={false}
        scrollAnimationDuration={1500}
        mode="parallax"
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
              [0.5, 1, 0.5]
            );
            const translateY = interpolate(
              animationValue.value,
              [-1, 0, 1],
              [30, 0, 30]
            );
            return {
              transform: [{ scale }, { translateY }],
              opacity,
            };
          });

          return (
            <Animated.View style={[styles.card, animatedStyle]}>
              {/* Header avec logo et nom de marque */}
              <View style={styles.header}>
                {item.brandLogo && (
                  <Image
                    source={{ uri: item.brandLogo }}
                    style={styles.brandLogo}
                    contentFit="contain"
                  />
                )}
                {item.brandName && (
                  <Text style={styles.brandName}>{item.brandName}</Text>
                )}
              </View>

              {/* Image principale avec bordure */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                  contentFit="cover"
                />
              </View>

              {/* Footer avec titre et CTA rouge */}
              <View style={styles.footer}>
                <Text style={styles.title}>{item.title}</Text>
                <TouchableOpacity 
                  style={styles.button}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Voir la marque</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}