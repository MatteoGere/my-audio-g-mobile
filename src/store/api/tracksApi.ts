import { apiSlice } from './apiSlice'
import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase-types'

export interface TrackWithDetails extends Tables<'audio_track'> {
  image_file?: Tables<'image_file'>
  audio_track_poi?: Tables<'audio_track_poi'>
}

export const tracksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tracks with details
    getTracks: builder.query<TrackWithDetails[], void>({
      query: () => 'audio_track?select=*,image_file(*),audio_track_poi(*)',
      providesTags: ['AudioTrack'],
    }),
    
    // Get track by ID with details
    getTrack: builder.query<TrackWithDetails, string>({
      query: (id) => `audio_track?id=eq.${id}&select=*,image_file(*),audio_track_poi(*)`,
      transformResponse: (response: TrackWithDetails[]) => response[0],
      providesTags: (result, error, id) => [{ type: 'AudioTrack', id }],
    }),
    
    // Get tracks by itinerary
    getTracksByItinerary: builder.query<TrackWithDetails[], string>({
      query: (itineraryId) => 
        `audio_track?audio_itinerary_id=eq.${itineraryId}&select=*,image_file(*),audio_track_poi(*)&order=audio_itinerary_order.asc`,
      providesTags: (result, error, itineraryId) => [
        { type: 'AudioTrack', id: `itinerary-${itineraryId}` }
      ],
    }),
    
    // Get track POI
    getTrackPOI: builder.query<Tables<'audio_track_poi'>, string>({
      query: (trackId) => `audio_track_poi?audio_track_id=eq.${trackId}&select=*`,
      transformResponse: (response: Tables<'audio_track_poi'>[]) => response[0],
      providesTags: (result, error, trackId) => [{ type: 'AudioTrack', id: `poi-${trackId}` }],
    }),
    
    // Create track
    createTrack: builder.mutation<Tables<'audio_track'>, TablesInsert<'audio_track'>>({
      query: (track) => ({
        url: 'audio_track',
        method: 'POST',
        body: track,
      }),
      invalidatesTags: ['AudioTrack'],
    }),
    
    // Update track
    updateTrack: builder.mutation<Tables<'audio_track'>, { id: string; data: TablesUpdate<'audio_track'> }>({
      query: ({ id, data }) => ({
        url: `audio_track?id=eq.${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'AudioTrack', id }],
    }),
    
    // Delete track
    deleteTrack: builder.mutation<void, string>({
      query: (id) => ({
        url: `audio_track?id=eq.${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'AudioTrack', id }],
    }),
    
    // Create track POI
    createTrackPOI: builder.mutation<Tables<'audio_track_poi'>, TablesInsert<'audio_track_poi'>>({
      query: (poi) => ({
        url: 'audio_track_poi',
        method: 'POST',
        body: poi,
      }),
      invalidatesTags: (result, error, poi) => [
        { type: 'AudioTrack', id: `poi-${poi.audio_track_id}` }
      ],
    }),
    
    // Update track POI
    updateTrackPOI: builder.mutation<Tables<'audio_track_poi'>, { trackId: string; data: TablesUpdate<'audio_track_poi'> }>({
      query: ({ trackId, data }) => ({
        url: `audio_track_poi?audio_track_id=eq.${trackId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { trackId }) => [
        { type: 'AudioTrack', id: `poi-${trackId}` }
      ],
    }),
  }),
})

export const {
  useGetTracksQuery,
  useGetTrackQuery,
  useGetTracksByItineraryQuery,
  useGetTrackPOIQuery,
  useCreateTrackMutation,
  useUpdateTrackMutation,
  useDeleteTrackMutation,
  useCreateTrackPOIMutation,
  useUpdateTrackPOIMutation,
} = tracksApi