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
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import slide1 from '../../assets/images/slide1.png';
import slide2 from '../../assets/images/slide2.png';
import slide3 from '../../assets/images/slide3.png';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
      console.log('🚀 [Navigation] Redirection vers /(auth)/login');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('❌ [Onboarding] Erreur sauvegarde:', error);
      // Still try to navigate even if there was an error
      await onFinish();
      router.replace('/(auth)/login');
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <RNStatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Skip Button */}
      {currentIndex < onboardingData.length - 1 && (
        <TouchableOpacity 
          style={[styles.skipButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
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
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <Image source={item.image} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
              <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                {item.description}
              </Text>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {onboardingData.map((_, i) => {
          const inputRange = [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH];
          
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
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={scrollTo}
      >
        <Text style={styles.buttonText}>
          {currentIndex === onboardingData.length - 1 ? 'Commencer' : 'Suivant'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
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
    paddingHorizontal: 20,
  },
  image: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    resizeMode: 'contain',
    marginBottom: 40,
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
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;