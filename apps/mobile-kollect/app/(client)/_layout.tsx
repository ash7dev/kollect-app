/* eslint-disable import/no-duplicates */
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { useCartStore } from '../../src/store/cartStore';
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

export default function ClientLayout() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { isAuthenticated, token, user, isLoading } = useAuthStore();
  const totalCartQty = useCartStore((s) => s.totalQuantity());

  // ⚠️ GUARD: Empêcher l'accès au layout Client si l'utilisateur n'est pas authentifié ou n'est pas client
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !token || !user) {
        console.log('🚫 [Client Layout] Utilisateur non authentifié - Redirection vers (auth)/login');
        router.replace('/(auth)/login');
        return;
      }
      // Si l'utilisateur est CEO, le laisser dans le layout CEO (pas de redirection ici)
      // Le guard CEO gérera sa propre redirection
    }
  }, [isAuthenticated, token, user, isLoading, router]);

  // Afficher un loader pendant la vérification
  if (isLoading || !isAuthenticated || !token || !user) {
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

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#ffffff' : theme.colors.text,
        tabBarInactiveTintColor: isDark ? '#b0b0b0' : theme.colors.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: Platform.OS === 'ios' ? 72 : 64,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: isDark
            ? 'rgba(15,15,15,0.98)'
            : 'rgba(255,255,255,0.98)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.12,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
          letterSpacing: 0.3,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="home"
              outlineName="home-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="search"
              outlineName="search-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="panier"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="cart"
              outlineName="cart-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
          // Badge synchronisé avec le contenu du panier
          tabBarBadge: totalCartQty > 0 ? String(totalCartQty) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.accent,
            color: '#FFFFFF',
            fontSize: 10,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            lineHeight: 16,
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="person"
              outlineName="person-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}