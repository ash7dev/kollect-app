/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useTheme } from '../../../../../app/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'accent' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const { theme, isDark } = useTheme();
  const isDisabled = disabled || loading;

  // Styles selon la variante
  const getButtonColors = () => {
    if (isDisabled) {
      return {
        background: theme.colors.textDisabled,
        text: isDark ? theme.colors.text : theme.colors.background,
      };
    }

    switch (variant) {
      case 'accent':
        return {
          background: theme.colors.accent,
          text: theme.colors.background,
        };
      case 'outline':
        return {
          background: 'transparent',
          text: theme.colors.text,
          border: theme.colors.text,
        };
      default: // primary
        return {
          background: theme.colors.text,
          text: theme.colors.background,
        };
    }
  };

  const colors = getButtonColors();

  const ButtonContent = () => (
    <View
      style={[
        styles.button,
        {
          backgroundColor: variant !== 'outline' ? colors.background : 'transparent',
          borderColor: colors.border,
          borderWidth: variant === 'outline' ? 2 : 0,
        },
        isDisabled && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.text} size="small" />
          <Text style={[styles.buttonText, { color: colors.text }, textStyle, styles.loadingText]}>
            {title}
          </Text>
        </View>
      ) : (
        <Text style={[styles.buttonText, { color: colors.text }, textStyle]}>
          {title}
        </Text>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.touchable,
        isDisabled && styles.touchableDisabled,
      ]}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  touchableDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    marginLeft: 0,
  },
});