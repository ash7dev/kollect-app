/* eslint-disable import/no-duplicates */
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
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
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 8,
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
        }}
      />
      <Tabs.Screen
        name="brands"
        options={{
          title: 'Marques',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="star"
              outlineName="star-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="heart"
              outlineName="heart-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
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