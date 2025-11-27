import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ColorValue } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';

// Types pour les props du composant GuestProfileView
type GuestProfileViewProps = {
  onLogin: () => void;
  onCreateBrand: () => void;
  theme: {
    colors: {
      accent: ColorValue | undefined;
      background: string;
      card: string;
      primary: string;
      text: string;
      textSecondary: string;
      border: string;
      success: string;
    };
  };
};

// Composant pour la vue invité
const GuestProfileView = ({ onLogin, onCreateBrand, theme }: GuestProfileViewProps) => (
  <View style={[styles.guestContainer, { backgroundColor: theme.colors.background }]}>
    <View style={[styles.guestContent, { backgroundColor: theme.colors.card }]}>
      <View style={styles.guestHeader}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary, marginBottom: 16, width: 80, height: 80, borderRadius: 40 }]}>
          <Ionicons name="person-circle-outline" size={48} color="#FFFFFF" />
        </View>
        <Text style={[styles.guestTitle, { color: theme.colors.text }]}>
          Connectez-vous
        </Text>
        <Text style={[styles.guestSubtitle, { color: theme.colors.textSecondary }]}>
          Pour accéder à votre profil et gérer vos commandes
        </Text>
      </View>

      <View style={styles.guestActions}>
        <TouchableOpacity
          style={[styles.guestButton, { backgroundColor: theme.colors.primary }]}
          onPress={onLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.guestButtonText}>Se connecter</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>ou</Text>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        </View>

        <TouchableOpacity
          style={[styles.guestButton, { backgroundColor: theme.colors.accent}]}
          onPress={onCreateBrand}
          activeOpacity={0.8}
        >
          <Text style={styles.guestButtonText}>Créer votre marque</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function ProfileScreen() {
  const { theme } = useTheme();
  
  // ✅ Utiliser uniquement le store Zustand
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);
  const updateUserRole = useAuthStore((state) => state.updateUserRole);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // La navigation sera gérée automatiquement par _layout.tsx
              // car isAuthenticated passera à false
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
            }
          },
        },
      ]
    );
  };

  const handleCreateBrand = async () => {
    if (isUpgrading) return;

    try {
      setIsUpgrading(true);

      // Si déjà CEO, pas besoin de mettre à jour le rôle
      if (user?.isCEO) {
        router.push('/create-brand');
        return;
      }

      // Mettre à jour le rôle côté backend/store (même logique que CreatorPromptScreen)
      const response = await updateUserRole('vendeur');

      if (!response?.user?.has_seen_creator_prompt) {
        throw new Error('La mise à jour du rôle a échoué');
      }

      // Une fois le rôle mis à jour, on envoie vers create-brand
      router.push('/create-brand');
    } catch (error) {
      console.error('[Profile] Erreur lors du passage en vendeur:', error);
      Alert.alert(
        'Erreur',
        "Impossible de passer en mode vendeur pour le moment. Réessaie plus tard.",
      );
    } finally {
      setIsUpgrading(false);
    }
  };

  // Si l'utilisateur n'est pas connecté, afficher la vue invité
  if (!user) {
    return (
      <GuestProfileView 
        onLogin={() => router.push('/(auth)/login')}
        onCreateBrand={() => router.push('/(auth)/register')}
        theme={theme}
      />
    );
  }

  // Vue pour utilisateur connecté
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.content, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="person" size={32} color="#FFFFFF" />
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
            {user.email}
          </Text>
          
          {/* Afficher les rôles pour debug */}
          <View style={styles.rolesContainer}>
            {user.isAdmin && (
              <View style={[styles.roleBadge, { backgroundColor: theme.colors.error }]}>
                <Text style={styles.roleText}>Admin</Text>
              </View>
            )}
            {user.isCEO && (
              <View style={[styles.roleBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.roleText}>CEO</Text>
              </View>
            )}
            {user.isClient && (
              <View style={[styles.roleBadge, { backgroundColor: theme.colors.success }]}>
                <Text style={styles.roleText}>Client</Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions principales */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionItem, { borderColor: theme.colors.borderLight }]}
            activeOpacity={0.8}
            onPress={() => router.push('/favorites')}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Mes favoris</Text>
                <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>Produits que tu as mis de côté</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionItem, { borderColor: theme.colors.borderLight }]}
            activeOpacity={0.8}
            onPress={() => router.push('/orders')}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.accent }]}>
                <Ionicons name="receipt-outline" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Historique d&apos;achats</Text>
                <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>Retrouve toutes tes commandes</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {user?.isClient && !user?.isCEO && (
            <TouchableOpacity
              style={[styles.actionItem, { borderColor: theme.colors.borderLight }]}
              activeOpacity={0.8}
              onPress={handleCreateBrand}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionIcon, { backgroundColor: theme.colors.success }]}>
                  <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Crée ta marque</Text>
                  <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>Deviens créateur et lance tes drops</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            { 
              backgroundColor: theme.colors.error,
              opacity: isLoading ? 0.6 : 1,
            },
          ]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>
            {isLoading ? 'Déconnexion...' : 'Se déconnecter'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Styles pour la vue invité
  guestContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  guestContent: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  guestHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  guestActions: {
    width: '100%',
  },
  guestButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  guestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#666',
  },

  // Styles existants
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 12,
  },
  rolesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 10,
    marginBottom: 24,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});