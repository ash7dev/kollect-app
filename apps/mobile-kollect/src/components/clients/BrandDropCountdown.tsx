import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../../app/context/ThemeContext';

const { width } = Dimensions.get('window');

interface BrandDropCountdownProps {
  drop: {
    id: string;
    name: string;
    description?: string | null;
    coverImage?: string | null;
    teaserVideo?: string | null;
    launchDate: string | Date;
    brand?: {
      id: string;
      name: string;
      logo?: string | null;
      colors?: {
        primary?: string;
        accent?: string;
      };
    } | null;
    _count?: { products?: number };
    priceRange?: {
      min: number;
      max: number;
    };
  };
  variant?: 'compact' | 'featured' | 'inline' | 'card';
  onPress?: (id: string) => void;
  onAlert?: (id: string) => void;
  brandTheme?: {
    primary?: string;
    accent?: string;
  };
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(launchDate: string | Date): TimeLeft {
  const now = new Date().getTime();
  const launch = new Date(launchDate).getTime();
  const difference = launch - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

function getDropStatus(launchDate: string | Date): { status: 'upcoming' | 'soon' | 'live' | 'ended'; label: string } {
  const now = new Date().getTime();
  const launch = new Date(launchDate).getTime();
  const difference = launch - now;
  const hoursUntil = difference / (1000 * 60 * 60);

  if (difference <= 0) {
    return { status: 'ended', label: 'Terminé' };
  } else if (hoursUntil <= 1) {
    return { status: 'live', label: 'Bientôt' };
  } else if (hoursUntil <= 24) {
    return { status: 'soon', label: 'Aujourd\'hui' };
  } else {
    return { status: 'upcoming', label: 'À venir' };
  }
}

// Composant pour l'animation de pulse
function PulseDot({ color }: { color: string }) {
  const anim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);

  return (
    <View style={{ width: 8, height: 8, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
          opacity: anim,
          transform: [{ scale: anim }],
        }}
      />
      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color }} />
    </View>
  );
}

// Composant pour les chiffres du countdown
function CountdownNumber({ value, label }: { value: string; label: string }) {
  const { theme, isDark } = useTheme();
  
  return (
    <View style={styles.countdownNumber}>
      <Text style={[styles.countdownValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.countdownLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

export default function BrandDropCountdown({
  drop,
  variant = 'featured',
  onPress,
  onAlert,
  brandTheme,
}: BrandDropCountdownProps) {
  const { theme, isDark } = useTheme();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(drop.launchDate));
  const { status, label } = getDropStatus(drop.launchDate);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const primaryColor = brandTheme?.primary || theme.colors.primary;
  const accentColor = brandTheme?.accent || theme.colors.accent;

  // Mise à jour du countdown chaque seconde
  useEffect(() => {
    if (status === 'ended') return;

    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(drop.launchDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [drop.launchDate, status]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onPress?.(drop.id);
  };

  const handleAlert = () => {
    onAlert?.(drop.id);
  };

  // Variant compact
  if (variant === 'compact') {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={[
          styles.compactContainer,
          { 
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          }
        ]}
      >
        <View style={styles.compactContent}>
          <Image 
            source={{ uri: drop.coverImage || '' }} 
            style={styles.compactImage}
            contentFit="cover"
          />
          <View style={styles.compactInfo}>
            <View style={styles.compactHeader}>
              <Text style={[styles.compactName, { color: theme.colors.text }]} numberOfLines={1}>
                {drop.name}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: status === 'live' ? accentColor : primaryColor }
              ]}>
                {status === 'live' && <PulseDot color="#fff" />}
                <Text style={styles.statusText}>{label}</Text>
              </View>
            </View>
            <Text style={[styles.compactDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              {drop.description}
            </Text>
            <View style={styles.compactCountdown}>
              <CountdownNumber value={String(timeLeft.days).padStart(2, '0')} label="J" />
              <CountdownNumber value={String(timeLeft.hours).padStart(2, '0')} label="H" />
              <CountdownNumber value={String(timeLeft.minutes).padStart(2, '0')} label="M" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Variant featured (défaut)
  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.93}
        onPress={handlePress}
        style={styles.featuredContainer}
      >
        {/* Image de fond avec overlay */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: drop.coverImage || '' }} 
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.7)']}
            locations={[0.3, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Contenu */}
        <View style={styles.featuredContent}>
          {/* En-tête avec statut */}
          <View style={styles.featuredHeader}>
            <View style={styles.brandInfo}>
              {drop.brand?.logo && (
                <Image 
                  source={{ uri: drop.brand.logo }} 
                  style={styles.brandLogo}
                  contentFit="cover"
                />
              )}
              <Text style={[styles.brandName, { color: theme.colors.text }]}>
                {drop.brand?.name}
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              { 
                backgroundColor: status === 'live' ? accentColor : primaryColor,
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)',
              }
            ]}>
              {status === 'live' && <PulseDot color="#fff" />}
              <Text style={styles.statusText}>{label}</Text>
            </View>
          </View>

          {/* Nom et description */}
          <Text style={[styles.featuredName, { color: '#fff' }]} numberOfLines={2}>
            {drop.name}
          </Text>
          {drop.description && (
            <Text style={[styles.featuredDescription, { color: 'rgba(255,255,255,0.8)' }]} numberOfLines={3}>
              {drop.description}
            </Text>
          )}

          {/* Countdown */}
          {status !== 'ended' && (
            <View style={styles.countdownContainer}>
              <CountdownNumber value={String(timeLeft.days).padStart(2, '0')} label="Jours" />
              <CountdownNumber value={String(timeLeft.hours).padStart(2, '0')} label="Heures" />
              <CountdownNumber value={String(timeLeft.minutes).padStart(2, '0')} label="Min" />
              <CountdownNumber value={String(timeLeft.seconds).padStart(2, '0')} label="Sec" />
            </View>
          )}

          {/* Actions */}
          <View style={styles.featuredActions}>
            <TouchableOpacity
              style={[
                styles.alertButton,
                { 
                  backgroundColor: 'transparent',
                  borderColor: 'rgba(255,255,255,0.5)',
                  borderWidth: 1,
                }
              ]}
              onPress={handleAlert}
            >
              <Ionicons name="notifications-outline" size={16} color="#fff" />
              <Text style={[styles.alertButtonText, { color: '#fff' }]}>M'alerter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.viewButton, { backgroundColor: accentColor }]}
              onPress={handlePress}
            >
              <Text style={[styles.viewButtonText, { color: '#fff' }]}>Voir le drop</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Featured variant
  featuredContainer: {
    width: width - 32,
    height: 280,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  featuredName: {
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 8,
    letterSpacing: -0.5,
  },
  featuredDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 16,
  },
  countdownNumber: {
    alignItems: 'center',
    minWidth: 50,
  },
  countdownValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  countdownLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  featuredActions: {
    flexDirection: 'row',
    gap: 12,
  },
  alertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  alertButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Compact variant
  compactContainer: {
    width: width - 32,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  compactContent: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  compactImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  compactInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  compactName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  compactDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  compactCountdown: {
    flexDirection: 'row',
    gap: 8,
  },
});
