import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LogoProps {
  onPress?: () => void;
  size?: number;
}

export function Logo({ onPress, size = 52 }: LogoProps) {
  const fontSize = size * 0.65;

  const content = (
    <LinearGradient
      colors={['#FF3B30', '#FF6B6B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: 14,
        },
      ]}
    >
      <Text style={[styles.letter, { fontSize }]}>K</Text>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  letter: {
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
    textAlign: 'center',
  },
});
