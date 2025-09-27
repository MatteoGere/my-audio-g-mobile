import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  useAddFavoriteMutation,
  useGetUserFavoritesDetailedQuery,
  useRemoveFavoriteMutation,
} from '../redux/api/apiSlice';
import {
  setFavoriteItineraries,
  setFavoriteTracks,
  setLoading as setFavoritesLoading,
  setError as setFavoritesError,
  setAddingFavorite,
  setRemovingFavorite,
  clearError as clearFavoritesError,
  FavoriteItem,
} from '../redux/slices/favoritesSlice';

export type FavoriteContentType = 'FAVOURITE-TRACK' | 'FAVOURITE-ITINERARY';

interface ToggleFavoritePayload {
  favouriteId: string;
  type: FavoriteContentType;
}

interface RemoveFavoritePayload extends ToggleFavoritePayload {
  favoriteRecordId?: number;
}

export const useFavorites = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const {
    favoriteItineraries,
    favoriteTracks,
    favoriteItineraryIds,
    favoriteTrackIds,
    isLoading,
    error,
    isAddingFavorite,
    isRemovingFavorite,
  } = useAppSelector((state) => state.favorites);

  const userId = user?.id;

  const queryArgs = useMemo(() => ({ userId: userId ?? '' }), [userId]);

  const {
    data: favoritesData,
    isFetching,
    isError,
    error: queryError,
    refetch,
  } = useGetUserFavoritesDetailedQuery(queryArgs, {
    skip: !userId,
    pollingInterval: 0,
  });

  useEffect(() => {
    dispatch(setFavoritesLoading(isFetching));
  }, [dispatch, isFetching]);

  useEffect(() => {
    if (!favoritesData) {
      if (!isFetching) {
        dispatch(setFavoriteItineraries([]));
        dispatch(setFavoriteTracks([]));
      }
      return;
    }

    const itineraryFavorites: FavoriteItem[] = [];
    const trackFavorites: FavoriteItem[] = [];

    favoritesData.forEach((favorite) => {
      if (favorite.type === 'FAVOURITE-ITINERARY') {
        itineraryFavorites.push({
          ...favorite,
          item: favorite.itinerary,
        });
      } else if (favorite.type === 'FAVOURITE-TRACK') {
        trackFavorites.push({
          ...favorite,
          item: favorite.track,
        });
      }
    });

    dispatch(setFavoriteItineraries(itineraryFavorites));
    dispatch(setFavoriteTracks(trackFavorites));
  }, [dispatch, favoritesData, isFetching]);

  useEffect(() => {
    if (isError) {
      const fallbackMessage = 'Unable to load favorites right now. Please try again later.';
      const message = (queryError as { error?: string })?.error || fallbackMessage;
      dispatch(setFavoritesError(message));
    } else {
      dispatch(clearFavoritesError());
    }
  }, [dispatch, isError, queryError]);

  const [addFavoriteMutation, { isLoading: addLoading }] = useAddFavoriteMutation();
  const [removeFavoriteMutation, { isLoading: removeLoading }] = useRemoveFavoriteMutation();

  useEffect(() => {
    dispatch(setAddingFavorite(addLoading));
  }, [addLoading, dispatch]);

  useEffect(() => {
    dispatch(setRemovingFavorite(removeLoading));
  }, [dispatch, removeLoading]);

  const addFavorite = useCallback(
    async ({ favouriteId, type }: ToggleFavoritePayload) => {
      if (!userId) {
        throw new Error('User must be authenticated to manage favorites.');
      }

      await addFavoriteMutation({
        user_id: userId,
        favourite_id: favouriteId,
        type,
      }).unwrap();

      await refetch();
    },
    [addFavoriteMutation, refetch, userId],
  );

  const removeFavoriteRecord = useCallback(
    async (favoriteRecordId: number) => {
      await removeFavoriteMutation(favoriteRecordId).unwrap();
      await refetch();
    },
    [refetch, removeFavoriteMutation],
  );

  const removeFavorite = useCallback(
    async ({ favouriteId, type, favoriteRecordId }: RemoveFavoritePayload) => {
      if (favoriteRecordId) {
        await removeFavoriteRecord(favoriteRecordId);
        return;
      }

      const collection = type === 'FAVOURITE-ITINERARY' ? favoriteItineraries : favoriteTracks;
      const match = collection.find((favorite) => favorite.favourite_id === favouriteId);
      if (match) {
        await removeFavoriteRecord(match.id);
      }
    },
    [favoriteItineraries, favoriteTracks, removeFavoriteRecord],
  );

  const toggleFavorite = useCallback(
    async ({ favouriteId, type }: ToggleFavoritePayload) => {
      const ids = type === 'FAVOURITE-ITINERARY' ? favoriteItineraryIds : favoriteTrackIds;
      const isAlreadyFavorite = ids.includes(favouriteId);

      if (isAlreadyFavorite) {
        await removeFavorite({ favouriteId, type });
      } else {
        await addFavorite({ favouriteId, type });
      }
    },
    [addFavorite, favoriteItineraryIds, favoriteTrackIds, removeFavorite],
  );

  const summary = useMemo(
    () => ({
      totalFavorites: favoriteItineraries.length + favoriteTracks.length,
      itineraryCount: favoriteItineraries.length,
      trackCount: favoriteTracks.length,
      isLoading: isLoading || isFetching,
    }),
    [favoriteItineraries.length, favoriteTracks.length, isFetching, isLoading],
  );

  return {
    userId,
    favoritesData,
    favoriteItineraries,
    favoriteTracks,
    favoriteItineraryIds,
    favoriteTrackIds,
    isLoading: isLoading || isFetching,
    isAddingFavorite,
    isRemovingFavorite,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refetch,
    summary,
  };
};
