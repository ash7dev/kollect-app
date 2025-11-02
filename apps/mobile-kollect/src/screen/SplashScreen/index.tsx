import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Image, Dimensions } from 'react-native';
import { useTheme } from '@/app/context/ThemeContext';

const { width } = Dimensions.get('window');

// TAILLE FIXE MAIS VISIBLE – 280px sur grand écran
const LOGO_SIZE = Math.min(width * 0.5, 280); // 50% de largeur, max 280px
const FONT_SIZE = Math.min(width * 0.14, 56); // Texte grand

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const { theme } = useTheme();

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Démarrer les animations immédiatement
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Appeler onAnimationComplete après 1500ms
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [slideAnim, fadeAnim, onAnimationComplete]);

  // Animation logo : glisse vers la gauche
  const logoTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width * 0.18], // Moins de déplacement
  });

  // Animation texte : apparaît en douceur
  const textTranslateX = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* CONTENEUR CENTRÉ */}
      <View style={styles.content}>
        {/* LOGO – GRAND ET CENTRÉ */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [{ translateX: logoTranslateX }],
            },
          ]}
        >
          <Image
            source={require('../../../assets/images/LOGO-KOLLECT.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* TEXTE – PROCHE DU LOGO */}
        <Animated.Text
          style={[
            styles.text,
            { color: theme.colors.text },
            {
              opacity: fadeAnim,
              transform: [{ translateX: textTranslateX }],
            },
          ]}
        >
          Kollect
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // CENTRAGE PARFAIT
  },
  logoWrapper: {
    marginRight: 16, // ÉCART RÉDUIT (avant : 24)
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  text: {
    fontSize: FONT_SIZE,
    fontWeight: '900',
    letterSpacing: 1.2,
    includeFontPadding: false,
  },
});