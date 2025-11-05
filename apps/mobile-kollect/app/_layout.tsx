/* eslint-disable @typescript-eslint/no-require-imports */
// app/_layout.tsx - Version optimisée avec fetch intelligent
import { SplashScreen as ExpoSplash, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, useRef, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
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

// --- Timing
const TIMING = {
  SPLASH_MIN: 800,
};

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

ExpoSplash.preventAutoHideAsync();

function RootLayoutContent() {
  const { theme, isDark } = useTheme();

  // États
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [splashAnimationDone, setSplashAnimationDone] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  const { isAuthenticated, isLoading, user, initAuth, _setAuth ,token} = useAuthStore();

  const initOnceRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);

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
    startTimeRef.current = Date.now();

    const initializeAll = async () => {
      console.log('🚀 [Init] Démarrage initialisation parallèle');

      // 1. Tâches parallèles de base (Firebase, Auth, Onboarding)
      const basicTasks = [
        // Firebase
        (async () => {
          try {
            await initializeFirebase();
            const hasPermission = await requestNotificationPermission();
            if (hasPermission) {
              await setupNotifications();
              const token = await getNotificationToken();
              if (token) console.log('🎯 [Init] FCM token obtenu');
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
      // Ceci garantit qu'on a la version la plus fraîche du backend
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
            staleTime: 0, // Fresh fetch pour init
            gcTime: 1000 * 60 * 5, // Cache 5 min
            retry: false,
          });

          // Vérifier si on doit hydrater le store
          const currentStoreUser = useAuthStore.getState().user;
          
          if (fetchedUser) {
            // Si le store n'a pas de user OU si le user est différent
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
        // Continue quand même - l'app peut fonctionner avec le user du store
      }

      // 3. Garantir temps minimum de splash
      const elapsed = Date.now() - (startTimeRef.current || Date.now());
      const remaining = Math.max(0, TIMING.SPLASH_MIN - elapsed);
      if (remaining > 0) {
        console.log(`⏱️ [Init] Attente ${remaining}ms pour splash minimum`);
        await new Promise(res => setTimeout(res, remaining));
      }

      // 4. Marquer comme prêt
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
  // GESTION DU SPLASH
  // ============================================
  useEffect(() => {
    const tryHideSplash = async () => {
      if (!splashAnimationDone || !isReady) return;

      try {
        await ExpoSplash.hideAsync();
      } catch (err) {
        console.warn('[Splash] hideAsync échoué', err);
      }
      
      setShowCustomSplash(false);
      console.log('👋 [Splash] Splash caché');
    };

    tryHideSplash();
  }, [splashAnimationDone, isReady]);

  // ============================================
  // LOG CHANGEMENTS USER (DEBUG)
  // ============================================
  // DEBUG: Log l'état complet avant chaque décision de navigation
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
  // PAS DE FORCAGE NAVIGATION - Le Stack avec initialRouteName devrait suffire
  // ============================================

  // ============================================
  // RENDU CONDITIONNEL
  // ============================================

  // 1. Splash personnalisé
  if (showCustomSplash) {
    return (
      <SplashScreen
        onAnimationComplete={() => {
          console.log('[Splash] Animation terminée');
          setSplashAnimationDone(true);
        }}
      />
    );
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

  // 4. Non authentifié → Stack Auth
  console.log('🔍 [Layout] Vérification condition 4 - Non authentifié:', {
    isAuthenticated,
    hasToken: !!token,
    condition: !isAuthenticated || !token,
  });
  if (!isAuthenticated || !token) {
    console.log('✅ [Layout] Condition 4 VRAIE - Retour Stack Auth');
    return (
      <>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
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
  console.log('🔍 [Layout] Vérification condition 5 - User pas chargé:', {
    isAuthenticated,
    hasUser: !!user,
    condition: isAuthenticated && !user,
  });
  if (isAuthenticated && !user) {
    console.log('✅ [Layout] Condition 5 VRAIE - Retour Loader');
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
  // ⚠️ IMPORTANT: Vérifier isAuthenticated ET token avant de vérifier user
  console.log('🔍 [Layout] Vérification condition 6 - CreatorPrompt:', {
    isAuthenticated,
    hasToken: !!token,
    hasUser: !!user,
    hasSeenPrompt: user?.has_seen_creator_prompt,
    condition: isAuthenticated && token && user && user.has_seen_creator_prompt === false,
  });
  if (isAuthenticated && token && user && user.has_seen_creator_prompt === false) {
    console.log('✅ [Layout] Condition 6 VRAIE - Retour CreatorPrompt');
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <CreatorPromptScreen />
      </View>
    );
  }

  // 7. CEO sans marque → CreateBrand
  // ⚠️ IMPORTANT: Vérifier isAuthenticated ET token avant de vérifier user.isCEO
  console.log('🔍 [Layout] Vérification condition 7 - CEO sans marque:', {
    isAuthenticated,
    hasToken: !!token,
    hasUser: !!user,
    isCEO: user?.isCEO,
    hasBrand: !!user?.brand,
    condition: isAuthenticated && token && user && user.isCEO && !user.brand,
  });
  if (isAuthenticated && token && user && user.isCEO && !user.brand) {
    console.log('✅ [Layout] Condition 7 VRAIE - Retour CreateBrand');
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
      // Fallback: ne PAS naviguer vers CEO si erreur, retourner vers Auth
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
  console.log('🔍 [Layout] Vérification condition 8 - CEO avec marque:', {
    isAuthenticated,
    hasToken: !!token,
    hasUser: !!user,
    isCEO: user?.isCEO,
    hasBrand: !!user?.brand,
    condition: isAuthenticated && token && user?.isCEO && !!user?.brand,
  });
  if (isAuthenticated && token && user?.isCEO && !!user?.brand) {
    console.log('✅ [Layout] Condition 8 VRAIE - Retour Stack CEO');
    console.log('✅ [User] CEO avec marque:', {
      email: user.email,
      isCEO: user.isCEO,
      hasBrand: !!user.brand,
    });
    return (
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(ceo)" />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </>
    );
  }

  // 9. Client par défaut → Stack Client
  console.log('✅ [Layout] Aucune condition CEO/Prompt - Retour Stack Client (défaut)');
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
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
      callbacks={{}}
    >
      <QueryClientProvider client={queryClient}>
        <ThemedApp />
      </QueryClientProvider>
    </KindeAuthProvider>
  );
}

export const unstable_settings = {
  initialRouteName: '(auth)',
};