import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Platform, 
  UIManager, 
  ImageBackground,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.5;
const SPACING = 16;

// Activer les animations pour Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  theme: {
    colors: {
      text: string;
      background: string;
      borderLight: string;
      primary: string;
      card: string;
      overlay: string;
    };
  };
  coverImage?: string | null;
  brandLogo?: string | null;
  brandName?: string;
  status?: string;
  viewCount?: number;
  productCount?: number;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}

export const HorizontalAccordionCard: React.FC<AccordionItemProps> = ({
  title,
  children,
  theme,
  coverImage,
  brandLogo,
  brandName,
  status,
  viewCount,
  productCount,
  isExpanded,
  onToggle,
  index,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentHeight = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Run non-native animations first (height)
    const heightAnim = Animated.spring(contentHeight, {
      toValue: isExpanded ? 1 : 0,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    });

    // Run native animations in parallel
    const nativeAnimations = Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isExpanded ? 1.02 : 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(contentOpacity, {
        toValue: isExpanded ? 1 : 0,
        duration: isExpanded ? 400 : 200,
        delay: isExpanded ? 200 : 0,
        useNativeDriver: true,
      })
    ]);

    // Start animations in sequence to avoid conflicts
    Animated.sequence([
      Animated.delay(10), // Small delay to ensure proper initialization
      Animated.parallel([
        heightAnim,
        nativeAnimations
      ])
    ]).start();
  }, [contentHeight, contentOpacity, isExpanded, scaleAnim]);

  const getStatusColor = () => {
    switch (status) {
      case 'DISPONIBLE': return '#4CAF50';
      case 'TEASER': return '#FFA000';
      case 'EPUISEE': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'DISPONIBLE': return 'Disponible';
      case 'TEASER': return 'Bientôt';
      case 'EPUISEE': return 'Épuisé';
      default: return 'Terminé';
    }
  };

  const cardHeight = contentHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [CARD_HEIGHT * 0.6, CARD_HEIGHT]
  });

  return (
    <Animated.View 
      style={[
        styles.cardContainer,
        {
          width: isExpanded ? SCREEN_WIDTH * 0.95 : CARD_WIDTH,
          height: cardHeight,
          transform: [{ scale: scaleAnim }],
          marginRight: isExpanded ? 0 : SPACING,
        }
      ]}
    >
      <TouchableOpacity 
        activeOpacity={0.95}
        onPress={onToggle}
        style={styles.card}
        disabled={isExpanded}
      >
        <ImageBackground
          source={{ uri: coverImage || 'https://via.placeholder.com/400x300' }}
          style={styles.cardBackground}
          imageStyle={styles.cardImage}
        >
          {/* Overlay gradient */}
          <View style={styles.gradientOverlay}>
            {/* Header section */}
            <View style={styles.cardHeader}>
              <View style={styles.brandContainer}>
                {brandLogo && (
                  <Image 
                    source={{ uri: brandLogo }} 
                    style={styles.brandLogo} 
                    contentFit="cover"
                  />
                )}
                <View style={styles.brandInfo}>
                  <Text style={styles.brandName}>{brandName || 'Marque'}</Text>
                  {status && (
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                      <Text style={styles.statusText}>{getStatusText()}</Text>
                    </View>
                  )}
                </View>
              </View>
              
              {isExpanded && (
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={onToggle}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              )}
            </View>

            {/* Title section */}
            <View style={styles.titleSection}>
              <Text style={styles.cardTitle} numberOfLines={isExpanded ? undefined : 2}>
                {title}
              </Text>
              
              {!isExpanded && (
                <View style={styles.statsRow}>
                  {viewCount !== undefined && (
                    <View style={styles.stat}>
                      <Ionicons name="eye" size={14} color="white" />
                      <Text style={styles.statText}>{viewCount}</Text>
                    </View>
                  )}
                  {productCount !== undefined && (
                    <View style={styles.stat}>
                      <Ionicons name="shirt" size={14} color="white" />
                      <Text style={styles.statText}>{productCount}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Expand indicator */}
            {!isExpanded && (
              <View style={styles.expandIndicator}>
                <Ionicons name="chevron-forward" size={20} color="white" />
                <Text style={styles.expandText}>Voir plus</Text>
              </View>
            )}
          </View>
        </ImageBackground>
      </TouchableOpacity>

      {/* Expanded content */}
      {isExpanded && (
        <Animated.View 
          style={[
            styles.expandedContent,
            { opacity: contentOpacity }
          ]}
        >
          <ScrollView 
            style={styles.contentScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.detailsSection}>
              {viewCount !== undefined && (
                <View style={styles.detailStat}>
                  <Ionicons name="eye" size={18} color={theme.colors.primary} />
                  <Text style={[styles.detailStatText, { color: theme.colors.text }]}>
                    {viewCount} vues
                  </Text>
                </View>
              )}
              {productCount !== undefined && (
                <View style={styles.detailStat}>
                  <Ionicons name="shirt" size={18} color={theme.colors.primary} />
                  <Text style={[styles.detailStatText, { color: theme.colors.text }]}>
                    {productCount} produits
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.childrenContainer}>
              {children}
            </View>
          </ScrollView>
        </Animated.View>
      )}
    </Animated.View>
  );
};

interface AccordionEffetProps {
  items: {
    id: string;
    title: string;
    content: React.ReactNode;
    coverImage?: string | null;
    brandLogo?: string | null;
    brandName?: string;
    status?: string;
    viewCount?: number;
    productCount?: number;
  }[];
  theme: {
    colors: {
      text: string;
      background: string;
      borderLight: string;
      primary: string;
      card: string;
      overlay: string;
    };
  };
}

const AccordionEffet: React.FC<AccordionEffetProps> = ({ items, theme }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleToggle = (id: string, index: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      // Scroll to the expanded card
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: index * (CARD_WIDTH + SPACING) - SPACING,
          animated: true,
        });
      }, 100);
    }
  };

  return (
    <View style={styles.accordionContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={expandedId ? undefined : CARD_WIDTH + SPACING}
        decelerationRate="fast"
        scrollEnabled={!expandedId}
      >
        {items.map((item, index) => (
          <HorizontalAccordionCard
            key={item.id}
            title={item.title}
            theme={theme}
            coverImage={item.coverImage}
            brandLogo={item.brandLogo}
            brandName={item.brandName}
            status={item.status}
            viewCount={item.viewCount}
            productCount={item.productCount}
            isExpanded={expandedId === item.id}
            onToggle={() => handleToggle(item.id, index)}
            index={index}
          >
            {item.content}
          </HorizontalAccordionCard>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  accordionContainer: {
    width: '100%',
    marginVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: SPACING,
    paddingVertical: 8,
  },
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  card: {
    flex: 1,
    overflow: 'hidden',
  },
  cardBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cardImage: {
    borderRadius: 20,
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    padding: 4,
    marginRight: 12,
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  titleSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 8,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  expandIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 12,
    gap: 6,
  },
  expandText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  expandedContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  detailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  detailStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailStatText: {
    fontSize: 15,
    fontWeight: '600',
  },
  childrenContainer: {
    padding: 20,
  },
});

export default AccordionEffet;