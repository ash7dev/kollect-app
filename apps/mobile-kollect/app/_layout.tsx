/* eslint-disable @typescript-eslint/no-require-imports */
// app/_layout.tsx - Version avec SplashScreen personnalisé uniquement
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, useRef, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { KindeAuthProvider } from '@kinde/expo';

// Config local
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { queryClient } from '../src/config/queryClient';
import { useAuthStore } from '../src/store/authStore';
import { CreatorPromptScreen } from '../src/screen/CreatorPromptScreen';
import { kindeConfig } from '../src/features/auth/services/kindeConfig';

// Composants/écrans
import OnboardingScreen from './(auth)/onboarding';
import { SplashScreen } from '../src/screen/SplashScreen/index';

// Firebase utils
import {
  initializeFirebase,
  requestNotificationPermission,
  setupNotifications,
  getNotificationToken,
} from '../firebaseConfig';

// Backend auth service
import { authService } from '../src/features/auth/services/auth.service';

const STORAGE_KEYS = {
  JWT_TOKEN: 'jwt_token',
};

// Notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function RootLayoutContent() {
  const { theme, isDark } = useTheme();

  // États
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  const { isAuthenticated, isLoading, user, initAuth, _setAuth, token } = useAuthStore();

  const initOnceRef = useRef(false);

  // Utility: check onboarding
  const checkOnboarding = useCallback(async (): Promise<boolean> => {
    try {
      const raw = await AsyncStorage.getItem('@hasSeenOnboarding');
      const result = raw === 'true';
      setHasSeenOnboarding(result);
      console.log('[Init] Onboarding status:', result);
      return result;
    } catch (err) {
      console.warn('[Init] checkOnboarding error', err);
      setHasSeenOnboarding(false);
      return false;
    }
  }, []);

  // ============================================
  // INITIALISATION CENTRALISÉE
  // ============================================
  useEffect(() => {
    if (initOnceRef.current) return;
    initOnceRef.current = true;

    const initializeAll = async () => {
      console.log('🚀 [Init] Démarrage initialisation parallèle');

      // 1. Tâches parallèles de base (Firebase, Auth, Onboarding)
      const basicTasks = [
        // Firebase (éviter la configuration notifications sur simulateur)
        (async () => {
          try {
            await initializeFirebase();
            const isPhysicalDevice = (() => {
              try {
                const Device = require('expo-device');
                return !!Device?.isDevice;
              } catch {
                return false;
              }
            })();
            if (isPhysicalDevice) {
              const hasPermission = await requestNotificationPermission();
              if (hasPermission) {
                await setupNotifications();
                const token = await getNotificationToken();
                if (token) console.log('🎯 [Init] FCM token obtenu');
              }
            } else {
              console.log('[Init] Skip notifications setup on iOS Simulator');
            }
            return { name: 'firebase', ok: true };
          } catch (err) {
            console.warn('[Init] Firebase échoué (non-fatal)', err);
            return { name: 'firebase', ok: false, err };
          }
        })(),
        
        // Auth init (hydrate le store depuis SecureStore)
        (async () => {
          try {
            await initAuth();
            return { name: 'auth', ok: true };
          } catch (err) {
            console.warn('[Init] initAuth échoué', err);
            return { name: 'auth', ok: false, err };
          }
        })(),
        
        // Onboarding check
        (async () => {
          try {
            const onboarding = await checkOnboarding();
            return { name: 'onboarding', ok: true, onboarding };
          } catch (err) {
            console.warn('[Init] Onboarding check échoué', err);
            return { name: 'onboarding', ok: false, err };
          }
        })(),
      ];

      await Promise.allSettled(basicTasks);

      // 2. Fetch explicite currentUser SI on a un token
      try {
        const jwtToken = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
        
        if (jwtToken) {
          console.log('[Init] Token détecté, fetch currentUser...');
          
          const fetchedUser = await queryClient.fetchQuery({
            queryKey: ['currentUser'],
            queryFn: async () => {
              const userData = await authService.getUserData();
              console.log('[Init] User fetched:', {
                email: userData?.email,
                isCEO: userData?.isCEO,
                hasBrand: !!userData?.brand,
              });
              return userData;
            },
            staleTime: 0,
            gcTime: 1000 * 60 * 5,
            retry: false,
          });

          const currentStoreUser = useAuthStore.getState().user;
          
          if (fetchedUser) {
            const needsSync = !currentStoreUser || 
                             currentStoreUser.id !== fetchedUser.id ||
                             currentStoreUser.brand !== fetchedUser.brand;
            
            if (needsSync) {
              console.log('[Init] 🔄 Synchronisation user store → backend');
              await _setAuth(fetchedUser, jwtToken);
            } else {
              console.log('[Init] ✅ User déjà à jour dans le store');
            }
          }
        } else {
          console.log('[Init] Pas de token, skip fetch currentUser');
        }
      } catch (err) {
        console.warn('[Init] Fetch currentUser échoué (non-fatal)', err);
      }

      // 3. Marquer comme prêt
      setIsReady(true);
      console.log('✅ [Init] Application PRÊTE');
    };

    initializeAll().catch(err => {
      console.error('[Init] Erreur non gérée', err);
      setHasSeenOnboarding(prev => prev === null ? false : prev);
      setIsReady(true);
    });
  }, [checkOnboarding, initAuth, _setAuth]);

  // ============================================
  // GESTION DU SPLASH PERSONNALISÉ
  // ============================================
  const handleSplashComplete = useCallback(() => {
    console.log('[Splash] Animation terminée');
    // Attendre que l'initialisation soit prête
    if (isReady) {
      setShowCustomSplash(false);
      console.log('👋 [Splash] Splash caché');
    }
  }, [isReady]);

  // Cacher le splash quand l'init est prête ET l'animation est terminée
  useEffect(() => {
    if (isReady && !showCustomSplash) {
      console.log('✅ [Splash] Transition vers l\'app terminée');
    }
  }, [isReady, showCustomSplash]);

  // ============================================
  // LOG CHANGEMENTS USER (DEBUG)
  // ============================================
  useEffect(() => {
    console.log('🎯 [Navigation] État actuel:', {
      isReady,
      hasSeenOnboarding,
      isLoading,
      isAuthenticated,
      hasToken: !!token,
      hasUser: !!user,
      userEmail: user?.email,
      isCEO: user?.isCEO,
      hasBrand: !!user?.brand,
    });
  }, [isReady, hasSeenOnboarding, isLoading, isAuthenticated, token, user]);

  // ============================================
  // RENDU CONDITIONNEL
  // ============================================

  // 1. Splash personnalisé (toujours affiché en premier)
  if (showCustomSplash) {
    return <SplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  // 2. Loader si pas prêt
  if (!isReady || hasSeenOnboarding === null || isLoading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // 3. Onboarding
  if (hasSeenOnboarding === false) {
    return (
      <OnboardingScreen
        onFinish={async () => {
          try {
            await AsyncStorage.setItem('@hasSeenOnboarding', 'true');
            setHasSeenOnboarding(true);
            console.log('✅ [Onboarding] Complété');
          } catch (err) {
            console.error('[Onboarding] Erreur sauvegarde', err);
          }
        }}
      />
    );
  }

  // 4. Non authentifié → Stack Auth (geste retour désactivé)
  if (!isAuthenticated || !token) {
    return (
      <>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
            gestureEnabled: false,
          }}
          initialRouteName="(auth)"
        >
          <Stack.Screen name="(auth)" />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </>
    );
  }

  // 5. Authentifié mais user pas chargé (défensif)
  if (isAuthenticated && !user) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // 6. CreatorPrompt (sélection de rôle)
  if (isAuthenticated && token && user && user.has_seen_creator_prompt === false) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <CreatorPromptScreen />
      </View>
    );
  }

  // 7. CEO sans marque → CreateBrand
  if (isAuthenticated && token && user && user.isCEO && !user.brand) {
    try {
      const { CreateBrandScreen } = require('../src/screen/CreateBrandScreen');
      return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <CreateBrandScreen />
        </View>
      );
    } catch (err) {
      console.error('[Layout] CreateBrandScreen import échoué', err);
      return (
        <>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
          </Stack>
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </>
      );
    }
  }

  // 8. CEO avec marque → Stack CEO
  if (isAuthenticated && token && user?.isCEO && !!user?.brand) {
    return (
      <>
        <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
          <Stack.Screen name="(ceo)" />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </>
    );
  }

  // 9. Client par défaut → Stack Client (geste retour désactivé)
  return (
    <>
      <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
        <Stack.Screen name="(client)" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

function ThemedApp() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <KindeAuthProvider
      config={{
        domain: kindeConfig.domain,
        clientId: kindeConfig.clientId,
        scopes: kindeConfig.scopes,
      }}
      // @ts-expect-error: tokenStorage prop is supported at runtime by @kinde/expo
      tokenStorage={{
        getItem: SecureStore.getItemAsync,
        setItem: SecureStore.setItemAsync,
        removeItem: SecureStore.deleteItemAsync,
      }}
      callbacks={{}}
    >
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemedApp />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </KindeAuthProvider>
  );
}

export const unstable_settings = {
  initialRouteName: '(auth)',
};