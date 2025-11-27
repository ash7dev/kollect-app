/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable import/no-duplicates */
import { Tabs, useRouter } from 'expo-router';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../src/store/authStore';
import { useBrandStore } from '../../src/features/brands/store/brandStore';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const TabBarIcon = ({ 
  name, 
  outlineName, 
  color, 
  size, 
  focused 
}: { 
  name: string; 
  outlineName: string; 
  color: string; 
  size: number; 
  focused: boolean;
}) => {
  const scale = useSharedValue(focused ? 1 : 0.9);
  const opacity = useSharedValue(focused ? 1 : 0.7);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 0.9, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(focused ? 1 : 0.7, { duration: 200 });
  }, [focused, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons 
        name={(focused ? name : outlineName) as any} 
        size={size} 
        color={color} 
      />
    </Animated.View>
  );
};

export default function CeoLayout() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { isAuthenticated, token, user, isLoading: isAuthLoading, isInitialized } = useAuthStore();
  const hasMyBrand = useBrandStore((state) => !!state.myBrand);

  // ⚠️ GUARD: Vérifications complètes d'authentification et de rôle
  useEffect(() => {
    // Tant que l'auth n'est pas initialisée ou en cours → ne rien faire (on affiche juste un loader neutre)
    if (!isInitialized || isAuthLoading) {
      return;
    }

    // 1. Utilisateur non authentifié → ne JAMAIS rester dans le layout CEO
    if (!isAuthenticated) {
      console.log('🚫 [CEO Layout] Utilisateur non authentifié - Redirection vers (client)');
      router.replace('/(client)');
      return;
    }

    // 2. État d'auth incohérent (token ou user manquants) → vers login
    if (!token || !user) {
      console.log('🚫 [CEO Layout] État d\'auth incohérent - Redirection vers (auth)/login');
      router.replace('/(auth)/login');
      return;
    }
    
    // 3. Utilisateur authentifié mais pas CEO → forcer vers client
    if (!user.isCEO) {
      console.log('🚫 [CEO Layout] Utilisateur n\'est pas CEO - Redirection vers (client)');
      router.replace('/(client)');
      return;
    }

    // 4. CEO sans marque : on ne redirige pas, mais on reste dans un état contrôlé
    if (user && user.isCEO && !user.brand && !hasMyBrand) {
      console.log('🏪 [CEO Layout] CEO sans marque - Affichage CreateBrandScreen');
      return;
    }
  }, [isAuthenticated, token, user, hasMyBrand, isInitialized, isAuthLoading, router]);

  // Afficher un loader stylisé pendant la vérification ou le chargement
  // Tant qu'on n'a PAS un vrai CEO authentifié, on ne doit pas rendre les Tabs CEO.
  const isLoadingState =
    !isInitialized ||
    isAuthLoading ||
    !isAuthenticated ||
    !token ||
    !user ||
    !user.isCEO;
  
  if (isLoadingState) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Animated.View 
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.colors.card,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <ActivityIndicator 
            size="large" 
            color={theme.colors.primary} 
          />
        </Animated.View>
      </View>
    );
  }

  // ⚠️ CEO sans marque → Afficher CreateBrandScreen
  if (user && user.isCEO && !user.brand && !hasMyBrand) {
    console.log('🏪 [CEO Layout] CEO sans marque - Affichage CreateBrandScreen');
    try {
      const { CreateBrandScreen } = require('../../src/screen/CreateBrandScreen');
      return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <CreateBrandScreen />
        </View>
      );
    } catch (err) {
      console.error('[CEO Layout] CreateBrandScreen import échoué', err);
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
  }

  return (
    <BottomSheetModalProvider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopWidth: 0, // Suppression du trait supérieur
          borderTopColor: 'transparent',
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 8,
          borderTopLeftRadius: 20, // Coins arrondis en haut à gauche
          borderTopRightRadius: 20, // Coins arrondis en haut à droite
          marginTop: -10, // Pour masquer le bord supérieur
          shadowColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 10,
          // Effet de flou pour iOS
          ...Platform.select({
            ios: {
              shadowColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.15)',
              shadowOffset: { width: 0, height: -5 },
              shadowOpacity: 0.3,
              shadowRadius: 15,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="speedometer"
              outlineName="speedometer-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: 'Drops',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="flame"
              outlineName="flame-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
          tabBarBadgeStyle: {
            backgroundColor: 'transparent',
            fontSize: 10,
            top: -2,
            right: -8,
          },
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Produits',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="cube"
              outlineName="cube-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Commandes',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="receipt"
              outlineName="receipt-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="settings"
              outlineName="settings-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
    </BottomSheetModalProvider>
  );
}