import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../../app/context/ThemeContext';

interface Order {
  id: string;
  clientName: string;
  date: string;
  status: 'en attente' | 'confirmée' | 'annulée';
  total: number;
  itemsCount: number;
  address: string;
  phone: string;
}

interface CheckCommandeModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onProcessOrder: (orderId: string) => void;
}

export const CheckCommandeModal: React.FC<CheckCommandeModalProps> = ({
  visible,
  order,
  onClose,
  onProcessOrder,
}) => {
  const { theme, isDark } = useTheme();

  if (!order) return null;

  // Styles dynamiques basés sur le thème
  const dynamicStyles = {
    modalOverlay: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)',
    },
    glassContainer: {
      backgroundColor: isDark 
        ? 'rgba(26, 26, 26, 0.95)' 
        : 'rgba(255, 255, 255, 0.85)',
      borderColor: isDark 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(255, 255, 255, 0.5)',
      borderTopColor: isDark 
        ? 'rgba(255, 255, 255, 0.15)' 
        : 'rgba(255, 255, 255, 0.8)',
      borderLeftColor: isDark 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(255, 255, 255, 0.7)',
      borderRightColor: isDark 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(255, 255, 255, 0.7)',
    },
    modalHeader: {
      borderBottomColor: isDark 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.03)',
      backgroundColor: isDark 
        ? 'rgba(26, 26, 26, 0.8)' 
        : 'rgba(255, 255, 255, 0.6)',
    },
    modalTitle: {
      color: theme.colors.text,
    },
    closeButton: {
      color: theme.colors.textSecondary,
    },
    sectionTitle: {
      color: theme.colors.text,
    },
    label: {
      color: theme.colors.textSecondary,
    },
    value: {
      color: theme.colors.text,
    },
    totalValue: {
      color: theme.colors.text,
    },
    address: {
      color: theme.colors.text,
    },
    phone: {
      color: theme.colors.textSecondary,
    },
  };

  // Couleurs de statut utilisant la palette Kollect
  const getStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'en attente':
        return {
          backgroundColor: `${theme.colors.warning}20`,
          color: theme.colors.warning,
        };
      case 'confirmée':
        return {
          backgroundColor: `${theme.colors.info}20`,
          color: theme.colors.info,
        };
      case 'annulée':
        return {
          backgroundColor: `${theme.colors.error}20`,
          color: theme.colors.error,
        };
    }
  };

  const statusStyle = getStatusStyle(order.status);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, dynamicStyles.modalOverlay]}>
        <BlurView 
          intensity={60} 
          tint={isDark ? 'dark' : 'light'} 
          style={[styles.glassContainer, dynamicStyles.glassContainer]}
        >
          <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
            <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>
              Détails de la commande
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons 
                name="close" 
                size={22} 
                color={dynamicStyles.closeButton.color} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
                Résumé
              </Text>
              <View style={styles.infoRow}>
                <Text style={[styles.label, dynamicStyles.label]}>N° commande</Text>
                <Text style={[styles.value, dynamicStyles.value]}>#{order.id}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.label, dynamicStyles.label]}>Date</Text>
                <Text style={[styles.value, dynamicStyles.value]}>{order.date}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.label, dynamicStyles.label]}>Statut</Text>
                <Text
                  style={[
                    styles.status,
                    {
                      backgroundColor: statusStyle.backgroundColor,
                      color: statusStyle.color,
                    },
                  ]}
                >
                  {order.status}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.infoRow}>
                <Text style={[styles.label, dynamicStyles.label]}>Articles</Text>
                <Text style={[styles.value, dynamicStyles.value]}>
                  {order.itemsCount}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.label, dynamicStyles.label]}>Montant total</Text>
                <Text style={[styles.value, styles.totalValue, dynamicStyles.totalValue]}>
                  {order.total.toLocaleString('fr-FR')} FCFA
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
                Livraison
              </Text>
              <Text style={[styles.address, dynamicStyles.address]}>
                {order.address}
              </Text>
              <Text style={[styles.phone, dynamicStyles.phone]}>
                Tél: {order.phone}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.processButton,
                { backgroundColor: theme.colors.success }
              ]}
              onPress={() => onProcessOrder(order.id)}
            >
              <Text style={styles.processButtonText}>Traiter la commande</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  glassContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    maxHeight: '92%',
    paddingBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 15,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 18,
    borderBottomWidth: 1,
    backdropFilter: 'blur(12px)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  address: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  phone: {
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  processButton: {
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 20,
    shadowColor: '#34C759',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
    position: 'relative',
  },
  processButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CheckCommandeModal;