/* eslint-disable @typescript-eslint/no-unused-vars */
// src/screen/CreatorPromptScreen.tsx - AVEC STATE MACHINE
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../../app/context/ThemeContext';
import { useAppStateMachine } from '../machines/appStateMachine';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export const CreatorPromptScreen = () => {
  const { user, updateUserRole } = useAuthStore();
  const { theme, isDark } = useTheme();
  const { send } = useAppStateMachine(); // ✨ Accès à la machine
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'client' | 'vendeur' | null>(null);

  const handleSelectRole = async (role: 'client' | 'vendeur') => {
    if (isSubmitting) return;
    
    setSelectedRole(role);
    setIsSubmitting(true);
   
    try {
      console.log(`🔄 [CreatorPrompt] Mise à jour du rôle: ${role}`);
     
      // 1. Mettre à jour le rôle dans le backend
      const response = await updateUserRole(role);
     
      if (!response?.user?.has_seen_creator_prompt) {
        throw new Error('Échec de la mise à jour du rôle');
      }
     
      console.log('✅ [CreatorPrompt] Rôle mis à jour avec succès');
     
      // 2. ✨ ENVOYER L'ÉVÉNEMENT À LA STATE MACHINE
      send({
        type: 'ROLE_SELECTED',
        role,
        user: response.user,
      });
     
      // La navigation sera gérée automatiquement par la machine
      // Redirection explicite si l'utilisateur a choisi le rôle client
      if (role === 'client') {
        setTimeout(() => {
          router.replace('/(client)' as any);
        }, 300);
      }
     
    } catch (error: any) {
      console.error('❌ [CreatorPrompt] Erreur:', error);
      Alert.alert(
        'Erreur',
        'Impossible de mettre à jour votre profil. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
      setSelectedRole(null);
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.loadingBox, {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        }]}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Configuration de votre profil...
          </Text>
          <Text style={[styles.loadingSubtext, { color: theme.colors.textSecondary }]}>
            {selectedRole === 'client' ? '🛍️ Mode acheteur' : '🏪 Préparation de votre boutique'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.topAccent, { backgroundColor: theme.colors.accent }]} />
     
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>
            BIENVENUE
          </Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {user?.firstName || 'Utilisateur'} 👋
          </Text>
          <View style={[styles.divider, { backgroundColor: theme.colors.accent }]} />
        </View>

        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Pour continuer, choisissez votre parcours
        </Text>

        <View style={styles.buttonsContainer}>
          {/* Bouton Client */}
          <TouchableOpacity
            style={[styles.button, {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            }]}
            onPress={() => handleSelectRole('client')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '15' }]}>
                <Text style={styles.emoji}>🛍️</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={[styles.buttonTitle, { color: theme.colors.text }]}>
                  Je veux acheter
                </Text>
                <Text style={[styles.buttonDescription, { color: theme.colors.textSecondary }]}>
                  Découvrir et acheter des collections exclusives
                </Text>
              </View>
              <View style={[styles.arrow, { borderColor: theme.colors.textSecondary }]} />
            </View>
          </TouchableOpacity>

          {/* Bouton Vendeur */}
          <TouchableOpacity
            style={[styles.button, {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            }]}
            onPress={() => handleSelectRole('vendeur')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.accent + '15' }]}>
                <Text style={styles.emoji}>🏪</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={[styles.buttonTitle, { color: theme.colors.text }]}>
                  Je veux vendre
                </Text>
                <Text style={[styles.buttonDescription, { color: theme.colors.textSecondary }]}>
                  Créer ma boutique et gérer mes collections streetwear
                </Text>
              </View>
              <View style={[styles.arrow, { borderColor: theme.colors.textSecondary }]} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.badge, {
          backgroundColor: theme.colors.primary + '08',
          borderColor: theme.colors.border,
        }]}>
          <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
            🔒 Vous pourrez changer ce choix plus tard
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    width: 60,
    height: 3,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  button: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  buttonTextContainer: {
    flex: 1,
    gap: 4,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  buttonDescription: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  arrow: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  badge: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingBox: {
    padding: 40,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    gap: 16,
    minWidth: width * 0.7,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});