import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Linking,
  Animated,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';
import { useSuiviStore } from '../../features/suivi/store/suiviStore';
import { Video, ResizeMode } from 'expo-av';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { ShareButton } from '../ui/ShareButton';
import { ShareService, ShareType } from '../../features/share/services/share.service';

const { width } = Dimensions.get('window');

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  coverImage: string;
  teaserVideo?: string;
  description: string;
  stats: {
    followers: number;
    collections: number;
    products: number;
  };
  tags: string[];
  verified?: boolean;
  isFollowing?: boolean;
  instagram?: string;
  website?: string;
  whatsapp?: string;
}

interface BrandSpotlightProps {
  brand: Brand;
  onFollow?: () => void;
  onVisit?: () => void;
  showSocialLinks?: boolean;
  scrollY?: Animated.Value;
}

export default function BrandSpotlight({
  brand,
  onFollow,
  onVisit,
  showSocialLinks,
  scrollY,
}: BrandSpotlightProps) {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [following, setFollowing] = useState(brand.isFollowing || false);
  const {
    followingBrands,
    brandFollowersCount,
    fetchBrandFollowState,
    followBrand,
    unfollowBrand,
  } = useSuiviStore();

  const storeFollowing = followingBrands[brand.id];
  const isFollowing = storeFollowing ?? following;
  const followersCount = brandFollowersCount[brand.id] ?? brand.stats.followers;

  useEffect(() => {
    void fetchBrandFollowState(brand.id);
  }, [brand.id, fetchBrandFollowState]);

  const handleFollow = () => {
    // Si l'utilisateur n'est pas connecté, on lui propose d'abord de se connecter
    if (!user) {
      Alert.alert(
        'Connexion requise',
        "Connecte-toi pour suivre ce créateur et voir ses nouveautés.",
        [
          { text: 'Plus tard', style: 'cancel' },
          {
            text: 'Se connecter',
            onPress: () => router.push('/(auth)/login?redirect=/(client)'),
          },
        ],
      );
      return;
    }

    const next = !isFollowing;
    setFollowing(next);
    if (next) {
      void followBrand(brand.id);
    } else {
      void unfollowBrand(brand.id);
    }
    onFollow?.();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const handleOpenInstagram = async () => {
    if (!brand.instagram) return;
    const username = brand.instagram.replace('@', '').trim();
    const url = `https://instagram.com/${username}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('Instagram indisponible', "Impossible d'ouvrir ce profil Instagram sur cet appareil.");
        return;
      }

      await Linking.openURL(url);
    } catch (err) {
      console.warn('[BrandSpotlight] Error opening Instagram URL', err);
      Alert.alert('Erreur', "Impossible d'ouvrir Instagram pour le moment.");
    }
  };

  const handleOpenWebsite = async () => {
    if (!brand.website) return;
    const hasProtocol = brand.website.startsWith('http://') || brand.website.startsWith('https://');
    const url = hasProtocol ? brand.website : `https://${brand.website}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('Site indisponible', "Impossible d'ouvrir ce site sur cet appareil.");
        return;
      }

      await Linking.openURL(url);
    } catch (err) {
      console.warn('[BrandSpotlight] Error opening website URL', err);
      Alert.alert('Erreur', "Impossible d'ouvrir le site pour le moment.");
    }
  };

  const handleOpenWhatsApp = async () => {
    if (!brand.whatsapp) return;
    const phone = brand.whatsapp.replace(/\s+/g, '');
    const url = `https://wa.me/${phone}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('WhatsApp indisponible', "Impossible d'ouvrir WhatsApp sur cet appareil.");
        return;
      }

      await Linking.openURL(url);
    } catch (err) {
      console.warn('[BrandSpotlight] Error opening WhatsApp URL', err);
      Alert.alert('Erreur', "Impossible d'ouvrir WhatsApp pour le moment.");
    }
  };

  // Parallax effect sur cover
  const coverTranslateY = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 300],
        outputRange: [0, -80],
        extrapolate: 'clamp',
      })
    : undefined;

  const coverAnimatedStyle =
    scrollY && coverTranslateY
      ? {
          transform: [{ translateY: coverTranslateY }],
        }
      : undefined;

  const hasVideo = brand.teaserVideo || brand.coverImage?.includes('.mp4');

  // 🔥 Couleurs dynamiques pour le mode sombre
  const dynamicStyles = {
    logoBorder: isDark ? theme.colors.surfaceDark : '#FFFFFF',
    statsBorder: theme.colors.divider,
    gradientColors: isDark 
      ? ['transparent', 'rgba(0,0,0,0.95)'] as const
      : ['transparent', 'rgba(0,0,0,0.7)'] as const,
    verifiedBadgeBg: isDark ? theme.colors.surfaceDark : 'rgba(255,255,255,0.95)',
    tagBg: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.surface,
    tagBorder: isDark ? 'rgba(255,255,255,0.15)' : theme.colors.borderLight,
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.card,
          // 🔥 Ombres adaptatives
          shadowColor: isDark ? '#000' : '#000',
          shadowOpacity: isDark ? 0.5 : 0.15,
        }
      ]}
    >
      {/* Cover Image/Video avec Parallax */}
      <View style={styles.coverContainer}>
        <Animated.View
          style={[
            styles.coverWrapper,
            coverAnimatedStyle,
          ]}
        >
          {hasVideo ? (
            <Video
              source={{ uri: brand.teaserVideo || brand.coverImage }}
              style={styles.coverVideo}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted
            />
          ) : (
            <Image
              source={{ uri: brand.coverImage }}
              style={styles.coverImage}
              contentFit="cover"
            />
          )}
        </Animated.View>
        
        {/* 🔥 Gradient adaptatif */}
        <LinearGradient
          colors={dynamicStyles.gradientColors}
          style={styles.coverGradient}
        />
        
        {/* Verified Badge */}
        {brand.verified && (
          <View 
            style={[
              styles.verifiedBadge,
              { backgroundColor: dynamicStyles.verifiedBadgeBg }
            ]}
          >
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
          </View>
        )}
      </View>

      {/* Brand Info */}
      <View style={styles.infoContainer}>
        {/* Logo - 🔥 Border adaptatif */}
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: brand.logo }} 
            style={[
              styles.logo,
              { borderColor: dynamicStyles.logoBorder }
            ]} 
          />
        </View>

        {/* Brand Name & Description */}
        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={[styles.brandName, { color: theme.colors.text }]}>
              {brand.name}
            </Text>
            {brand.verified && (
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            )}
          </View>
          <Text
            style={[styles.description, { color: theme.colors.textSecondary }]}
            numberOfLines={3}
          >
            {brand.description}
          </Text>
        </View>

        {showSocialLinks && (brand.instagram || brand.website || brand.whatsapp) && (
          <View style={styles.socialRow}>
            {brand.instagram && (
              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: '#E1306C' }]}
                activeOpacity={0.8}
                onPress={handleOpenInstagram}
              >
                <Ionicons name="logo-instagram" size={16} color="#FFF" />
                <Text style={styles.socialButtonText}>Instagram</Text>
              </TouchableOpacity>
            )}
            {brand.website && (
              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: theme.colors.primary }]}
                activeOpacity={0.8}
                onPress={handleOpenWebsite}
              >
                <Ionicons name="globe-outline" size={16} color="#FFF" />
                <Text style={styles.socialButtonText}>Site web</Text>
              </TouchableOpacity>
            )}
            {brand.whatsapp && (
              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: '#25D366' }]}
                activeOpacity={0.8}
                onPress={handleOpenWhatsApp}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#FFF" />
                <Text style={styles.socialButtonText}>WhatsApp</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tags - 🔥 Couleurs adaptatives */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsScroll}
          contentContainerStyle={styles.tagsContainer}
        >
          {brand.tags.map((tag, index) => (
            <View
              key={index}
              style={[
                styles.tag,
                {
                  backgroundColor: dynamicStyles.tagBg,
                  borderColor: dynamicStyles.tagBorder,
                },
              ]}
            >
              <Text style={[styles.tagText, { color: theme.colors.accent }]}>
                #{tag}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Stats - 🔥 Border adaptatif */}
        <View 
          style={[
            styles.statsContainer,
            { borderColor: dynamicStyles.statsBorder }
          ]}
        >
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {formatNumber(followersCount)}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              Abonnés
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: theme.colors.divider }]}
          />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {brand.stats.collections}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              Collections
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: theme.colors.divider }]}
          />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {brand.stats.products}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              Produits
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <ShareButton
            data={{
              type: ShareType.BRAND,
              id: brand.id,
              name: brand.name,
              brandName: brand.name,
              imageUrl: brand.logo,
              description: brand.description,
              stats: {
                followerCount: followersCount,
                productCount: brand.stats.products,
              },
            }}
            size="medium"
            style={styles.shareButton}
          />
          
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing && styles.followingButton,
              {
                backgroundColor: isFollowing
                  ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')
                  : theme.colors.accent,
                borderColor: isFollowing ? theme.colors.accent : 'transparent',
              },
            ]}
            onPress={handleFollow}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFollowing ? 'checkmark' : 'add'}
              size={18}
              color={isFollowing ? theme.colors.accent : '#FFFFFF'}
            />
            <Text
              style={[
                styles.followButtonText,
                {
                  color: isFollowing ? theme.colors.accent : '#FFFFFF',
                },
              ]}
            >
              {isFollowing ? 'Abonné' : "S'abonner"}
            </Text>
          </TouchableOpacity>

          {onVisit && (
            <TouchableOpacity
              style={[
                styles.visitButton,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : theme.colors.surface,
                  borderColor: isDark 
                    ? 'rgba(255,255,255,0.15)' 
                    : theme.colors.borderLight,
                },
              ]}
              onPress={onVisit}
              activeOpacity={0.8}
            >
              <Text style={[styles.visitButtonText, { color: theme.colors.text }]}>
                Visiter
              </Text>
              <Ionicons name="arrow-forward" size={18} color={theme.colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 5,
  },
  coverContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  coverWrapper: {
    width: '100%',
    height: '120%',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverVideo: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderRadius: 20,
    padding: 4,
  },
  infoContainer: {
    padding: 20,
  },
  logoContainer: {
    marginTop: -50,
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 4,
  },
  textContainer: {
    marginBottom: 16,
  },
  socialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 6,
  },
  socialButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  tagsScroll: {
    marginBottom: 20,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  tagsContainer: {
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    opacity: 0.3,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    marginRight: 4,
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  followingButton: {
    borderWidth: 1.5,
  },
  followButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  visitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  visitButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});