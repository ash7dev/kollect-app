import { Share } from 'react-native';
import { publicUrl } from '@/config/env';

// URL publique utilisée pour les liens de partage (pages web /s/*)
const PUBLIC_URL = publicUrl;

export enum ShareType {
  PRODUCT = 'PRODUCT',
  COLLECTION = 'COLLECTION',
  BRAND = 'BRAND'
}

export interface ShareData {
  type: ShareType;
  id: string;
  name: string;
  slug?: string;
  price?: number;
  brandName?: string;
  imageUrl?: string;
  description?: string;
  stats?: {
    viewCount?: number;
    followerCount?: number;
    productCount?: number;
  };
}

export class ShareService {
  private static generateShareUrl = (type: ShareType, id: string, slug?: string): string => {
    switch (type) {
      case ShareType.PRODUCT:
        return `kollect://product/${id}`;
      case ShareType.COLLECTION:
        return `kollect://collection/${id}`;
      case ShareType.BRAND:
        return slug ? `kollect://brand/${slug}` : `kollect://brand/${id}`;
      default:
        return `kollect://`;
    }
  };

  private static generateWebUrl = (type: ShareType, id: string, slug?: string): string => {
    switch (type) {
      case ShareType.PRODUCT:
        return `${PUBLIC_URL}/s/product/${id}`;
      case ShareType.COLLECTION:
        return `${PUBLIC_URL}/s/collection/${id}`;
      case ShareType.BRAND:
        return `${PUBLIC_URL}/s/brand/${id}`;
      default:
        return PUBLIC_URL;
    }
  };

  private static generateShareMessage = (data: ShareData): string => {
    const { type, name, price, brandName, stats } = data;
    
    let message = '';
    
    switch (type) {
      case ShareType.PRODUCT:
        message = `🔥 ${name}`;
        if (brandName) message += ` par ${brandName}`;
        if (price) message += ` - ${(price / 100).toLocaleString('fr-FR')} FCFA`;
        message += '\nDécouvre ce produit sur Kollect !';
        break;
        
      case ShareType.COLLECTION:
        message = `⏰ ${name}`;
        if (brandName) message += ` - ${brandName}`;
        if (stats?.productCount) message += `\n${stats.productCount} produits uniques`;
        message += '\nRejoins le drop sur Kollect !';
        break;
        
      case ShareType.BRAND:
        message = `✨ ${brandName || name}`;
        if (stats?.followerCount) message += ` - ${stats.followerCount} followers`;
        if (stats?.productCount) message += `\n${stats.productCount} créations`;
        message += '\nDécouvre leur univers sur Kollect !';
        break;
    }
    
    return message;
  };

  static shareContent = async (data: ShareData): Promise<void> => {
    try {
      const shareUrl = ShareService.generateShareUrl(data.type, data.id);
      const webUrl = ShareService.generateWebUrl(data.type, data.id);
      const message = ShareService.generateShareMessage(data);
      
      // Utiliser l'URL web pour les amis (navigateur), deep link pour les utilisateurs Kollect
      const finalUrl = webUrl;
      
      await Share.share({
        // IMPORTANT: sur iOS/WhatsApp/etc, fournir à la fois `message` et `url`
        // peut dupliquer le lien. On met donc le lien uniquement dans le message.
        message: `${message}\n${finalUrl}`,
        title: data.name,
      });

    } catch (error) {
      console.error('[ShareService] Share error:', error);
      throw error;
    }
  };

  static shareProduct = async (product: any): Promise<void> => {
    const shareData: ShareData = {
      type: ShareType.PRODUCT,
      id: product.id,
      name: product.name,
      price: product.price,
      brandName: product.brand?.name,
      imageUrl: product.images?.[0],
      description: product.description,
    };
    
    await ShareService.shareContent(shareData);
  };

  static shareCollection = async (collection: any): Promise<void> => {
    const shareData: ShareData = {
      type: ShareType.COLLECTION,
      id: collection.id,
      name: collection.name,
      brandName: collection.brand?.name,
      imageUrl: collection.coverImage,
      description: collection.description,
      stats: {
        viewCount: collection.viewCount,
        productCount: collection._count?.products || collection.productCount,
      },
    };
    
    await ShareService.shareContent(shareData);
  };

  static shareBrand = async (brand: any): Promise<void> => {
    const shareData: ShareData = {
      type: ShareType.BRAND,
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      brandName: brand.name,
      imageUrl: brand.logo || brand.coverImage,
      description: brand.description || brand.bio,
      stats: {
        followerCount: brand.followerCount || brand.stats?.followers,
        productCount: brand.productCount || brand.stats?.products,
      },
    };
    
    await ShareService.shareContent(shareData);
  };
}
