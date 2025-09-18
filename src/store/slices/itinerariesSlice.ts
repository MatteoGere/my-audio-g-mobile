import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Tables } from '../../types/supabase-types';

export interface ItineraryWithDetails extends Tables<'audio_itinerary'> {
  company?: Tables<'company'>;
  image_file?: Tables<'image_file'>;
  tracks?: Tables<'audio_track'>[];
}

export interface ItinerariesState {
  // Discovery & browsing
  featuredItineraries: ItineraryWithDetails[];
  nearbyItineraries: ItineraryWithDetails[];
  searchResults: ItineraryWithDetails[];

  // Current itinerary details
  currentItinerary: ItineraryWithDetails | null;
  currentTracks: Tables<'audio_track'>[];

  // Filters and search
  searchQuery: string;
  selectedCategories: string[];
  sortBy: 'name' | 'duration' | 'popularity' | 'distance';

  // Loading states
  isLoadingFeatured: boolean;
  isLoadingNearby: boolean;
  isLoadingSearch: boolean;
  isLoadingDetails: boolean;

  // Error states
  error: string | null;
}

const initialState: ItinerariesState = {
  featuredItineraries: [],
  nearbyItineraries: [],
  searchResults: [],
  currentItinerary: null,
  currentTracks: [],
  searchQuery: '',
  selectedCategories: [],
  sortBy: 'name',
  isLoadingFeatured: false,
  isLoadingNearby: false,
  isLoadingSearch: false,
  isLoadingDetails: false,
  error: null,
};

const itinerariesSlice = createSlice({
  name: 'itineraries',
  initialState,
  reducers: {
    // Set data
    setFeaturedItineraries: (state, action: PayloadAction<ItineraryWithDetails[]>) => {
      state.featuredItineraries = action.payload;
    },
    setNearbyItineraries: (state, action: PayloadAction<ItineraryWithDetails[]>) => {
      state.nearbyItineraries = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<ItineraryWithDetails[]>) => {
      state.searchResults = action.payload;
    },
    setCurrentItinerary: (state, action: PayloadAction<ItineraryWithDetails | null>) => {
      state.currentItinerary = action.payload;
    },
    setCurrentTracks: (state, action: PayloadAction<Tables<'audio_track'>[]>) => {
      state.currentTracks = action.payload;
    },

    // Search and filters
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategories: (state, action: PayloadAction<string[]>) => {
      state.selectedCategories = action.payload;
    },
    addCategory: (state, action: PayloadAction<string>) => {
      if (!state.selectedCategories.includes(action.payload)) {
        state.selectedCategories.push(action.payload);
      }
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategories = state.selectedCategories.filter((cat) => cat !== action.payload);
    },
    setSortBy: (state, action: PayloadAction<'name' | 'duration' | 'popularity' | 'distance'>) => {
      state.sortBy = action.payload;
    },

    // Loading states
    setLoadingFeatured: (state, action: PayloadAction<boolean>) => {
      state.isLoadingFeatured = action.payload;
    },
    setLoadingNearby: (state, action: PayloadAction<boolean>) => {
      state.isLoadingNearby = action.payload;
    },
    setLoadingSearch: (state, action: PayloadAction<boolean>) => {
      state.isLoadingSearch = action.payload;
    },
    setLoadingDetails: (state, action: PayloadAction<boolean>) => {
      state.isLoadingDetails = action.payload;
    },

    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Reset
    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchResults = [];
      state.selectedCategories = [];
    },
    resetCurrentItinerary: (state) => {
      state.currentItinerary = null;
      state.currentTracks = [];
    },
  },
});

export const {
  setFeaturedItineraries,
  setNearbyItineraries,
  setSearchResults,
  setCurrentItinerary,
  setCurrentTracks,
  setSearchQuery,
  setSelectedCategories,
  addCategory,
  removeCategory,
  setSortBy,
  setLoadingFeatured,
  setLoadingNearby,
  setLoadingSearch,
  setLoadingDetails,
  setError,
  clearError,
  clearSearch,
  resetCurrentItinerary,
} = itinerariesSlice.actions;

export default itinerariesSlice.reducer;
