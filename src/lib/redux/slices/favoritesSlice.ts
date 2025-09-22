import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AudioItinerary, AudioTrack } from './itinerariesSlice';

// Types for favorites
export interface FavoriteItem {
  id: number; // user_favourite.id
  user_id: string;
  favourite_id: string; // itinerary or track ID
  type: 'FAVOURITE-TRACK' | 'FAVOURITE-ITINERARY';
  created_at: string;
  // Extended data
  item?: AudioItinerary | AudioTrack;
}

export interface FavoritesState {
  // Favorites data
  favoriteItineraries: FavoriteItem[];
  favoriteTracks: FavoriteItem[];

  // Quick access sets for performance
  favoriteItineraryIds: Set<string>;
  favoriteTrackIds: Set<string>;

  // Loading states
  isLoading: boolean;
  isAddingFavorite: boolean;
  isRemovingFavorite: boolean;

  // Error states
  error: string | null;

  // UI state
  showFavoritesOnly: boolean;
  favoritesSortBy: 'name' | 'created_at' | 'duration';
  favoritesSortOrder: 'asc' | 'desc';
}

// Initial state
const initialState: FavoritesState = {
  favoriteItineraries: [],
  favoriteTracks: [],
  favoriteItineraryIds: new Set(),
  favoriteTrackIds: new Set(),
  isLoading: false,
  isAddingFavorite: false,
  isRemovingFavorite: false,
  error: null,
  showFavoritesOnly: false,
  favoritesSortBy: 'created_at',
  favoritesSortOrder: 'desc',
};

// Favorites slice
export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAddingFavorite: (state, action: PayloadAction<boolean>) => {
      state.isAddingFavorite = action.payload;
    },
    setRemovingFavorite: (state, action: PayloadAction<boolean>) => {
      state.isRemovingFavorite = action.payload;
    },

    // Set favorites data
    setFavoriteItineraries: (state, action: PayloadAction<FavoriteItem[]>) => {
      state.favoriteItineraries = action.payload;
      state.favoriteItineraryIds = new Set(action.payload.map((f) => f.favourite_id));
      state.error = null;
    },
    setFavoriteTracks: (state, action: PayloadAction<FavoriteItem[]>) => {
      state.favoriteTracks = action.payload;
      state.favoriteTrackIds = new Set(action.payload.map((f) => f.favourite_id));
      state.error = null;
    },

    // Add favorites
    addFavoriteItinerary: (state, action: PayloadAction<FavoriteItem>) => {
      const favorite = action.payload;
      if (!state.favoriteItineraryIds.has(favorite.favourite_id)) {
        state.favoriteItineraries.push(favorite);
        state.favoriteItineraryIds.add(favorite.favourite_id);
      }
      state.isAddingFavorite = false;
      state.error = null;
    },
    addFavoriteTrack: (state, action: PayloadAction<FavoriteItem>) => {
      const favorite = action.payload;
      if (!state.favoriteTrackIds.has(favorite.favourite_id)) {
        state.favoriteTracks.push(favorite);
        state.favoriteTrackIds.add(favorite.favourite_id);
      }
      state.isAddingFavorite = false;
      state.error = null;
    },

    // Remove favorites
    removeFavoriteItinerary: (state, action: PayloadAction<string>) => {
      const itineraryId = action.payload;
      state.favoriteItineraries = state.favoriteItineraries.filter(
        (f) => f.favourite_id !== itineraryId,
      );
      state.favoriteItineraryIds.delete(itineraryId);
      state.isRemovingFavorite = false;
      state.error = null;
    },
    removeFavoriteTrack: (state, action: PayloadAction<string>) => {
      const trackId = action.payload;
      state.favoriteTracks = state.favoriteTracks.filter((f) => f.favourite_id !== trackId);
      state.favoriteTrackIds.delete(trackId);
      state.isRemovingFavorite = false;
      state.error = null;
    },

    // Remove by database ID
    removeFavoriteById: (state, action: PayloadAction<number>) => {
      const favoriteId = action.payload;

      // Check itineraries
      const itineraryIndex = state.favoriteItineraries.findIndex((f) => f.id === favoriteId);
      if (itineraryIndex !== -1) {
        const removedFavorite = state.favoriteItineraries[itineraryIndex];
        state.favoriteItineraries.splice(itineraryIndex, 1);
        state.favoriteItineraryIds.delete(removedFavorite.favourite_id);
      }

      // Check tracks
      const trackIndex = state.favoriteTracks.findIndex((f) => f.id === favoriteId);
      if (trackIndex !== -1) {
        const removedFavorite = state.favoriteTracks[trackIndex];
        state.favoriteTracks.splice(trackIndex, 1);
        state.favoriteTrackIds.delete(removedFavorite.favourite_id);
      }

      state.isRemovingFavorite = false;
      state.error = null;
    },

    // Update favorites with item data
    updateFavoriteItineraryData: (
      state,
      action: PayloadAction<{ favoriteId: string; itinerary: AudioItinerary }>,
    ) => {
      const { favoriteId, itinerary } = action.payload;
      const favorite = state.favoriteItineraries.find((f) => f.favourite_id === favoriteId);
      if (favorite) {
        favorite.item = itinerary;
      }
    },
    updateFavoriteTrackData: (
      state,
      action: PayloadAction<{ favoriteId: string; track: AudioTrack }>,
    ) => {
      const { favoriteId, track } = action.payload;
      const favorite = state.favoriteTracks.find((f) => f.favourite_id === favoriteId);
      if (favorite) {
        favorite.item = track;
      }
    },

    // Bulk operations
    addFavorites: (state, action: PayloadAction<FavoriteItem[]>) => {
      action.payload.forEach((favorite) => {
        if (favorite.type === 'FAVOURITE-ITINERARY') {
          if (!state.favoriteItineraryIds.has(favorite.favourite_id)) {
            state.favoriteItineraries.push(favorite);
            state.favoriteItineraryIds.add(favorite.favourite_id);
          }
        } else if (favorite.type === 'FAVOURITE-TRACK') {
          if (!state.favoriteTrackIds.has(favorite.favourite_id)) {
            state.favoriteTracks.push(favorite);
            state.favoriteTrackIds.add(favorite.favourite_id);
          }
        }
      });
    },

    // UI state
    setShowFavoritesOnly: (state, action: PayloadAction<boolean>) => {
      state.showFavoritesOnly = action.payload;
    },
    setFavoritesSortBy: (state, action: PayloadAction<'name' | 'created_at' | 'duration'>) => {
      state.favoritesSortBy = action.payload;
    },
    setFavoritesSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.favoritesSortOrder = action.payload;
    },

    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isAddingFavorite = false;
      state.isRemovingFavorite = false;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Clear all favorites (on logout)
    clearFavorites: (state) => {
      state.favoriteItineraries = [];
      state.favoriteTracks = [];
      state.favoriteItineraryIds.clear();
      state.favoriteTrackIds.clear();
      state.error = null;
      state.isLoading = false;
      state.isAddingFavorite = false;
      state.isRemovingFavorite = false;
    },

    // Reset state
    resetFavorites: () => initialState,
  },
});

