import { apiSlice, supabase } from './apiSlice';
import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase-types';

export interface TrackWithDetails extends Tables<'audio_track'> {
  image_file?: Tables<'image_file'> | null;
  audio_track_poi?: Tables<'audio_track_poi'> | null;
}

export const tracksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tracks with details
    getTracks: builder.query<TrackWithDetails[], void>({
      queryFn: async () => {
        try {
          const { data, error } = await supabase.from('audio_track').select(`
              *,
              image_file(*),
              audio_track_poi(*)
            `);

          if (error) throw error;
          return { data: data || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: ['AudioTrack'],
    }),

    // Get track by ID with details
    getTrack: builder.query<TrackWithDetails, string>({
      queryFn: async (id) => {
        try {
          const { data, error } = await supabase
            .from('audio_track')
            .select(
              `
              *,
              image_file(*),
              audio_track_poi(*)
            `,
            )
            .eq('id', id)
            .single();

          if (error) throw error;
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: (result, error, id) => [{ type: 'AudioTrack', id }],
    }),

    // Get tracks by itinerary
    getTracksByItinerary: builder.query<TrackWithDetails[], string>({
      queryFn: async (itineraryId) => {
        try {
          const { data, error } = await supabase
            .from('audio_track')
            .select(
              `
              *,
              image_file(*),
              audio_track_poi(*)
            `,
            )
            .eq('audio_itinerary_id', itineraryId)
            .order('audio_itinerary_order', { ascending: true });

          if (error) throw error;
          return { data: data || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: (result, error, itineraryId) => [
        { type: 'AudioTrack', id: `itinerary-${itineraryId}` },
      ],
    }),

    // Get track POI
    getTrackPOI: builder.query<Tables<'audio_track_poi'>, string>({
      queryFn: async (trackId) => {
        try {
          const { data, error } = await supabase
            .from('audio_track_poi')
            .select('*')
            .eq('audio_track_id', trackId)
            .single();

          if (error) throw error;
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: (result, error, trackId) => [{ type: 'AudioTrack', id: `poi-${trackId}` }],
    }),

    // Create track
    createTrack: builder.mutation<Tables<'audio_track'>, TablesInsert<'audio_track'>>({
      queryFn: async (track) => {
        try {
          const { data, error } = await supabase
            .from('audio_track')
            .insert(track)
            .select()
            .single();

          if (error) throw error;
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['AudioTrack'],
    }),

    // Update track
    updateTrack: builder.mutation<
      Tables<'audio_track'>,
      { id: string; data: TablesUpdate<'audio_track'> }
    >({
      queryFn: async ({ id, data }) => {
        try {
          const { data: result, error } = await supabase
            .from('audio_track')
            .update(data)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;
          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'AudioTrack', id }],
    }),

    // Delete track
    deleteTrack: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          const { error } = await supabase.from('audio_track').delete().eq('id', id);

          if (error) throw error;
          return { data: undefined };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, id) => [{ type: 'AudioTrack', id }],
    }),

    // Create track POI
    createTrackPOI: builder.mutation<Tables<'audio_track_poi'>, TablesInsert<'audio_track_poi'>>({
      queryFn: async (poi) => {
        try {
          const { data, error } = await supabase
            .from('audio_track_poi')
            .insert(poi)
            .select()
            .single();

          if (error) throw error;
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, poi) => [
        { type: 'AudioTrack', id: `poi-${poi.audio_track_id}` },
      ],
    }),

    // Update track POI
    updateTrackPOI: builder.mutation<
      Tables<'audio_track_poi'>,
      { trackId: string; data: TablesUpdate<'audio_track_poi'> }
    >({
      queryFn: async ({ trackId, data }) => {
        try {
          const { data: result, error } = await supabase
            .from('audio_track_poi')
            .update(data)
            .eq('audio_track_id', trackId)
            .select()
            .single();

          if (error) throw error;
          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, { trackId }) => [
        { type: 'AudioTrack', id: `poi-${trackId}` },
      ],
    }),
  }),
});

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
} = tracksApi;
