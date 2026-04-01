import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { View, ActivityIndicator, Pressable } from 'react-native';
import { useEffect } from 'react';
import { useAuthStore } from '../../src/store/authStore';
import { useCartStore } from '../../src/store/cartStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const TAB_CONFIG: Record<string, {
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}> = {
  index:   { activeIcon: 'home',          inactiveIcon: 'home-outline' },
  search:  { activeIcon: 'compass',       inactiveIcon: 'compass-outline' },
  panier:  { activeIcon: 'bag',           inactiveIcon: 'bag-outline' },
  profile: { activeIcon: 'person-circle', inactiveIcon: 'person-circle-outline' },
};

function TabItem({
  route,
  isFocused,
  onPress,
  isDark,
  accent,
  barBg,
}: {
  route: any;
  isFocused: boolean;
  onPress: () => void;
  isDark: boolean;
  accent: string;
  barBg: string;
}) {
  const { theme } = useTheme();
  const config = TAB_CONFIG[route.name] ?? {
    activeIcon: 'ellipse' as const,
    inactiveIcon: 'ellipse-outline' as const,
  };
  const totalCartQty = useCartStore((s) => s.totalQuantity());

  const scale = useSharedValue(1);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pillOpacity = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0, { duration: 200 }),
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.84, { damping: 10, stiffness: 320 }); }}
      onPressOut={() => { scale.value = withSpring(1,    { damping: 12, stiffness: 280 }); }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={[scaleStyle, { alignItems: 'center', justifyContent: 'center' }]}>


        {/* Icon */}
        <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons
            name={isFocused ? config.activeIcon : config.inactiveIcon}
            size={24}
            color={isFocused ? accent : (isDark ? '#555555' : 'rgba(255,255,255,0.6)')}
          />

          {/* Cart badge */}
          {route.name === 'panier' && totalCartQty > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -6,
                minWidth: 15,
                height: 15,
                borderRadius: 8,
                backgroundColor: accent,
                borderWidth: 1.5,
                borderColor: isDark ? '#FFFFFF' : '#000000',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 2,
              }}
            >
              <Animated.Text style={{ color: isDark ? '#FFFFFF' : '#FFFFFF', fontSize: 8, fontWeight: '800', lineHeight: 11 }}>
                {totalCartQty > 9 ? '9+' : totalCartQty}
              </Animated.Text>
            </View>
          )}
        </View>

        {/* Active dot */}
        <Animated.View
          style={[
            {
              marginTop: 5,
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: accent,
            },
            { opacity: withTiming(isFocused ? 1 : 0, { duration: 200 }) },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { isDark, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const accent = theme.colors.accent;

  const barBg = isDark ? 'rgba(15,15,22,0.82)' : 'rgba(255,255,255,0.86)';

  return (
    <View
      style={{
        position: 'absolute',
        bottom: Math.max(insets.bottom + 4, 12),
        left: 28,
        right: 28,
        height: 64,
        borderRadius: 32,
        overflow: 'hidden',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.22 : 0.10,
        shadowRadius: 18,
        elevation: 14,
      }}
    >
      <BlurView
        intensity={isDark ? 95 : 95}
        tint={isDark ? 'light' : 'dark'}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          borderRadius: 32,
          borderWidth: 1.5,
          borderColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
          backgroundColor: isDark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)',
        }}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
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
            <TabItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={onPress}
              isDark={isDark}
              accent={accent}
              barBg={barBg}
            />
          );
        })}
      </BlurView>
    </View>
  );
}

export default function ClientLayout() {
  const { theme } = useTheme();
  const router = useRouter();
  const { isAuthenticated, token, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated && (!token || !user)) {
      router.replace('/(auth)/login');
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
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        lazy: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="panier" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}