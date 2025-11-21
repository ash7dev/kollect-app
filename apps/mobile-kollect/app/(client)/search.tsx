import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { produitsService, ProduitDto } from '@/features/produits/services/produits.service';
import { useProduitsStore } from '@/features/produits/store/produitsStore';
import { brandService, Brand } from '@/features/brands/services/brand.service';
import { collectionsApi, CollectionDto } from '@/features/collections/services/collections.service';
import { formatPrice } from '@/features/commandes/types/commande.types';

type SearchTab = 'all' | 'products' | 'brands' | 'collections';

type SearchItem =
  | { type: 'product'; id: string; product: ProduitDto }
  | { type: 'brand'; id: string; brand: any }
  | { type: 'collection'; id: string; collection: CollectionDto };

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Icônes SVG améliorées
const SearchIcon = ({ color = '#666', size = 20 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: size, color }}>🔍</Text>
  </View>
);

const CloseIcon = ({ color = '#666', size = 18 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: size * 0.7, height: 2, backgroundColor: color, transform: [{ rotate: '45deg' }], position: 'absolute' }} />
    <View style={{ width: size * 0.7, height: 2, backgroundColor: color, transform: [{ rotate: '-45deg' }], position: 'absolute' }} />
  </View>
);

const BoxIcon = ({ color = '#666', size = 24 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, borderWidth: 2, borderColor: color, borderRadius: 4 }} />
);

const TagIcon = ({ color = '#666', size = 24 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, borderWidth: 2, borderColor: color, borderRadius: size / 2, transform: [{ rotate: '45deg' }] }}>
    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, position: 'absolute', top: 3, right: 3 }} />
  </View>
);

const SparkleIcon = ({ color = '#666', size = 24 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: 2, height: size * 0.6, backgroundColor: color, position: 'absolute' }} />
    <View style={{ width: size * 0.6, height: 2, backgroundColor: color, position: 'absolute' }} />
  </View>
);

