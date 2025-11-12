import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { ProductPostCard } from '../../src/components/clients/ProductPostCard';
import { brandService } from '../../src/features/brands/services/brand.service';
import { produitsService, type ProduitDto } from '../../src/features/produits/services/produits.service';
import { useProduitsStore } from '../../src/features/produits/store/produitsStore';

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
            (prodRes as any)?.data ?? (Array.isArray(prodRes) ? prodRes : prodRes?.products ?? []);
          setProducts(productList);
          if (productList?.length) {
            setProduits(productList);
          }
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
      {/* Header brand */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerRow}>
          {brand?.logo ? (
            <Image source={{ uri: brand.logo }} style={styles.logo} />
          ) : (
            <View style={[styles.logoFallback, { backgroundColor: theme.colors.overlayLight }]} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.brandName, { color: theme.colors.text }]}>{brand?.name || slug}</Text>
            {!!brand?.bio && (
              <Text style={[styles.brandBio, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                {brand.bio}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.statsRow}>
          <Stat label="Produits" value={brand?._count?.products ?? 0} color={theme.colors.text} />
          <Stat label="Collections" value={brand?._count?.collections ?? 0} color={theme.colors.text} />
          <Stat label="Followers" value={brand?._count?.favoris ?? 0} color={theme.colors.text} />
        </View>
      </View>

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
          <View style={styles.grid}>
            {(brand?.collections || []).map((c: any, idx: number) => (
              <View key={idx} style={styles.gridItem}>
                <ProductPostCard
                  product={{
                    id: c.id,
                    name: c.name,
                    price: 0,
                    images: c.coverImage ? [c.coverImage] : [],
                    brand: { id: brand?.id, name: brand?.name, logo: brand?.logo, slug: brand?.slug },
                  }}
                />
              </View>
            ))}
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
});


