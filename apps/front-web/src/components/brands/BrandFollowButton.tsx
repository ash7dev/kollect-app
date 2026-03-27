'use client';

import { useFollowBrand } from '@/hooks/useFollowBrand';
import { FONT_FAMILY_INTER } from '@/styles/typography';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/services/api/client';
import { useAuth } from '@/providers/AuthProvider';

type BrandFollowButtonProps = {
  brandId: string;
  initialFollowerCount: number;
  variant?: 'pill' | 'compact';
  /** Suivre / Suivi (défaut) ou S'abonner / Abonné — même styles, même icône ✓ */
  labelVariant?: 'follow' | 'subscribe';
  /** 'light' = fond blanc sur dark (défaut) | 'accent' = rouge sur dark */
  colorVariant?: 'light' | 'accent';
};

export function BrandFollowButton({
  brandId,
  initialFollowerCount,
  variant = 'pill',
  labelVariant = 'follow',
  colorVariant = 'light',
}: BrandFollowButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [count, setCount] = useState(initialFollowerCount);
  const [following, setFollowing] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCount(initialFollowerCount);
  }, [initialFollowerCount]);

  useEffect(() => {
    // Pas connecté → on sait déjà qu'il ne suit pas
    if (!user) {
      setFollowing(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get<{ isFollowing: boolean }>(`/brands/${brandId}/is-following`);
        if (!cancelled) setFollowing(res.data.isFollowing);
      } catch {
        if (!cancelled) setFollowing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [brandId, user]);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) {
        const path = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/brands';
        router.push(`/auth/login?redirect=${encodeURIComponent(path)}`);
        return;
      }
      if (following === null || loading) return;
      setLoading(true);
      try {
        if (following) {
          const res = await apiClient.delete<{ success: boolean; followerCount: number }>(`/brands/${brandId}/follow`);
          setFollowing(false);
          if (typeof res.data?.followerCount === 'number') setCount(res.data.followerCount);
          else setCount((c) => Math.max(0, c - 1));
        } else {
          const res = await apiClient.post<{ success: boolean; followerCount: number }>(`/brands/${brandId}/follow`);
          setFollowing(true);
          if (typeof res.data?.followerCount === 'number') setCount(res.data.followerCount);
          else setCount((c) => c + 1);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    },
    [brandId, following, loading, router, user],
  );

  const isCompact = variant === 'compact';
  const isFollowing = following === true;
  const isSubscribe = labelVariant === 'subscribe';
  const isAccent = colorVariant === 'accent';
  const aria =
    loading
      ? 'Chargement'
      : isFollowing
        ? isSubscribe
          ? 'Se désabonner de cette marque'
          : 'Ne plus suivre cette marque'
        : isSubscribe
          ? "S'abonner à cette marque"
          : 'Suivre cette marque';
  const countLabel = count > 999 ? `${(count / 1000).toFixed(1)}k` : count > 0 ? String(count) : '';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || following === null}
      aria-pressed={isFollowing}
      aria-label={aria}
      className={`brand-follow-btn${isFollowing ? ' following' : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: isCompact ? '5px 12px' : '8px 16px',
        borderRadius: 999,
        fontSize: isCompact ? 11 : 13,
        fontWeight: 700,
        letterSpacing: 0.2,
        cursor: loading || following === null ? 'wait' : 'pointer',
        border: isFollowing
          ? '1.5px solid rgba(255,255,255,0.2)'
          : isAccent
            ? '1.5px solid var(--color-accent)'
            : '1.5px solid rgba(255,255,255,0.9)',
        backgroundColor: isFollowing
          ? 'rgba(255,255,255,0.08)'
          : isAccent
            ? 'var(--color-accent)'
            : '#fff',
        color: isFollowing ? 'rgba(255,255,255,0.6)' : isAccent ? '#fff' : '#000',
        backdropFilter: 'blur(12px)',
        transition: 'all 180ms ease',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      {loading ? (
        <span>…</span>
      ) : isFollowing ? (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" aria-hidden>
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <span>
            {isSubscribe ? 'Abonné' : 'Suivi'}
            {!isCompact && countLabel ? ` · ${countLabel}` : ''}
          </span>
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          <span>
            {isSubscribe ? "S'abonner" : 'Suivre'}
            {!isCompact && countLabel ? ` · ${countLabel}` : ''}
          </span>
        </>
      )}
    </button>
  );
}
