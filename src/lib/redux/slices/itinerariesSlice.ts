import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  EnhancedAudioItinerary,
  EnhancedAudioTrack,
  SearchFilters as AppSearchFilters,
} from '@/types/app-types';

// Re-export enhanced types for backward compatibility
export type AudioItinerary = EnhancedAudioItinerary;
export type AudioTrack = EnhancedAudioTrack;
export type SearchFilters = AppSearchFilters;

export interface ItinerariesState {
  // Data
  itineraries: AudioItinerary[];
  tracks: Record<string, AudioTrack[]>; // key: itinerary_id
  featured: string[]; // itinerary IDs
  nearby: AudioItinerary[];

  // Search and filters
  searchFilters: SearchFilters;
  searchResults: AudioItinerary[];
  isSearching: boolean;

  // Selection and current state
  selectedItinerary: AudioItinerary | null;
  currentItineraryId: string | null;

  // Loading states
  isLoading: boolean;
  isLoadingTracks: boolean;
  isLoadingNearby: boolean;

  // Error states
  error: string | null;
  tracksError: string | null;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Initial state
const initialState: ItinerariesState = {
  itineraries: [],
  tracks: {},
  featured: [],
  nearby: [],
  searchFilters: {
    query: '',
    sort_by: 'name',
    sort_order: 'asc',
  } as SearchFilters,
  searchResults: [],
  isSearching: false,
  selectedItinerary: null,
  currentItineraryId: null,
  isLoading: false,
  isLoadingTracks: false,
  isLoadingNearby: false,
  error: null,
  tracksError: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
};

// Itineraries slice
export const itinerariesSlice = createSlice({
  name: 'itineraries',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLoadingTracks: (state, action: PayloadAction<boolean>) => {
      state.isLoadingTracks = action.payload;
    },
    setLoadingNearby: (state, action: PayloadAction<boolean>) => {
      state.isLoadingNearby = action.payload;
    },

    // Itineraries management
    setItineraries: (state, action: PayloadAction<AudioItinerary[]>) => {
      state.itineraries = action.payload;
      state.error = null;
    },
    addItineraries: (state, action: PayloadAction<AudioItinerary[]>) => {
      const existingIds = new Set(state.itineraries.map((i) => i.id));
      const newItineraries = action.payload.filter((i) => !existingIds.has(i.id));
      state.itineraries.push(...newItineraries);
    },
    updateItinerary: (state, action: PayloadAction<AudioItinerary>) => {
      const index = state.itineraries.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) {
        state.itineraries[index] = action.payload;
      }
      if (state.selectedItinerary?.id === action.payload.id) {
        state.selectedItinerary = action.payload;
      }
    },

    // Tracks management
    setTracks: (state, action: PayloadAction<{ itineraryId: string; tracks: AudioTrack[] }>) => {
      state.tracks[action.payload.itineraryId] = action.payload.tracks;
      state.tracksError = null;
    },
    addTrack: (state, action: PayloadAction<{ itineraryId: string; track: AudioTrack }>) => {
      const { itineraryId, track } = action.payload;
      if (!state.tracks[itineraryId]) {
        state.tracks[itineraryId] = [];
      }
      state.tracks[itineraryId].push(track);
    },
    updateTrack: (state, action: PayloadAction<{ itineraryId: string; track: AudioTrack }>) => {
      const { itineraryId, track } = action.payload;
      if (state.tracks[itineraryId]) {
        const index = state.tracks[itineraryId].findIndex((t) => t.id === track.id);
        if (index !== -1) {
          state.tracks[itineraryId][index] = track;
        }
      }
    },

    // Featured and nearby
    setFeatured: (state, action: PayloadAction<string[]>) => {
      state.featured = action.payload;
    },
    setNearby: (state, action: PayloadAction<AudioItinerary[]>) => {
      state.nearby = action.payload;
      state.error = null;
    },

    // Search functionality
    setSearchFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchFilters.query = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<AudioItinerary[]>) => {
      state.searchResults = action.payload;
      state.isSearching = false;
    },
    setSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
    clearSearch: (state) => {
      state.searchFilters.query = '';
      state.searchResults = [];
      state.isSearching = false;
    },

    // Selection
    selectItinerary: (state, action: PayloadAction<AudioItinerary | null>) => {
      state.selectedItinerary = action.payload;
      state.currentItineraryId = action.payload?.id || null;
    },
    setCurrentItineraryId: (state, action: PayloadAction<string | null>) => {
      state.currentItineraryId = action.payload;
      if (action.payload) {
        const itinerary = state.itineraries.find((i) => i.id === action.payload);
        state.selectedItinerary = itinerary || null;
      } else {
        state.selectedItinerary = null;
      }
    },

    // Pagination
    setPagination: (state, action: PayloadAction<Partial<ItinerariesState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetPagination: (state) => {
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: true,
      };
    },

    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setTracksError: (state, action: PayloadAction<string | null>) => {
      state.tracksError = action.payload;
      state.isLoadingTracks = false;
    },
    clearErrors: (state) => {
      state.error = null;
      state.tracksError = null;
    },

    // Reset state
    reset: () => initialState,
  },
});

// Export actions
export const {
  setLoading,
  setLoadingTracks,
  setLoadingNearby,
  setItineraries,
  addItineraries,
  updateItinerary,
  setTracks,
  addTrack,
  updateTrack,
  setFeatured,
  setNearby,
  setSearchFilters,
  setSearchQuery,
  setSearchResults,
  setSearching,
  clearSearch,
  selectItinerary,
  setCurrentItineraryId,
  setPagination,
  resetPagination,
  setError,
  setTracksError,
  clearErrors,
  reset,
} = itinerariesSlice.actions;

// Selectors
export const selectItineraries = (state: { itineraries: ItinerariesState }) =>
  state.itineraries.itineraries;
export const selectTracks = (state: { itineraries: ItinerariesState }, itineraryId: string) =>
  state.itineraries.tracks[itineraryId] || [];
export const selectFeatured = (state: { itineraries: ItinerariesState }) =>
  state.itineraries.itineraries.filter((i) => state.itineraries.featured.includes(i.id));
export const selectNearby = (state: { itineraries: ItinerariesState }) => state.itineraries.nearby;
export const selectSearchResults = (state: { itineraries: ItinerariesState }) =>
  state.itineraries.searchResults;
export const selectSearchFilters = (state: { itineraries: ItinerariesState }) =>
  state.itineraries.searchFilters;
export const selectSelectedItinerary = (state: { itineraries: ItinerariesState }) =>
  state.itineraries.selectedItinerary;
export const selectCurrentItineraryId = (state: { itineraries: ItinerariesState }) =>
  state.itineraries.currentItineraryId;
export const selectItinerariesLoading = (state: { itineraries: ItinerariesState }) =>
  state.itineraries.isLoading;
export const selectTracksLoading = (state: { itineraries: ItinerariesState }) =>
  state.itineraries.isLoadingTracks;
export const selectItinerariesError = (state: { itineraries: ItinerariesState }) =>
  state.itineraries.error;
export const selectPagination = (state: { itineraries: ItinerariesState }) =>
  state.itineraries.pagination;

export default itinerariesSlice.reducer;
