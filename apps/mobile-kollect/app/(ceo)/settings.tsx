import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';

const SettingItem = ({ 
  icon, 
  title, 
  onPress, 
  rightComponent 
}: {
  icon: string;
  title: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
}) => (
  <TouchableOpacity 
    style={styles.settingItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.settingIconContainer}>
      <Ionicons name={icon as any} size={22} color="#6B7280" />
    </View>
    <Text style={styles.settingText}>{title}</Text>
    <View style={styles.settingRight}>
      {rightComponent}
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);

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
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.content, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="person" size={32} color="#FFFFFF" />
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {user?.firstName} {user?.lastName}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Préférences
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.surface }]}>
            <SettingItem
              icon="moon-outline"
              title="Mode sombre"
              rightComponent={
                <Switch
                  value={themeMode === 'dark'}
                  onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
                  trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
                  thumbColor="white"
                  style={{ marginRight: 8 }}
                />
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Compte
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="mail-outline" size={22} color="#6B7280" />
              </View>
              <View>
                <Text style={[styles.settingText, { color: theme.colors.text }]}>
                  {user?.email}
                </Text>
                <Text style={[styles.settingSubtext, { color: theme.colors.textSecondary }]}>
                  Adresse email
                </Text>
              </View>
            </View>

            {user && (
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
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutButtonText}>
            {isLoading ? 'Déconnexion...' : 'Se déconnecter'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtext: {
    fontSize: 13,
    color: '#6B7280',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rolesContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});