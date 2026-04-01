import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';
import { ProduitDto } from '@/features/produits/services/produits.service';

interface StockAlertSectionProps {
  products: ProduitDto[];
}

export const StockAlertSection: React.FC<StockAlertSectionProps> = ({ products }) => {
  const { theme } = useTheme();
  const router = useRouter();

  if (products.length === 0) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 400 }}
      style={[styles.section, { backgroundColor: theme.colors.card }]}
    >
      <View style={styles.sectionHeader}>
        <View>
          <View style={styles.headerTitleRow}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Alertes Stocks</Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Produits bientôt épuisés</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(ceo)/products')}>
          <Text style={[styles.viewAll, { color: theme.colors.primary }]}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {products.map((p) => (
          <TouchableOpacity 
            key={p.id}
            style={[styles.alertCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => router.push(`/product/${p.id}`)}
            activeOpacity={0.8}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: p.images[0] }} style={styles.alertImage} />
              <View style={[styles.urgencyBadge, { backgroundColor: '#EF4444' }]}>
                <Ionicons name="alert-circle" size={12} color="#FFF" />
                <Text style={styles.urgencyText}>{p.stock} restant(s)</Text>
              </View>
            </View>
            
            <View style={styles.alertInfo}>
              <Text style={[styles.alertName, { color: theme.colors.text }]} numberOfLines={1}>
                {p.name}
              </Text>
              
              {p.sku && (
                <Text style={[styles.productSku, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {p.sku}
                </Text>
              )}
              
              <View style={styles.productFooter}>
                <Text style={[styles.productPrice, { color: theme.colors.accent }]}>
                  {formatPrice(p.price)}
                </Text>
                
                <View style={[styles.stockBadgeSmall, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <View style={[styles.stockDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={[styles.stockBadgeText, { color: '#EF4444' }]}>
                    {p.stock}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  section: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  viewAll: {
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContainer: {
    paddingVertical: 16,
    gap: 16,
  },
  alertCard: {
    width: 240, // Increased to 240 as per plan
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1, // Full square as per ceo/products
  },
  alertImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  urgencyBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  urgencyText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  alertInfo: {
    padding: 14,
  },
  alertName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  productSku: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 10,
    opacity: 0.6,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  stockBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
