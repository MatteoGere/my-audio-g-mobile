import { apiSlice } from './apiSlice'
import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase-types'

export interface ItineraryWithDetails extends Tables<'audio_itinerary'> {
  company?: Tables<'company'>
  image_file?: Tables<'image_file'>
  tracks?: Tables<'audio_track'>[]
}

export const itinerariesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all itineraries with company and image details
    getItineraries: builder.query<ItineraryWithDetails[], void>({
      query: () => 'audio_itinerary?select=*,company(*),image_file(*)',
      providesTags: ['AudioItinerary'],
    }),
    
    // Get itinerary by ID with full details
    getItinerary: builder.query<ItineraryWithDetails, string>({
      query: (id) => `audio_itinerary?id=eq.${id}&select=*,company(*),image_file(*)`,
      transformResponse: (response: ItineraryWithDetails[]) => response[0],
      providesTags: (result, error, id) => [{ type: 'AudioItinerary', id }],
    }),
    
    // Get itineraries by company
    getItinerariesByCompany: builder.query<ItineraryWithDetails[], string>({
      query: (companyId) => `audio_itinerary?company_id=eq.${companyId}&select=*,company(*),image_file(*)`,
      providesTags: ['AudioItinerary'],
    }),
    
    // Get nearby itineraries using the database function
    getNearbyItineraries: builder.query<any[], { lat: number; lng: number; radius?: number }>({
      query: ({ lat, lng, radius = 5000 }) => 
        `rpc/fn_nearby_audio_itineraries?user_lat=${lat}&user_lng=${lng}&radius_meters=${radius}`,
      providesTags: ['AudioItinerary'],
    }),
    
    // Get itinerary tracks
    getItineraryTracks: builder.query<Tables<'audio_track'>[], string>({
      query: (itineraryId) => 
        `audio_track?audio_itinerary_id=eq.${itineraryId}&select=*,image_file(*)&order=audio_itinerary_order.asc`,
      providesTags: (result, error, itineraryId) => [
        { type: 'AudioTrack', id: `itinerary-${itineraryId}` }
      ],
    }),
    
    // Create itinerary
    createItinerary: builder.mutation<Tables<'audio_itinerary'>, TablesInsert<'audio_itinerary'>>({
      query: (itinerary) => ({
        url: 'audio_itinerary',
        method: 'POST',
        body: itinerary,
      }),
      invalidatesTags: ['AudioItinerary'],
    }),
    
    // Update itinerary
    updateItinerary: builder.mutation<Tables<'audio_itinerary'>, { id: string; data: TablesUpdate<'audio_itinerary'> }>({
      query: ({ id, data }) => ({
        url: `audio_itinerary?id=eq.${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'AudioItinerary', id }],
    }),
    
    // Delete itinerary
    deleteItinerary: builder.mutation<void, string>({
      query: (id) => ({
        url: `audio_itinerary?id=eq.${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'AudioItinerary', id }],
    }),
  }),
})

export const {
  useGetItinerariesQuery,
  useGetItineraryQuery,
  useGetItinerariesByCompanyQuery,
  useGetNearbyItinerariesQuery,
  useGetItineraryTracksQuery,
  useCreateItineraryMutation,
  useUpdateItineraryMutation,
  useDeleteItineraryMutation,
} = itinerariesApi