import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './context/ThemeContext';
import { useNotificationsStore } from '../src/features/notifications/services/notificationsStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function CeoNotificationsScreen() {
  const { theme, isDark } = useTheme();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchMyNotifications,
    markAsRead,
  } = useNotificationsStore();

  useEffect(() => {
    void fetchMyNotifications();
  }, [fetchMyNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'COMMANDE_CONFIRMEE':
        return 'checkmark-circle';
      case 'NOUVELLE_COMMANDE':
        return 'cart';
      case 'COMMANDE_ANNULEE':
        return 'close-circle';
      case 'PAIEMENT':
        return 'wallet';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string, isUnread: boolean) => {
    if (!isUnread) return theme.colors.textSecondary;
    
    switch (type) {
      case 'COMMANDE_CONFIRMEE':
        return theme.colors.success;
      case 'NOUVELLE_COMMANDE':
        return theme.colors.primary;
      case 'COMMANDE_ANNULEE':
        return theme.colors.error;
      case 'PAIEMENT':
        return theme.colors.accent;
      default:
        return theme.colors.primary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'À l\'instant';
    if (diffInMins < 60) return `Il y a ${diffInMins} min`;
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const renderItem = ({ item }: any) => {
    const isUnread = !item.read;
    const notifColor = getNotificationColor(item.type, isUnread);
    const iconName = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.item,
          {
            backgroundColor: isUnread ? theme.colors.surface : theme.colors.card,
            borderColor: isUnread ? `${notifColor}40` : theme.colors.borderLight,
            shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => {
          if (isUnread) {
            void markAsRead(item.id);
          }
        }}
      >
        {/* Barre latérale colorée pour notifications non lues */}
        {isUnread && (
          <View style={[styles.unreadBar, { backgroundColor: notifColor }]} />
        )}

        {/* Icône avec background */}
        <View style={[styles.iconContainer, { backgroundColor: `${notifColor}15` }]}>
          <Ionicons
            name={iconName as any}
            size={24}
            color={notifColor}
          />
        </View>

        {/* Contenu */}
        <View style={styles.contentContainer}>
          <View style={styles.textContainer}>
            <Text 
              style={[
                styles.title, 
                { 
                  color: theme.colors.text,
                  fontWeight: isUnread ? '700' : '600',
                }
              ]} 
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text 
              style={[styles.message, { color: theme.colors.textSecondary }]} 
              numberOfLines={2}
            >
              {item.message}
            </Text>
            
            {/* Date */}
            <Text style={[styles.date, { color: theme.colors.textDisabled }]}>
              {formatDate(item.createdAt || new Date().toISOString())}
            </Text>
          </View>

          {/* Badge non lu */}
          {isUnread && (
            <View style={[styles.unreadBadge, { backgroundColor: notifColor }]}>
              <View style={styles.unreadDot} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* Header avec gradient */}
      <LinearGradient
        colors={isDark 
          ? [theme.colors.background, theme.colors.surface]
          : [theme.colors.card, theme.colors.background]
        }
        style={[styles.header, { borderBottomColor: theme.colors.divider }]}
      >
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View style={[styles.headerBadge, { backgroundColor: theme.colors.accent }]}>
              <Text style={[styles.headerBadgeText, { color: theme.colors.card }]}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>

        {/* Bouton "Tout marquer comme lu" */}
        {unreadCount > 0 && (
          <TouchableOpacity
            style={[styles.markAllButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              // Marquer toutes les notifications comme lues
              notifications
                .filter(n => !n.read)
                .forEach(n => void markAsRead(n.id));
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-done" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Loading State */}
      {loading && (
        <View style={styles.centerContainer}>
          <View style={[styles.loadingIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Chargement des notifications...
          </Text>
        </View>
      )}

      {/* Error State */}
      {!loading && error && (
        <View style={styles.centerContainer}>
          <View style={[styles.errorIcon, { backgroundColor: `${theme.colors.error}15` }]}>
            <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
          </View>
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Erreur de chargement
          </Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void fetchMyNotifications()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.retryButtonGradient}
            >
              <Ionicons name="refresh" size={20} color={theme.colors.card} />
              <Text style={[styles.retryButtonText, { color: theme.colors.card }]}>
                Réessayer
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State */}
      {!loading && !error && notifications.length === 0 && (
        <View style={styles.centerContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.colors.surface }]}>
            <Ionicons 
              name="notifications-off-outline" 
              size={64} 
              color={theme.colors.textDisabled} 
            />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            Aucune notification
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Vous n&apos;avez pas encore reçu de notifications
          </Text>
        </View>
      )}

      {/* Notifications List */}
      {!loading && !error && notifications.length > 0 && (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  markAllButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  loadingIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 15,
  },
  errorIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: 20,
    paddingBottom: 32,
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  date: {
    fontSize: 11,
    marginTop: 4,
  },
  unreadBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
});