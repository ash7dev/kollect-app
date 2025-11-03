import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/app/context/ThemeContext';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SplashScreen } from '@/src/screen/SplashScreen';
import { KindeAuthProvider, useKindeAuth } from '@kinde/expo';
import * as SecureStore from 'expo-secure-store';
import { kindeConfig } from '@/src/features/auth/services/kindeConfig';
import { initializeFirebase, requestNotificationPermission, setupNotifications, getNotificationToken } from '@/firebaseConfig';
import * as Notifications from 'expo-notifications';

// Configurer le gestionnaire de notifications pour iOS/Android
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
  const { isAuthenticated } = useKindeAuth();
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Initialize Firebase and setup notifications - UNE SEULE FOIS
  useEffect(() => {
    const initFirebase = async () => {
      try {
        console.log('🚀 Démarrage de l\'initialisation...');
        
        await initializeFirebase();
        
        const hasPermission = await requestNotificationPermission();
        
        if (hasPermission) {
          await setupNotifications();
          const token = await getNotificationToken();
          
          if (token) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🎯 TOKEN REÇU DANS LAYOUT:');
            console.log(token);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            // TODO: Envoyer le token à votre backend ici
            // await sendTokenToBackend(token);
          } else {
            console.log('⚠️ Aucun token reçu');
          }
        } else {
          console.log('⚠️ Permissions non accordées, impossible de récupérer le token');
        }
      } catch (error) {
        console.error('❌ Error initializing Firebase:', error);
      }
    };

    initFirebase();
  }, []); // Exécuté UNE SEULE FOIS au montage

  // Gérer la redirection automatique basée sur l'état d'authentification
  useEffect(() => {
    if (!isSplashFinished) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedGroup = segments[0] === '(client)' || segments[0] === '(ceo)';

    if (!isAuthenticated && inProtectedGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(client)');
    }
  }, [isAuthenticated, segments, isSplashFinished, router]);

  if (!isSplashFinished) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <SplashScreen onAnimationComplete={() => {
          setIsSplashFinished(true);
        }} />
      </View>
    );
  }

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
      callbacks={{
        // This is a workaround for v0.5.2
        // The actual storage is handled by expo-secure-store internally
        // when using @kinde/expo
      }}
    >
      <ThemedApp />
    </KindeAuthProvider>
  );
}

export const unstable_settings = {
  initialRouteName: '(auth)',
};