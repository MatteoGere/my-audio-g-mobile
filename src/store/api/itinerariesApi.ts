import { apiSlice, supabase } from './apiSlice';
import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase-types';

export interface ItineraryWithDetails extends Tables<'audio_itinerary'> {
  company?: Tables<'company'> | null;
  image_file?: Tables<'image_file'> | null;
  tracks?: Tables<'audio_track'>[];
}

export const itinerariesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all itineraries with company and image details
    getItineraries: builder.query<ItineraryWithDetails[], void>({
      queryFn: async () => {
        try {
          const { data, error } = await supabase.from('audio_itinerary').select(`
              *,
              company(*),
              image_file(*)
            `);

          if (error) throw error;
          return { data: data || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: ['AudioItinerary'],
    }),

    // Get itinerary by ID with full details
    getItinerary: builder.query<ItineraryWithDetails, string>({
      queryFn: async (id) => {
        try {
          const { data, error } = await supabase
            .from('audio_itinerary')
            .select(
              `
              *,
              company(*),
              image_file(*)
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
      providesTags: (result, error, id) => [{ type: 'AudioItinerary', id }],
    }),

    // Get itineraries by company
    getItinerariesByCompany: builder.query<ItineraryWithDetails[], string>({
      queryFn: async (companyId) => {
        try {
          const { data, error } = await supabase
            .from('audio_itinerary')
            .select(
              `
              *,
              company(*),
              image_file(*)
            `,
            )
            .eq('company_id', companyId);

          if (error) throw error;
          return { data: data || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: ['AudioItinerary'],
    }),

    // Get nearby itineraries using the database function
    getNearbyItineraries: builder.query<any[], { lat: number; lng: number; radius?: number }>({
      queryFn: async ({ lat, lng, radius = 5000 }) => {
        try {
          const { data, error } = await supabase.rpc('fn_nearby_audio_itineraries', {
            user_lat: lat,
            user_lng: lng,
            radius_meters: radius,
          });

          if (error) throw error;
          return { data: data || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: ['AudioItinerary'],
    }),

    // Get itinerary tracks
    getItineraryTracks: builder.query<Tables<'audio_track'>[], string>({
      queryFn: async (itineraryId) => {
        try {
          const { data, error } = await supabase
            .from('audio_track')
            .select(
              `
              *,
              image_file(*)
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

    // Create itinerary
    createItinerary: builder.mutation<Tables<'audio_itinerary'>, TablesInsert<'audio_itinerary'>>({
      queryFn: async (itinerary) => {
        try {
          const { data, error } = await supabase
            .from('audio_itinerary')
            .insert(itinerary)
            .select()
            .single();

          if (error) throw error;
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['AudioItinerary'],
    }),

    // Update itinerary
    updateItinerary: builder.mutation<
      Tables<'audio_itinerary'>,
      { id: string; data: TablesUpdate<'audio_itinerary'> }
    >({
      queryFn: async ({ id, data }) => {
        try {
          const { data: result, error } = await supabase
            .from('audio_itinerary')
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
      invalidatesTags: (result, error, { id }) => [{ type: 'AudioItinerary', id }],
    }),

    // Delete itinerary
    deleteItinerary: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          const { error } = await supabase.from('audio_itinerary').delete().eq('id', id);

          if (error) throw error;
          return { data: undefined };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, id) => [{ type: 'AudioItinerary', id }],
    }),
  }),
});

export const {
  useGetItinerariesQuery,
  useGetItineraryQuery,
  useGetItinerariesByCompanyQuery,
  useGetNearbyItinerariesQuery,
  useGetItineraryTracksQuery,
  useCreateItineraryMutation,
  useUpdateItineraryMutation,
  useDeleteItineraryMutation,
} = itinerariesApi;
