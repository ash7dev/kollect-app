/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable import/no-duplicates */
import { Tabs, useRouter } from 'expo-router';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Platform } from 'react-native';
import { useEffect, useState } from 'react';
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
  const { isAuthenticated, token, user, isLoading: isAuthLoading } = useAuthStore();
  const hasMyBrand = useBrandStore((state) => !!state.myBrand);
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  // Simuler un chargement d'application
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 1500); // Temps de chargement simulé
    
    return () => clearTimeout(timer);
  }, []);

  // ⚠️ GUARD: Vérifications complètes d'authentification et de rôle
  useEffect(() => {
    if (!isAppLoading) {
      // 1. Vérifier l'authentification
      if (!isAuthenticated || !token || !user) {
        console.log('🚫 [CEO Layout] Utilisateur non authentifié - Redirection vers (auth)/login');
        router.replace('/(auth)/login');
        return;
      }
      
      // 2. Vérifier si l'utilisateur est CEO
      if (!user.isCEO) {
        console.log('🚫 [CEO Layout] Utilisateur n\'est pas CEO - Redirection vers (client)');
        router.replace('/(client)');
        return;
      }
      
      // 3. Vérifier si CEO a une marque (depuis user OU store) - sinon afficher CreateBrand
      if (user.isCEO && !user.brand && !hasMyBrand) {
        console.log('🚫 [CEO Layout] CEO sans marque - Redirection vers CreateBrand');
        // Note: On ne peut pas naviguer vers une route qui n'est pas dans le Stack
        // On va plutôt afficher CreateBrandScreen directement
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token, user, hasMyBrand, isAppLoading]);

  // Afficher un loader stylisé pendant la vérification ou le chargement
  const isLoadingState = isAuthLoading || !isAuthenticated || !token || !user || !user.isCEO || isAppLoading;
  
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
  if (user.isCEO && !user.brand && !hasMyBrand) {
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