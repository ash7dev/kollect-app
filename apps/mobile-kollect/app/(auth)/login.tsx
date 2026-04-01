import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '@/components/ui/Logo';

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const { signInWithEmail, signInWithGoogle, isLoading, error, _setError } = useAuthStore();

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
    if (error) { setLocalError(error); shakeError(); }
  }, [error, shakeError]);

  const handleLogin = async () => {
    setLocalError(null);
    _setError(null);
    if (!email.trim()) { setLocalError('Veuillez entrer votre email'); shakeError(); return; }
    if (!password) { setLocalError('Veuillez entrer votre mot de passe'); shakeError(); return; }
    try {
      await signInWithEmail(email.trim().toLowerCase(), password);
      // Forcer Expo Router à réévaluer le layout avec le nouveau state d'auth
      router.replace('/');
    } catch (err: any) {
      setLocalError(err?.message || 'Email ou mot de passe incorrect');
      shakeError();
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setLocalError(null);
    try {
      await signInWithGoogle();
      // Forcer Expo Router à réévaluer le layout avec le nouveau state d'auth
      router.replace('/');
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
        {/* Décoration de fond */}
        <View style={[styles.bgCircle1, { backgroundColor: `${theme.colors.accent}18` }]} />
        <View style={[styles.bgCircle2, { backgroundColor: `${theme.colors.primary}10` }]} />

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Bouton retour */}
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
            <Logo size={64} />

            <Text style={[styles.title, { color: theme.colors.text }]}>Bon retour !</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Connectez-vous pour continuer
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
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Mot de passe</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                  <Text style={[styles.forgotText, { color: theme.colors.accent }]}>Oublié ?</Text>
                </TouchableOpacity>
              </View>
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
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Bouton connexion */}
          <TouchableOpacity
            style={[styles.primaryBtn, {
              backgroundColor: theme.colors.accent,
              shadowColor: theme.colors.accent,
              opacity: isAnyLoading ? 0.65 : 1,
            }]}
            onPress={handleLogin}
            disabled={isAnyLoading}
            activeOpacity={0.85}
          >
            {isLoading && !googleLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>Se connecter</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Séparateur */}
          <View style={styles.separator}>
            <View style={[styles.sepLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
            <Text style={[styles.sepText, { color: theme.colors.textSecondary }]}>ou continuer avec</Text>
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
                {/* SVG Google à la main via Text — icône native identique */}
                <View style={styles.googleIconWrapper}>
                  <Text style={styles.gLetter}><Text style={{ color: '#EA4335' }}>G</Text></Text>
                </View>
                <Text style={[styles.googleBtnText, { color: theme.colors.text }]}>
                  Continuer avec Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Pas encore de compte ?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.footerLink, { color: theme.colors.accent }]}>S&apos;inscrire</Text>
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
    top: -100, right: -80, zIndex: 0,
  },
  bgCircle2: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    bottom: 0, left: -60, zIndex: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingTop: 80,
    paddingBottom: 40,
    zIndex: 1,
  },
  backButton: {
    position: 'absolute', top: 52, left: 24,
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  header: { alignItems: 'center', marginBottom: 36, gap: 20 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 6, letterSpacing: -0.7 },
  subtitle: { fontSize: 15, fontWeight: '500' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center',
    padding: 13, borderRadius: 14, borderWidth: 1,
    marginBottom: 20, gap: 10,
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  form: { gap: 16, marginBottom: 24 },
  fieldGroup: { gap: 7 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '600', letterSpacing: 0.1 },
  forgotText: { fontSize: 13, fontWeight: '700' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 16, height: 54,
    paddingHorizontal: 16, gap: 12,
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
    gap: 12, borderWidth: 1.5,
    marginBottom: 32,
  },
  googleIconWrapper: {
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
  },
  gLetter: { fontSize: 20, fontWeight: '800' },
  googleBtnText: { fontSize: 15, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14, fontWeight: '500' },
  footerLink: { fontSize: 14, fontWeight: '800' },
});
