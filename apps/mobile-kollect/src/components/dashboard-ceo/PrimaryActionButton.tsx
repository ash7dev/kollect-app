import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface PrimaryActionButtonProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}

export const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({ 
  label, 
  iconName, 
  onPress,
  disabled = false
}) => {
  const { theme } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ scale: scaleValue }], opacity: disabled ? 0.6 : 1 }
    ]}>
      <TouchableOpacity 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={disabled}
        style={styles.touchable}
      >
        <LinearGradient
          colors={[theme.colors.accent, theme.colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Ionicons 
            name={iconName} 
            size={20} 
            color="#FFFFFF" 
            style={styles.icon}
          />
          <Text style={[styles.text, { color: '#FFFFFF' }]} numberOfLines={1}>
            {label}
          </Text>
        </LinearGradient>
        
        {/* Subtle glow/shadow effect */}
        {!disabled && (
          <View style={[styles.glow, { backgroundColor: theme.colors.accent, opacity: 0.2 }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'visible', // To show glow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  touchable: {
    borderRadius: 14,
    overflow: 'hidden',
    minHeight: 52,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
    borderRadius: 14,
  },
  icon: {
    // No margin needed with gap
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  glow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: -4,
    borderRadius: 14,
    zIndex: -1,
  }
});
