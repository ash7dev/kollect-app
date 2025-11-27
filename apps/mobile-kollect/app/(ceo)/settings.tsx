import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';

const SettingItem = ({ 
  icon, 
  title, 
  onPress, 
  rightComponent,
  showChevron = true,
  isDark,
  isLast = false
}: {
  icon: string;
  title: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  showChevron?: boolean;
  isDark: boolean;
  isLast?: boolean;
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.settingItem,
        !isLast && { 
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
        }
      ]}
      onPress={onPress}
      activeOpacity={0.6}
      disabled={!onPress}
    >
      <View style={[
        styles.settingIconContainer,
        { backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.1)' }
      ]}>
        <Ionicons 
          name={icon as any} 
          size={20} 
          color="#FF3B30" 
        />
      </View>
      <Text style={[
        styles.settingText, 
        { color: isDark ? '#FFFFFF' : '#000000' }
      ]}>
        {title}
      </Text>
      <View style={styles.settingRight}>
        {rightComponent}
        {showChevron && onPress && (
          <Ionicons 
            name="chevron-forward" 
            size={18} 
            color={isDark ? '#666666' : '#B8B8B8'} 
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);
  const router = useRouter();
  const isDark = themeMode === 'dark';

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

  const cardStyle = {
    backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? '#333333' : '#E5E5E5',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: isDark ? 8 : 6 },
    shadowOpacity: isDark ? 0.5 : 0.15,
    shadowRadius: 12,
    elevation: isDark ? 8 : 4,
  };

  return (
    <ScrollView 
      style={[
        styles.container, 
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Header Profile */}
        <View style={[styles.headerCard, cardStyle]}>
          <View style={[
            styles.avatarContainer,
            { 
              backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.1)',
            }
          ]}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#FF3B30" />
            </View>
          </View>
          
          <Text style={[
            styles.name, 
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            {user?.firstName} {user?.lastName}
          </Text>
          
          <Text style={[
            styles.email, 
            { color: isDark ? '#B0B0B0' : '#4D4D4D' }
          ]}>
            {user?.email}
          </Text>

          {user && (user.isAdmin || user.isCEO) && (
            <View style={styles.rolesContainer}>
              {user.isAdmin && (
                <View style={[
                  styles.roleBadge, 
                  { 
                    backgroundColor: isDark ? '#FF3B30' : '#FF3B30',
                    borderWidth: 1,
                    borderColor: isDark ? '#FF3B30' : '#FF3B30',
                  }
                ]}>
                  <Text style={styles.roleText}>ADMIN</Text>
                </View>
              )}
              {user.isCEO && (
                <View style={[
                  styles.roleBadge, 
                  { 
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    borderWidth: 1,
                    borderColor: isDark ? '#FFFFFF' : '#000000',
                  }
                ]}>
                  <Text style={[
                    styles.roleText,
                    { color: isDark ? '#000000' : '#FFFFFF' }
                  ]}>
                    CEO
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Section Boutique */}
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle, 
            { color: isDark ? '#B0B0B0' : '#4D4D4D' }
          ]}>
            MA BOUTIQUE
          </Text>
          <View style={[styles.sectionContent, cardStyle]}>
            <SettingItem
              icon="storefront-outline"
              title="Voir ma boutique publique"
              isDark={isDark}
              onPress={() => {
                const slug = user?.brand?.slug;
                if (!slug) {
                  Alert.alert('Boutique indisponible', 'Aucune marque n\'est associée à ce compte.');
                  return;
                }
                router.push(`/ClientbrandId/${slug}`);
              }}
            />
            <SettingItem
              icon="build-outline"
              title="Paramètres de la marque"
              isDark={isDark}
              onPress={() => {
                router.push('/settingBrand');
              }}
            />
            <SettingItem
              icon="construct-outline"
              title="Outils avancés"
              isDark={isDark}
              isLast
              onPress={() => router.push('/outil-avances' as any)}
            />
          </View>
        </View>

        {/* Section Préférences */}
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle, 
            { color: isDark ? '#B0B0B0' : '#4D4D4D' }
          ]}>
            APPARENCE
          </Text>
          <View style={[styles.sectionContent, cardStyle]}>
            <View style={[
              styles.settingItem,
            ]}>
              <View style={[
                styles.settingIconContainer,
                { backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.1)' }
              ]}>
                <Ionicons 
                  name={isDark ? "moon" : "moon-outline"}
                  size={20} 
                  color="#FF3B30" 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[
                  styles.settingText, 
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  Mode sombre
                </Text>
                <Text style={[
                  styles.settingSubtext,
                  { color: isDark ? '#666666' : '#B8B8B8' }
                ]}>
                  {isDark ? 'Activé' : 'Désactivé'}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleContainer,
                  { 
                    backgroundColor: isDark ? '#FF3B30' : '#E5E5E5',
                  }
                ]}
                onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.toggleThumb,
                  isDark ? styles.toggleThumbActive : styles.toggleThumbInactive
                ]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bouton Déconnexion */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { 
              backgroundColor: '#FF3B30',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255, 59, 48, 0.3)' : 'rgba(255, 59, 48, 0.2)',
              shadowColor: '#FF3B30',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }
          ]}
          onPress={handleLogout}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>
            {isLoading ? 'DÉCONNEXION...' : 'SE DÉCONNECTER'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  headerCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 28,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  rolesContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  roleBadge: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 6,
    letterSpacing: 1.5,
  },
  sectionContent: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  settingSubtext: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleContainer: {
    width: 56,
    height: 32,
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  toggleThumbInactive: {
    alignSelf: 'flex-start',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 12,
    gap: 10,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
});