// register.tsx - VERSION AVEC PALETTE "BOOM"
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
import { useTheme } from '../context/ThemeContext';
import { useKinde } from '../../src/features/auth/hooks/useKinde';
import { useAuthStore } from '../../src/store/authStore';
import type { AuthState } from '../../src/store/authStore';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import logo from '../../assets/images/LOGO-KOLLECT.png';

const { width } = Dimensions.get('window');
const LOGO_SIZE = Math.min(width * 0.25, 120);

export default function RegisterScreen() {
  const { register: kindeRegister, loginWithProvider, loading: kindeLoading, error: kindeError } = useKinde();
  const { theme, isDark } = useTheme();
  
  // Zustand store
  const login = useAuthStore((state: AuthState) => state.login);
  const isLoading = useAuthStore((state: AuthState) => state.isLoading);
  const error = useAuthStore((state: AuthState) => state.error);
  
  const [localError, setLocalError] = useState<string | null>(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation d'entrée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Animation d'erreur
  const shakeError = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnimation]);

  // Gestion des erreurs
  useEffect(() => {
    if (kindeError) {
      setLocalError(kindeError.message || 'Erreur lors de l\'inscription');
      shakeError();
    }
  }, [kindeError, shakeError]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      shakeError();
    }
  }, [error, shakeError]);

  /**
   * 📝 Register avec Email
   */
  const handleEmailRegister = async () => {
    try {
      setLocalError(null);
      
      const kindeResponse = await kindeRegister();
      
      if (!kindeResponse?.user) {
        throw new Error('Erreur lors de l\'inscription Kinde');
      }

      console.log('✅ Register Kinde réussi, synchronisation...');
      await login(kindeResponse.user);
      console.log('✅ Inscription complète');
      
    } catch (err: any) {
      console.error('❌ Erreur register:', err);
      setLocalError(err.message || 'Erreur lors de l\'inscription');
      shakeError();
    }
  };

  /**
   * 🌐 Register avec Provider
   */
  const handleProviderRegister = async (provider: 'google' | 'apple') => {
    try {
      setLocalError(null);
      
      const kindeResponse = await loginWithProvider(provider);
      
      if (!kindeResponse?.user) {
        throw new Error(`Erreur lors de l'inscription avec ${provider}`);
      }

      console.log(`✅ Register ${provider} réussi, synchronisation...`);
      await login(kindeResponse.user);
      console.log('✅ Inscription complète');
      
    } catch (err: any) {
      console.error(`❌ Erreur register ${provider}:`, err);
      setLocalError(err.message || `Erreur lors de l'inscription avec ${provider}`);
      shakeError();
    }
  };

  const isButtonDisabled = kindeLoading || isLoading;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Back button */}
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.card }]}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={[
            styles.logoContainer, 
            { 
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
              width: LOGO_SIZE,
              height: LOGO_SIZE,
              borderRadius: LOGO_SIZE / 2,
              shadowColor: isDark ? '#000' : '#000',
              shadowOffset: { width: 0, height: isDark ? 8 : 6 },
              shadowOpacity: isDark ? 0.5 : 0.15,
              shadowRadius: 12,
              elevation: isDark ? 8 : 4,
            }
          ]}>
            <Image
              source={logo}
              style={[
                styles.logo, 
                { 
                  width: '400%',
                  height: '400%',
                  maxWidth: 720,
                  maxHeight: 720,
                },
                isDark && { tintColor: '#FFFFFF' }
              ]}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Créer un compte
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Rejoignez Kollect dès maintenant
          </Text>
        </View>

        {/* Error Message - Style "BOOM" */}
        {localError && (
          <Animated.View
            style={[
              styles.errorContainer,
              {
                backgroundColor: `${theme.colors.error}15`,
                borderColor: theme.colors.error,
                borderWidth: 1,
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

        {/* Boutons d'inscription */}
        <View style={styles.buttonsContainer}>
          {/* Bouton principal - Rouge accent "BOOM" */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { 
                backgroundColor: theme.colors.accent,
                borderWidth: 0,
                shadowColor: theme.colors.accent,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
                opacity: isButtonDisabled ? 0.6 : 1
              }
            ]}
            onPress={handleEmailRegister}
            disabled={isButtonDisabled}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                S&apos;inscrire avec email
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.separator}>
            <View style={[
              styles.separatorLine, 
              { backgroundColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight }
            ]} />
            <Text style={[styles.separatorText, { color: theme.colors.textSecondary }]}>
              ou
            </Text>
            <View style={[
              styles.separatorLine, 
              { backgroundColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight }
            ]} />
          </View>

          {/* Boutons sociaux - Style "BOOM" */}
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[
                styles.socialButton,
                { 
                  backgroundColor: theme.colors.card,
                  borderWidth: 1,
                  borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.border,
                  shadowColor: isDark ? '#000' : '#000',
                  shadowOffset: { width: 0, height: isDark ? 4 : 2 },
                  shadowOpacity: isDark ? 0.3 : 0.08,
                  shadowRadius: 6,
                  elevation: isDark ? 4 : 2,
                  opacity: isButtonDisabled ? 0.6 : 1
                }
              ]}
              onPress={() => handleProviderRegister('google')}
              disabled={isButtonDisabled}
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
                  borderWidth: 1,
                  borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.border,
                  shadowColor: isDark ? '#000' : '#000',
                  shadowOffset: { width: 0, height: isDark ? 4 : 2 },
                  shadowOpacity: isDark ? 0.3 : 0.08,
                  shadowRadius: 6,
                  elevation: isDark ? 4 : 2,
                  opacity: isButtonDisabled ? 0.6 : 1
                }
              ]}
              onPress={() => handleProviderRegister('apple')}
              disabled={isButtonDisabled}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-apple" size={20} color={theme.colors.text} />
              <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>
                Apple
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Termes et conditions - Style "BOOM" */}
        <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
          En créant un compte, vous acceptez nos{' '}
          <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>
            Conditions d&apos;utilisation
          </Text>
          {' '}et notre{' '}
          <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>
            Politique de confidentialité
          </Text>
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Vous avez déjà un compte ?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={[styles.footerLink, { color: theme.colors.accent }]}>
              Se connecter
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    paddingHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logo: { 
    width: 85, 
    height: 85, 
    resizeMode: 'contain', 
    marginTop: 43,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '700', 
    marginBottom: 8, 
    letterSpacing: -0.8,
  },
  subtitle: { 
    fontSize: 15, 
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    gap: 10,
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
    fontWeight: '600', 
    lineHeight: 18,
  },
  closeError: { 
    padding: 4,
  },
  buttonsContainer: { 
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
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
    fontWeight: '600',
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
    borderRadius: 14,
    height: 56,
    gap: 8,
  },
  socialButtonText: { 
    fontSize: 15, 
    fontWeight: '700',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: { 
    fontSize: 14, 
    fontWeight: '500',
  },
  footerLink: { 
    fontSize: 14, 
    fontWeight: '700',
  },
});
