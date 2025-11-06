/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  Image, 
  StyleSheet, 
  StatusBar as RNStatusBar,
  ViewToken
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import slide1 from '../../assets/images/slide1.png';
import slide2 from '../../assets/images/slide2.png';
import slide3 from '../../assets/images/slide3.png';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Découvre les marques\nstreetwear de Dakar',
    description: 'Explore les créations des meilleurs designers Sénégalais',
    image: slide1,
  },
  {
    id: '2',
    title: 'Suis tes drops\npréférés',
    description: 'Reçois des notifications pour ne jamais rater une collection exclusive',
    image: slide2,
  },
  {
    id: '3',
    title: 'Commande en\nquelques clics',
    description: 'Paiement sécurisé et livraison rapide directement chez toi',
    image: slide3,
  }
];

interface OnboardingScreenProps {
  onFinish: () => Promise<void>;
}

const OnboardingScreen = ({ onFinish }: OnboardingScreenProps) => {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');
  const isSmallDevice = height < 700 || width < 360;

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < onboardingData.length - 1 && slidesRef.current) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinish();
    }
  };

  const handleNavigation = useCallback(async () => {
    if (isNavigating) return;
    
    try {
      setIsNavigating(true);
      console.log('✅ [Onboarding] Terminé, sauvegarde...');
      await AsyncStorage.setItem('@hasSeenOnboarding', 'true');
      console.log('✅ [Onboarding] Sauvegardé');
      
      // Call the parent's onFinish first
      await onFinish();
      
      // Then navigate to login
      console.log('🚀 [Navigation] Push vers /(auth)/login');
      router.push('/(auth)/login');
    } catch (error) {
      console.error('❌ [Onboarding] Erreur sauvegarde:', error);
      // Still try to navigate even if there was an error
      await onFinish();
      router.push('/(auth)/login');
    } finally {
      setIsNavigating(false);
    }
  }, [isNavigating, onFinish, router]);

  const handleSkip = async () => {
    console.log('⏭️ [Onboarding] Skip cliqué');
    await handleNavigation();
  };

  const handleFinish = async () => {
    console.log('✅ [Onboarding] Commencer cliqué');
    await handleNavigation();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <RNStatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Skip Button */}
      {currentIndex < onboardingData.length - 1 && (
        <TouchableOpacity 
          style={[
            styles.skipButton,
            { 
              top: insets.top + 12,
              right: 16,
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }
          ]}
          onPress={handleSkip}
        >
          <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>
            Passer
          </Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={slidesRef}
        data={onboardingData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
        renderItem={({ item, index }) => (
          <View style={[styles.slide, { width }]}> 
            <Image 
              source={item.image} 
              style={[
                styles.image,
                {
                  width: width * 0.82,
                  height: Math.min(width * 0.82, height * 0.45),
                  marginBottom: isSmallDevice ? 20 : 40,
                }
              ]}
            />
            <View style={styles.textContainer}>
              <Text 
                style={[
                  styles.title,
                  { 
                    color: theme.colors.text,
                    fontSize: isSmallDevice ? 22 : 28,
                    lineHeight: isSmallDevice ? 30 : 36,
                    marginBottom: isSmallDevice ? 12 : 16,
                    paddingHorizontal: isSmallDevice ? 10 : 0,
                  }
                ]}
              >
                {item.title}
              </Text>
              <Text style={[
                styles.description,
                { 
                  color: theme.colors.textSecondary,
                  fontSize: isSmallDevice ? 14 : 16,
                  lineHeight: isSmallDevice ? 20 : 24,
                  paddingHorizontal: isSmallDevice ? 10 : 20,
                }
              ]}> 
                {item.description}
              </Text>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Dots */}
      <View style={[styles.dotsContainer, { marginVertical: isSmallDevice ? 16 : 30 }]}>
        {onboardingData.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor: theme.colors.primary,
                }
              ]}
            />
          );
        })}
      </View>

      {/* Next/Get Started Button */}
      <TouchableOpacity
        style={[
          styles.button,
          { 
            backgroundColor: theme.colors.primary,
            height: isSmallDevice ? 50 : 56,
            marginBottom: isSmallDevice ? 20 : 40,
            width: isSmallDevice ? '88%' : '80%'
          }
        ]}
        onPress={scrollTo}
      >
        <Text style={[styles.buttonText, { fontSize: isSmallDevice ? 15 : 16 }]}>
          {currentIndex === onboardingData.length - 1 ? 'Rejoindre la communauté' : 'Suivant'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  skipButton: {
    position: 'absolute',
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  slide: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  image: {
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#007AFF',
  },
  button: {
    width: '80%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;