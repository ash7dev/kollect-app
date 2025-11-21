import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface LiveDrop {
  id: string;
  collectionName: string;
  brandName: string;
  brandLogo: string;
  viewers: number;
  stockRemaining: number;
  totalStock: number;
  startTime: Date;
}

interface LiveDropIndicatorProps {
  drop: LiveDrop;
  onPress?: () => void;
}

export default function LiveDropIndicator({ drop, onPress }: LiveDropIndicatorProps) {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [viewers, setViewers] = useState(drop.viewers);
  const [stock, setStock] = useState(drop.stockRemaining);

  useEffect(() => {
    // Animation de pulsation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Simulation de changements en temps réel
    const viewerInterval = setInterval(() => {
      setViewers((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);

    const stockInterval = setInterval(() => {
      setStock((prev) => Math.max(0, prev - Math.floor(Math.random() * 3)));
    }, 5000);

    return () => {
      clearInterval(viewerInterval);
      clearInterval(stockInterval);
    };
  }, [pulseAnim]);

  const stockPercentage = (stock / drop.totalStock) * 100;
  const isLowStock = stockPercentage < 20;
  const isSoldOut = stock === 0;

  const getTimeElapsed = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - drop.startTime.getTime()) / 1000 / 60);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return `Il y a ${diff}m`;
    return `Il y a ${Math.floor(diff / 60)}h`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={onPress}
      disabled={isSoldOut}
    >
      <LinearGradient
        colors={
          isSoldOut
            ? ['#1C1C1E', '#2C2C2E']
            : ['#8B5CF6', '#EC4899', '#F59E0B']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <BlurView intensity={20} tint="dark" style={styles.blur}>
          {/* Live Badge */}
          {!isSoldOut && (
            <Animated.View
              style={[
                styles.liveBadge,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View style={styles.liveIndicator} />
              <Text style={styles.liveText}>LIVE</Text>
            </Animated.View>
          )}

          {/* Brand Info */}
          <View style={styles.brandContainer}>
            <Image source={{ uri: drop.brandLogo }} style={styles.brandLogo} />
            <View style={styles.textContainer}>
              <Text style={styles.brandName}>{drop.brandName}</Text>
              <Text style={styles.collectionName} numberOfLines={1}>
                {drop.collectionName}
              </Text>
              <Text style={styles.timeText}>{getTimeElapsed()}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {!isSoldOut ? (
              <>
                {/* Viewers */}
                <View style={styles.stat}>
                  <Ionicons name="eye" size={16} color="white" />
                  <Text style={styles.statText}>
                    {viewers >= 1000
                      ? `${(viewers / 1000).toFixed(1)}K`
                      : viewers}
                  </Text>
                </View>

                {/* Stock */}
                <View style={[styles.stat, isLowStock && styles.statWarning]}>
                  <Ionicons
                    name={isLowStock ? 'flash' : 'cube'}
                    size={16}
                    color={isLowStock ? '#FF3B30' : 'white'}
                  />
                  <Text
                    style={[
                      styles.statText,
                      isLowStock && styles.statWarningText,
                    ]}
                  >
                    {stock} restants
                  </Text>
                </View>

                {/* CTA */}
                <TouchableOpacity style={styles.ctaButton} onPress={onPress}>
                  <Text style={styles.ctaText}>Acheter</Text>
                  <Ionicons name="arrow-forward" size={14} color="black" />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.soldOutContainer}>
                <Ionicons name="close-circle" size={20} color="#FF3B30" />
                <Text style={styles.soldOutText}>Épuisé</Text>
              </View>
            )}
          </View>

          {/* Stock Progress Bar */}
          {!isSoldOut && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${stockPercentage}%`,
                      backgroundColor: isLowStock ? '#FF3B30' : '#34C759',
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {stockPercentage.toFixed(0)}% disponible
              </Text>
            </View>
          )}
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    padding: 2,
  },
  blur: {
    padding: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  liveBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  liveText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  brandLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  textContainer: {
    flex: 1,
  },
  brandName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  collectionName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  timeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statWarning: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  statText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  statWarningText: {
    color: '#FF3B30',
  },
  ctaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  ctaText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '700',
  },
  soldOutContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  soldOutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '700',
  },
  progressContainer: {
    gap: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});