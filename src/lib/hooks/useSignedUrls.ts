import { useEffect, useCallback, useMemo } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  useGetSignedAudioUrlQuery,
  useGetSignedImageUrlQuery,
  useGetBatchSignedUrlsQuery,
} from '../redux/api/apiSlice';
import {
  setSignedAudioUrl,
  setSignedAudioUrls,
  removeSignedAudioUrl,
  clearExpiredAudioUrls,
  selectSignedAudioUrl,
  selectIsAudioUrlExpired,
  selectIsAudioUrlNearExpiry,
  setAudioUrlsLoading,
  setAudioUrlsError,
} from '../redux/slices/audioTrackSlice';
import {
  setSignedUrl,
  setSignedUrls,
  removeSignedUrl,
  clearExpiredUrls,
  selectSignedUrl,
  selectIsUrlExpired,
  selectIsUrlNearExpiry,
  setLoading,
  setError,
} from '../redux/slices/storageSlice';

// Single audio URL hook
export const useSignedAudioUrl = (path: string, expiresIn: number = 3600) => {
  const dispatch = useAppDispatch();
  const cachedUrl = useAppSelector((state) => selectSignedAudioUrl(state, path));
  const isExpired = useAppSelector((state) => selectIsAudioUrlExpired(state, path));
  const isNearExpiry = useAppSelector((state) => selectIsAudioUrlNearExpiry(state, path, 5));

  // Skip RTK Query if we have a valid, non-near-expiry URL
  const shouldSkip = Boolean(cachedUrl && !isExpired && !isNearExpiry);

  const { data, isLoading, error, refetch } = useGetSignedAudioUrlQuery(
    { path, expiresIn },
    {
      skip: shouldSkip,
      refetchOnMountOrArgChange: true,
    },
  );

  // Cache the URL when fetched
  useEffect(() => {
    if (data && !error) {
      dispatch(
        setSignedAudioUrl({
          path,
          url: data.url,
          expiresIn: data.expiresIn,
        }),
      );
    }
  }, [data, error, dispatch, path]);

  // Handle errors
  useEffect(() => {
    if (error) {
      dispatch(setAudioUrlsError(error.toString()));
    }
  }, [error, dispatch]);

  // Cleanup expired URLs every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        dispatch(clearExpiredAudioUrls());
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [dispatch]);

  // Force refresh function
  const refreshUrl = useCallback(() => {
    dispatch(removeSignedAudioUrl(path));
    refetch();
  }, [dispatch, path, refetch]);

  return {
    signedUrl: cachedUrl || undefined,
    isLoading: shouldSkip ? false : isLoading,
    error,
    refreshUrl,
  };
};

// Batch audio URLs hook
export const useSignedAudioUrls = (paths: string[], expiresIn: number = 3600) => {
  const dispatch = useAppDispatch();

  // Filter out empty or invalid paths
  const validPaths = paths.filter((path) => Boolean(path && path.trim() && path !== '__SKIP__'));

  // Check which URLs need fetching
  // Check which URLs need fetching
  const selectUrlsToFetch = useMemo(
    () =>
      createSelector(
        (state: any) => state.audioTrack.signedUrls,
        (signedAudioUrls: Record<string, any>) => {
          // Build list of paths that need fetching
          return paths.filter((path) => {
            const cachedUrl = signedAudioUrls[path];
            const isExpired = !cachedUrl || cachedUrl.expiresAt <= Date.now();
            // near-expiry check: 5 minutes
            const isNearExpiry = !cachedUrl || cachedUrl.expiresAt <= Date.now() + 5 * 60 * 1000;
            return !cachedUrl || isExpired || isNearExpiry;
          });
        },
      ),
    [validPaths],
  );

  const urlsToFetch = useAppSelector((state) => selectUrlsToFetch(state));

  // Only fetch if we have paths that need fetching
  const shouldSkip = urlsToFetch.length === 0;

  const { data, isLoading, error, refetch } = useGetBatchSignedUrlsQuery(
    {
      paths: urlsToFetch,
      bucket: 'audio-files',
      expiresIn,
    },
    {
      skip: shouldSkip,
      refetchOnMountOrArgChange: true,
    },
  );

  // Cache the URLs when fetched
  useEffect(() => {
    if (data && !error) {
      const validUrls = data
        .filter((item) => item.url && !item.error)
        .map((item) => ({
          path: item.path,
          url: item.url,
          expiresIn,
        }));

      if (validUrls.length > 0) {
        dispatch(setSignedAudioUrls(validUrls));
      }
    }
  }, [data, error, dispatch, expiresIn]);

  // Get all cached URLs for the requested paths
  // Create a memoized selector so we return the same reference when inputs haven't changed
  const selectSignedAudioUrlsForPaths = useMemo(
    () =>
      createSelector(
        // input selector: the whole signedUrls map from audioTrack slice
        (state: any) => state.audioTrack.signedUrls,
        // output selector: build a path->url map for requested paths
        (signedAudioUrlsState: Record<string, any>) => {
          const urls: Record<string, string> = {};
          paths.forEach((path) => {
            const entry = signedAudioUrlsState[path];
            if (entry && entry.expiresAt > Date.now()) {
              urls[path] = entry.url;
            }
          });
          return urls;
        },
      ),
    // recreate selector only when validPaths change
    [validPaths],
  );

  const signedUrls = useAppSelector((state) => selectSignedAudioUrlsForPaths(state));

  // Refresh all URLs: remove cached entries for requested paths then trigger a refetch
  const refreshUrls = useCallback(() => {
    validPaths.forEach((path) => {
      dispatch(removeSignedAudioUrl(path));
    });
    refetch();
  }, [validPaths, refetch, dispatch]);

  return {
    signedUrls,
    isLoading: shouldSkip ? false : isLoading,
    error,
    refreshUrls,
  };
};

