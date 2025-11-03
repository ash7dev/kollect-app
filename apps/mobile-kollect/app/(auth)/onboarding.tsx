import React, { useRef, useState } from 'react';
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
import { useTheme } from '@/app/context/ThemeContext';
import slide1 from '@/assets/images/slide1.png';
import slide2 from '@/assets/images/slide2.png';
import slide3 from '@/assets/images/slide3.png';

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

export default function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const { theme, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const handleSkip = async () => {
    console.log('⏭️ [Onboarding] Skip cliqué');
    await onFinish();
  };

  const handleFinish = async () => {
    console.log('✅ [Onboarding] Commencer cliqué');
    await onFinish();
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
        bounces={false}
        keyExtractor={item => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
        renderItem={({ item, index }) => (
          <OnboardingSlide 
            item={item} 
            index={index} 
            scrollX={scrollX} 
            primaryColor={theme.colors.accent}
            textColor={theme.colors.text}
            secondaryTextColor={theme.colors.textSecondary}
          />
        )}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {onboardingData.map((_, i) => {
            const inputRange = [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH];
            
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp'
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp'
            });

            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  { 
                    width: dotWidth, 
                    opacity,
                    backgroundColor: theme.colors.accent
                  }
                ]}
              />
            );
          })}
        </View>

        {/* CTA Button */}
        <TouchableOpacity 
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary }
          ]}
          onPress={scrollTo}
        >
          <Text style={[styles.buttonText, { color: theme.colors.textDark }]}>
            {currentIndex === onboardingData.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface OnboardingSlideProps {
  item: {
    id: string;
    title: string;
    description: string;
    image: any;
  };
  index: number;
  scrollX: Animated.Value;
  primaryColor: string;
  textColor: string;
  secondaryTextColor: string;
}

function OnboardingSlide({ item, index, scrollX, primaryColor, textColor, secondaryTextColor }: OnboardingSlideProps) {
  const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];

  const imageScale = scrollX.interpolate({
    inputRange,
    outputRange: [0.8, 1, 0.8],
    extrapolate: 'clamp'
  });

  const imageOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp'
  });

  const titleTranslateY = scrollX.interpolate({
    inputRange,
    outputRange: [50, 0, 50],
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.slide}>
      <View style={styles.slideContent}>
        {/* Image avec animation */}
        <Animated.View 
          style={[
            styles.imageContainer,
            { 
              transform: [{ scale: imageScale }],
              opacity: imageOpacity
            }
          ]}
        >
          <Image 
            source={item.image}
            style={styles.image}
            resizeMode="contain"
          />
          
          {/* Badge décoratif avec accent color (rouge) */}
          <View style={[styles.badge, { backgroundColor: primaryColor }]}>
            <Text style={styles.badgeText}>{index + 1}/3</Text>
          </View>
        </Animated.View>

        {/* Texte avec animation */}
        <Animated.View 
          style={[
            styles.textContainer,
            { transform: [{ translateY: titleTranslateY }] }
          ]}
        >
          <Text style={[styles.title, { color: textColor }]}>
            {item.title}
          </Text>
          <Text style={[styles.description, { color: secondaryTextColor }]}>
            {item.description}
          </Text>
        </Animated.View>

        {/* Decoration circles avec accent color */}
        <View style={[styles.circleDecor1, { backgroundColor: `${primaryColor}15` }]} />
        <View style={[styles.circleDecor2, { backgroundColor: `${primaryColor}10` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80
  },
  imageContainer: {
    width: SCREEN_WIDTH * 0.75,
    height: 300,
    marginBottom: 40,
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '110%'
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20
  },
  circleDecor1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -50,
    left: -80,
    opacity: 0.3
  },
  circleDecor2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: 100,
    right: -50,
    opacity: 0.2
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 50,
    paddingTop: 20
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    height: 8
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4
  },
  button: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5
  }
});