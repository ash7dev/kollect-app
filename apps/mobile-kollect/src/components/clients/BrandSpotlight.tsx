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
import { BlurView } from 'expo-blur';
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
  coverImage?: string;
  teaserVideo?: string;
  description?: string;
  stats: { followers: number; collections: number; products: number };
  tags?: string[];
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
  onHome?: () => void;
  showHomeButton?: boolean;
  showSocialLinks?: boolean;
  scrollY?: Animated.Value;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function BrandSpotlight({
  brand,
  onFollow,
  onVisit,
  onHome,
  showHomeButton = false,
  showSocialLinks = false,
  scrollY,
}: BrandSpotlightProps) {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [following, setFollowing] = useState(brand.isFollowing ?? false);
  const { followingBrands, brandFollowersCount, fetchBrandFollowState, followBrand, unfollowBrand } =
    useSuiviStore();

  const isFollowing = followingBrands[brand.id] ?? following;
  const followersCount = brandFollowersCount[brand.id] ?? brand.stats.followers;
  const accent = theme.colors.accent; // #FF3B30

  useEffect(() => { void fetchBrandFollowState(brand.id); }, [brand.id]);

  /* ── Handlers ─────────────────────────────────────── */
  const handleFollow = () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Connecte-toi pour suivre ce créateur.', [
        { text: 'Plus tard', style: 'cancel' },
        { text: 'Se connecter', onPress: () => router.push('/(auth)/login?redirect=/(client)') },
      ]);
      return;
    }
    const next = !isFollowing;
    setFollowing(next);
    void (next ? followBrand(brand.id) : unfollowBrand(brand.id));
    onFollow?.();
  };

  const openLink = async (url: string, label: string) => {
    try {
      const ok = await Linking.canOpenURL(url);
      if (!ok) { Alert.alert('Impossible d\'ouvrir ce lien'); return; }
      await Linking.openURL(url);
    } catch { Alert.alert('Erreur', `Impossible d'ouvrir ${label}.`); }
  };

  const handleInstagram = () => brand.instagram &&
    openLink(`https://instagram.com/${brand.instagram.replace('@', '').trim()}`, 'Instagram');
  const handleWebsite = () => brand.website &&
    openLink(brand.website.startsWith('http') ? brand.website : `https://${brand.website}`, 'Site web');
  const handleWhatsApp = () => brand.whatsapp &&
    openLink(`https://wa.me/${brand.whatsapp.replace(/\s+/g, '')}`, 'WhatsApp');

  /* ── Parallax ─────────────────────────────────────── */
  const coverTranslateY = scrollY?.interpolate({
    inputRange: [0, 300], outputRange: [0, -80], extrapolate: 'clamp',
  });

  const hasVideo = brand.teaserVideo || brand.coverImage?.includes('.mp4');

  /* ── Render ───────────────────────────────────────── */
  return (
    <View style={[styles.card, {
      backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
      shadowColor: isDark ? '#000' : '#000',
      shadowOpacity: isDark ? 0.55 : 0.12,
    }]}>

      {/* ── COVER ────────────────────────────────────── */}
      <View style={styles.coverShell}>
        <Animated.View
          style={[
            styles.coverInner,
            coverTranslateY ? { transform: [{ translateY: coverTranslateY }] } : undefined,
          ]}
        >
          {hasVideo ? (
            <Video
              source={{ uri: (brand.teaserVideo || brand.coverImage) as string }}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.COVER}
              shouldPlay isLooping isMuted
            />
          ) : (
            <Image source={{ uri: brand.coverImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
          )}
        </Animated.View>

        {/* Gradient du bas */}
        <LinearGradient
          colors={['transparent', isDark ? 'rgba(10,10,10,0.94)' : 'rgba(0,0,0,0.62)']}
          locations={[0.35, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Badge vérifié */}
        {brand.verified && (
          <BlurView intensity={60} tint="dark" style={styles.verifiedPill}>
            <Ionicons name="checkmark-circle" size={13} color="#34C759" />
            <Text style={styles.verifiedText}>Vérifié</Text>
          </BlurView>
        )}

        {/* Nom de la marque sur la cover */}
        <View style={styles.coverBottom}>
          <Text style={styles.coverBrandName} numberOfLines={1}>{brand.name}</Text>
          {(brand.tags && brand.tags.length > 0) && (
            <Text style={styles.coverTag} numberOfLines={1}>
              {brand.tags.slice(0, 3).map(t => `#${t}`).join('  ')}
            </Text>
          )}
        </View>
      </View>

      {/* ── BODY ─────────────────────────────────────── */}
      <View style={styles.body}>

        {/* Logo seul */}
        <View style={styles.logoActionRow}>
          {/* Logo flottant */}
          <View style={[styles.logoRing, { borderColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
            <Image source={{ uri: brand.logo }} style={styles.logo} contentFit="cover" />
          </View>
        </View>

        {/* Description */}
        {brand.description ? (
          <Text style={[styles.description, { color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.50)' }]}
            numberOfLines={3}>
            {brand.description}
          </Text>
        ) : null}

        {/* Réseaux sociaux */}
        {showSocialLinks && (brand.instagram || brand.website || brand.whatsapp) && (
          <View style={styles.socialRow}>
            {brand.instagram && (
              <TouchableOpacity
                style={[styles.socialChip, { backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5' }]}
                onPress={handleInstagram} activeOpacity={0.75}
              >
                <Ionicons name="logo-instagram" size={15} color="#E1306C" />
                <Text style={[styles.socialChipText, { color: isDark ? '#FFF' : '#111' }]}>Instagram</Text>
              </TouchableOpacity>
            )}
            {brand.website && (
              <TouchableOpacity
                style={[styles.socialChip, { backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5' }]}
                onPress={handleWebsite} activeOpacity={0.75}
              >
                <Ionicons name="globe-outline" size={15} color={isDark ? '#AAA' : '#444'} />
                <Text style={[styles.socialChipText, { color: isDark ? '#FFF' : '#111' }]}>Site web</Text>
              </TouchableOpacity>
            )}
            {brand.whatsapp && (
              <TouchableOpacity
                style={[styles.socialChip, { backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5' }]}
                onPress={handleWhatsApp} activeOpacity={0.75}
              >
                <Ionicons name="logo-whatsapp" size={15} color="#25D366" />
                <Text style={[styles.socialChipText, { color: isDark ? '#FFF' : '#111' }]}>WhatsApp</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Séparateur */}
        <View style={[styles.divider, { backgroundColor: isDark ? '#1E1E1E' : '#F0F0F0' }]} />

        {/* Stats améliorées */}
        <View style={styles.statsContainer}>
          <View style={[styles.statsCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
            {[
              { 
                value: formatNumber(followersCount), 
                label: 'Abonnés', 
                icon: 'people-outline',
                color: '#10B981'
              },
              { 
                value: String(brand.stats.collections), 
                label: 'Drops', 
                icon: 'cube-outline',
                color: '#3B82F6'
              },
              { 
                value: String(brand.stats.products), 
                label: 'Pièces', 
                icon: 'pricetag-outline',
                color: '#F59E0B'
              },
            ].map((stat, index) => (
              <View key={stat.label} style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: stat.color + '15' }]}>
                  <Ionicons 
                    name={stat.icon as any} 
                    size={16} 
                    color={stat.color}
                  />
                </View>
                <View style={styles.statContent}>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {stat.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    {stat.label}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Actions après les stats */}
        <View style={styles.actionsAfterStats}>
          {/* Icône conditionnelle : Accueil ou Partager */}
          {showHomeButton ? (
            <TouchableOpacity
              onPress={onHome}
              activeOpacity={0.8}
              style={[
                styles.homeBtn,
                { backgroundColor: theme.colors.surface }
              ]}
            >
              <Ionicons
                name="home-outline"
                size={20}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          ) : (
            <ShareButton
              data={{
                type: ShareType.BRAND,
                id: brand.id,
                name: brand.name,
                brandName: brand.name,
                imageUrl: brand.logo,
                description: brand.description,
                stats: { followerCount: followersCount, productCount: brand.stats.products },
              }}
              size="medium"
            />
          )}

          {/* Follow - occupe le reste de la ligne */}
          <TouchableOpacity
            onPress={onFollow}
            activeOpacity={0.8}
            style={[
              styles.followBtnFullWidth,
              isFollowing
                ? {
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderColor: accent,
                  }
                : { backgroundColor: accent, borderWidth: 0 },
            ]}
          >
            <Ionicons
              name={isFollowing ? 'checkmark' : 'add'}
              size={16}
              color={isFollowing ? accent : '#FFF'}
            />
            <Text style={[styles.followBtnText, { color: isFollowing ? accent : '#FFF' }]}>
              {isFollowing ? 'Abonné' : "S'abonner"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Visiter bouton */}
        {onVisit && (
          <>
            <View style={[styles.divider, { backgroundColor: isDark ? '#1E1E1E' : '#F0F0F0' }]} />
            <TouchableOpacity
              onPress={onVisit}
              activeOpacity={0.8}
              style={[
                styles.visitBtn,
                { backgroundColor: accent, borderColor: accent },
              ]}
            >
              <Text style={[styles.visitBtnText, { color: '#FFFFFF' }]}>
                Voir la boutique
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const COVER_H = width * 0.52;
const LOGO_SIZE = 72;
const LOGO_OVERLAP = 36;

const styles = StyleSheet.create({
  card: {
    width: width - 32,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 10,
  },

  /* COVER */
  coverShell: { width: '100%', height: COVER_H, overflow: 'hidden', position: 'relative' },
  coverInner: { ...StyleSheet.absoluteFillObject, height: '120%' },
  verifiedPill: {
    position: 'absolute', top: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 6, paddingHorizontal: 11,
    borderRadius: 100, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#34C759' },
  coverBottom: { position: 'absolute', bottom: 18, left: 18, right: 18, gap: 4 },
  coverBrandName: {
    fontSize: 26, fontWeight: '900', color: '#FFFFFF',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  coverTag: {
    fontSize: 11, fontWeight: '600',
    color: 'rgba(255,255,255,0.58)', letterSpacing: 0.4,
  },

  /* BODY */
  body: { paddingHorizontal: 18, paddingBottom: 18, paddingTop: 0 },

  logoActionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: -LOGO_OVERLAP,
    marginBottom: 14,
  },
  actionsAfterStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  logoRing: {
    width: LOGO_SIZE + 6,
    height: LOGO_SIZE + 6,
    borderRadius: 22,
    borderWidth: 3,
    padding: 2,
    overflow: 'hidden',
  },
  logo: { width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: 18 },
  quickActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },

  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  followBtnFullWidth: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1, // Prend tout le reste de l'espace disponible
  },
  followBtnText: { fontSize: 15, fontWeight: '700' },
  homeBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },

  description: { fontSize: 13, lineHeight: 19, marginBottom: 14 },

  /* SOCIALS */
  socialRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  socialChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10,
  },
  socialChipText: { fontSize: 12, fontWeight: '600' },

  /* DIVIDER */
  divider: { height: 1, marginVertical: 16 },

  /* STATS */
  statsContainer: {
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    alignItems: 'center',
    gap: 2,
  },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  statCell: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  statLabel: { fontSize: 11, fontWeight: '500', letterSpacing: 0.2 },
  statSep: { width: 1, height: 36 },

  /* VISIT */
  visitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 14, gap: 8,
    borderWidth: 1,
  },
  visitBtnText: { fontSize: 14, fontWeight: '700' },
});