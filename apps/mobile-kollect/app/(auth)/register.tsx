import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../../src/store/authStore';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import logo from '../../assets/images/LOGO-KOLLECT.png';

const { width } = Dimensions.get('window');
const LOGO_SIZE = Math.min(width * 0.2, 88);

export default function RegisterScreen() {
  const { theme, isDark } = useTheme();
  const { signUpWithEmail, signInWithGoogle, isLoading, error: storeError, _setError } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const shakeError = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnimation]);

  useEffect(() => {
    if (storeError) { setLocalError(storeError); shakeError(); }
  }, [storeError, shakeError]);

  const handleRegister = async () => {
    setLocalError(null);
    _setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setLocalError('Veuillez renseigner votre prénom et nom');
      shakeError(); return;
    }
    if (!email.trim() || !email.includes('@')) {
      setLocalError('Veuillez entrer un email valide');
      shakeError(); return;
    }
    if (!password || password.length < 6) {
      setLocalError('Le mot de passe doit contenir au moins 6 caractères');
      shakeError(); return;
    }

    try {
      await signUpWithEmail(email.trim().toLowerCase(), password, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
    } catch (err: any) {
      setLocalError(err?.message || "Erreur lors de l'inscription");
      shakeError();
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setLocalError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err?.message !== 'OAUTH_REDIRECT') {
        setLocalError(err?.message || 'Connexion Google échouée');
        shakeError();
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const isAnyLoading = isLoading || googleLoading;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Décoration fond */}
        <View style={[styles.bgCircle1, { backgroundColor: `${theme.colors.accent}18` }]} />
        <View style={[styles.bgCircle2, { backgroundColor: `${theme.colors.primary}10` }]} />

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Back */}
          <TouchableOpacity
            style={[styles.backButton, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
            }]}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoWrap, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
              width: LOGO_SIZE + 8,
              height: LOGO_SIZE + 8,
              borderRadius: (LOGO_SIZE + 8) / 2,
              shadowColor: theme.colors.accent,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.25 : 0.12,
              shadowRadius: 20,
              elevation: 10,
            }]}>
              <Image source={logo} style={{ width: LOGO_SIZE, height: LOGO_SIZE }} resizeMode="contain" />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Créer un compte</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Rejoignez Kollect dès maintenant
            </Text>
          </View>

          {/* Erreur */}
          {localError && (
            <Animated.View style={[
              styles.errorBox,
              {
                backgroundColor: `${theme.colors.error}12`,
                borderColor: `${theme.colors.error}60`,
                transform: [{ translateX: shakeAnimation }],
              },
            ]}>
              <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{localError}</Text>
              <TouchableOpacity onPress={() => setLocalError(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={18} color={theme.colors.error} />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Formulaire */}
          <View style={styles.form}>
            {/* Prénom & Nom sur la même ligne */}
            <View style={styles.nameRow}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Prénom</Text>
                <View style={[styles.inputWrapper, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }]}>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="Amadou"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nom</Text>
                <View style={[styles.inputWrapper, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }]}>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="Diallo"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'}
                    value={lastName}
                    onChangeText={setLastName}
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Adresse email</Text>
              <View style={[styles.inputWrapper, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }]}>
                <Ionicons name="mail-outline" size={18} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="amadou.diallo@email.com"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Mot de passe */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Mot de passe</Text>
              <View style={[styles.inputWrapper, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }]}>
                <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
                Minimum 6 caractères
              </Text>
            </View>
          </View>

          {/* Bouton inscription */}
          <TouchableOpacity
            style={[styles.primaryBtn, {
              backgroundColor: theme.colors.accent,
              shadowColor: theme.colors.accent,
              opacity: isAnyLoading ? 0.65 : 1,
            }]}
            onPress={handleRegister}
            disabled={isAnyLoading}
            activeOpacity={0.85}
          >
            {isLoading && !googleLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>Créer mon compte</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Séparateur */}
          <View style={styles.separator}>
            <View style={[styles.sepLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
            <Text style={[styles.sepText, { color: theme.colors.textSecondary }]}>ou s&apos;inscrire avec</Text>
            <View style={[styles.sepLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
          </View>

          {/* Bouton Google */}
          <TouchableOpacity
            style={[styles.googleBtn, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#fff',
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.06,
              shadowRadius: 8,
              elevation: isDark ? 4 : 2,
              opacity: isAnyLoading ? 0.65 : 1,
            }]}
            onPress={handleGoogle}
            disabled={isAnyLoading}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <ActivityIndicator color="#EA4335" size="small" />
            ) : (
              <>
                <View style={styles.googleIconWrapper}>
                  <Text style={styles.gLetter}><Text style={{ color: '#EA4335' }}>G</Text></Text>
                </View>
                <Text style={[styles.googleBtnText, { color: theme.colors.text }]}>
                  Continuer avec Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Termes */}
          <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
            En créant un compte, vous acceptez nos{' '}
            <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>Conditions d&apos;utilisation</Text>
            {' '}et notre{' '}
            <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>Politique de confidentialité</Text>
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Vous avez déjà un compte ?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.footerLink, { color: theme.colors.accent }]}>Se connecter</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },
  bgCircle1: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    top: -80, right: -80, zIndex: 0,
  },
  bgCircle2: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    bottom: 40, left: -60, zIndex: 0,
  },
  content: {
    flex: 1, justifyContent: 'center',
    paddingHorizontal: 26, paddingTop: 80, paddingBottom: 40, zIndex: 1,
  },
  backButton: {
    position: 'absolute', top: 52, left: 24,
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  header: { alignItems: 'center', marginBottom: 32 },
  logoWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 24, overflow: 'hidden' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 6, letterSpacing: -0.7 },
  subtitle: { fontSize: 15, fontWeight: '500' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center',
    padding: 13, borderRadius: 14, borderWidth: 1,
    marginBottom: 20, gap: 10,
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  form: { gap: 14, marginBottom: 24 },
  nameRow: { flexDirection: 'row', gap: 10 },
  fieldGroup: { gap: 7 },
  label: { fontSize: 13, fontWeight: '600', letterSpacing: 0.1 },
  hint: { fontSize: 11, fontWeight: '500', marginTop: 4 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 16, height: 54,
    paddingHorizontal: 14, gap: 10,
  },
  input: { flex: 1, fontSize: 15, fontWeight: '500' },
  eyeBtn: { padding: 2 },
  primaryBtn: {
    height: 58, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    flexDirection: 'row', gap: 10,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
  separator: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sepLine: { flex: 1, height: 1 },
  sepText: { fontSize: 13, fontWeight: '500' },
  googleBtn: {
    height: 56, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, borderWidth: 1.5, marginBottom: 20,
  },
  googleIconWrapper: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  gLetter: { fontSize: 20, fontWeight: '800' },
  googleBtnText: { fontSize: 15, fontWeight: '700' },
  termsText: {
    fontSize: 11.5, textAlign: 'center', lineHeight: 17,
    marginBottom: 20, fontWeight: '500',
  },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14, fontWeight: '500' },
  footerLink: { fontSize: 14, fontWeight: '800' },
});
