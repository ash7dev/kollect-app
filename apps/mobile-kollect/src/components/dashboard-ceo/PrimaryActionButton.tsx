import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';

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
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const buttonStyle = {
    transform: [{ scale: scaleValue }],
    opacity: disabled ? 0.6 : 1,
    backgroundColor: disabled ? theme.colors.textDisabled : theme.colors.accent,
    ...styles.button,
  };

  return (
    <Animated.View style={[buttonStyle, styles.shadow]}>
      <TouchableOpacity 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={disabled}
        style={styles.touchable}
      >
        <Ionicons 
          name={iconName} 
          size={20} 
          color="#FFFFFF" 
          style={styles.icon}
        />
        <Text style={[styles.text, { color: '#FFFFFF' }]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minHeight: 48,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  shadow: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
