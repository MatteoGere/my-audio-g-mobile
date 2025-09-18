import { apiSlice } from './apiSlice'
import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase-types'

export const userFavouritesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get user favourites
    getUserFavourites: builder.query<Tables<'user_favourite'>[], string>({
      query: (userId) => `user_favourite?user_id=eq.${userId}&select=*`,
      providesTags: (result, error, userId) => [{ type: 'UserFavourite', id: userId }],
    }),
    
    // Get favourite itineraries for user
    getUserFavouriteItineraries: builder.query<Tables<'user_favourite'>[], string>({
      query: (userId) => `user_favourite?user_id=eq.${userId}&type=eq.FAVOURITE-ITINERARY&select=*`,
      providesTags: (result, error, userId) => [{ type: 'UserFavourite', id: `${userId}-itineraries` }],
    }),
    
    // Get favourite tracks for user
    getUserFavouriteTracks: builder.query<Tables<'user_favourite'>[], string>({
      query: (userId) => `user_favourite?user_id=eq.${userId}&type=eq.FAVOURITE-TRACK&select=*`,
      providesTags: (result, error, userId) => [{ type: 'UserFavourite', id: `${userId}-tracks` }],
    }),
    
    // Add favourite
    addFavourite: builder.mutation<Tables<'user_favourite'>, TablesInsert<'user_favourite'>>({
      query: (favourite) => ({
        url: 'user_favourite',
        method: 'POST',
        body: favourite,
      }),
      invalidatesTags: (result, error, favourite) => [
        { type: 'UserFavourite', id: favourite.user_id },
        { type: 'UserFavourite', id: `${favourite.user_id}-${favourite.type === 'FAVOURITE-ITINERARY' ? 'itineraries' : 'tracks'}` }
      ],
    }),
    
    // Remove favourite
    removeFavourite: builder.mutation<void, { userId: string; favouriteId: string; type: string }>({
      query: ({ userId, favouriteId, type }) => ({
        url: `user_favourite?user_id=eq.${userId}&favourite_id=eq.${favouriteId}&type=eq.${type}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { userId, type }) => [
        { type: 'UserFavourite', id: userId },
        { type: 'UserFavourite', id: `${userId}-${type === 'FAVOURITE-ITINERARY' ? 'itineraries' : 'tracks'}` }
      ],
    }),
    
    // Check if item is favourite
    checkFavourite: builder.query<boolean, { userId: string; favouriteId: string; type: string }>({
      query: ({ userId, favouriteId, type }) => 
        `user_favourite?user_id=eq.${userId}&favourite_id=eq.${favouriteId}&type=eq.${type}&select=id`,
      transformResponse: (response: any[]) => response.length > 0,
      providesTags: (result, error, { userId, favouriteId, type }) => [
        { type: 'UserFavourite', id: `${userId}-${favouriteId}-${type}` }
      ],
    }),
  }),
})

export const {
  useGetUserFavouritesQuery,
  useGetUserFavouriteItinerariesQuery,
  useGetUserFavouriteTracksQuery,
  useAddFavouriteMutation,
  useRemoveFavouriteMutation,
  useCheckFavouriteQuery,
} = userFavouritesApi