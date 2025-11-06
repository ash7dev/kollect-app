import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { theme } from '@/theme';

const CeoDashboardScreen = () => {
  const { user } = useAuthStore();
  const { colors } = theme;

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Chargement des informations utilisateur...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Bonjour, {user.firstName || 'Cher CEO'}
        </Text>
        
        <View style={styles.userInfo}>
          <Text style={[styles.text, { color: colors.text }]}>
            {user.email}
          </Text>
          {user.lastName && (
            <Text style={[styles.subtext, { color: colors.text }]}>
              {user.lastName}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>
            Rôle
          </Text>
          <Text style={[styles.cardText, { color: colors.text }]}>
            {user.isCEO ? 'CEO' : user.isAdmin ? 'Administrateur' : 'Utilisateur'}
          </Text>
        </View>

        {user.brand && (
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.primary }]}>
              Boutique
            </Text>
            <Text style={[styles.cardText, { color: colors.text }]}>
              {user.brand.name}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
  },
  subtext: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
  },
  header: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 24,
  },
  userInfo: {
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CeoDashboardScreen;
