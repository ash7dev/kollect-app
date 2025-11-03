// app/_layout.tsx - VERSION AVEC DÉLAIS MINIMUM
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/app/context/ThemeContext';
import { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from '@/app/(auth)/onboarding';
import { SplashScreen } from '@/src/screen/SplashScreen';
import { KindeAuthProvider } from '@kinde/expo';
import { kindeConfig } from '@/src/features/auth/services/kindeConfig';
import { 
  initializeFirebase, 
  requestNotificationPermission, 
  setupNotifications, 
  getNotificationToken 
} from '@/firebaseConfig';
import * as Notifications from 'expo-notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/src/config/queryClient';
import { useAuthStore } from '@/src/store/authStore';

// ⏱️ CONFIGURATION DES DÉLAIS (en millisecondes)
const TIMING = {
  SPLASH_MIN: 2000,        // Splash minimum 2 secondes
  LOADING_MIN: 800,        // Chargement minimum 0.8 secondes
  NAVIGATION_DELAY: 100,   // Délai avant navigation
  TRANSITION_BUFFER: 300,  // Buffer après navigation
};

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let globalSplashShown = false;

function RootLayoutContent() {
  const { theme, isDark } = useTheme();
  const [isSplashFinished, setIsSplashFinished] = useState(globalSplashShown);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  
  const router = useRouter();
  const segments = useSegments();
  
  const hasInitializedRef = useRef(false);
  const navigationAttempted = useRef(false);
  const loadingStartTime = useRef<number | null>(null);
  const splashStartTime = useRef<number>(Date.now());

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const initAuth = useAuthStore((state) => state.initAuth);

  // ============================================
  // Utilitaire pour attendre un délai minimum
  // ============================================
  const waitMinimumTime = async (startTime: number, minimumMs: number) => {
    const elapsed = Date.now() - startTime;
    const remaining = minimumMs - elapsed;
    
    if (remaining > 0) {
      console.log(`⏱️ [Timing] Attente de ${remaining}ms pour atteindre le minimum de ${minimumMs}ms`);
      await new Promise(resolve => setTimeout(resolve, remaining));
    }
  };

  // ============================================
  // 1. Initialiser l'authentification
  // ============================================
  useEffect(() => {
    if (hasInitializedRef.current) return;
    
    const initialize = async () => {
      console.log('🔐 [Layout] Initialisation de l\'auth store...');
      loadingStartTime.current = Date.now();
      
      await initAuth();
      
      // Attendre le délai minimum avant de marquer comme initialisé
      await waitMinimumTime(loadingStartTime.current, TIMING.LOADING_MIN);
      
      setIsInitialized(true);
      hasInitializedRef.current = true;
      console.log('✅ [Layout] Initialisation terminée');
    };

    initialize();
  }, [initAuth]);

  // ============================================
  // 2. Initialiser Firebase
  // ============================================
  useEffect(() => {
    const initFirebase = async () => {
      try {
        console.log('🚀 [Firebase] Démarrage de l\'initialisation...');
        await initializeFirebase();
        const hasPermission = await requestNotificationPermission();
        
        if (hasPermission) {
          await setupNotifications();
          const token = await getNotificationToken();
          if (token) {
            console.log('🎯 TOKEN FCM:', token);
          }
        }
      } catch (error) {
        console.error('❌ [Firebase] Erreur:', error);
      }
    };

    if (!hasInitializedRef.current) {
      initFirebase();
    }
  }, []);

  // ============================================
  // 3. Vérifier le statut onboarding
  // ============================================
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem('@hasSeenOnboarding');
        console.log('📱 [Onboarding] Statut:', hasSeen);
        setHasSeenOnboarding(hasSeen === 'true');
      } catch (error) {
        console.error('❌ [Onboarding] Erreur:', error);
        setHasSeenOnboarding(false);
      }
    };

    checkOnboarding();
  }, []);

  // ============================================
  // 4. Gérer la navigation automatique
  // ============================================
  useEffect(() => {
    if (!isSplashFinished || !isInitialized || hasSeenOnboarding === null || isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedGroup = segments[0] === '(client)' || segments[0] === '(ceo)';

    if (!hasSeenOnboarding) {
      return;
    }

    const navigateSafely = async (path: string, reason: string) => {
      if (navigationAttempted.current) return;
      
      navigationAttempted.current = true;
      setIsNavigating(true);
      setShowLoadingScreen(true);
      
      const navStartTime = Date.now();
      console.log(`🚀 [Navigation] ${reason} → ${path}`);
      
      // Attendre le délai de navigation
      await new Promise(resolve => setTimeout(resolve, TIMING.NAVIGATION_DELAY));
      
      router.replace(path as any);
      
      // Attendre le délai minimum de chargement
      await waitMinimumTime(navStartTime, TIMING.LOADING_MIN);
      
      // Buffer de transition
      await new Promise(resolve => setTimeout(resolve, TIMING.TRANSITION_BUFFER));
      
      setIsNavigating(false);
      setShowLoadingScreen(false);
      navigationAttempted.current = false;
    };

    // Logique de navigation inchangée
    if (!isAuthenticated && inProtectedGroup) {
      navigateSafely('/(auth)/login', 'Non authentifié');
      return;
    }

    if (isAuthenticated && inProtectedGroup) {
      if (!user) return;
      
      if (segments[0] === '(ceo)' && !user.isAdmin && !user.isCEO) {
        navigateSafely('/(client)', 'Accès CEO refusé');
        return;
      }
    }

    if (isAuthenticated && inAuthGroup) {
      if (!user) return;
      
      if (user.isAdmin || user.isCEO) {
        navigateSafely('/(ceo)', 'Utilisateur CEO/Admin');
      } else {
        navigateSafely('/(client)', 'Utilisateur Client');
      }
      return;
    }

    if (navigationAttempted.current) {
      setTimeout(() => {
        navigationAttempted.current = false;
      }, 500);
    }
  }, [
    isSplashFinished,
    isInitialized,
    hasSeenOnboarding,
    isAuthenticated,
    isLoading,
    user,
    segments,
    router
  ]);

  // ============================================
  // Vérifier si on peut afficher le contenu
  // ============================================
  const canRenderContent = () => {
    if (!isInitialized || isLoading || hasSeenOnboarding === null) {
      return false;
    }

    if (isNavigating || showLoadingScreen) {
      return false;
    }

    const inProtectedGroup = segments[0] === '(client)' || segments[0] === '(ceo)';
    
    if (inProtectedGroup && !isAuthenticated) {
      return false;
    }

    if (isAuthenticated && inProtectedGroup && !user) {
      return false;
    }

    if (isAuthenticated && segments[0] === '(ceo)' && user && !user.isAdmin && !user.isCEO) {
      return false;
    }

    return true;
  };

  // ============================================
  // Affichage conditionnel
  // ============================================
  
  // 1. Splash Screen avec délai minimum
  if (!isSplashFinished) {
    return (
      <SplashScreen 
        onAnimationComplete={async () => {
          // Attendre le délai minimum du splash
          await waitMinimumTime(splashStartTime.current, TIMING.SPLASH_MIN);
          
          setIsSplashFinished(true);
          globalSplashShown = true;
          console.log('✅ [Splash] Terminé après délai minimum');
        }} 
      />
    );
  }

  // 2. Onboarding
  if (hasSeenOnboarding === false) {
    return (
      <OnboardingScreen 
        onFinish={async () => {
          try {
            console.log('✅ [Onboarding] Terminé, sauvegarde...');
            await AsyncStorage.setItem('@hasSeenOnboarding', 'true');
            setHasSeenOnboarding(true);
            console.log('✅ [Onboarding] Sauvegardé');
          } catch (error) {
            console.error('❌ [Onboarding] Erreur sauvegarde:', error);
          }
        }} 
      />
    );
  }

  // 3. Écran de chargement avec minimum garanti
  if (!canRenderContent()) {
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

  // 4. Navigation principale
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.card,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen 
          name="(auth)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="(ceo)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="(client)" 
          options={{ headerShown: false }} 
        />
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