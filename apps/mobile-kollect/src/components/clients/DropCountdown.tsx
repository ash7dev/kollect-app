import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';
import { Video, ResizeMode } from 'expo-av';

const { width } = Dimensions.get('window');

interface DropCountdownProps {
  collectionId: string;
  collectionName: string;
  brandName: string;
  brandLogo: string;
  coverImage: string;
  teaserVideo?: string;
  launchDate: Date;
  onNotifyMe?: () => void;
  onPreview?: () => void;
  isNotified?: boolean;
}

export default function DropCountdown({
  collectionName,
  brandName,
  brandLogo,
  coverImage,
  teaserVideo,
  launchDate,
  onNotifyMe,
  onPreview,
  isNotified = false,
}: DropCountdownProps) {
  const { theme, isDark } = useTheme();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [notified, setNotified] = useState(isNotified);
  
  // Génération aléatoire du nombre de personnes intéressées (1K - 6K)
  const [hypeCount] = useState(() => Math.floor(Math.random() * 5000) + 1000);
  
  // Animation pulse pour le countdown
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    // Animation pulse en boucle
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    startPulse();

    return () => clearInterval(timer);
  }, [launchDate, pulseAnim]);

  const handleNotify = () => {
    setNotified(!notified);
    onNotifyMe?.();
  };

  const formatHypeCount = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const hasVideo = teaserVideo || coverImage?.includes('.mp4');

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.95}
      onPress={onPreview}
    >
      {/* Cover Image/Video */}
      {hasVideo ? (
        <Video
          source={{ uri: teaserVideo || coverImage }}
          style={styles.coverMedia}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
        />
      ) : (
        <Image
          source={{ uri: coverImage }}
          style={styles.coverMedia}
          contentFit="cover"
        />
      )}
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)']}
        style={styles.gradient}
      >
        {/* Drop Badge */}
        <View style={styles.dropBadge}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dropBadgeGradient}
          >
            <Ionicons name="flash" size={16} color="white" />
            <Text style={styles.dropBadgeText}>DROP IMMINENT</Text>
          </LinearGradient>
        </View>

        {/* Brand Info */}
        <View style={styles.brandInfo}>
          <Image source={{ uri: brandLogo }} style={styles.brandLogo} />
          <View style={styles.brandTextContainer}>
            <Text style={styles.brandName}>{brandName}</Text>
            <Text style={styles.collectionName} numberOfLines={2}>
              {collectionName}
            </Text>
          </View>
        </View>

        {/* Countdown avec animation pulse */}
        <Animated.View 
          style={[
            styles.countdown,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>{timeLeft.days}</Text>
            <Text style={styles.countdownLabel}>JOURS</Text>
          </View>
          <Text style={styles.countdownSeparator}>:</Text>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>
              {String(timeLeft.hours).padStart(2, '0')}
            </Text>
            <Text style={styles.countdownLabel}>HEURES</Text>
          </View>
          <Text style={styles.countdownSeparator}>:</Text>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>
              {String(timeLeft.minutes).padStart(2, '0')}
            </Text>
            <Text style={styles.countdownLabel}>MIN</Text>
          </View>
          <Text style={styles.countdownSeparator}>:</Text>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>
              {String(timeLeft.seconds).padStart(2, '0')}
            </Text>
            <Text style={styles.countdownLabel}>SEC</Text>
          </View>
        </Animated.View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[
              styles.notifyButton,
              notified && styles.notifyButtonActive,
            ]}
            onPress={handleNotify}
          >
            <Ionicons
              name={notified ? 'notifications' : 'notifications-outline'}
              size={20}
              color={notified ? 'white' : '#8B5CF6'}
            />
            <Text
              style={[
                styles.notifyButtonText,
                notified && styles.notifyButtonTextActive,
              ]}
            >
              {notified ? 'Notifié' : 'Me notifier'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.previewButton} onPress={onPreview}>
            <Text style={styles.previewButtonText}>Aperçu</Text>
            <Ionicons name="arrow-forward" size={18} color="black" />
          </TouchableOpacity>
        </View>

        {/* Hype Indicator avec compteur aléatoire */}
        <View style={styles.hypeContainer}>
          <View style={styles.hypeIcons}>
            <Ionicons name="flame" size={16} color="#FF3B30" />
            <Text style={styles.hypeText}>
              {formatHypeCount(hypeCount)} personnes intéressées
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    height: 520,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  coverMedia: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  dropBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    overflow: 'hidden',
  },
  dropBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  dropBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
  brandTextContainer: {
    flex: 1,
  },
  brandName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
    marginBottom: 4,
  },
  collectionName: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  countdownItem: {
    alignItems: 'center',
  },
  countdownNumber: {
    color: 'white',
    fontSize: 32,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  countdownLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 4,
  },
  countdownSeparator: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    opacity: 0.5,
    marginBottom: 16,
  },
  ctaContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  notifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  notifyButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  notifyButtonText: {
    color: '#8B5CF6',
    fontSize: 15,
    fontWeight: '700',
  },
  notifyButtonTextActive: {
    color: 'white',
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  previewButtonText: {
    color: 'black',
    fontSize: 15,
    fontWeight: '700',
  },
  hypeContainer: {
    alignItems: 'center',
  },
  hypeIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hypeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
});