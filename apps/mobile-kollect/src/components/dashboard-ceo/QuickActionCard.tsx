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
        <View>
          <Text style={[styles.count, { color: theme.colors.text }]}>
            {count}
          </Text>
          <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
            {title}
          </Text>
        </View>
        <Ionicons 
          name={iconName} 
          size={24} 
          color={theme.colors.textSecondary} 
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  count: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
  },
});
