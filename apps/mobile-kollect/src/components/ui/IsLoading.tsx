import React from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle, Text, Platform } from 'react-native';
import { useTheme } from '../../../app/context/ThemeContext';

interface IsLoadingProps {
  fullScreen?: boolean;
  containerStyle?: ViewStyle;
}

export const IsLoading: React.FC<IsLoadingProps> = ({ fullScreen = true, containerStyle }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.loadingContainer,
        fullScreen && styles.fullScreen,
        { backgroundColor: theme.colors.background },
        containerStyle,
      ]}
    >
      <View style={styles.loadingContent}>
        <View style={styles.spinnerContainer}>
          <View style={[styles.outerRing, { borderColor: theme.colors.primary + '20' }]} />
          <View style={[styles.middleRing, { borderColor: theme.colors.primary + '40' }]} />
          <View style={[styles.innerCircle, { backgroundColor: theme.colors.primary + '10' }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </View>
        
        <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>
          Kollect
        </Text>
        
        <View style={styles.dotContainer}>
          <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
          <View style={[styles.dot, { backgroundColor: theme.colors.primary, opacity: 0.6 }]} />
          <View style={[styles.dot, { backgroundColor: theme.colors.primary, opacity: 0.3 }]} />
        </View>
        
        <Text style={[styles.loadingSubtitle, { color: theme.colors.textSecondary }]}>
          Préparation de votre expérience
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    flex: 1,
  },
  loadingContent: {
    alignItems: 'center',
  },
  spinnerContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  outerRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
  },
  middleRing: {
    position: 'absolute',
    width: 85,
    height: 85,
    borderRadius: 42.5,
    borderWidth: 1.5,
  },
  innerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 44,
    fontWeight: '600',
    letterSpacing: -0.5,
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'cursive',
    
    marginBottom: 20,
  },
  dotContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  loadingSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
});