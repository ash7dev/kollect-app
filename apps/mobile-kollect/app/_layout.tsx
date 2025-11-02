// app/_layout.tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/app/context/ThemeContext';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SplashScreen } from '@/src/screen/SplashScreen';
import { KindeAuthProvider, useKindeAuth } from '@kinde/expo';
import { kindeConfig } from '@/src/features/auth/services/kindeConfig';

function RootLayoutContent() {
  const { theme, isDark } = useTheme();
  const { isAuthenticated } = useKindeAuth();
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // ✅ Gérer la redirection automatique basée sur l'état d'authentification
  useEffect(() => {
    if (!isSplashFinished) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedGroup = segments[0] === '(client)' || segments[0] === '(ceo)';

    if (!isAuthenticated && inProtectedGroup) {
      // Utilisateur non connecté essayant d'accéder à une zone protégée
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Utilisateur connecté sur une page d'authentification
      router.replace('/(client)');
    }
  }, [isAuthenticated, segments, isSplashFinished, router]);

  // Afficher le splash screen personnalisé pendant 1500ms
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

export default function RootLayout() {
  return (
    <KindeAuthProvider
    config={{
      domain: kindeConfig.domain,
      clientId: kindeConfig.clientId,
      scopes: kindeConfig.scopes,
    }}
  >
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </KindeAuthProvider>
  );
}

export const unstable_settings = {
  // Route initiale basée sur l'authentification
  initialRouteName: '(auth)',
};