import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShareButtonProps {
  onPress: () => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.shareButton}>
      <Ionicons name="share-outline" size={18} color="#374151" />
      <Text style={styles.shareText}>Partager</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  shareText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});
