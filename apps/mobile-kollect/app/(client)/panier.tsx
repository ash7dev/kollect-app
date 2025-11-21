import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useCartStore, type CartItem } from '../../src/store/cartStore';

export default function CartScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const totalQty = useCartStore((s) => s.totalQuantity());
  const clear = useCartStore((s) => s.clear);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const total = subtotal;

  const renderItem = ({ item }: { item: CartItem }) => (
    <View
      style={[
        styles.itemContainer,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0',
        },
      ]}
    >
      <View style={styles.itemLeft}>
        <View style={styles.imageWrapper}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: isDark ? '#333' : '#f5f5f5' },
              ]}
            >
              <Ionicons
                name="image-outline"
                size={24}
                color={isDark ? '#666' : '#ccc'}
              />
            </View>
          )}
          {item.quantity > 1 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.quantity}</Text>
            </View>
          )}
        </View>

        <View style={styles.itemInfo}>
          <Text
            style={[
              styles.itemName,
              { color: isDark ? '#fff' : '#000' },
            ]}
            numberOfLines={2}
          >
            {item.name}
          </Text>

          <View style={styles.variantRow}>
            {item.size && (
              <View style={[styles.tag, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f5f5f5' }]}>
                <Text style={[styles.tagText, { color: isDark ? '#aaa' : '#666' }]}>
                  {item.size}
                </Text>
              </View>
            )}
            {item.color && (
              <View style={[styles.tag, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f5f5f5' }]}>
                <Text style={[styles.tagText, { color: isDark ? '#aaa' : '#666' }]}>
                  {item.color}
                </Text>
              </View>
            )}
          </View>

          <Text
            style={[
              styles.itemPrice,
              { color: theme.colors.primary },
            ]}
          >
            {item.price.toLocaleString()} CFA
          </Text>
        </View>
      </View>

      <View style={styles.itemRight}>
        <View
          style={[
            styles.qtyControl,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f8f8',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e8e8e8',
            },
          ]}
        >
          <TouchableOpacity
            onPress={() =>
              updateQuantity(item.productId, Math.max(1, item.quantity - 1), {
                size: item.size,
                color: item.color,
              })
            }
            style={styles.qtyBtn}
          >
            <Ionicons
              name="remove"
              size={16}
              color={theme.colors.primary}
            />
          </TouchableOpacity>

          <Text style={[styles.qtyValue, { color: isDark ? '#fff' : '#000' }]}>
            {item.quantity}
          </Text>

          <TouchableOpacity
            onPress={() =>
              updateQuantity(item.productId, item.quantity + 1, {
                size: item.size,
                color: item.color,
              })
            }
            style={styles.qtyBtn}
          >
            <Ionicons
              name="add"
              size={16}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() =>
            removeItem(item.productId, {
              size: item.size,
              color: item.color,
            })
          }
          style={styles.removeBtn}
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color="#ff4444"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000' : '#fafafa' },
      ]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
            Mon Panier
          </Text>
          {items.length > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.cartBadgeText}>{totalQty}</Text>
            </View>
          )}
        </View>
        {items.length > 0 && (
          <Text style={[styles.subtitle, { color: isDark ? '#888' : '#666' }]}>
            {items.length} article{items.length > 1 ? 's' : ''} dans votre panier
          </Text>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5' }]}>
            <Ionicons
              name="cart-outline"
              size={64}
              color={isDark ? '#444' : '#ddd'}
            />
          </View>
          <Text style={[styles.emptyTitle, { color: isDark ? '#fff' : '#000' }]}>
            Votre panier est vide
          </Text>
          <Text style={[styles.emptyText, { color: isDark ? '#888' : '#666' }]}>
            Ajoutez des articles pour commencer
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(it) =>
              `${it.productId}-${it.size ?? ''}-${it.color ?? ''}`
            }
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Footer with gradient */}
          <View style={styles.footerContainer}>
            <LinearGradient
              colors={
                isDark
                  ? ['rgba(0,0,0,0)', 'rgba(0,0,0,0.95)', '#000']
                  : ['rgba(255,255,255,0)', 'rgba(250,250,250,0.95)', '#fafafa']
              }
              style={styles.footerGradient}
            >
              <View
                style={[
                  styles.footer,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0',
                  },
                ]}
              >
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: isDark ? '#aaa' : '#666' }] }>
                    Total
                  </Text>
                  <Text style={[styles.summaryValue, { color: isDark ? '#fff' : '#000' }]}>
                    {total.toLocaleString()} CFA
                  </Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={clear}
                    style={[
                      styles.clearBtn,
                      {
                        backgroundColor: isDark ? 'rgba(255,68,68,0.1)' : '#fff5f5',
                        borderColor: '#ff4444',
                      },
                    ]}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ff4444" />
                    <Text style={[styles.clearText, { color: '#ff4444' }]}>
                      Vider
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push('/checkout')}
                    style={[
                      styles.checkoutBtn,
                    ]}
                  >
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.primary + 'dd']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.checkoutGradient}
                    >
                      <Text style={styles.checkoutText}>Commander</Text>
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  cartBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#000',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  variantRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 10,
    marginLeft: 12,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  qtyValue: {
    minWidth: 32,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
  },
  removeBtn: {
    padding: 8,
  },
  footerContainer: {
    position: 'relative',
  },
  footerGradient: {
    paddingTop: 24,
  },
  footer: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 90,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(128,128,128,0.2)',
    marginVertical: 12,
  },
  totalRow: {
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.2,
    flex: 0.8,
  },
  clearText: {
    fontWeight: '600',
    fontSize: 14,
  },
  checkoutBtn: {
    flex: 1.5,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  checkoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});