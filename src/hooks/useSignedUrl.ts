import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setSignedUrl,
  setLoading,
  setError,
  removeExpiredUrls,
} from '../store/slices/signedUrlCacheSlice';
import { getSignedAudioUrl, getSignedImageUrl } from '../lib/supabase';

export function useSignedUrl(storageKey: string, type: 'audio' | 'image') {
  const dispatch = useAppDispatch();
  const signedUrlCache = useAppSelector((state) => state.signedUrlCache);

  // Get cached URL
  const cachedUrl = (() => {
    const cached = signedUrlCache.urls[storageKey];
    if (!cached) return null;

    // Check if expired
    if (cached.expiresAt <= Date.now()) {
      return null;
    }

    return cached.url;
  })();

  const isLoading = signedUrlCache.loading[storageKey] || false;
  const error = signedUrlCache.error;

  // Clean up expired URLs on mount
  useEffect(() => {
    dispatch(removeExpiredUrls());
  }, [dispatch]);

  const fetchSignedUrl = useCallback(async () => {
    // Return cached URL if available and not expired
    if (cachedUrl) {
      return cachedUrl;
    }

    // Don't fetch if already loading
    if (isLoading) {
      return null;
    }

    try {
      dispatch(setLoading({ storageKey, loading: true }));

      let url: string;
      if (type === 'audio') {
        url = await getSignedAudioUrl(storageKey);
      } else {
        url = await getSignedImageUrl(storageKey);
      }

      dispatch(
        setSignedUrl({
          storageKey,
          url,
          type,
        }),
      );

      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get signed URL';
      dispatch(setError(errorMessage));
      return null;
    }
  }, [cachedUrl, isLoading, storageKey, type, dispatch]);

  // Auto-fetch on mount if not cached
  useEffect(() => {
    if (!cachedUrl && !isLoading) {
      fetchSignedUrl();
    }
  }, [cachedUrl, isLoading, fetchSignedUrl]);

  return {
    url: cachedUrl,
    isLoading,
    error,
    refetch: fetchSignedUrl,
  };
}

// Hook specifically for audio URLs
export function useSignedAudioUrl(storageKey: string) {
  return useSignedUrl(storageKey, 'audio');
}

// Hook specifically for image URLs
export function useSignedImageUrl(storageKey: string) {
  return useSignedUrl(storageKey, 'image');
}
