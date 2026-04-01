import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';

interface QuickActionCardProps {
  title: string;
  count: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ 
  title, 
  count, 
  iconName, 
  onPress,
  style,
}) => {
  const { theme, isDark } = useTheme();
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.card, 
        { 
          backgroundColor: theme.colors.surface,
          borderWidth: isDark ? 0 : 1,
          borderColor: isDark ? 'transparent' : theme.colors.border,
          ...(isDark ? {
            shadowColor: theme.colors.shadowDark,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          } : {})
        },
        style
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text 
            style={[styles.count, { color: theme.colors.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {count}
          </Text>
          <Text 
            style={[styles.title, { color: theme.colors.textSecondary }]}
            numberOfLines={2}
          >
            {title}
          </Text>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={iconName} 
            size={22} 
            color={theme.colors.textSecondary} 
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    flex: 1,
    minHeight: 115,
    backgroundColor: 'white',
    overflow: 'hidden', // Empêcher le débordement
    // BOOM shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: 1,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    flexShrink: 0, // Ne jamais rétrécir l'icône
  },
  count: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    opacity: 0.7,
    letterSpacing: 0.1,
  },
});
