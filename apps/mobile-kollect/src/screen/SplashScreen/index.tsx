/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Image, Dimensions } from 'react-native';
import { useTheme } from '@/app/context/ThemeContext';

const { width, height } = Dimensions.get('window');

const LOGO_BASE_SIZE = Math.min(width * 1.75, 520);
const LOGO_FINAL_SIZE = Math.min(width * 0.25, 120);

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const { theme } = useTheme();

  // Animations principales
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Animations des particules
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;
  
  // Animation de l'indicateur de chargement
  const loaderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Séquence d'animation principale
    Animated.sequence([
      // Étape 1 : Apparition explosive du logo
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          friction: 5,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      
      // Étape 2 : Stabilisation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation du texte avec effet de rebond
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        delay: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(textScale, {
        toValue: 1,
        delay: 400,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsation subtile et continue
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Animation des particules flottantes
    const particles = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(particle1, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(particle1, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(particle2, {
            toValue: 1,
            duration: 2500,
            delay: 500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(particle2, {
            toValue: 0,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(particle3, {
            toValue: 1,
            duration: 2800,
            delay: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(particle3, {
            toValue: 0,
            duration: 2800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    particles.start();

    // Animation du loader (barre de progression)
    const loader = Animated.loop(
      Animated.sequence([
        Animated.timing(loaderAnim, {
          toValue: 1,
          duration: 1500,
          delay: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(loaderAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    );
    loader.start();

    // Fin de l'animation
    const timer = setTimeout(() => {
      pulse.stop();
      particles.stop();
      loader.stop();
      onAnimationComplete();
    }, 3000);

    return () => {
      clearTimeout(timer);
      pulse.stop();
      particles.stop();
      loader.stop();
    };
  }, [loaderAnim, onAnimationComplete, opacityAnim, particle1, particle2, particle3, pulseAnim, rotateAnim, scaleAnim, textOpacity, textScale]);

  // Interpolations
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg'],
  });

  const textTranslateY = textOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const loaderWidth = loaderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Particules positions
  const particle1Y = particle1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });
  const particle1Opacity = particle1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.6, 0],
  });

  const particle2Y = particle2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });
  const particle2Opacity = particle2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 0],
  });

  const particle3Y = particle3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });
  const particle3Opacity = particle3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.7, 0],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Cercles de fond décoratifs */}
      <View style={styles.backgroundCircles}>
        <View 
          style={[
            styles.circle, 
            styles.circle1,
            { backgroundColor: theme.colors.primary + '10' }
          ]} 
        />
        <View 
          style={[
            styles.circle, 
            styles.circle2,
            { backgroundColor: theme.colors.primary + '08' }
          ]} 
        />
      </View>

      <View style={styles.content}>
        {/* Particules flottantes autour du logo */}
        <Animated.View
          style={[
            styles.particle,
            {
              opacity: particle1Opacity,
              transform: [
                { translateY: particle1Y },
                { translateX: -40 },
              ],
              backgroundColor: theme.colors.primary + '80',
            },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            {
              opacity: particle2Opacity,
              transform: [
                { translateY: particle2Y },
                { translateX: 50 },
              ],
              backgroundColor: theme.colors.primary + '60',
            },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            {
              opacity: particle3Opacity,
              transform: [
                { translateY: particle3Y },
                { translateX: 0 },
              ],
              backgroundColor: theme.colors.primary + '70',
            },
          ]}
        />

        {/* Logo avec effets multiples */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: opacityAnim,
              transform: [
                { scale: Animated.multiply(scaleAnim, pulseAnim) },
                { rotate: rotation },
              ],
            },
          ]}
        >
          {/* Glow effect */}
          <View 
            style={[
              styles.logoGlow,
              { 
                backgroundColor: theme.colors.primary + '20',
                shadowColor: theme.colors.primary,
              }
            ]} 
          />
          
          <Image
            source={require('../../../assets/images/LOGO-KOLLECT.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Texte "Kollect" avec animation */}
        <Animated.Text
          style={[
            styles.text,
            {
              color: theme.colors.text,
              opacity: textOpacity,
              transform: [
                { translateY: textTranslateY },
                { scale: textScale },
              ],
            },
          ]}
        >
          Kollect
        </Animated.Text>

        {/* Sous-titre subtil */}
        <Animated.Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.text + '60',
              opacity: textOpacity,
            },
          ]}
        >
          Collectionnez vos moments
        </Animated.Text>
      </View>

      {/* Barre de chargement moderne */}
      <Animated.View
        style={[
          styles.loaderContainer,
          { opacity: textOpacity },
        ]}
      >
        <View style={[styles.loaderTrack, { backgroundColor: theme.colors.primary + '20' }]}>
          <Animated.View
            style={[
              styles.loaderBar,
              {
                width: loaderWidth,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>
      </Animated.View>
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
  backgroundCircles: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  circle1: {
    width: width * 1.2,
    height: width * 1.2,
    top: -width * 0.3,
    right: -width * 0.4,
  },
  circle2: {
    width: width * 0.8,
    height: width * 0.8,
    bottom: -width * 0.2,
    left: -width * 0.3,
  },
  content: {
    alignItems: 'center',
    position: 'relative',
  },
  logoWrapper: {
    marginBottom: 24,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  logoGlow: {
    position: 'absolute',
    width: LOGO_BASE_SIZE * 1.3,
    height: LOGO_BASE_SIZE * 1.3,
    borderRadius: LOGO_BASE_SIZE * 0.65,
    top: '50%',
    left: '50%',
    marginTop: -(LOGO_BASE_SIZE * 0.65),
    marginLeft: -(LOGO_BASE_SIZE * 0.65),
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 5,
  },
  logo: {
    width: LOGO_BASE_SIZE,
    height: LOGO_BASE_SIZE,
    tintColor: undefined,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: '50%',
    left: '50%',
  },
  text: {
    fontSize: Math.min(width * 0.13, 52),
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: -234,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '500',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: -3,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: height * 0.12,
    width: width * 0.5,
    maxWidth: 200,
  },
  loaderTrack: {
    width: '100%',
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  loaderBar: {
    height: '100%',
    borderRadius: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});