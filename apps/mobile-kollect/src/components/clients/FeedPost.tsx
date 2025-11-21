import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface FeedPostProps {
  id: string;
  brandName: string;
  brandLogo: string;
  brandSlug: string;
  postImage: string;
  caption: string;
  tags: string[];
  taggedProducts?: Product[];
  likes: number;
  comments: number;
  timestamp: string;
  isLiked?: boolean;
  isSaved?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onProductPress?: (product: Product) => void;
}

export default function FeedPost({
  brandName,
  brandLogo,
  postImage,
  caption,
  tags,
  taggedProducts = [],
  likes,
  comments,
  timestamp,
  isLiked = false,
  isSaved = false,
  onLike,
  onComment,
  onShare,
  onSave,
  onProductPress,
}: FeedPostProps) {
  const { theme, isDark } = useTheme();
  const [showProducts, setShowProducts] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    onLike?.();
  };

  const handleSave = () => {
    setSaved(!saved);
    onSave?.();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Découvre ce drop de ${brandName} sur Kollect !`,
      });
      onShare?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: brandLogo }} style={styles.brandLogo} />
          <View>
            <Text style={[styles.brandName, { color: theme.colors.text }]}>
              {brandName}
            </Text>
            <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
              {timestamp}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Image */}
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => setShowProducts(!showProducts)}
      >
        <Image source={{ uri: postImage }} style={styles.postImage} contentFit="cover" />
        
        {/* Tagged Products Overlay */}
        {showProducts && taggedProducts.length > 0 && (
          <View style={styles.productsOverlay}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.85)']}
              style={styles.productsGradient}
            >
              {taggedProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.productTag, { backgroundColor: 'rgba(255,255,255,0.95)' }]}
                  onPress={() => onProductPress?.(product)}
                >
                  <Image
                    source={{ uri: product.image }}
                    style={styles.productTagImage}
                  />
                  <View style={styles.productTagInfo}>
                    <Text style={styles.productTagName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.productTagPrice}>{product.price} CFA</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#666" />
                </TouchableOpacity>
              ))}
            </LinearGradient>
          </View>
        )}

        {/* Products Indicator */}
        {taggedProducts.length > 0 && (
          <View style={styles.tagIndicator}>
            <Ionicons name="pricetag" size={16} color="white" />
          </View>
        )}
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={28}
              color={liked ? '#FF3B30' : theme.colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onComment} style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={26} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={26} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSave}>
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={26}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Likes Count */}
      <View style={styles.likesContainer}>
        <Text style={[styles.likesText, { color: theme.colors.text }]}>
          <Text style={styles.likesBold}>{likeCount.toLocaleString()}</Text> j&apos;aime
        </Text>
      </View>

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={[styles.caption, { color: theme.colors.text }]}>
          <Text style={styles.captionBrand}>{brandName}</Text> {caption}
        </Text>
        {tags.length > 0 && (
          <Text style={[styles.tags, { color: theme.colors.primary }]}>
            {tags.map((tag) => `#${tag}`).join(' ')}
          </Text>
        )}
      </View>

      {/* Comments Link */}
      {comments > 0 && (
        <TouchableOpacity onPress={onComment} style={styles.commentsLink}>
          <Text style={[styles.commentsText, { color: theme.colors.textSecondary }]}>
            Voir les {comments} commentaires
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  postImage: {
    width,
    height: width,
    backgroundColor: '#f0f0f0',
  },
  productsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  productsGradient: {
    padding: 16,
    gap: 12,
  },
  productTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    gap: 12,
  },
  productTagImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  productTagInfo: {
    flex: 1,
  },
  productTagName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  productTagPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  tagIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  actionsLeft: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 0,
  },
  likesContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  likesText: {
    fontSize: 14,
  },
  likesBold: {
    fontWeight: '600',
  },
  captionContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  caption: {
    fontSize: 14,
    lineHeight: 18,
  },
  captionBrand: {
    fontWeight: '600',
  },
  tags: {
    fontSize: 14,
    marginTop: 4,
  },
  commentsLink: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  commentsText: {
    fontSize: 14,
  },
});