// Export actions
export const {
  setLoading,
  setAddingFavorite,
  setRemovingFavorite,
  setFavoriteItineraries,
  setFavoriteTracks,
  addFavoriteItinerary,
  addFavoriteTrack,
  removeFavoriteItinerary,
  removeFavoriteTrack,
  removeFavoriteById,
  updateFavoriteItineraryData,
  updateFavoriteTrackData,
  addFavorites,
  setShowFavoritesOnly,
  setFavoritesSortBy,
  setFavoritesSortOrder,
  setError,
  clearError,
  clearFavorites,
  resetFavorites,
} = favoritesSlice.actions;

// Selectors
export const selectFavoriteItineraries = (state: { favorites: FavoritesState }) =>
  state.favorites.favoriteItineraries;
export const selectFavoriteTracks = (state: { favorites: FavoritesState }) =>
  state.favorites.favoriteTracks;
export const selectFavoriteItineraryIds = (state: { favorites: FavoritesState }) =>
  state.favorites.favoriteItineraryIds;
export const selectFavoriteTrackIds = (state: { favorites: FavoritesState }) =>
  state.favorites.favoriteTrackIds;
export const selectIsItineraryFavorite = (
  state: { favorites: FavoritesState },
  itineraryId: string,
) => state.favorites.favoriteItineraryIds.has(itineraryId);
export const selectIsTrackFavorite = (state: { favorites: FavoritesState }, trackId: string) =>
  state.favorites.favoriteTrackIds.has(trackId);
export const selectFavoritesLoading = (state: { favorites: FavoritesState }) =>
  state.favorites.isLoading;
export const selectFavoritesError = (state: { favorites: FavoritesState }) => state.favorites.error;
export const selectShowFavoritesOnly = (state: { favorites: FavoritesState }) =>
  state.favorites.showFavoritesOnly;

// Computed selectors
export const selectSortedFavoriteItineraries = (state: { favorites: FavoritesState }) => {
  const { favoriteItineraries, favoritesSortBy, favoritesSortOrder } = state.favorites;

  return [...favoriteItineraries].sort((a, b) => {
    let comparison = 0;

    switch (favoritesSortBy) {
      case 'name':
        const aName = (a.item as AudioItinerary)?.name || '';
        const bName = (b.item as AudioItinerary)?.name || '';
        comparison = aName.localeCompare(bName);
        break;
      case 'duration':
        const aDuration = (a.item as AudioItinerary)?.total_duration || 0;
        const bDuration = (b.item as AudioItinerary)?.total_duration || 0;
        comparison = aDuration - bDuration;
        break;
      case 'created_at':
      default:
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }

    return favoritesSortOrder === 'desc' ? -comparison : comparison;
  });
};

export const selectSortedFavoriteTracks = (state: { favorites: FavoritesState }) => {
  const { favoriteTracks, favoritesSortBy, favoritesSortOrder } = state.favorites;

  return [...favoriteTracks].sort((a, b) => {
    let comparison = 0;

    switch (favoritesSortBy) {
      case 'name':
        const aName = (a.item as AudioTrack)?.name || '';
        const bName = (b.item as AudioTrack)?.name || '';
        comparison = aName.localeCompare(bName);
        break;
      case 'duration':
        const aDuration = (a.item as AudioTrack)?.duration || 0;
        const bDuration = (b.item as AudioTrack)?.duration || 0;
        comparison = aDuration - bDuration;
        break;
      case 'created_at':
      default:
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }

    return favoritesSortOrder === 'desc' ? -comparison : comparison;
  });
};

export default favoritesSlice.reducer;
