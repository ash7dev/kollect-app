import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { ProductPostCard } from '../../src/components/clients/ProductPostCard';
import { brandService } from '../../src/features/brands/services/brand.service';
import { produitsService, type ProduitDto } from '../../src/features/produits/services/produits.service';
import { useProduitsStore } from '../../src/features/produits/store/produitsStore';
import BrandSpotlight from '../../src/components/clients/BrandSpotlight';
// Composants pour les drops
import JustLaunchedDrop from '../../src/components/clients/JustLaunchedDrop';
import BrandDropCountdown from '../../src/components/clients/BrandDropCountdown';

export default function BrandPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const slug = Array.isArray(id) ? id[0] : id;
  const { theme } = useTheme();
  const setProduits = useProduitsStore((state) => state.setProduits);
  const produitsFromStore = useProduitsStore((state) => state.produits);

  const [tab, setTab] = useState<'products' | 'collections'>('products');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brand, setBrand] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [upcomingDrops, setUpcomingDrops] = useState<any[]>([]);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [brandRes, prodRes] = await Promise.all([
          brandService.getBrandBySlug(slug),
          produitsService.getByBrand(slug, { page: 1, limit: 20, sortBy: 'recent' }),
        ]);
        if (mounted) {
          setBrand(brandRes);
          const productList: ProduitDto[] =
            (prodRes as any)?.data ?? (Array.isArray(prodRes) ? prodRes : []);
          setProducts(productList);
          if (productList?.length) {
            setProduits(productList);
          }
          
          // Simuler des drops à venir (à remplacer avec vrai appel API)
          const mockUpcomingDrops = [
            {
              id: '1',
              name: 'Summer Collection 2024',
              description: 'La nouvelle collection été avec des pièces exclusives',
              coverImage: brandRes.coverImage,
              launchDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
              brand: {
                id: brandRes.id,
                name: brandRes.name,
                logo: brandRes.logo,
              },
              _count: { products: 12 },
              priceRange: { min: 29, max: 129 },
            },
            {
              id: '2',
              name: 'Limited Edition Drop',
              description: 'Édition limitée en collaboration avec un artiste',
              coverImage: brandRes.coverImage,
              launchDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
              brand: {
                id: brandRes.id,
                name: brandRes.name,
                logo: brandRes.logo,
              },
              _count: { products: 8 },
              priceRange: { min: 49, max: 199 },
            },
          ];
          setUpcomingDrops(mockUpcomingDrops);
        }
      } catch (e: any) {
        setError(e?.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Titre de la page */}
      <View style={[styles.pageHeader, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.pageTitle, { color: theme.colors.text }]}>
          {brand?.name || slug}
        </Text>
      </View>

      {/* BrandSpotlight - Header riche avec logo, cover, stats, follow */}
      {brand && (
        <BrandSpotlight
          brand={{
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
            logo: brand.logo || '',
            coverImage: brand.coverImage || '',
            description: brand.bio || brand.description || '',
            stats: {
              followers: brand._count?.favoris || 0,
              collections: brand._count?.collections || 0,
              products: brand._count?.products || 0,
            },
            tags: [], // À ajouter si disponible dans l'API
            verified: brand.isVerified,
            instagram: brand.instagram,
            website: brand.website,
            whatsapp: brand.whatsapp,
          }}
          onVisit={() => {
            // Navigation vers les produits ou autre action
            setTab('products');
          }}
          showSocialLinks={true}
        />
      )}

      {/* Section Drops à venir */}
      {upcomingDrops.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Drops à venir
          </Text>
          {upcomingDrops.map((drop) => (
            <BrandDropCountdown
              key={drop.id}
              drop={drop}
              variant="featured"
              brandTheme={{
                primary: theme.colors.primary,
                accent: theme.colors.accent,
              }}
              onPress={(id) => {
                console.log('Navigation vers drop:', id);
                // Navigation vers la page du drop
              }}
              onAlert={(id) => {
                console.log('Alerte pour drop:', id);
                // Activer les notifications pour ce drop
              }}
            />
          ))}
        </View>
      )}

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: theme.colors.border }]}>
        <TabButton
          label="Produits"
          active={tab === 'products'}
          onPress={() => setTab('products')}
          activeColor={theme.colors.primary}
          textColor={theme.colors.text}
        />
        <TabButton
          label="Collections"
          active={tab === 'collections'}
          onPress={() => setTab('collections')}
          activeColor={theme.colors.primary}
          textColor={theme.colors.text}
        />
      </View>

      {loading && (
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.colors.textSecondary }}>Chargement...</Text>
        </View>
      )}
      {error && (
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.colors.error }}>{error}</Text>
        </View>
      )}

      {/* Content */}
      <View style={{ paddingVertical: 16, gap: 16 }}>
        {tab === 'products' && (
          <View style={styles.grid}>
            {(products.length ? products : produitsFromStore).map((p, idx) => (
              <View key={idx} style={styles.gridItem}>
                <ProductPostCard
                  product={{
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    images: p.images,
                    stock: p.stock,
                    brand: { id: brand?.id, name: brand?.name, logo: brand?.logo, slug: brand?.slug },
                  }}
                />
              </View>
            ))}
          </View>
        )}

        {tab === 'collections' && (
          <View style={{ gap: 16 }}>
            {/* Collections récentes avec JustLaunchedDrop */}
            {(brand?.collections || []).map((collection: any) => {
              const isRecent = collection.launchedAt && 
                new Date(collection.launchedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              
              return isRecent ? (
                <JustLaunchedDrop
                  key={collection.id}
                  collection={{
                    id: collection.id,
                    name: collection.name,
                    description: collection.description,
                    coverImage: collection.coverImage,
                    teaserVideo: collection.teaserVideo,
                    launchedAt: collection.launchedAt,
                    brand: {
                      id: brand?.id,
                      name: brand?.name,
                      logo: brand?.logo,
                    },
                    _count: { products: collection._count?.products },
                  }}
                  onPress={(id) => {
                    // Navigation vers la collection
                    console.log('Navigation vers collection:', id);
                  }}
                />
              ) : (
                <View key={collection.id} style={styles.gridItem}>
                  <ProductPostCard
                    product={{
                      id: collection.id,
                      name: collection.name,
                      price: 0,
                      images: collection.coverImage ? [collection.coverImage] : [],
                      brand: { id: brand?.id, name: brand?.name, logo: brand?.logo, slug: brand?.slug },
                    }}
                  />
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontWeight: '800', color }}>{value}</Text>
      <Text style={{ opacity: 0.7, color, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
  activeColor,
  textColor,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  activeColor: string;
  textColor: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.tabBtn}>
      <Text style={[styles.tabText, { color: active ? activeColor : textColor }]}>{label}</Text>
      {active && <View style={[styles.tabUnderline, { backgroundColor: activeColor }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  logoFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
  },
  brandBio: {
    marginTop: 4,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: {
    fontWeight: '700',
  },
  tabUnderline: {
    height: 2,
    width: 40,
    borderRadius: 999,
    marginTop: 8,
  },
  grid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  pageHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
});