// Generic signed URL hook (for both audio and images)
export const useSignedUrl = (
  path: string,
  bucket: 'audio-files' | 'image-files',
  expiresIn: number = 3600,
) => {
  const dispatch = useAppDispatch();

  // Skip the hook entirely if path is empty or invalid
  const isValidPath = Boolean(path && path.trim() && path !== '__SKIP__');

  const cachedUrl = useAppSelector((state) =>
    isValidPath ? selectSignedUrl(state, path, bucket) : undefined,
  );
  const isExpired = useAppSelector((state) =>
    isValidPath ? selectIsUrlExpired(state, path, bucket) : false,
  );
  const isNearExpiry = useAppSelector((state) =>
    isValidPath ? selectIsUrlNearExpiry(state, path, bucket, 5) : false,
  );

  const shouldSkip = !isValidPath || Boolean(cachedUrl && !isExpired && !isNearExpiry);

  // Use the appropriate hook based on bucket
  const {
    data: audioData,
    isLoading: audioLoading,
    error: audioError,
    refetch: audioRefetch,
  } = useGetSignedAudioUrlQuery(
    { path, expiresIn },
    {
      skip: shouldSkip || bucket !== 'audio-files',
      refetchOnMountOrArgChange: true,
    },
  );

  const {
    data: imageData,
    isLoading: imageLoading,
    error: imageError,
    refetch: imageRefetch,
  } = useGetSignedImageUrlQuery(
    { path, expiresIn },
    {
      skip: shouldSkip || bucket !== 'image-files',
      refetchOnMountOrArgChange: true,
    },
  );

  const data = bucket === 'audio-files' ? audioData : imageData;
  const isLoading = bucket === 'audio-files' ? audioLoading : imageLoading;
  const error = bucket === 'audio-files' ? audioError : imageError;
  const refetch = bucket === 'audio-files' ? audioRefetch : imageRefetch;

  // Cache the URL when fetched
  useEffect(() => {
    if (data && !error) {
      dispatch(
        setSignedUrl({
          path,
          bucket,
          url: data.url,
          expiresIn: data.expiresIn,
        }),
      );
    }
  }, [data, error, dispatch, path, bucket]);

  // Handle errors
  useEffect(() => {
    if (error) {
      dispatch(setError(error.toString()));
    }
  }, [error, dispatch]);

  // Cleanup expired URLs every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        dispatch(clearExpiredUrls());
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [dispatch]);

  // Force refresh function
  const refreshUrl = useCallback(() => {
    if (isValidPath) {
      dispatch(removeSignedUrl({ path, bucket }));
      refetch();
    }
  }, [dispatch, path, bucket, refetch, isValidPath]);

  return {
    signedUrl: isValidPath ? cachedUrl || undefined : undefined,
    isLoading: isValidPath && !shouldSkip ? isLoading : false,
    error: isValidPath ? error : undefined,
    refreshUrl,
  };
};

