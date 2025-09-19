import { apiSlice, supabase } from './apiSlice';
import type { Tables, TablesInsert } from '../../types/supabase-types';

export const userFavouritesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get user favourites
    getUserFavourites: builder.query<Tables<'user_favourite'>[], string>({
      queryFn: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('user_favourite')
            .select('*')
            .eq('user_id', userId);

          if (error) throw error;
          return { data: data || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: (result, error, userId) => [{ type: 'UserFavourite', id: userId }],
    }),

    // Get favourite itineraries for user
    getUserFavouriteItineraries: builder.query<Tables<'user_favourite'>[], string>({
      queryFn: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('user_favourite')
            .select('*')
            .eq('user_id', userId)
            .eq('type', 'FAVOURITE-ITINERARY');

          if (error) throw error;
          return { data: data || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: (result, error, userId) => [
        { type: 'UserFavourite', id: `${userId}-itineraries` },
      ],
    }),

    // Get favourite tracks for user
    getUserFavouriteTracks: builder.query<Tables<'user_favourite'>[], string>({
      queryFn: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('user_favourite')
            .select('*')
            .eq('user_id', userId)
            .eq('type', 'FAVOURITE-TRACK');

          if (error) throw error;
          return { data: data || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: (result, error, userId) => [{ type: 'UserFavourite', id: `${userId}-tracks` }],
    }),

    // Add favourite
    addFavourite: builder.mutation<Tables<'user_favourite'>, TablesInsert<'user_favourite'>>({
      queryFn: async (favourite) => {
        try {
          const { data, error } = await supabase
            .from('user_favourite')
            .insert(favourite)
            .select()
            .single();

          if (error) throw error;
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, favourite) => [
        { type: 'UserFavourite', id: favourite.user_id },
        {
          type: 'UserFavourite',
          id: `${favourite.user_id}-${favourite.type === 'FAVOURITE-ITINERARY' ? 'itineraries' : 'tracks'}`,
        },
      ],
    }),

    // Remove favourite
    removeFavourite: builder.mutation<
      void,
      { userId: string; favouriteId: string; type: 'FAVOURITE-TRACK' | 'FAVOURITE-ITINERARY' }
    >({
      queryFn: async ({ userId, favouriteId, type }) => {
        try {
          const { error } = await supabase
            .from('user_favourite')
            .delete()
            .eq('user_id', userId)
            .eq('favourite_id', favouriteId)
            .eq('type', type);

          if (error) throw error;
          return { data: undefined };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, { userId, type }) => [
        { type: 'UserFavourite', id: userId },
        {
          type: 'UserFavourite',
          id: `${userId}-${type === 'FAVOURITE-ITINERARY' ? 'itineraries' : 'tracks'}`,
        },
      ],
    }),

    // Check if item is favourite
    checkFavourite: builder.query<
      boolean,
      { userId: string; favouriteId: string; type: 'FAVOURITE-TRACK' | 'FAVOURITE-ITINERARY' }
    >({
      queryFn: async ({ userId, favouriteId, type }) => {
        try {
          const { data, error } = await supabase
            .from('user_favourite')
            .select('id')
            .eq('user_id', userId)
            .eq('favourite_id', favouriteId)
            .eq('type', type);

          if (error) throw error;
          return { data: (data || []).length > 0 };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: (result, error, { userId, favouriteId, type }) => [
        { type: 'UserFavourite', id: `${userId}-${favouriteId}-${type}` },
      ],
    }),
  }),
});

export const {
  useGetUserFavouritesQuery,
  useGetUserFavouriteItinerariesQuery,
  useGetUserFavouriteTracksQuery,
  useAddFavouriteMutation,
  useRemoveFavouriteMutation,
  useCheckFavouriteQuery,
} = userFavouritesApi;
