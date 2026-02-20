import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShareService, ShareData } from '../../features/share/services/share.service';
import { useTheme } from '../../../app/context/ThemeContext';

interface ShareButtonProps {
  data: ShareData;
  size?: 'small' | 'medium' | 'large';
  style?: any;
  showLabel?: boolean;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  data,
  size = 'medium',
  style,
  showLabel = false,
}) => {
  const { theme } = useTheme();

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          width: 32,
          height: 32,
          borderRadius: 16,
          iconSize: 16,
        };
      case 'large':
        return {
          width: 56,
          height: 56,
          borderRadius: 28,
          iconSize: 24,
        };
      default:
        return {
          width: 40,
          height: 40,
          borderRadius: 20,
          iconSize: 20,
        };
    }
  };

  const sizeStyle = getSizeStyle();

  const handleShare = async () => {
    try {
      await ShareService.shareContent(data);
    } catch (error) {
      console.error('[ShareButton] Share failed:', error);
      Alert.alert('Erreur', 'Impossible de partager ce contenu. Réessayez plus tard.');
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: sizeStyle.width,
          height: sizeStyle.height,
          borderRadius: sizeStyle.borderRadius,
          backgroundColor: theme.colors.primary + '15',
          borderColor: theme.colors.primary + '30',
        },
        style,
      ]}
      onPress={handleShare}
      activeOpacity={0.7}
    >
      <Ionicons
        name="share-outline"
        size={sizeStyle.iconSize}
        color={theme.colors.primary}
      />
      {showLabel && (
        <Ionicons
          name="share-social-outline"
          size={12}
          color={theme.colors.primary}
          style={styles.shareIcon}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  shareIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
});
