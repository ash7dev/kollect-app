// src/utils/cloudinaryUpload.ts
// Upload direct mobile → Cloudinary (sans passer par le backend pour les fichiers)

import * as ImageManipulator from 'expo-image-manipulator';
import { apiUrl, ngrokSkipBrowserWarning } from '@/config/env';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@/config/storage';

export type CloudinaryFolder =
  | 'kollect/products'
  | 'kollect/brands'
  | 'kollect/collections'
  | 'kollect/avatars'
  | 'kollect/teasers';

interface UploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  resourceType: string;
}

interface UploadResult {
  secureUrl: string;
  publicId: string;
}

export interface UploadOptions {
  folder: CloudinaryFolder;
  isVideo?: boolean;
  onProgress?: (percent: number) => void;
  maxWidth?: number;
}

/**
 * Récupère une signature d'upload depuis le backend
 */
async function getUploadSignature(
  folder: CloudinaryFolder,
  resourceType: 'image' | 'video',
): Promise<UploadSignature> {
  const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
  
  console.log('🔐 [Cloudinary] Demande de signature:', {
    folder,
    resourceType,
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
  });

  if (!token) {
    throw new Error('Aucun token d\'authentification pour la signature Cloudinary');
  }

  const res = await fetch(
    `${apiUrl}/upload/signature?folder=${encodeURIComponent(folder)}&resourceType=${resourceType}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    },
  );

  console.log('📝 [Cloudinary] Réponse signature:', {
    status: res.status,
    statusText: res.statusText,
    ok: res.ok
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    console.error('❌ [Cloudinary] Erreur signature:', errorText);
    throw new Error(`Impossible de générer la signature upload (${res.status}): ${errorText}`);
  }

  const signatureData: UploadSignature = await res.json();
  console.log('✅ [Cloudinary] Signature reçue:', {
    hasSignature: !!signatureData.signature,
    cloudName: signatureData.cloudName,
    folder: signatureData.folder
  });

  return signatureData;
}

/**
 * Compresse et redimensionne une image avant upload
 */
async function compressImage(uri: string, maxWidth = 1200): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
  );
  return result.uri;
}

/**
 * Upload un seul fichier directement vers Cloudinary via XHR (avec progress)
 */
export async function uploadToCloudinary(
  uri: string,
  options: UploadOptions,
): Promise<UploadResult> {
  const { folder, isVideo = false, onProgress, maxWidth = 1200 } = options;
  const resourceType = isVideo ? 'video' : 'image';

  // Compression image avant upload (pas pour les vidéos)
  const fileUri = isVideo ? uri : await compressImage(uri, maxWidth);

  // Signature générée par le backend
  const { signature, timestamp, apiKey, cloudName } = await getUploadSignature(folder, resourceType);

  const formData = new FormData();
  const ext = fileUri.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'jpg');
  const mimeType = isVideo ? `video/${ext === 'mov' ? 'quicktime' : ext}` : `image/jpeg`;

  formData.append('file', { uri: fileUri, name: `upload.${ext}`, type: mimeType } as any);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText) as { secure_url: string; public_id: string; error?: { message: string } };
        if (xhr.status === 200) {
          resolve({ secureUrl: response.secure_url, publicId: response.public_id });
        } else {
          reject(new Error(response.error?.message || `Upload échoué (${xhr.status})`));
        }
      } catch {
        reject(new Error('Réponse Cloudinary invalide'));
      }
    };

    xhr.onerror = () => reject(new Error('Erreur réseau pendant l\'upload'));
    xhr.ontimeout = () => reject(new Error('Timeout upload'));
    xhr.timeout = 120_000; // 2 min max par fichier

    xhr.send(formData);
  });
}

/**
 * Upload plusieurs images en parallèle vers Cloudinary
 * onProgress reçoit la progression globale (0–100)
 */
export async function uploadMultipleToCloudinary(
  uris: string[],
  folder: CloudinaryFolder,
  onProgress?: (percent: number) => void,
): Promise<UploadResult[]> {
  if (uris.length === 0) return [];

  const progresses = new Array(uris.length).fill(0);

  const updateGlobalProgress = () => {
    if (!onProgress) return;
    const total = progresses.reduce((a, b) => a + b, 0);
    onProgress(Math.round(total / uris.length));
  };

  const uploads = uris.map((uri, i) =>
    uploadToCloudinary(uri, {
      folder,
      onProgress: (p) => {
        progresses[i] = p;
        updateGlobalProgress();
      },
    }),
  );

  return Promise.all(uploads);
}
