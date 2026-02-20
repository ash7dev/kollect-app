/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MotiView } from 'moti';
import { CheckCommandeModal } from './check-commande-modal';
import { useTheme } from '../../../app/context/ThemeContext';

// Types
interface Order {
  id: string;
  customer: string;
  amount: number;
  status: 'en attente' | 'confirmée' | 'annulée';
  date: string;
  itemsCount: number;
  phone: string;
  address: string;
}

interface OrderCardProps {
  order: Order;
  onPress: (order: Order) => void;
  index: number;
}

const OrderCard = ({ order, onPress, index }: OrderCardProps) => {
  const { theme, isDark } = useTheme();
  
  console.log(`[OrderCard] Rendu de la commande ${order.id}`, {
    customer: order.customer,
    status: order.status,
    amount: order.amount,
    itemsCount: order.itemsCount
  });
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    console.log(`[OrderCard] Appui sur la commande ${order.id}`);
    setIsPressed(true);
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    console.log(`[OrderCard] Ouverture du modal pour la commande ${order.id}`);
    setIsModalVisible(true);
    setIsPressed(false);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleProcessOrder = () => {
    console.log(`[OrderCard] Traitement de la commande ${order.id}`, {
      status: order.status,
      customer: order.customer
    });
    setIsModalVisible(false);
    onPress(order);
  };

  // Couleurs de statut utilisant la palette Kollect
  const statusColors = {
    'en attente': theme.colors.warning,     // #FF9500
    'confirmée': theme.colors.info,         // #007AFF
    'annulée': theme.colors.error,          // #FF3B30
  };

  const statusLabels = {
    'en attente': 'En attente',
    'confirmée': 'Confirmée',
    'annulée': 'Annulée',
  };

  // Log quand le composant est monté
  React.useEffect(() => {
    console.log(`[OrderCard] Composant monté pour la commande ${order.id}`);
    return () => {
      console.log(`[OrderCard] Composant démonté pour la commande ${order.id}`);
    };
  }, [order.id]);

  // Styles dynamiques basés sur le thème
  const dynamicStyles = {
    card: {
      backgroundColor: theme.colors.card,
      shadowColor: isDark ? theme.colors.text : theme.colors.primary,
    },
    customerName: {
      color: theme.colors.text,
    },
    orderDate: {
      color: theme.colors.textSecondary,
    },
    orderItemText: {
      color: theme.colors.textSecondary,
    },
    amount: {
      color: theme.colors.text,
    },
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300, delay: index * 50 }}
    >
      <Animated.View
        style={[
          {
            transform: [{ scale: scaleValue }],
            opacity: isPressed ? 0.8 : 1,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.card,
            dynamicStyles.card,
            isPressed && styles.cardPressed
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          <View style={styles.leftSection}>
            <View style={styles.customerInfo}>
              <Text style={[styles.customerName, dynamicStyles.customerName]} numberOfLines={1}>
                {order.customer}
              </Text>
              <Text style={[styles.orderDate, dynamicStyles.orderDate]}>
                {new Date(order.date).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.orderInfo}>
              <View style={styles.orderItem}>
                <Ionicons 
                  name="basket-outline" 
                  size={16} 
                  color={theme.colors.textSecondary} 
                />
                <Text style={[styles.orderItemText, dynamicStyles.orderItemText]}>
                  {order.itemsCount} articles
                </Text>
              </View>
              <View style={styles.orderItem}>
                <Ionicons 
                  name="time-outline" 
                  size={16} 
                  color={theme.colors.textSecondary} 
                />
                <Text style={[styles.orderItemText, dynamicStyles.orderItemText]}>
                  {new Date(order.date).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.rightSection}>
            <Text style={[styles.amount, dynamicStyles.amount]}>
              {order.amount.toLocaleString('fr-FR')} FCFA
            </Text>
            <View 
              style={[
                styles.statusBadge, 
                { backgroundColor: `${statusColors[order.status]}20` }
              ]}
            >
              <Text 
                style={[
                  styles.statusText, 
                  { color: statusColors[order.status] }
                ]}
              >
                {statusLabels[order.status]}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <CheckCommandeModal
          visible={isModalVisible}
          order={{
            ...order,
            clientName: order.customer,
            total: order.amount,
            itemsCount: order.itemsCount,
            status: order.status,
          }}
          onClose={() => setIsModalVisible(false)}
          onProcessOrder={handleProcessOrder}
        />
      </Animated.View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.9,
  },
  leftSection: {
    flex: 1,
    marginRight: 12,
  },
  customerInfo: {
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 13,
  },
  orderInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  orderItemText: {
    fontSize: 13,
    marginLeft: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default OrderCard;
