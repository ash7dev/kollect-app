import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Platform, View, ActivityIndicator, Pressable, Text } from 'react-native';
import { useEffect } from 'react';
import { useAuthStore } from '../../src/store/authStore';
import { useCartStore } from '../../src/store/cartStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { 
  LinearTransition,
  FadeInRight,
  FadeOutRight,
} from 'react-native-reanimated';

// Mapping local des icônes pour la custom tab bar
const TAB_CONFIG: Record<string, { label: string, activeIcon: keyof typeof Ionicons.glyphMap, inactiveIcon: keyof typeof Ionicons.glyphMap }> = {
  index: { label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
  search: { label: 'Explorer', activeIcon: 'search', inactiveIcon: 'search-outline' },
  panier: { label: 'Panier', activeIcon: 'cart', inactiveIcon: 'cart-outline' },
  profile: { label: 'Profil', activeIcon: 'person', inactiveIcon: 'person-outline' },
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const totalCartQty = useCartStore((s) => s.totalQuantity());

  // Couleurs dynamiques selon le mode
  const pillBg = isDark ? '#000000' : '#FFFFFF';
  const inactiveIconColor = isDark ? '#636366' : '#8E8E93';

  return (
    <View style={{
      position: 'absolute',
      bottom: Math.max(insets.bottom + 8, 24),
      left: 20,
      right: 20,
      height: 60,
      backgroundColor: pillBg,
      borderRadius: 30,
      flexDirection: 'row',
      alignItems: 'center',
      // PAS de justifyContent: chaque item a flex:1 → distribution parfaitement égale
      paddingHorizontal: 6,
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? 'transparent' : 'rgba(0,0,0,0.08)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: isDark ? 12 : 6 },
      shadowOpacity: isDark ? 0.45 : 0.12,
      shadowRadius: isDark ? 20 : 12,
      elevation: isDark ? 16 : 8,
    }}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name] || { label: route.name, activeIcon: 'ellipse', inactiveIcon: 'ellipse-outline' };

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          // flex:1 sur TOUS les items → largeur de base identique pour chacun
          <Pressable 
            key={route.key} 
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Animated.View
              layout={LinearTransition.springify().damping(18).stiffness(180)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isFocused ? theme.colors.accent : 'transparent',
                paddingVertical: 9,
                paddingHorizontal: isFocused ? 18 : 0,
                borderRadius: 22,
                gap: 6,
                // L'actif prend toute la largeur disponible de sa cellule flex:1
                alignSelf: isFocused ? 'stretch' : 'center',
              }}
            >
              <View>
                <Ionicons 
                  name={isFocused ? config.activeIcon : config.inactiveIcon} 
                  size={22} 
                  color={isFocused ? '#FFFFFF' : inactiveIconColor} 
                />
                {!isFocused && route.name === 'panier' && totalCartQty > 0 && (
                  <View style={{
                    position: 'absolute',
                    top: -2,
                    right: -4,
                    width: 9,
                    height: 9,
                    borderRadius: 5,
                    backgroundColor: theme.colors.accent,
                    borderWidth: 1.5,
                    borderColor: pillBg,
                  }} />
                )}
              </View>
              {isFocused && (
                <Animated.Text 
                  entering={FadeInRight.duration(180).delay(40)}
                  exiting={FadeOutRight.duration(120)}
                  style={{
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: '700',
                    letterSpacing: 0.2,
                  }}
                  numberOfLines={1}
                >
                  {config.label}
                </Animated.Text>
              )}
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function ClientLayout() {
  const { theme } = useTheme();
  const router = useRouter();
  const { isAuthenticated, token, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && (!token || !user)) {
        console.log('🚫 [Client Layout] État d\'auth incohérent - Redirection vers (auth)/login');
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, token, user, isLoading, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Tabs 
      tabBar={(props) => <CustomTabBar {...props} />} 
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="panier" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}