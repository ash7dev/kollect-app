'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { useAuth } from '@/providers/AuthProvider';

export function useFollowBrand(brandId: string, initialFollowerCount = 0) {
  const { user, isInitialized } = useAuth();
  const router = useRouter();

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch follow state once auth is ready and user is logged in
  useEffect(() => {
    if (!isInitialized || !user) return;

    void apiClient
      .get<{ isFollowing: boolean }>(API_ENDPOINTS.BRANDS.IS_FOLLOWING(brandId))
      .then(({ data }) => setIsFollowing(data.isFollowing))
      .catch(() => {});
  }, [brandId, user, isInitialized]);

  const toggle = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const next = !isFollowing;
    // Optimistic update
    setIsFollowing(next);
    setFollowerCount((c) => c + (next ? 1 : -1));
    setIsLoading(true);

    try {
      if (next) {
        const { data } = await apiClient.post<{ success: boolean; followerCount?: number }>(
          API_ENDPOINTS.BRANDS.FOLLOW(brandId),
        );
        if (typeof data.followerCount === 'number') setFollowerCount(data.followerCount);
        toast.success('Marque suivie !');
      } else {
        const { data } = await apiClient.delete<{ success: boolean; followerCount?: number }>(
          API_ENDPOINTS.BRANDS.FOLLOW(brandId),
        );
        if (typeof data.followerCount === 'number') setFollowerCount(data.followerCount);
        toast.message('Vous ne suivez plus cette marque.');
      }
    } catch {
      // Rollback
      setIsFollowing(!next);
      setFollowerCount((c) => c + (next ? -1 : 1));
      toast.error('Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return { isFollowing, followerCount, toggle, isLoading };
}
