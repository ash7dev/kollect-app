import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CollectionTeaserData } from './CollectionTeaserStep';

interface ProductPreview {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface CollectionConfirmationStepProps {
  teaserData: CollectionTeaserData;
  onLaunch: () => Promise<void>;
  onPrevious?: () => void;
  brandId: string;
}

export function CollectionConfirmationStep({
  teaserData,
  onLaunch,
  onPrevious,
  brandId,
}: CollectionConfirmationStepProps) {
  const { theme } = useTheme();
  const [products, setProducts] = useState<ProductPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (teaserData.launchDate) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const target = new Date(teaserData.launchDate).getTime();
        const difference = target - now;

        if (difference > 0) {
          setCountdown({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000),
          });
        } else {
          setCountdown(null);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [teaserData.launchDate]);

  const loadProducts = async () => {
    const stored = await AsyncStorage.getItem('COLLECTION_PRODUCTS_DRAFT');
    if (stored) {
      setProducts(JSON.parse(stored));
    }
  };

  const handleLaunch = async () => {
    setIsLoading(true);
    try {
      await onLaunch();
    } finally {
      setIsLoading(false);
    }
  };

  const hasMedia = !!teaserData.teaserUri;
  const status = hasMedia ? 'Teaser' : 'Disponible';
  const productCount = products.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Vérifie ton drop avant de le lancer.
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Récapitulatif de ta collection
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Nom de la collection */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Nom de la collection
            </Text>
          </View>
          <Text style={[styles.sectionValue, { color: theme.colors.text }]}>
            {teaserData.name}
          </Text>
        </View>

        {/* Nombre de produits */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Nombre de produits
            </Text>
          </View>
          <Text style={[styles.sectionValue, { color: theme.colors.text }]}>
            {productCount} produit{productCount > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Média */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name={hasMedia ? (teaserData.teaserType === 'photo' ? 'image' : 'videocam') : 'image-outline'} 
              size={20} 
              color={theme.colors.primary} 
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Média
            </Text>
          </View>
          {hasMedia ? (
            <View style={styles.mediaPreview}>
              {teaserData.teaserType === 'photo' ? (
                <Image
                  source={{ uri: teaserData.teaserUri! }}
                  style={styles.mediaImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.mediaPlaceholder, { backgroundColor: theme.colors.surface }]}>
                  <Ionicons name="videocam" size={32} color={theme.colors.textSecondary} />
                </View>
              )}
              <Text style={[styles.mediaType, { color: theme.colors.textSecondary }]}>
                {teaserData.teaserType === 'photo' ? 'Photo' : 'Vidéo'}
              </Text>
            </View>
          ) : (
            <Text style={[styles.sectionValue, { color: theme.colors.textSecondary }]}>
              Aucun média (disponible immédiatement)
            </Text>
          )}
        </View>

        {/* Date de lancement */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Date de lancement
            </Text>
          </View>
          <Text style={[styles.sectionValue, { color: theme.colors.text }]}>
            {teaserData.launchDate.toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {countdown && hasMedia && (
            <View style={[styles.countdownBox, { backgroundColor: theme.colors.primary + '15' }]}>
              <Ionicons name="time" size={16} color={theme.colors.primary} />
              <Text style={[styles.countdownText, { color: theme.colors.primary }]}>
                Lancement dans {countdown.days > 0 && `${countdown.days}j `}
                {countdown.hours > 0 && `${countdown.hours}h `}
                {countdown.minutes}min {countdown.seconds}s
              </Text>
            </View>
          )}
        </View>

        {/* Statut final */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Statut final prévisible
            </Text>
          </View>
          <View style={[styles.statusBadge, { 
            backgroundColor: hasMedia 
              ? theme.colors.primary + '20' 
              : theme.colors.success + '20' 
          }]}>
            <Ionicons 
              name={hasMedia ? 'eye' : 'flash'} 
              size={16} 
              color={hasMedia ? theme.colors.primary : theme.colors.success} 
            />
            <Text style={[styles.statusText, { 
              color: hasMedia ? theme.colors.primary : theme.colors.success 
            }]}>
              {status}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={[styles.footer, { 
        borderTopColor: theme.colors.borderLight,
        backgroundColor: theme.colors.card,
      }]}>
        {onPrevious && (
          <TouchableOpacity
            style={[styles.backButton, { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }]}
            onPress={onPrevious}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.backButtonText, { color: theme.colors.textSecondary }]}>
              Retour
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.launchButton,
            {
              backgroundColor: theme.colors.primary,
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          onPress={handleLaunch}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="rocket" size={20} color="#FFFFFF" />
              <Text style={styles.launchButtonText}>Lancer le drop</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600' },
  sectionValue: { fontSize: 16, fontWeight: '500' },
  mediaPreview: {
    alignItems: 'center',
    gap: 8,
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  mediaPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaType: { fontSize: 14, fontWeight: '500' },
  countdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  countdownText: { fontSize: 14, fontWeight: '600' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  statusText: { fontSize: 14, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  backButtonText: { fontSize: 16, fontWeight: '600' },
  launchButton: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#6B4CE6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  launchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

