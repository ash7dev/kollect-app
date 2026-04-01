import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  ImageBackground,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';

const { width } = Dimensions.get('window');

export interface StoryItem {
  id: string; // Product id
  coverImage: string;
}

export interface Story {
  id: string; // Brand id
  brandName: string;
  brandSlug?: string;
  brandLogo: string;
  items: StoryItem[];
  type: 'collection' | 'drop' | 'behind-the-scenes';
  viewed?: boolean;
}

interface StoryBannerProps {
  stories: Story[];
  onStoryPress?: (story: Story) => void;
  onCtaPress?: (story: Story, item: StoryItem) => void;
}

export default function StoryBanner({ stories, onStoryPress, onCtaPress }: StoryBannerProps) {
  const { theme, isDark } = useTheme();
  // We now track which brand story is active, and which item inside that brand
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;
  const activeItem = activeStory && activeStory.items.length > 0 ? activeStory.items[activeItemIndex] : null;

  const handleStoryPress = (index: number) => {
    setActiveStoryIndex(index);
    setActiveItemIndex(0);
    onStoryPress?.(stories[index]);
  };

  const closeStory = () => {
    setActiveStoryIndex(null);
    setActiveItemIndex(0);
  };

  const handleNext = () => {
    if (activeStoryIndex === null || !activeStory) return;
    if (activeItemIndex < activeStory.items.length - 1) {
      setActiveItemIndex((prev) => (prev ?? 0) + 1);
    } else if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex((prev) => (prev ?? 0) + 1);
      setActiveItemIndex(0);
    } else {
      closeStory();
    }
  };

  const handlePrev = () => {
    if (activeStoryIndex === null || !activeStory) return;
    if (activeItemIndex > 0) {
      setActiveItemIndex((prev) => (prev ?? 0) - 1);
    } else if (activeStoryIndex > 0) {
      setActiveStoryIndex((prev) => (prev ?? 0) - 1);
      setActiveItemIndex(stories[activeStoryIndex - 1].items.length - 1);
    } else {
      setActiveItemIndex(0);
    }
  };

  const handleCtaPress = () => {
    if (activeStory && activeItem && onCtaPress) {
      onCtaPress(activeStory, activeItem);
      closeStory();
    }
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {stories.map((story, index) => (
            <TouchableOpacity
              key={story.id}
              style={[styles.storyItem, index === 0 && styles.firstStory]}
              onPress={() => handleStoryPress(index)}
              activeOpacity={0.8}
            >
              {/* Le cerceau avec le gradient */}
              <LinearGradient
                colors={
                  story.viewed
                    ? [isDark ? '#333333' : '#E5E5E5', isDark ? '#1F1F1F' : '#CCCCCC']
                    : ['#FF3B30', '#F59E0B', '#EC4899'] // Accent dynamique et gradient premium
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBorder}
              >
                {/* L'espace intérieur créant une marge (Instagram style) */}
                <View style={[styles.innerSpacing, { backgroundColor: theme.colors.background }]}>
                  {/* L'image finale */}
                  <Image
                    source={{ uri: story.brandLogo }}
                    style={styles.storyImage}
                    contentFit="cover"
                  />
                </View>
              </LinearGradient>

              {/* Nom de la marque */}
              <Text
                style={[styles.brandName, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {story.brandName}
              </Text>
              
              {/* Badge Drop repensé */}
              {story.type === 'drop' && !story.viewed && (
                <View style={[styles.typeBadge, { backgroundColor: '#FF3B30' }]}>
                  <Text style={styles.typeBadgeText}>DROP</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Modal
        visible={activeStoryIndex !== null}
        animationType="fade" // Pour l'instant on garde fade, slide-up serait sympa mais demande plus de setup
        statusBarTranslucent
        onRequestClose={closeStory}
      >
        {activeStory && activeItem && (
          <View style={{ flex: 1, backgroundColor: 'black' }}>
            <ImageBackground
              source={{ uri: activeItem.coverImage }}
              style={styles.storyViewer}
              blurRadius={0}
            >
              {/* Un dégradé très subtil pour assombrir le haut et le bas */}
              <LinearGradient
                colors={['rgba(0,0,0,0.5)', 'transparent', 'transparent', 'rgba(0,0,0,0.85)']}
                locations={[0, 0.2, 0.6, 1]}
                style={styles.overlay}
              >
                {/* Zones de navigation tactiles invisibles */}
                <View style={StyleSheet.absoluteFill}>
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={handlePrev} activeOpacity={1} />
                    <TouchableOpacity style={{ flex: 2 }} onPress={handleNext} activeOpacity={1} />
                  </View>
                </View>

                {/* --- HEADER PROTEGE DU CLIC --- */}
                <View pointerEvents="box-none" style={styles.headerContainer}>
                  {/* Barres de progression ultra slim */}
                  <View style={styles.progressContainer}>
                    {activeStory.items.map((_, i) => (
                      <View key={i} style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: i < activeItemIndex ? '100%' : (i === activeItemIndex ? '100%' : '0%'),
                            },
                          ]}
                        />
                      </View>
                    ))}
                  </View>

                  <View style={styles.storyHeader}>
                    <View style={styles.storyHeaderLeft}>
                      <Image
                        source={{ uri: activeStory.brandLogo }}
                        style={styles.storyHeaderLogo}
                      />
                      <Text style={styles.storyHeaderBrand}>
                        {activeStory.brandName}
                      </Text>
                      {activeStory.type === 'drop' && (
                        <View style={styles.headerDropBadge}>
                          <Text style={styles.headerDropBadgeText}>LIVE</Text>
                        </View>
                      )}
                    </View>
                    
                    {/* Bouton pour fermer avec effet Glassmorphism léger */}
                    <TouchableOpacity onPress={closeStory} style={styles.closeButtonContainer} activeOpacity={0.7}>
                      <BlurView tint="dark" intensity={50} style={styles.closeButtonBlur}>
                        <Ionicons name="close" size={24} color="white" />
                      </BlurView>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* --- FOOTER CTA ET ACTIONS PROTEGES DU CLIC --- */}
                <View pointerEvents="box-none" style={styles.footerContainer}>
                  
                  {/* Actions verticales de droite */}
                  <View style={styles.storyActions}>
                    <TouchableOpacity style={styles.actionButtonContainer} activeOpacity={0.7}>
                      <BlurView tint="dark" intensity={30} style={styles.actionButtonBlur}>
                        <Ionicons name="heart-outline" size={26} color="white" />
                      </BlurView>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonContainer} activeOpacity={0.7}>
                      <BlurView tint="dark" intensity={30} style={styles.actionButtonBlur}>
                        <Ionicons name="paper-plane-outline" size={26} color="white" style={{ position: 'relative', left: -1 }} />
                      </BlurView>
                    </TouchableOpacity>
                  </View>

                  {/* Bouton Call to action premium */}
                  <TouchableOpacity style={styles.ctaButtonWrapper} activeOpacity={0.9} onPress={handleCtaPress}>
                    <BlurView
                      intensity={80}
                      tint="light" // "light" tint crée l'effet vitre blanchie
                      style={styles.ctaButton}
                    >
                      <Text style={styles.ctaButtonText}>Voir la collection</Text>
                      <View style={styles.ctaButtonIcon}>
                        <Ionicons name="chevron-forward" size={16} color="white" />
                      </View>
                    </BlurView>
                  </TouchableOpacity>

                </View>

              </LinearGradient>
            </ImageBackground>
          </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120, // Plus d'espace pour le design premium
    marginBottom: 10,
    marginTop: 5,
  },
  scrollContent: {
    paddingHorizontal: 16, // Laisse respirer un poil plus sur les bords
    alignItems: 'center',
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 76,
  },
  firstStory: {
    marginLeft: 0,
  },
  gradientBorder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerSpacing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyImage: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1, // Minuscule border interne pour couper net l'image
    borderColor: 'rgba(0,0,0,0.05)',
  },
  brandName: {
    fontSize: 12,
    fontFamily: 'Outfit-Medium',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  typeBadge: {
    position: 'absolute',
    bottom: 24,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 9,
    fontFamily: 'Outfit-Bold',
    letterSpacing: 0.5,
  },
  
  // --- STORY VIEWER ---
  storyViewer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 14,
  },
  progressBar: {
    flex: 1,
    height: 2.5, // Encore plus fin, plus esthétique
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2, // Pour donner un léger halo brillant
  },
  
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  storyHeaderLogo: {
    width: 36, // Légerement réduit pour paraitre moins lourd
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  storyHeaderBrand: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'Outfit-Bold',
    marginLeft: 10,
    letterSpacing: -0.3,
  },
  headerDropBadge: {
    marginLeft: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  headerDropBadgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Outfit-Bold',
    letterSpacing: 0.5,
  },
  closeButtonContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerContainer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingHorizontal: 16,
  },
  storyActions: {
    alignItems: 'flex-end',
    gap: 16,
    marginBottom: 20,
    paddingRight: 4, // Décolle les icônes légèrement du bord droit
  },
  actionButtonContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionButtonBlur: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonWrapper: {
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18, // Plus massif mais soft
    paddingHorizontal: 24,
  },
  ctaButtonText: {
    color: 'black', // Texte sombre pour l'effet light blur
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
    letterSpacing: -0.2,
  },
  ctaButtonIcon: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 1, // Pour recentrer le chevron visuellement
  },
});