// Batch generic URLs hook
export const useSignedUrls = (
  paths: string[],
  bucket: 'audio-files' | 'image-files',
  expiresIn: number = 3600,
) => {
  const dispatch = useAppDispatch();

  // Filter out empty or invalid paths
  const validPaths = paths.filter((path) => Boolean(path && path.trim() && path !== '__SKIP__'));

  // Check which URLs need fetching
  const selectUrlsToFetchGeneric = useMemo(
    () =>
      createSelector(
        (state: any) => state.storage.signedUrls,
        (signedStorageUrls: Record<string, any>) => {
          return validPaths.filter((path) => {
            const key = `${bucket}:${path}`;
            const entry = signedStorageUrls[key];
            const isExpired = !entry || entry.expiresAt <= Date.now();
            const isNearExpiry = !entry || entry.expiresAt <= Date.now() + 5 * 60 * 1000;
            return !entry || isExpired || isNearExpiry;
          });
        },
      ),
    [paths, bucket],
  );

  const urlsToFetch = useAppSelector((state) => selectUrlsToFetchGeneric(state));

  const shouldSkip = urlsToFetch.length === 0;

  const { data, isLoading, error, refetch } = useGetBatchSignedUrlsQuery(
    {
      paths: urlsToFetch,
      bucket,
      expiresIn,
    },
    {
      skip: shouldSkip,
      refetchOnMountOrArgChange: true,
    },
  );

  // Cache the URLs when fetched
  useEffect(() => {
    if (data && !error) {
      const validUrls = data
        .filter((item) => item.url && !item.error)
        .map((item) => ({
          path: item.path,
          bucket,
          url: item.url,
          expiresIn,
        }));

      if (validUrls.length > 0) {
        dispatch(setSignedUrls(validUrls));
      }
    }
  }, [data, error, dispatch, bucket, expiresIn]);

  // Get all cached URLs for the requested paths
  // Create a memoized selector so we return the same reference when inputs haven't changed
  const selectSignedUrlsForPaths = useMemo(
    () =>
      createSelector(
        // input selector: the whole signedUrls map from storage slice
        (state: any) => state.storage.signedUrls,
        // output selector: build a path->url map for requested paths
        (signedUrlsState: Record<string, any>) => {
          const urls: Record<string, string> = {};
          validPaths.forEach((path) => {
            const key = `${bucket}:${path}`;
            const entry = signedUrlsState[key];
            if (entry && entry.expiresAt > Date.now()) {
              urls[path] = entry.url;
            }
          });
          return urls;
        },
      ),
    // recreate selector only when validPaths or bucket change
    [validPaths, bucket],
  );

  const signedUrls = useAppSelector((state) => selectSignedUrlsForPaths(state));

  // Refresh all URLs
  const refreshUrls = useCallback(() => {
    paths.forEach((path) => {
      dispatch(removeSignedUrl({ path, bucket }));
    });
    refetch();
  }, [dispatch, paths, bucket, refetch]);

  return {
    signedUrls,
    isLoading: shouldSkip ? false : isLoading,
    error,
    refreshUrls,
  };
};

// Helper hook for preloading signed URLs (useful for performance)
export const usePreloadSignedUrls = (
  paths: string[],
  bucket: 'audio-files' | 'image-files',
  expiresIn: number = 3600,
) => {
  const { signedUrls, isLoading, error } = useSignedUrls(paths, bucket, expiresIn);

  // Return just the loading state and error for preloading scenarios
  return {
    isPreloading: isLoading,
    preloadError: error,
    preloadedCount: Object.keys(signedUrls).length,
    totalCount: paths.length,
  };
};

// Hook for managing signed URL cache health
export const useSignedUrlCacheHealth = () => {
  const dispatch = useAppDispatch();
  const audioUrls = useAppSelector((state) => state.audioTrack.signedUrls);
  const storageUrls = useAppSelector((state) => state.storage.signedUrls);

  const stats = useMemo(() => {
    const now = Date.now();
    let audioTotal = 0;
    let audioExpired = 0;
    let audioNearExpiry = 0;
    let storageTotal = 0;
    let storageExpired = 0;
    let storageNearExpiry = 0;

    // Audio URLs stats
    Object.values(audioUrls).forEach((entry) => {
      audioTotal++;
      if (entry.expiresAt <= now) {
        audioExpired++;
      } else if (entry.expiresAt <= now + 5 * 60 * 1000) {
        audioNearExpiry++;
      }
    });

    // Storage URLs stats
    Object.values(storageUrls).forEach((entry) => {
      storageTotal++;
      if (entry.expiresAt <= now) {
        storageExpired++;
      } else if (entry.expiresAt <= now + 5 * 60 * 1000) {
        storageNearExpiry++;
      }
    });

    return {
      audio: {
        total: audioTotal,
        expired: audioExpired,
        nearExpiry: audioNearExpiry,
        valid: audioTotal - audioExpired,
      },
      storage: {
        total: storageTotal,
        expired: storageExpired,
        nearExpiry: storageNearExpiry,
        valid: storageTotal - storageExpired,
      },
    };
  }, [audioUrls, storageUrls]);

  const cleanupExpired = useCallback(() => {
    dispatch(clearExpiredAudioUrls());
    dispatch(clearExpiredUrls());
  }, [dispatch]);

  return {
    stats,
    cleanupExpired,
  };
};
