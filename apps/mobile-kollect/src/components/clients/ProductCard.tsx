import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';
import { ShareButton } from '../ui/ShareButton';
import { ShareService, ShareType } from '../../features/share/services/share.service';

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  brandName?: string;
  onAddToCart?: () => void;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  imageUrl,
  brandName,
  onAddToCart,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Link href={`/product/${id}`} asChild>
        <TouchableOpacity style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={[styles.image, { backgroundColor: theme.colors.background }]} />
          )}
        </TouchableOpacity>
      </Link>

      <View style={styles.detailsContainer}>
        {brandName && (
          <Text style={[styles.brand, { color: theme.colors.textSecondary }]}>
            {brandName}
          </Text>
        )}
        <Link href={`/product/${id}`} asChild>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={2}>
            {name}
          </Text>
        </Link>
        
        <View style={styles.footer}>
          <Text style={[styles.price, { color: theme.colors.primary }]}>
            {`${price.toLocaleString('fr-FR')} CFA`}
          </Text>
          <View style={styles.actionsRow}>
            <ShareButton
              data={{
                type: ShareType.PRODUCT,
                id,
                name,
                price,
                brandName,
                imageUrl: imageUrl || undefined,
              }}
              size="small"
              style={styles.shareButton}
            />
            {onAddToCart && (
              <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                onPress={onAddToCart}
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 12,
  },
  brand: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    height: 36,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareButton: {
    marginRight: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
