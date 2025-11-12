import React from 'react';
import { View, StyleSheet, FlatList, ListRenderItem, Dimensions } from 'react-native';
import { ProductCard } from './ProductCard';

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  brandName?: string;
};

type ProductsGridProps = {
  products: Product[];
  onAddToCart?: (productId: string) => void;
  numColumns?: number;
  loading?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListFooterComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement | null;
};

export const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  onAddToCart,
  numColumns = 2,
  loading = false,
  onEndReached,
  onEndReachedThreshold = 0.5,
  ListFooterComponent,
  ListEmptyComponent,
}) => {
  // Calculer la largeur des cartes en fonction du nombre de colonnes
  const { width } = Dimensions.get('window');
  const padding = 16; // padding horizontal du conteneur
  const gap = 12; // espacement entre les cartes
  const cardWidth = (width - padding * 2 - gap * (numColumns - 1)) / numColumns;

  const renderProduct: ListRenderItem<Product> = ({ item }) => (
    <View style={[styles.cardContainer, { width: cardWidth }]}>
      <ProductCard
        id={item.id}
        name={item.name}
        price={item.price}
        imageUrl={item.imageUrl}
        brandName={item.brandName}
        onAddToCart={onAddToCart ? () => onAddToCart(item.id) : undefined}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardContainer: {
    marginBottom: 16,
  },
});
