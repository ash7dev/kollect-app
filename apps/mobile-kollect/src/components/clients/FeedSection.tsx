import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { useTheme } from '../../../app/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient'; // Si disponible

type CardRenderer<T> = (item: T, index: number) => React.ReactNode;

type LayoutType = 'grid' | 'horizontal';

type Props<T> = {
  title: string;
  data: T[];
  renderItem: CardRenderer<T>;
  itemWidth?: number;
  subtitle?: string;
  showGradient?: boolean;
  layout?: LayoutType;
};

export function FeedSection<T>({ 
  title, 
  data, 
  renderItem, 
  itemWidth = 280,
  subtitle,
  showGradient = false,
  layout = 'grid' 
}: Props<T>) {
  const { theme } = useTheme();
  
  if (!data?.length) return null;

  return (
    <View style={styles.container}>
      {/* Header avec design moderne */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </Text>
            {showGradient && (
              <View style={[styles.titleUnderline, { 
                backgroundColor: theme.colors.primary || '#007AFF' 
              }]} />
            )}
          </View>
          {subtitle && (
            <Text style={[styles.subtitle, { 
              color: theme.colors.text + '99' // 60% opacity
            }]}>
              {subtitle}
            </Text>
          )}
        </View>
        
        {/* Badge optionnel pour le nombre d'items */}
        <View style={[styles.badge, { 
          backgroundColor: theme.colors.primary + '15' || '#007AFF15' 
        }]}>
          <Text style={[styles.badgeText, { 
            color: theme.colors.primary || '#007AFF' 
          }]}>
            {data.length}
          </Text>
        </View>
      </View>

      {layout === 'grid' ? (
        <View style={styles.grid}>
          {data.map((item, index) => (
            <View 
              key={index} 
              style={styles.gridItem}
            >
              {renderItem(item, index)}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.horizontalScrollContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
            snapToInterval={itemWidth + 24} // Largeur de l'élément + marge
            decelerationRate="fast"
          >
            {data.map((item, index) => (
              <View 
                key={index}
                style={[
                  styles.horizontalItem, 
                  { width: itemWidth },
                  index === 0 && styles.firstItem,
                  index === data.length - 1 && styles.lastItem
                ]}
              >
                {renderItem(item, index)}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
    gap: 4,
  },
  titleContainer: {
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
  titleUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridItem: {
    width: '48%', // 2 colonnes avec un petit espace entre
    marginBottom: 16,
  },
  horizontalScrollContainer: {
    paddingVertical: 16,
  },
  horizontalScrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 16,
  },
  horizontalItem: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  firstItem: {
    marginLeft: 20,
  },
  lastItem: {
    marginRight: 20,
  },
});