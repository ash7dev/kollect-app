import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { useNotificationsStore } from '../src/features/notifications/services/notificationsStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ClientNotificationsScreen() {
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

  const renderItem = ({ item }: any) => {
    const isUnread = !item.read;
    return (
      <TouchableOpacity
        style={[
          styles.item,
          {
            backgroundColor: isUnread
              ? isDark
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(0,0,0,0.02)'
              : theme.colors.background,
            borderColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => {
          if (isUnread) {
            void markAsRead(item.id);
          }
        }}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={item.type === 'COMMANDE_CONFIRMEE' ? 'checkmark-circle' : 'notifications-outline'}
            size={20}
            color={isUnread ? theme.colors.accent : theme.colors.textSecondary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.message, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.message}
          </Text>
        </View>
        {isUnread && <View style={[styles.unreadDot, { backgroundColor: theme.colors.accent }]} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: isDark ? theme.colors.borderDarkSubtle : theme.colors.borderLight }]}> 
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Notifications</Text>

        {unreadCount > 0 ? (
          <Text style={[styles.headerBadge, { color: theme.colors.accent }]}> 
            {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
          </Text>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {loading && (
        <View style={styles.center}> 
          <ActivityIndicator size="small" color={theme.colors.accent} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Text style={{ color: theme.colors.error || '#EF4444' }}>{error}</Text>
        </View>
      )}

      {!loading && !error && notifications.length === 0 && (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={40} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Aucune notification pour le moment</Text>
        </View>
      )}

      {!loading && notifications.length > 0 && (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 20,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingRight: 8,
    paddingVertical: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerBadge: {
    fontSize: 14,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});
