import { useEffect, useCallback, useMemo } from 'react';
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

  const validPaths = useMemo(
    () =>
      paths
        .filter((path) => Boolean(path && path.trim() && path !== '__SKIP__'))
        .map((path) => path.trim()),
    [paths],
  );

  const signedAudioUrlsState = useAppSelector((state) => state.audioTrack.signedUrls);

  const urlsToFetch = useMemo(() => {
    if (validPaths.length === 0) {
      return [] as string[];
    }

    const now = Date.now();
    const refreshThreshold = now + 5 * 60 * 1000;

    return validPaths.filter((path) => {
      const cachedUrl = signedAudioUrlsState[path];
      if (!cachedUrl) {
        return true;
      }

      if (cachedUrl.expiresAt <= now) {
        return true;
      }

      return cachedUrl.expiresAt <= refreshThreshold;
    });
  }, [signedAudioUrlsState, validPaths]);

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

  const signedUrls = useMemo(() => {
    if (validPaths.length === 0) {
      return {} as Record<string, string>;
    }

    const now = Date.now();
    const urls: Record<string, string> = {};

    validPaths.forEach((path) => {
      const entry = signedAudioUrlsState[path];
      if (entry && entry.expiresAt > now) {
        urls[path] = entry.url;
      }
    });

    return urls;
  }, [signedAudioUrlsState, validPaths]);

  const refreshUrls = useCallback(() => {
    if (validPaths.length === 0) {
      return;
    }

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
  }, [data, error, dispatch, bucket]);

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

export const useSignedUrls = (
  paths: string[],
  bucket: 'audio-files' | 'image-files',
  expiresIn: number = 3600,
) => {
  const dispatch = useAppDispatch();

  const validPaths = useMemo(
    () =>
      paths
        .filter((path) => Boolean(path && path.trim() && path !== '__SKIP__'))
        .map((path) => path.trim()),
    [paths],
  );

  const signedStorageUrlsState = useAppSelector((state) => state.storage.signedUrls);

  const urlsToFetch = useMemo(() => {
    if (validPaths.length === 0) {
      return [] as string[];
    }

    const now = Date.now();
    const refreshThreshold = now + 5 * 60 * 1000;

    return validPaths.filter((path) => {
      const key = `${bucket}:${path}`;
      const entry = signedStorageUrlsState[key];

      if (!entry) {
        return true;
      }

      if (entry.expiresAt <= now) {
        return true;
      }

      return entry.expiresAt <= refreshThreshold;
    });
  }, [signedStorageUrlsState, validPaths, bucket]);

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

  const signedUrls = useMemo(() => {
    if (validPaths.length === 0) {
      return {} as Record<string, string>;
    }

    const now = Date.now();
    const urls: Record<string, string> = {};

    validPaths.forEach((path) => {
      const key = `${bucket}:${path}`;
      const entry = signedStorageUrlsState[key];

      if (entry && entry.expiresAt > now) {
        urls[path] = entry.url;
      }
    });

    return urls;
  }, [signedStorageUrlsState, validPaths, bucket]);

  const refreshUrls = useCallback(() => {
    if (validPaths.length === 0) {
      return;
    }

    validPaths.forEach((path) => {
      dispatch(removeSignedUrl({ path, bucket }));
    });
    refetch();
  }, [dispatch, validPaths, bucket, refetch]);

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
