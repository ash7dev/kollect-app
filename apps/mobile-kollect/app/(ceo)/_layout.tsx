import { Tabs, useRouter } from 'expo-router';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { View, ActivityIndicator, Pressable } from 'react-native';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../src/store/authStore';
import { useBrandStore } from '../../src/features/brands/store/brandStore';
import { CreateBrandScreen } from '../../src/screen/CreateBrandScreen';
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
  index:       { activeIcon: 'grid',           inactiveIcon: 'grid-outline' },
  collections: { activeIcon: 'flame',          inactiveIcon: 'flame-outline' },
  products:    { activeIcon: 'cube',           inactiveIcon: 'cube-outline' },
  orders:      { activeIcon: 'receipt',        inactiveIcon: 'receipt-outline' },
  settings:    { activeIcon: 'settings-sharp', inactiveIcon: 'settings-outline' },
};

function TabItem({
  route,
  isFocused,
  onPress,
  isDark,
  accent,
}: {
  route: any;
  isFocused: boolean;
  onPress: () => void;
  isDark: boolean;
  accent: string;
}) {
  const { theme } = useTheme();
  const config = TAB_CONFIG[route.name] ?? {
    activeIcon: 'ellipse' as const,
    inactiveIcon: 'ellipse-outline' as const,
  };

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
            size={22}
            color={isFocused ? accent : (isDark ? '#555555' : 'rgba(255,255,255,0.6)')}
          />
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
        bottom: Math.max(insets.bottom + 12, 28),
        left: 22,
        right: 22,
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
          paddingHorizontal: 6,
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
            />
          );
        })}
      </BlurView>
    </View>
  );
}

export default function CeoLayout() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { isAuthenticated, token, user, isLoading: isAuthLoading, isInitialized } = useAuthStore();
  const hasMyBrand = useBrandStore((state) => !!state.myBrand);

  useEffect(() => {
    if (!isInitialized || isAuthLoading) return;
    if (!isAuthenticated) { router.replace('/(client)'); return; }
    if (!token || !user)  { router.replace('/(auth)/login'); return; }
    if (!user.isCEO)      { router.replace('/(client)'); return; }
  }, [isAuthenticated, token, user, hasMyBrand, isInitialized, isAuthLoading, router]);

  const isLoadingState = !isInitialized || isAuthLoading || !isAuthenticated || !token || !user || !user.isCEO;

  if (isLoadingState) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.View style={{
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: theme.colors.card,
          justifyContent: 'center', alignItems: 'center',
          shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
        }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </Animated.View>
      </View>
    );
  }

  if (user.isCEO && !user.brand && !hasMyBrand) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <CreateBrandScreen />
      </View>
    );
  }

  return (
    <BottomSheetModalProvider>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: 'shift',
          lazy: false,
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="collections" />
        <Tabs.Screen name="products" />
        <Tabs.Screen name="orders" />
        <Tabs.Screen name="settings" />
      </Tabs>
    </BottomSheetModalProvider>
  );
}