// src/components/QueryBoundary.tsx
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/app/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

// ============================================
// PROPS
// ============================================

interface QueryBoundaryProps {
  isLoading: boolean;
  error: Error | null;
  children: React.ReactNode;
  onRetry?: () => void;
  loadingMessage?: string;
  errorMessage?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function QueryBoundary({
  isLoading,
  error,
  children,
  onRetry,
  loadingMessage = 'Chargement...',
  errorMessage,
  emptyMessage = 'Aucune donnée disponible',
  isEmpty = false,
}: QueryBoundaryProps) {
  const { theme } = useTheme();

  // État de chargement
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
          {loadingMessage}
        </Text>
      </View>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.errorIcon, { backgroundColor: theme.colors.error + '15' }]}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
        </View>
        <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
          Une erreur est survenue
        </Text>
        <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
          {errorMessage || error.message}
        </Text>
        {onRetry && (
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={onRetry}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // État vide
  if (isEmpty) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.emptyIcon, { backgroundColor: theme.colors.border }]}>
          <Ionicons name="folder-open-outline" size={48} color={theme.colors.textSecondary} />
        </View>
        <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  // Afficher le contenu
  return <>{children}</>;
}

// ============================================
// LOADING COMPONENT (pour les mutations)
// ============================================

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message = 'Chargement...' }: LoadingOverlayProps) {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={[styles.overlayContent, { backgroundColor: theme.colors.card }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.overlayMessage, { color: theme.colors.text }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

// ============================================
// ERROR BANNER (pour afficher des erreurs inline)
// ============================================

interface ErrorBannerProps {
  error: Error | null;
  onDismiss?: () => void;
}

export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  const { theme } = useTheme();

  if (!error) return null;

  return (
    <View style={[styles.banner, { backgroundColor: theme.colors.error + '15', borderColor: theme.colors.error }]}>
      <View style={[styles.bannerIcon, { backgroundColor: theme.colors.error }]}>
        <Ionicons name="alert-circle" size={16} color="#FFFFFF" />
      </View>
      <Text style={[styles.bannerText, { color: theme.colors.error }]}>
        {error.message}
      </Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.bannerClose}>
          <Ionicons name="close-circle" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlayContent: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  overlayMessage: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 10,
    borderWidth: 1,
  },
  bannerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  bannerClose: {
    padding: 4,
  },
});