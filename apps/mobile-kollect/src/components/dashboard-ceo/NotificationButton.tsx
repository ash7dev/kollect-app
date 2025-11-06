import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';

interface NotificationButtonProps {
  count?: number;
  onPress: () => void;
}

export const NotificationButton: React.FC<NotificationButtonProps> = ({ 
  count = 0, 
  onPress 
}) => {
  const { theme, isDark } = useTheme();
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.notificationButton,
        { backgroundColor: isDark ? theme.colors.surface : 'transparent' }
      ]}
    >
      <Ionicons 
        name="notifications-outline" 
        size={24} 
        color={theme.colors.text} 
      />
      {count > 0 && (
        <View 
          style={[
            styles.badge,
            { 
              backgroundColor: theme.colors.error,
              shadowColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 4,
              elevation: 3,
            }
          ]}
        >
          <Text style={styles.badgeText}>
            {count > 9 ? '9+' : count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
