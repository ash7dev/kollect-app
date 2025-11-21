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
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface Story {
  id: string;
  brandName: string;
  brandLogo: string;
  coverImage: string;
  type: 'collection' | 'drop' | 'behind-the-scenes';
  viewed?: boolean;
}

interface StoryBannerProps {
  stories: Story[];
  onStoryPress?: (story: Story) => void;
}

export default function StoryBanner({ stories, onStoryPress }: StoryBannerProps) {
  const { theme, isDark } = useTheme();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);

  const handleStoryPress = (story: Story) => {
    setSelectedStory(story);
    setCurrentProgress(0);
    onStoryPress?.(story);
  };

  const closeStory = () => {
    setSelectedStory(null);
    setCurrentProgress(0);
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
              onPress={() => handleStoryPress(story)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  story.viewed
                    ? ['#666', '#999']
                    : ['#8B5CF6', '#EC4899', '#F59E0B']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBorder}
              >
                <View
                  style={[
                    styles.storyImageContainer,
                    { backgroundColor: theme.colors.card },
                  ]}
                >
                  <Image
                    source={{ uri: story.brandLogo }}
                    style={styles.storyImage}
                    contentFit="cover"
                  />
                </View>
              </LinearGradient>
              <Text
                style={[styles.brandName, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {story.brandName}
              </Text>
              {story.type === 'drop' && (
                <View style={[styles.typeBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.typeBadgeText}>DROP</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Story Viewer Modal */}
      <Modal
        visible={!!selectedStory}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeStory}
      >
        {selectedStory && (
          <ImageBackground
            source={{ uri: selectedStory.coverImage }}
            style={styles.storyViewer}
            blurRadius={0}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
              style={styles.overlay}
            >
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${currentProgress}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Header */}
              <View style={styles.storyHeader}>
                <View style={styles.storyHeaderLeft}>
                  <Image
                    source={{ uri: selectedStory.brandLogo }}
                    style={styles.storyHeaderLogo}
                  />
                  <Text style={styles.storyHeaderBrand}>
                    {selectedStory.brandName}
                  </Text>
                </View>
                <TouchableOpacity onPress={closeStory} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.storyActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="heart-outline" size={32} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="paper-plane-outline" size={30} color="white" />
                </TouchableOpacity>
              </View>

              {/* CTA Button */}
              <TouchableOpacity style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>Voir la collection</Text>
                <Ionicons name="arrow-forward" size={20} color="black" />
              </TouchableOpacity>
            </LinearGradient>
          </ImageBackground>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 110,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 12,
    width: 72,
  },
  firstStory: {
    marginLeft: 4,
  },
  gradientBorder: {
    borderRadius: 38,
    padding: 3,
  },
  storyImageContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  typeBadge: {
    position: 'absolute',
    top: 52,
    right: -2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  storyViewer: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  progressContainer: {
    paddingHorizontal: 8,
    paddingTop: 50,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  storyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyHeaderLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  storyHeaderBrand: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  storyActions: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -80 }],
    gap: 24,
  },
  actionButton: {
    padding: 8,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '700',
  },
});