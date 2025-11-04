/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../../../app/context/ThemeContext';

interface BrandFormInputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  showCharacterCount?: boolean;
}

export const BrandFormInput: React.FC<BrandFormInputProps> = ({
  label,
  error,
  helperText,
  required = false,
  showCharacterCount = false,
  value,
  maxLength,
  ...textInputProps
}) => {
  const { theme, isDark } = useTheme();
  const characterCount = value?.length || 0;
  const isNearLimit = maxLength && characterCount > maxLength * 0.8;

  return (
    <View style={styles.container}>
      {/* Label avec indicateur requis */}
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {label}
          {required && <Text style={[styles.required, { color: theme.colors.accent }]}> *</Text>}
        </Text>
        {showCharacterCount && maxLength && (
          <Text
            style={[
              styles.characterCount,
              {
                color: characterCount > maxLength 
                  ? theme.colors.error 
                  : isNearLimit 
                    ? theme.colors.warning 
                    : theme.colors.textSecondary
              }
            ]}
          >
            {characterCount}/{maxLength}
          </Text>
        )}
      </View>

      {/* Input avec états visuels améliorés */}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: error ? theme.colors.error : theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
          error && styles.inputWrapperError,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text },
            textInputProps.multiline && styles.inputMultiline,
          ]}
          placeholderTextColor={theme.colors.textSecondary}
          value={value}
          maxLength={maxLength}
          selectionColor={theme.colors.accent}
          {...textInputProps}
        />
      </View>

      {/* Helper Text ou Error avec icône */}
      {(helperText || error) && (
        <View style={styles.helperRow}>
          {error && (
            <View style={[styles.errorIndicator, { backgroundColor: theme.colors.error }]} />
          )}
          <Text
            style={[
              styles.helperText,
              { color: theme.colors.textSecondary },
              error && [styles.errorText, { color: theme.colors.error }],
            ]}
          >
            {error || helperText}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  required: {
    fontWeight: '700',
  },
  characterCount: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
   
  },
  inputWrapperError: {
    borderWidth: 2,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  inputMultiline: {
    minHeight: 120,
    paddingTop: 14,
    paddingBottom: 14,
    textAlignVertical: 'top',
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorIndicator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginRight: 6,
    marginTop: 6,
  },
  helperText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  errorText: {
    fontWeight: '500',
  },
});