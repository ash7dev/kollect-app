// app/(auth)/register.tsx - VERSION CORRIGÉE
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/app/context/ThemeContext';
import { useKinde } from '../../src/features/auth/hooks/useKinde';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import logo from '../../assets/images/LOGO-KOLLECT.png';

const { width } = Dimensions.get('window');
const LOGO_SIZE = Math.min(width * 0.25, 120);

const ERROR_MESSAGES: Record<string, string> = {
  'Email already exists': 'Cet email est déjà utilisé',
  'Invalid email format': 'Format d\'email invalide',
  'Password too weak': 'Mot de passe trop faible',
  'Network request failed': 'Erreur de connexion. Vérifiez votre internet.',
  'User creation failed': 'Échec de la création du compte',
};

const getErrorMessage = (error: any): string => {
  if (!error) return 'Une erreur est survenue';
  
  const errorMessage = error.message || error.toString();
  
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.includes(key)) return value;
  }
  
  if (errorMessage.includes('google')) return 'Inscription Google annulée ou échouée';
  if (errorMessage.includes('apple')) return 'Inscription Apple annulée ou échouée';
  
  return 'Une erreur est survenue. Veuillez réessayer.';
};

export default function RegisterScreen() {
  const { register: registerUser, loginWithProvider, user, loading, error } = useKinde();
  const { theme, isDark } = useTheme();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;

  const shakeError = useCallback(() => {
    return Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]);
  }, [shakeAnimation]);

  const handleError = useCallback(() => {
    if (error) {
      const errorMsg = getErrorMessage(error);
      setLocalError(errorMsg);
      const animation = shakeError();
      animation.start();
    }
  }, [error, shakeError]);

  useEffect(() => {
    handleError();
  }, [handleError]);

  const updatePasswordStrength = useCallback(() => {
    const strength = calculatePasswordStrength(formData.password);
    setPasswordStrength(strength);
    Animated.timing(progressAnimation, {
      toValue: strength,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [formData.password, progressAnimation]);

  useEffect(() => {
    updatePasswordStrength();
  }, [updatePasswordStrength]);

  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return '#EF4444';
    if (passwordStrength < 70) return '#F59E0B';
    return '#10B981';
  };

  const getPasswordStrengthText = () => {
    if (!formData.password) return '';
    if (passwordStrength < 40) return 'Faible';
    if (passwordStrength < 70) return 'Moyen';
    return 'Fort';
  };

  const handleRegister = async () => {
    setLocalError(null);

    if (!formData.firstName.trim()) {
      setLocalError('Le prénom est requis');
      shakeError();
      return;
    }

    if (!formData.lastName.trim()) {
      setLocalError('Le nom est requis');
      shakeError();
      return;
    }

    if (!formData.email.trim()) {
      setLocalError('L\'email est requis');
      shakeError();
      return;
    }

    if (!isValidEmail(formData.email)) {
      setLocalError('Format d\'email invalide');
      shakeError();
      return;
    }

    if (formData.password.length < 8) {
      setLocalError('Le mot de passe doit contenir au moins 8 caractères');
      shakeError();
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas');
      shakeError();
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser();
      console.log('Register OK - User:', user);
      router.replace('/(client)');
    } catch (err) {
      console.error('Erreur register:', err);
      const errorMessage = getErrorMessage(err);
      setLocalError(errorMessage);
      shakeError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProviderRegister = async (provider: 'google' | 'apple') => {
    if (loading || isSubmitting) return;
    
    setLocalError(null);
    setIsSubmitting(true);
    
    try {
      await loginWithProvider(provider);
      console.log(`${provider} register OK - User:`, user);
      router.replace('/(client)');
    } catch (err) {
      console.error(`Erreur ${provider} register:`, err);
      const errorMessage = getErrorMessage(err);
      setLocalError(errorMessage);
      shakeError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };


  const clearError = () => {
    setLocalError(null);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
            Créer un compte
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Rejoignez Kollect dès maintenant
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
            <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {localError}
            </Text>
            <TouchableOpacity onPress={clearError} style={styles.closeError}>
              <Ionicons name="close" size={18} color={theme.colors.error} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Prénom et Nom */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputWrapper, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Prénom
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: focusedField === 'firstName' ? theme.colors.primary : theme.colors.border,
                    borderWidth: focusedField === 'firstName' ? 2 : 1,
                  },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={focusedField === 'firstName' ? theme.colors.primary : theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Jean"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.firstName}
                  onChangeText={(text) => updateFormData('firstName', text)}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="words"
                  editable={!loading && !isSubmitting}
                />
              </View>
            </View>

            <View style={[styles.inputWrapper, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Nom
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: focusedField === 'lastName' ? theme.colors.primary : theme.colors.border,
                    borderWidth: focusedField === 'lastName' ? 2 : 1,
                  },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={focusedField === 'lastName' ? theme.colors.primary : theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Dupont"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.lastName}
                  onChangeText={(text) => updateFormData('lastName', text)}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="words"
                  editable={!loading && !isSubmitting}
                />
              </View>
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Email
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: focusedField === 'email' ? theme.colors.primary : theme.colors.border,
                  borderWidth: focusedField === 'email' ? 2 : 1,
                },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color={focusedField === 'email' ? theme.colors.primary : theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="votre@email.com"
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading && !isSubmitting}
              />
            </View>
          </View>

          {/* Mot de passe */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Mot de passe
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: focusedField === 'password' ? theme.colors.primary : theme.colors.border,
                  borderWidth: focusedField === 'password' ? 2 : 1,
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={focusedField === 'password' ? theme.colors.primary : theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Minimum 8 caractères"
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading && !isSubmitting}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            
            {/* Password Strength Indicator */}
            {formData.password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <Animated.View
                    style={[
                      styles.strengthFill,
                      {
                        width: progressAnimation.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: getPasswordStrengthColor(),
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
                  {getPasswordStrengthText()}
                </Text>
              </View>
            )}
          </View>

          {/* Confirmer mot de passe */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Confirmer le mot de passe
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: focusedField === 'confirmPassword' ? theme.colors.primary : theme.colors.border,
                  borderWidth: focusedField === 'confirmPassword' ? 2 : 1,
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={focusedField === 'confirmPassword' ? theme.colors.primary : theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Confirmez votre mot de passe"
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.confirmPassword}
                onChangeText={(text) => updateFormData('confirmPassword', text)}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!loading && !isSubmitting}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bouton Créer mon compte */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              { backgroundColor: theme.colors.primary },
              (loading || isSubmitting) && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting && !loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>Créer mon compte</Text>
            )}
          </TouchableOpacity>

          {/* Termes et conditions */}
          <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
            En créant un compte, vous acceptez nos{' '}
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
              Conditions d&apos;utilisation
            </Text>
            {' '}et notre{' '}
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
              Politique de confidentialité
            </Text>
          </Text>
        </View>

        {/* Séparateur */}
        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
            ou s&apos;inscrire avec
          </Text>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        </View>

        {/* Boutons sociaux */}
        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={[
              styles.socialButton,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
              (loading || isSubmitting) && styles.socialButtonDisabled,
            ]}
            onPress={() => handleProviderRegister('google')}
            disabled={loading || isSubmitting}
            activeOpacity={0.7}
          >
            {loading || isSubmitting ? (
              <ActivityIndicator size="small" color={theme.colors.textSecondary} />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>
                  Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.socialButton,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
              (loading || isSubmitting) && styles.socialButtonDisabled,
            ]}
            onPress={() => handleProviderRegister('apple')}
            disabled={loading || isSubmitting}
            activeOpacity={0.7}
          >
            {loading || isSubmitting ? (
              <ActivityIndicator size="small" color={theme.colors.textSecondary} />
            ) : (
              <>
                <Ionicons name="logo-apple" size={20} color={theme.colors.text} />
                <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>
                  Apple
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Lien vers connexion */}
        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
            Vous avez déjà un compte ?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={[styles.loginLink, { color: theme.colors.primary }]}>
              Se connecter
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
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
    marginTop: 55, // Ajustement de la marge supérieure pour descendre le logo
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  closeError: {
    padding: 4,
  },
  formContainer: {
    marginBottom: 24,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
  },
  eyeIcon: {
    padding: 4,
  },
  strengthContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 11,
    fontWeight: '600',
    width: 50,
  },
  registerButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  termsText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    height: 52,
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    fontWeight: '400',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});