export default function SearchScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const setProduitsStore = useProduitsStore((s) => s.setProduits);
  const [searchFocused, setSearchFocused] = useState(false);

  const [products, setProducts] = useState<ProduitDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [brandsError, setBrandsError] = useState<string | null>(null);

  const [collectionsRaw, setCollectionsRaw] = useState<CollectionDto[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);

  // Chargement des produits
  useEffect(() => {
    let isCancelled = false;

    const trimmed = query.trim();
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductsError(null);
        let res;

        if (trimmed) {
          // Mode recherche classique
          res = await produitsService.search({
            query: trimmed,
            page: 1,
            limit: 20,
          });
        } else {
          // Mode Discover : on essaie d'abord getPopular, puis fallback sur search sans query
          try {
            res = await produitsService.getPopular(50);
          } catch {
            res = undefined;
          }

          if (!res || !res.data || res.data.length === 0) {
            try {
              res = await produitsService.search({
                page: 1,
                limit: 50,
              } as any);
            } catch (fallbackErr) {
              if (!isCancelled) {
                throw fallbackErr;
              }
            }
          }
        }

        if (isCancelled || !res) return;
        const rawData = res.data ?? [];
        const finalData = trimmed ? rawData : shuffleArray(rawData);
        setProducts(finalData);
        setProduitsStore(finalData);
      } catch (error: any) {
        if (isCancelled) return;
        setProductsError(error?.message || 'Erreur recherche produits');
      } finally {
        if (!isCancelled) {
          setLoadingProducts(false);
        }
      }
    };

    void fetchProducts();

    return () => {
      isCancelled = true;
    };
  }, [query, setProduitsStore]);

  // Chargement des marques
  useEffect(() => {
    let isCancelled = false;

    const trimmed = query.trim();
    const fetchBrands = async () => {
      try {
        setLoadingBrands(true);
        setBrandsError(null);
        const result = await brandService.getAllBrands({
          isActive: true,
          isVerified: true,
          search: trimmed || undefined,
        });
        if (isCancelled) return;
        setBrands(result ?? []);
      } catch (error: any) {
        if (isCancelled) return;
        setBrandsError(error?.message || 'Erreur chargement marques');
      } finally {
        if (!isCancelled) {
          setLoadingBrands(false);
        }
      }
    };

    void fetchBrands();

    return () => {
      isCancelled = true;
    };
  }, [query]);

  // Chargement des collections
  useEffect(() => {
    let isCancelled = false;

    const fetchCollections = async () => {
      try {
        setLoadingCollections(true);
        setCollectionsError(null);
        const response = await collectionsApi.listPublic({ page: 1, limit: 50 });
        if (isCancelled) return;
        setCollectionsRaw(response?.data ?? []);
      } catch (error: any) {
        if (isCancelled) return;
        setCollectionsError(error?.message || 'Erreur chargement collections');
      } finally {
        if (!isCancelled) {
          setLoadingCollections(false);
        }
      }
    };

    void fetchCollections();

    return () => {
      isCancelled = true;
    };
  }, []);

  const collections = useMemo(() => {
    if (!collectionsRaw.length) return [] as CollectionDto[];
    if (!query.trim()) return collectionsRaw;
    const q = query.trim().toLowerCase();
    return collectionsRaw.filter((c) => c.name.toLowerCase().includes(q));
  }, [collectionsRaw, query]);

  const allItems = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [];

    products.forEach((p) => {
      items.push({ type: 'product', id: `product-${p.id}`, product: p });
    });

    (brands ?? []).forEach((b: any) => {
      items.push({ type: 'brand', id: `brand-${b.id}`, brand: b });
    });

    collections.forEach((c) => {
      items.push({ type: 'collection', id: `collection-${c.id}`, collection: c });
    });
    return items;
  }, [products, brands, collections]);

  const isLoadingAny = loadingProducts || loadingBrands || loadingCollections;
  const anyError = productsError || brandsError || collectionsError;

  const tabs: { id: SearchTab; label: string; icon: string }[] = [
    { id: 'all', label: 'Tout', icon: 'grid-outline' },
    { id: 'products', label: 'Produits', icon: 'cube-outline' },
    { id: 'brands', label: 'Marques', icon: 'pricetag-outline' },
    { id: 'collections', label: 'Collections', icon: 'albums-outline' },
  ];

  const renderItem = ({ item }: { item: SearchItem }) => {
    switch (item.type) {
      case 'product': {
        const p = item.product;
        return (
          <TouchableOpacity
            style={[
              styles.card,
              activeTab === 'all' ? styles.gridCard : styles.listCard,
              { 
                backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isDark ? '#1A1A1A' : '#E5E5E5',
                shadowColor: isDark ? '#000000' : '#000000',
                shadowOffset: { width: 0, height: isDark ? 8 : 6 },
                shadowOpacity: isDark ? 0.5 : 0.12,
                shadowRadius: 16,
                elevation: isDark ? 8 : 4,
              },
            ]}
            activeOpacity={0.85}
            onPress={() => router.push(`/clientProductid/${p.id}`)}
          >
            {activeTab === 'all' ? (
              <>
                {p.images?.[0] ? (
                  <Image
                    source={{ uri: p.images[0] }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.cardImage, styles.placeholderImage, { backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8' }]}>
                    <BoxIcon color={isDark ? '#666666' : '#B8B8B8'} size={56} />
                  </View>
                )}
                <View style={styles.cardOverlay}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>PRODUIT</Text>
                  </View>
                  <Text
                    numberOfLines={2}
                    style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}
                  >
                    {p.name}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceText, { color: '#FF3B30' }]}>
                      {formatPrice(p.price)}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.listCardContent}>
                {p.images?.[0] ? (
                  <Image
                    source={{ uri: p.images[0] }}
                    style={styles.listImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.listImage, styles.placeholderImage, { backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8' }]}>
                    <BoxIcon color={isDark ? '#666666' : '#B8B8B8'} size={36} />
                  </View>
                )}
                <View style={styles.listTextContent}>
                  <Text style={[styles.listTitle, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={2}>
                    {p.name}
                  </Text>
                  <Text style={[styles.listPrice, { color: '#FF3B30' }]}>
                    {formatPrice(p.price)}
                  </Text>
                </View>
                <View style={styles.chevronContainer}>
                  <View style={[styles.chevron, { borderColor: isDark ? '#666666' : '#4D4D4D' }]} />
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      }
      case 'brand': {
        const b = item.brand;
        return (
          <TouchableOpacity
            style={[
              styles.card,
              activeTab === 'all' ? styles.gridCard : styles.listCard,
              { 
                backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isDark ? '#1A1A1A' : '#E5E5E5',
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: isDark ? 8 : 6 },
                shadowOpacity: isDark ? 0.5 : 0.12,
                shadowRadius: 16,
                elevation: isDark ? 8 : 4,
              },
            ]}
            activeOpacity={0.85}
            onPress={() => router.push(`/ClientbrandId/${b.slug}`)}
          >
            {activeTab === 'all' ? (
              <>
                {b.logo ? (
                  <Image
                    source={{ uri: b.logo }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.cardImage, styles.placeholderImage, { backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8' }]}>
                    <TagIcon color={isDark ? '#666666' : '#B8B8B8'} size={56} />
                  </View>
                )}
                <View style={styles.cardOverlay}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>MARQUE</Text>
                  </View>
                  <Text
                    numberOfLines={2}
                    style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}
                  >
                    {b.name}
                  </Text>
                  <Text style={[styles.cardSubtitle, { color: isDark ? '#B0B0B0' : '#4D4D4D' }]}>
                    Marque vérifiée
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.listCardContent}>
                {b.logo ? (
                  <Image
                    source={{ uri: b.logo }}
                    style={styles.listImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.listImage, styles.placeholderImage, { backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8' }]}>
                    <TagIcon color={isDark ? '#666666' : '#B8B8B8'} size={36} />
                  </View>
                )}
                <View style={styles.listTextContent}>
                  <Text style={[styles.listTitle, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={2}>
                    {b.name}
                  </Text>
                  <Text style={[styles.listSubtitle, { color: isDark ? '#B0B0B0' : '#4D4D4D' }]}>
                    Marque vérifiée
                  </Text>
                </View>
                <View style={styles.chevronContainer}>
                  <View style={[styles.chevron, { borderColor: isDark ? '#666666' : '#4D4D4D' }]} />
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      }
      case 'collection': {
        const c = item.collection;
        return (
          <TouchableOpacity
            style={[
              styles.card,
              activeTab === 'all' ? styles.gridCard : styles.listCard,
              { 
                backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isDark ? '#1A1A1A' : '#E5E5E5',
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: isDark ? 8 : 6 },
                shadowOpacity: isDark ? 0.5 : 0.12,
                shadowRadius: 16,
                elevation: isDark ? 8 : 4,
              },
            ]}
            activeOpacity={0.85}
            onPress={() => router.push(`/clientCollectionid/${c.id}`)}
          >
            {activeTab === 'all' ? (
              <>
                {c.coverImage ? (
                  <Image
                    source={{ uri: c.coverImage }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.cardImage, styles.placeholderImage, { backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8' }]}>
                    <SparkleIcon color={isDark ? '#666666' : '#B8B8B8'} size={56} />
                  </View>
                )}
                <View style={styles.cardOverlay}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>COLLECTION</Text>
                  </View>
                  <Text
                    numberOfLines={2}
                    style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}
                  >
                    {c.name}
                  </Text>
                  <Text style={[styles.cardSubtitle, { color: isDark ? '#B0B0B0' : '#4D4D4D' }]} numberOfLines={1}>
                    {c.brand?.name ?? 'Collection'}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.listCardContent}>
                {c.coverImage ? (
                  <Image
                    source={{ uri: c.coverImage }}
                    style={styles.listImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.listImage, styles.placeholderImage, { backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8' }]}>
                    <SparkleIcon color={isDark ? '#666666' : '#B8B8B8'} size={36} />
                  </View>
                )}
                <View style={styles.listTextContent}>
                  <Text style={[styles.listTitle, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={2}>
                    {c.name}
                  </Text>
                  <Text style={[styles.listSubtitle, { color: isDark ? '#B0B0B0' : '#4D4D4D' }]}>
                    {c.brand?.name ?? 'Collection'}
                  </Text>
                </View>
                <View style={styles.chevronContainer}>
                  <View style={[styles.chevron, { borderColor: isDark ? '#666666' : '#4D4D4D' }]} />
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      }
      default:
        return null;
    }
  };

  const renderTabContent = () => {
    if (anyError) {
      return (
        <View style={styles.centerContent}>
          <View style={[styles.errorIconContainer, { backgroundColor: 'rgba(255, 59, 48, 0.12)' }]}>
            <Text style={[styles.errorIconText, { color: '#FF3B30' }]}>!</Text>
          </View>
          <Text style={[styles.errorText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Une erreur est survenue
          </Text>
          <Text style={[styles.errorSubtext, { color: isDark ? '#B0B0B0' : '#4D4D4D' }]}>
            Veuillez réessayer plus tard
          </Text>
        </View>
      );
    }

    if (isLoadingAny && query.trim().length > 0) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={[styles.loadingText, { color: isDark ? '#B0B0B0' : '#4D4D4D' }]}>
            Recherche en cours...
          </Text>
        </View>
      );
    }

    if (activeTab === 'products') {
      const data = products;
      if (!data.length) {
        return (
          <View style={styles.centerContent}>
            <View style={[styles.emptyIconContainer, { backgroundColor: 'rgba(0, 0, 0, 0.06)' }]}>
              <SearchIcon color={isDark ? '#666666' : '#4D4D4D'} size={36} />
            </View>
            <Text style={[styles.emptyText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Aucun produit trouvé
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#B0B0B0' : '#4D4D4D' }]}>
              Essayez d&apos;autres mots-clés
            </Text>
          </View>
        );
      }

      return (
        <FlatList
          key="products-list"
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            renderItem({ item: { type: 'product', id: item.id, product: item } })
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    if (activeTab === 'brands') {
      const data = brands ?? [];
      if (!data.length) {
        return (
          <View style={styles.centerContent}>
            <View style={[styles.emptyIconContainer, { backgroundColor: 'rgba(0, 0, 0, 0.06)' }]}>
              <TagIcon color={isDark ? '#666666' : '#4D4D4D'} size={36} />
            </View>
            <Text style={[styles.emptyText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Aucune marque trouvée
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#B0B0B0' : '#4D4D4D' }]}>
              Essayez d&apos;autres mots-clés
            </Text>
          </View>
        );
      }

      return (
        <FlatList
          key="brands-list"
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            renderItem({ item: { type: 'brand', id: item.id, brand: item } })
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    if (activeTab === 'collections') {
      const data = collections;
      if (!data.length) {
        return (
          <View style={styles.centerContent}>
            <View style={[styles.emptyIconContainer, { backgroundColor: 'rgba(0, 0, 0, 0.06)' }]}>
              <SparkleIcon color={isDark ? '#666666' : '#4D4D4D'} size={36} />
            </View>
            <Text style={[styles.emptyText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Aucune collection trouvée
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#B0B0B0' : '#4D4D4D' }]}>
              Essayez d&apos;autres mots-clés
            </Text>
          </View>
        );
      }

      return (
        <FlatList
          key="collections-list"
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            renderItem({
              item: { type: 'collection', id: item.id, collection: item },
            })
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    if (!allItems.length) {
      return (
        <View style={styles.centerContent}>
          <View style={[styles.emptyIconContainer, { backgroundColor: 'rgba(0, 0, 0, 0.06)' }]}>
            <SearchIcon color={isDark ? '#666666' : '#4D4D4D'} size={36} />
          </View>
          <Text style={[styles.emptyText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Aucun résultat
          </Text>
          <Text style={[styles.emptySubtext, { color: isDark ? '#B0B0B0' : '#4D4D4D' }]}>
            Essayez d&apos;autres mots-clés
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        key="all-grid"
        data={allItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={tabs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.tabsList}
        renderItem={({ item }) => {
          const isActive = activeTab === item.id;
          let count = 0;

          if (item.id === 'all') {
            count = allItems.length;
          } else if (item.id === 'products') {
            count = products.length;
          } else if (item.id === 'brands') {
            count = brands.length;
          } else if (item.id === 'collections') {
            count = collections.length;
          }

          return (
            <TouchableOpacity
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.card,
                  borderColor: isActive ? theme.colors.primary : theme.colors.border,
                  shadowColor: isActive ? theme.colors.shadowLight : 'transparent',
                  shadowOffset: { width: 0, height: isActive ? 4 : 0 },
                  shadowOpacity: isActive ? 1 : 0,
                  shadowRadius: isActive ? 8 : 0,
                  elevation: isActive ? 4 : 0,
                },
              ]}
              onPress={() => setActiveTab(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon as any}
                size={18}
                color={isActive ? '#FFFFFF' : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? '#FFFFFF' : theme.colors.text },
                ]}
              >
                {item.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isActive
                        ? 'rgba(255,255,255,0.25)'
                        : theme.colors.highlight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: isActive ? '#FFFFFF' : theme.colors.accent },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>Découvrir</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#B0B0B0' : '#4D4D4D' }]}>
          Explorez produits, marques et collections
        </Text>
      </View>

      <View
        style={[
          styles.searchInputWrapper,
          { 
            backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
            borderWidth: 2,
            borderColor: searchFocused 
              ? '#FF3B30' 
              : (isDark ? '#1A1A1A' : '#E5E5E5'),
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: searchFocused ? 6 : 4 },
            shadowOpacity: isDark ? 0.4 : 0.08,
            shadowRadius: 12,
            elevation: searchFocused ? 6 : 3,
          },
        ]}
      >
        <SearchIcon 
          color={searchFocused 
            ? '#FF3B30' 
            : (isDark ? '#666666' : '#4D4D4D')
          } 
          size={22} 
        />
        <TextInput
          placeholder="Rechercher..."
          placeholderTextColor={isDark ? '#666666' : '#B8B8B8'}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#000000' }]}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
            <CloseIcon color={isDark ? '#666666' : '#4D4D4D'} size={18} />
          </TouchableOpacity>
        )}
      </View>
      {renderTabs()}

      <View style={styles.content}>{renderTabContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  searchInputWrapper: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  clearButton: {
    padding: 8,
  },
  tabsContainer: {
    paddingBottom: 16,
  },
  tabsList: { paddingHorizontal: 24, gap: 8 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    gap: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gridCard: {
    flex: 1,
    marginHorizontal: 6,
    marginBottom: 16,
  },
  listCard: {
    marginBottom: 14,
  },
  listCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  listTextContent: {
    flex: 1,
    marginLeft: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.15,
  },
  listSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  listPrice: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: -0.3,
  },
  chevronContainer: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    width: 9,
    height: 9,
    borderRightWidth: 2.5,
    borderTopWidth: 2.5,
    transform: [{ rotate: '45deg' }],
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardOverlay: {
    padding: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  priceRow: {
    marginTop: 6,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  gridRow: {
    paddingHorizontal: 14,
  },
  gridContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  errorIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIconText: {
    fontSize: 40,
    fontWeight: '800',
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  errorSubtext: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});