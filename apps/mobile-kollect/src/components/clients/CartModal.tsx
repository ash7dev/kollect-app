import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore, type CartItem } from '../../store/cartStore';
import { useTheme } from '../../../app/context/ThemeContext';

export type CartModalProps = {
  visible: boolean;
  onClose: () => void;
  onCheckout: () => void;
};

export default function CartModal({ visible, onClose, onCheckout }: CartModalProps) {
  const { theme, isDark } = useTheme();

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const totalQty = useCartStore((s) => s.totalQuantity());
  const clear = useCartStore((s) => s.clear);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={[styles.itemContainer, { backgroundColor: theme.colors.card, borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight }]}> 
      <View style={styles.itemLeft}>
        <View style={styles.imageWrapper}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="image-outline" size={20} color={theme.colors.textSecondary} />
            </View>
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text numberOfLines={1} style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</Text>
          <View style={styles.variantRow}>
            {item.size ? (
              <Text style={[styles.variantText, { color: theme.colors.textSecondary }]}>Taille: {item.size}</Text>
            ) : null}
            {item.color ? (
              <Text style={[styles.variantText, { color: theme.colors.textSecondary }]}>Couleur: {item.color}</Text>
            ) : null}
          </View>
          <Text style={[styles.itemPrice, { color: theme.colors.primary }]}>{item.price} CFA</Text>
        </View>
      </View>

      <View style={styles.itemRight}>
        <View style={[styles.qtyControl, { borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight }]}> 
          <TouchableOpacity
            onPress={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), { size: item.size, color: item.color })}
            style={styles.qtyBtn}
          >
            <Ionicons name="remove" size={18} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.qtyValue, { color: theme.colors.text }]}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => updateQuantity(item.productId, item.quantity + 1, { size: item.size, color: item.color })}
            style={styles.qtyBtn}
          >
            <Ionicons name="add" size={18} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => removeItem(item.productId, { size: item.size, color: item.color })} style={styles.removeBtn}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)' }]}>
        <View style={[styles.sheet, { backgroundColor: theme.colors.background, borderTopColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight }]}> 
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Mon Panier</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Votre panier est vide</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={items}
                keyExtractor={(it) => `${it.productId}-${it.size ?? ''}-${it.color ?? ''}`}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />

              <View style={[styles.footer, { borderTopColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight }]}> 
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Articles</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{totalQty}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Sous-total</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{subtotal} CFA</Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity onPress={clear} style={[styles.clearBtn, { borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight }]}>
                    <Ionicons name="trash-bin-outline" size={18} color={theme.colors.error} />
                    <Text style={[styles.clearText, { color: theme.colors.error }]}>Vider commande</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onCheckout} style={[styles.checkoutBtn, { backgroundColor: theme.colors.primary }]}> 
                    <Ionicons name="bag-check-outline" size={18} color="#fff" />
                    <Text style={styles.checkoutText}>Passer à commande</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  imageWrapper: {
    width: 58,
    height: 58,
    borderRadius: 8,
    overflow: 'hidden',
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
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  variantRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  variantText: {
    fontSize: 12,
  },
  itemPrice: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 8,
    marginLeft: 8,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  qtyValue: {
    minWidth: 28,
    textAlign: 'center',
    fontWeight: '600',
  },
  removeBtn: {
    padding: 6,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  clearBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  clearText: {
    fontWeight: '600',
  },
  checkoutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  checkoutText: {
    color: '#fff',
    fontWeight: '700',
  },
});
