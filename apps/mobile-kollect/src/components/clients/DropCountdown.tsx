/* eslint-disable @typescript-eslint/no-unused-vars */
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
  isActive?: boolean;
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
  isActive = true,
}: DropCountdownProps) {
  const { theme, isDark } = useTheme();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [notified, setNotified] = useState(isNotified);
  const [hypeCount] = useState(() => Math.floor(Math.random() * 5000) + 1000);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const videoRef = useRef<Video>(null);
  const [muted, setMuted] = useState(false);

  // 🔥 Couleurs dynamiques
  const colors = {
    // Card
    cardShadow: isDark ? 0.6 : 0.2,
    
    // Gradient overlay
    gradient: isDark
      ? ['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.98)'] as const
      : ['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.92)'] as const,
    
    // Countdown items background
    countdownBg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',
    countdownBorder: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.2)',
    
    // Buttons
    notifyBg: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.98)',
    notifyActiveBg: '#8B5CF6',
    previewBg: '#FFFFFF',
    
    // Hype
    hypeBg: isDark ? 'rgba(255,59,48,0.15)' : 'rgba(255,59,48,0.1)',
  };

  // Détermine si on a une vidéo à jouer
  const hasVideo = !!teaserVideo;
  const mediaSource = hasVideo ? teaserVideo : coverImage;

  // Pause / play automatique de la vidéo selon l'état de l'écran
  useEffect(() => {
    if (!hasVideo || !videoRef.current) return;
    if (isActive) {
      void videoRef.current.playAsync().catch(() => undefined);
    } else {
      void videoRef.current.pauseAsync().catch(() => undefined);
    }
  }, [hasVideo, isActive]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;
      if (distance < 0) { clearInterval(timer); return; }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    return () => clearInterval(timer);
  }, [launchDate, pulseAnim]);

  const handleNotify = () => {
    setNotified(!notified);
    onNotifyMe?.();
  };

  const formatHypeCount = (num: number) => num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num.toString();

  return (
    <TouchableOpacity
      style={[styles.container, { shadowOpacity: colors.cardShadow }]}
      activeOpacity={0.97}
      onPress={onPreview}
    >
      <View style={styles.mediaContainer}>
        {/* Cover Media - Video autoplay ou Image */}
        {hasVideo ? (
          <Video
            ref={videoRef}
            source={{ uri: mediaSource }}
            style={styles.coverMedia}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted={muted || !isActive}
            volume={muted || !isActive ? 0 : 1}
            posterSource={{ uri: coverImage }}
            usePoster
            onError={(error) => {
              console.error('DropCountdown video error:', error);
            }}
          />
        ) : (
          <Image source={{ uri: mediaSource }} style={styles.coverMedia} contentFit="cover" />
        )}
      </View>
      
      <LinearGradient colors={colors.gradient} locations={[0, 0.4, 1]} style={styles.gradient}>
        {/* Top Row: Badge + Live indicator */}
        <View style={styles.topRow}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dropBadge}
          >
            <Ionicons name="flash" size={14} color="white" />
            <Text style={styles.dropBadgeText}>Bientôt disponible</Text>
          </LinearGradient>

          {hasVideo && (
            <View style={styles.topRightControls}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>TEASER</Text>
              </View>
              <TouchableOpacity
                style={styles.soundButton}
                activeOpacity={0.8}
                onPress={() => setMuted((prev) => !prev)}
              >
                <Ionicons
                  name={muted ? 'volume-mute' : 'volume-high'}
                  size={16}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Brand Info */}
        <View style={styles.brandInfo}>
          <Image source={{ uri: brandLogo }} style={styles.brandLogo} />
          <View style={styles.brandTextContainer}>
            <Text style={styles.brandName}>{brandName}</Text>
            <Text style={styles.collectionName} numberOfLines={2}>{collectionName}</Text>
          </View>
        </View>

        {/* Countdown */}
        <Animated.View style={[styles.countdown, { transform: [{ scale: pulseAnim }] }]}>
          {[
            { value: timeLeft.days, label: 'JOURS' },
            { value: timeLeft.hours, label: 'HEURES' },
            { value: timeLeft.minutes, label: 'MIN' },
            { value: timeLeft.seconds, label: 'SEC' },
          ].map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 && <Text style={styles.countdownSeparator}>:</Text>}
              <View style={[styles.countdownItem, { backgroundColor: colors.countdownBg, borderColor: colors.countdownBorder }]}>
                <Text style={styles.countdownNumber}>
                  {index === 0 ? item.value : String(item.value).padStart(2, '0')}
                </Text>
                <Text style={styles.countdownLabel}>{item.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </Animated.View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[
              styles.notifyButton,
              { backgroundColor: notified ? colors.notifyActiveBg : colors.notifyBg },
            ]}
            onPress={handleNotify}
            activeOpacity={0.85}
          >
            <Ionicons
              name={notified ? 'notifications' : 'notifications-outline'}
              size={20}
              color={notified ? 'white' : '#8B5CF6'}
            />
            <Text style={[styles.notifyButtonText, notified && styles.notifyButtonTextActive]}>
              {notified ? 'Notifié' : 'Me notifier'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.previewButton, { backgroundColor: colors.previewBg }]} 
            onPress={onPreview}
            activeOpacity={0.85}
          >
            <Text style={styles.previewButtonText}>Aperçu</Text>
            <Ionicons name="arrow-forward" size={18} color="black" />
          </TouchableOpacity>
        </View>

        {/* Hype Indicator */}
        <View style={[styles.hypeContainer, { backgroundColor: colors.hypeBg }]}>
          <Ionicons name="flame" size={16} color="#FF3B30" />
          <Text style={styles.hypeText}>{formatHypeCount(hypeCount)} personnes intéressées</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    height: 540,
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 10,
  },
  mediaContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  coverMedia: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 0,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 20,
    zIndex: 1,
  },
  
  // Top Row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dropBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  dropBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
  },
  liveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Brand
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  brandLogo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  brandTextContainer: {
    flex: 1,
  },
  brandName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  collectionName: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },

  // Countdown
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  countdownItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 64,
  },
  countdownNumber: {
    color: 'white',
    fontSize: 26,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  countdownLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  countdownSeparator: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 24,
    fontWeight: '700',
  },

  // CTA
  ctaContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  notifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  notifyButtonText: {
    color: '#8B5CF6',
    fontSize: 14,
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
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  previewButtonText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '700',
  },

  // Hype
  hypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
  },
  hypeText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 13,
    fontWeight: '600',
  },
});