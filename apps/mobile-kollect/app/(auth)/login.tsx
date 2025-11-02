// login.tsx - VERSION CORRIGÉE
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/app/context/ThemeContext';
import { useKinde } from '@/src/features/auth/hooks/useKinde';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import logo from '../../assets/images/LOGO-KOLLECT.png';

const { width } = Dimensions.get('window');
const LOGO_SIZE = Math.min(width * 0.25, 120);

const ERROR_MESSAGES: Record<string, string> = {
  'Network request failed': 'Erreur de connexion. Vérifiez votre internet.',
  'Too many requests': 'Trop de tentatives. Réessayez dans quelques minutes.',
  'Session expired': 'Session expirée. Veuillez vous reconnecter.',
};

const getErrorMessage = (error: any): string => {
  if (!error) return 'Une erreur est survenue';
  const errorMessage = error.message || error.toString();
  
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.includes(key)) return value;
  }
  
  return 'Une erreur est survenue. Veuillez réessayer.';
};

export default function LoginScreen() {
  const { login, loginWithProvider, loading, error } = useKinde();
  const { theme, isDark } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const shakeError = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnimation]);

  useEffect(() => {
    if (error) {
      setLocalError(getErrorMessage(error));
      shakeError();
    }
  }, [error, shakeError]);

  const handleEmailLogin = async () => {
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await login();
    } catch (err) {
      console.error('Erreur lors de la connexion:', err);
      setLocalError('Erreur lors de la connexion. Veuillez réessayer.');
      shakeError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProviderLogin = async (provider: 'google' | 'apple') => {
    if (loading || isSubmitting) return;
    setLocalError(null);
    setIsSubmitting(true);
    
    try {
      await loginWithProvider(provider);
      router.replace('/(client)');
    } catch (err) {
      console.error(`Erreur ${provider}:`, err);
      setLocalError(getErrorMessage(err));
      shakeError();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[
            styles.logoContainer, 
            { 
              backgroundColor: theme.colors.card,
              width: LOGO_SIZE,
              height: LOGO_SIZE,
              borderRadius: LOGO_SIZE / 2,
            }
          ]}>
            <Image
              source={logo}
              style={[
                styles.logo, 
                { 
                  width: '400%',  // Utilisation d'un pourcentage pour une meilleure adaptation
                  height: '400%',
                  maxWidth: 720,   // Taille maximale pour éviter un logo trop grand
                  maxHeight: 720,
                },
                isDark && { tintColor: '#FFFFFF' }
                ]}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Bon retour !
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Connectez-vous pour continuer
          </Text>
        </View>

        {/* Error Message */}
        {localError && (
          <Animated.View
            style={[
              styles.errorContainer,
              {
                backgroundColor: theme.colors.error + '15',
                borderColor: theme.colors.error,
                transform: [{ translateX: shakeAnimation }],
              },
            ]}
          >
            <View style={[styles.errorIconContainer, { backgroundColor: theme.colors.error }]}>
              <Ionicons name="alert-circle" size={16} color="#FFFFFF" />
            </View>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {localError}
            </Text>
            <TouchableOpacity onPress={() => setLocalError(null)} style={styles.closeError}>
              <Ionicons name="close-circle" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Boutons de connexion */}
        <View style={styles.buttonsContainer}>
          {/* Bouton principal de connexion par email */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { 
                backgroundColor: theme.colors.primary,
                opacity: (loading || isSubmitting) ? 0.6 : 1
              }
            ]}
            onPress={handleEmailLogin}
            disabled={loading || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Se connecter avec email
              </Text>
            )}
          </TouchableOpacity>

          {/* Séparateur */}
          <View style={styles.separator}>
            <View style={[styles.separatorLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.separatorText, { color: theme.colors.textSecondary }]}>ou</Text>
            <View style={[styles.separatorLine, { backgroundColor: theme.colors.border }]} />
          </View>

          {/* Boutons de connexion sociale */}
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[
                styles.socialButton,
                { 
                  backgroundColor: theme.colors.card, 
                  borderColor: theme.colors.border,
                  opacity: (loading || isSubmitting) ? 0.6 : 1
                }
              ]}
              onPress={() => handleProviderLogin('google')}
              disabled={loading || isSubmitting}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>
                Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.socialButton,
                { 
                  backgroundColor: theme.colors.card, 
                  borderColor: theme.colors.border,
                  opacity: (loading || isSubmitting) ? 0.6 : 1
                }
              ]}
              onPress={() => handleProviderLogin('apple')}
              disabled={loading || isSubmitting}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-apple" size={20} color={theme.colors.text} />
              <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>
                Apple
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer - Lien vers l'inscription */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Vous n&apos;avez pas de compte ?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
              S&apos;inscrire
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 85,
    height: 85,
    resizeMode: 'contain',
    marginTop: 43, // Ajustement de la marge supérieure pour descendre le logo
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    gap: 10,
    borderWidth: 1,
  },
  errorIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  closeError: { 
    padding: 4 
  },
  buttonsContainer: { 
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    marginHorizontal: 12,
    fontSize: 13,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    height: 52,
    gap: 8,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: { 
    fontSize: 14,
    fontWeight: '400',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});