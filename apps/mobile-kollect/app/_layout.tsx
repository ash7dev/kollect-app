/* eslint-disable import/no-unresolved */
// app/_layout.tsx - VERSION AMÉLIORÉE AVEC SPLASH OBLIGATOIRE
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/app/context/ThemeContext';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
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

// React Query
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/src/config/queryClient';

// Zustand Auth Store
import { useAuthStore } from '@/src/store/authStore';



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

// ============================================
// Composant principal avec logique
// ============================================
function RootLayoutContent() {
  const { theme, isDark } = useTheme();
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // 🆕 Nouvel état
  const router = useRouter();
  const segments = useSegments();

  // 🆕 Zustand store - Sélecteurs optimisés
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const initAuth = useAuthStore((state) => state.initAuth);

  // ============================================
  // 1. Initialiser l'authentification Zustand
  // ============================================
  useEffect(() => {
    const initialize = async () => {
      console.log('🔐 [Layout] Initialisation de l\'auth store...');
      await initAuth();
      setIsInitialized(true); // 🆕 Marquer comme initialisé
      console.log('✅ [Layout] Initialisation terminée');
    };

    initialize();
  }, [initAuth]);

  // ============================================
  // 2. Initialiser Firebase et notifications
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
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🎯 TOKEN FCM REÇU:');
            console.log(token);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            // TODO: Envoyer le token à votre backend
            // await authService.sendFCMToken(token);
          } else {
            console.log('⚠️ [Firebase] Aucun token reçu');
          }
        } else {
          console.log('⚠️ [Firebase] Permissions non accordées');
        }
      } catch (error) {
        console.error('❌ [Firebase] Erreur d\'initialisation:', error);
      }
    };

    initFirebase();
  }, []);

  // ============================================
  // 3. Gérer la navigation automatique
  // ============================================
  useEffect(() => {
    // 🆕 IMPORTANT : Attendre que le splash soit terminé ET que l'auth soit initialisée
    if (!isSplashFinished || !isInitialized || isLoading) {
      console.log('⏳ [Navigation] En attente...', { 
        isSplashFinished,
        isInitialized,
        isLoading 
      });
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedGroup = segments[0] === '(client)' || segments[0] === '(ceo)';

    console.log('🧭 [Navigation] État actuel:', {
      segment: segments[0],
      isAuthenticated,
      inAuthGroup,
      inProtectedGroup,
      userRoles: user ? {
        isAdmin: user.isAdmin,
        isCEO: user.isCEO,
        isClient: user.isClient,
      } : null,
    });

    // Redirection si non authentifié et dans une zone protégée
    if (!isAuthenticated && inProtectedGroup) {
      console.log('🔒 [Navigation] Redirection vers login (non authentifié)');
      router.replace('/(auth)/login');
      return;
    }
   // Vérifier si l'utilisateur est dans une zone protégée sans les droits
if (isAuthenticated && inProtectedGroup) {
  const currentSegment = segments[0];
  
  // Vérifier les droits d'accès
  if (currentSegment === '(ceo)' && !user?.isAdmin && !user?.isCEO) {
    console.log('🚫 Accès non autorisé à (ceo), redirection vers (client)');
    router.replace('/(client)');
    return;
  }
  
  if (currentSegment === '(ceo)' && !user?.isAdmin) {
    console.log('🚫 Accès non autorisé à (admin), redirection vers (client)');
    router.replace('/(client)');
    return;
  }
}
   // Redirection si authentifié et dans la zone auth
if (isAuthenticated && inAuthGroup) {
  console.log('✅ [Navigation] Utilisateur authentifié, redirection...');
  
  if (user?.isAdmin) {
    console.log('👑 [Navigation] Redirection vers (ceo)');
    router.replace('/(ceo)');
  } else if (user?.isCEO) {
    console.log('👑 [Navigation] Redirection vers (ceo)');
    router.replace('/(ceo)');
  } else {
    console.log('👤 [Navigation] Redirection vers (client)');
    router.replace('/(client)');
  }
  return;
}


  
  }, [
    isAuthenticated,
    user,
    segments, 
    isSplashFinished,
    isInitialized, // 🆕 Ajouté dans les dépendances
    isLoading, 
    router
  ]);

  // ============================================
  // 🆕 Affichage du Splash Screen OBLIGATOIRE
  // ============================================
  // Le splash s'affiche TOUJOURS au démarrage, peu importe l'état
  if (!isSplashFinished) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <SplashScreen 
          onAnimationComplete={() => {
            console.log('🎬 [Splash] Animation terminée');
            setIsSplashFinished(true);
          }} 
        />
      </View>
    );
  }

  // ============================================
  // 🆕 Écran de chargement après le splash (optionnel)
  // ============================================
  // Si l'initialisation n'est pas terminée, on peut afficher un loader simple
  if (!isInitialized) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {/* Vous pouvez ajouter un ActivityIndicator ici si vous voulez */}
        {/* <ActivityIndicator size="large" color={theme.colors.primary} /> */}
      </View>
    );
  }

  // ============================================
  // Navigation principale
  // ============================================
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

// ============================================
// Wrapper avec Theme
// ============================================
function ThemedApp() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}

// ============================================
// Root Layout avec tous les providers
// ============================================
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