import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase-types';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// API slice using RTK Query with Supabase
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    'AudioItinerary',
    'AudioTrack',
    'UserProfile',
    'UserFavorite',
    'Company',
    'ImageFile',
    'SignedUrl',
  ],
  endpoints: (builder) => ({
    // ===== AUTHENTICATION =====
    signUp: builder.mutation<
      { user: any; session: any },
      { email: string; password: string; name: string; surname: string }
    >({
      queryFn: async ({ email, password, name, surname }) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name, surname },
            },
          });

          if (error) throw error;

          return { data };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
    }),

    signIn: builder.mutation<{ user: any; session: any }, { email: string; password: string }>({
      queryFn: async ({ email, password }) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          return { data };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
    }),

    signOut: builder.mutation<void, void>({
      queryFn: async () => {
        try {
          const { error } = await supabase.auth.signOut();

          if (error) throw error;

          return { data: undefined };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
    }),

    // ===== USER PROFILE =====
    getUserProfile: builder.query<Database['public']['Tables']['user_profile']['Row'], string>({
      queryFn: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('user_profile')
            .select('*')
            .eq('id', userId)
            .single();

          if (error) throw error;

          return { data };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['UserProfile'],
    }),

    updateUserProfile: builder.mutation<
      Database['public']['Tables']['user_profile']['Row'],
      { id: string; updates: Partial<Database['public']['Tables']['user_profile']['Update']> }
    >({
      queryFn: async ({ id, updates }) => {
        try {
          const { data, error } = await supabase
            .from('user_profile')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          return { data };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['UserProfile'],
    }),

    // ===== AUDIO ITINERARIES =====
    getAudioItineraries: builder.query<
      Database['public']['Tables']['audio_itinerary']['Row'][],
      { page?: number; limit?: number; search?: string }
    >({
      queryFn: async ({ page = 1, limit = 20, search }) => {
        try {
          let query = supabase
            .from('audio_itinerary')
            .select(
              `
              *,
              company:company_id (
                id,
                name,
                description,
                image_file_id
              ),
              image_file:image_file_id (
                image_storage_key,
                image_type
              )
            `,
            )
            .order('created_at', { ascending: false });

          if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
          }

          const from = (page - 1) * limit;
          const to = from + limit - 1;
          query = query.range(from, to);

          const { data, error } = await query;

          if (error) throw error;

          return { data };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['AudioItinerary'],
    }),

    getAudioItinerary: builder.query<
      Database['public']['Tables']['audio_itinerary']['Row'],
      string
    >({
      queryFn: async (id) => {
        try {
          const { data, error } = await supabase
            .from('audio_itinerary')
            .select(
              `
              *,
              company:company_id (
                id,
                name,
                description,
                image_file_id
              ),
              image_file:image_file_id (
                image_storage_key,
                image_type
              )
            `,
            )
            .eq('id', id)
            .single();

          if (error) throw error;

          return { data };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: (result, error, id) => [{ type: 'AudioItinerary', id }],
    }),

    getNearbyItineraries: builder.query<
      any[],
      { latitude: number; longitude: number; radius?: number }
    >({
      queryFn: async ({ latitude, longitude, radius = 5000 }) => {
        try {
          const { data, error } = await supabase.rpc('fn_nearby_audio_itineraries', {
            user_lat: latitude,
            user_lng: longitude,
            radius_meters: radius,
          });

          if (error) throw error;

          return { data };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['AudioItinerary'],
    }),

    // ===== AUDIO TRACKS =====
    getItineraryTracks: builder.query<Database['public']['Tables']['audio_track']['Row'][], string>(
      {
        queryFn: async (itineraryId) => {
          try {
            const { data, error } = await supabase
              .from('audio_track')
              .select(
                `
              *,
              image_file:image_file_id (
                image_storage_key,
                image_type
              ),
              audio_track_poi (
                latitude,
                longitude
              )
            `,
              )
              .eq('audio_itinerary_id', itineraryId)
              .order('audio_itinerary_order', { ascending: true });

            if (error) throw error;

            return { data };
          } catch (error: any) {
            return { error: { status: 'FETCH_ERROR', error: error.message } };
          }
        },
        providesTags: (result, error, itineraryId) => [{ type: 'AudioTrack', id: itineraryId }],
      },
    ),

    getAudioTrack: builder.query<Database['public']['Tables']['audio_track']['Row'], string>({
      queryFn: async (trackId) => {
        try {
          const { data, error } = await supabase
            .from('audio_track')
            .select(
              `
              *,
              image_file:image_file_id (
                image_storage_key,
                image_type
              ),
              audio_track_poi (
                latitude,
                longitude
              )
            `,
            )
            .eq('id', trackId)
            .single();

          if (error) throw error;

          return { data };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: (result, error, id) => [{ type: 'AudioTrack', id }],
    }),

    // ===== POI ENDPOINTS =====
    getPoisForMap: builder.query<
      Array<{
        trackId: string;
        trackName: string;
        itineraryId: string;
        itineraryName: string;
        latitude: number;
        longitude: number;
        duration: number;
        imageStorageKey: string | null;
        audioStorageKey: string;
        companyId: string;
        companyName: string;
      }>,
      { bounds?: { north: number; south: number; east: number; west: number }; itineraryId?: string }
    >({
      queryFn: async ({ bounds, itineraryId }) => {
        try {
          let query = supabase
            .from('audio_track')
            .select(
              `
              id,
              name,
              duration,
              audio_storage_key,
              image_file:image_file_id (
                image_storage_key
              ),
              audio_track_poi!inner (
                latitude,
                longitude
              ),
              audio_itinerary!inner (
                id,
                name,
                company:company_id (
                  id,
                  name
                )
              )
            `,
            )
            .not('audio_track_poi', 'is', null);

          // Filter by itinerary if specified
          if (itineraryId) {
            query = query.eq('itinerary_id', itineraryId);
          }

          // Filter by bounds if specified
          if (bounds) {
            query = query
              .gte('audio_track_poi.latitude', bounds.south)
              .lte('audio_track_poi.latitude', bounds.north)
              .gte('audio_track_poi.longitude', bounds.west)
              .lte('audio_track_poi.longitude', bounds.east);
          }

          const { data, error } = await query.order('track_order', { ascending: true });

          if (error) throw error;

          // Transform the data to match our POIMarkerData interface
          const transformedData = data?.map((track: any) => ({
            trackId: track.id,
            trackName: track.name,
            itineraryId: track.audio_itinerary.id,
            itineraryName: track.audio_itinerary.name,
            latitude: track.audio_track_poi.latitude,
            longitude: track.audio_track_poi.longitude,
            duration: track.duration,
            imageStorageKey: track.image_file?.image_storage_key || null,
            audioStorageKey: track.audio_storage_key,
            companyId: track.audio_itinerary.company.id,
            companyName: track.audio_itinerary.company.name,
          })) || [];

          return { data: transformedData };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['AudioTrack', 'AudioItinerary'],
    }),

    // ===== USER FAVORITES =====
    getUserFavorites: builder.query<
      Database['public']['Tables']['user_favourite']['Row'][],
      string
    >({
      queryFn: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('user_favourite')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) throw error;

          return { data };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['UserFavorite'],
    }),

    addFavorite: builder.mutation<
      Database['public']['Tables']['user_favourite']['Row'],
      {
        user_id: string;
        favourite_id: string;
        type: 'FAVOURITE-TRACK' | 'FAVOURITE-ITINERARY';
      }
    >({
      queryFn: async (favorite) => {
        try {
          const { data, error } = await supabase
            .from('user_favourite')
            .insert(favorite)
            .select()
            .single();

          if (error) throw error;

          return { data };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['UserFavorite'],
    }),

    removeFavorite: builder.mutation<void, number>({
      queryFn: async (favoriteId) => {
        try {
          const { error } = await supabase.from('user_favourite').delete().eq('id', favoriteId);

          if (error) throw error;

          return { data: undefined };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['UserFavorite'],
    }),

    // ===== SIGNED URLS =====
    getSignedAudioUrl: builder.query<
      { url: string; expiresIn: number },
      { path: string; expiresIn?: number }
    >({
      queryFn: async ({ path, expiresIn = 3600 }) => {
        try {
          const { data, error } = await supabase.storage
            .from('audio-files')
            .createSignedUrl(path, expiresIn);

          if (error) throw error;

          return { data: { url: data.signedUrl, expiresIn } };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['SignedUrl'],
    }),

    getSignedImageUrl: builder.query<
      { url: string; expiresIn: number },
      { path: string; expiresIn?: number }
    >({
      queryFn: async ({ path, expiresIn = 3600 }) => {
        try {
          const { data, error } = await supabase.storage
            .from('image-files')
            .createSignedUrl(path, expiresIn);

          if (error) throw error;

          return { data: { url: data.signedUrl, expiresIn } };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['SignedUrl'],
    }),

    getBatchSignedUrls: builder.query<
      Array<{ path: string; url: string; error?: string }>,
      {
        paths: string[];
        bucket: 'audio-files' | 'image-files';
        expiresIn?: number;
      }
    >({
      queryFn: async (params) => {
        try {
          // Guard against undefined params to avoid destructuring errors
          if (!params || !Array.isArray(params.paths) || params.paths.length === 0) {
            return {
              error: { status: 'FETCH_ERROR', error: 'Missing or invalid "paths" parameter' },
            };
          }

          const { paths, bucket, expiresIn = 3600 } = params;

          const results = await Promise.allSettled(
            paths.map(async (path) => {
              const { data, error } = await supabase.storage
                .from(bucket)
                .createSignedUrl(path, expiresIn);

              if (error) throw error;

              return { path, url: data.signedUrl };
            }),
          );

          const data = results.map((result, index) => {
            if (result.status === 'fulfilled') {
              return result.value;
            } else {
              return {
                path: paths[index],
                url: '',
                error: result.reason?.message || 'Failed to create signed URL',
              };
            }
          });

          return { data };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['SignedUrl'],
    }),

    // ===== COMPANIES =====
    getCompanies: builder.query<Database['public']['Tables']['company']['Row'][], void>({
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('company')
            .select(
              `
              *,
              image_file:image_file_id (
                image_storage_key,
                image_type
              )
            `,
            )
            .order('name', { ascending: true });

          if (error) throw error;

          return { data };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['Company'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Auth
  useSignUpMutation,
  useSignInMutation,
  useSignOutMutation,

  // User Profile
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,

  // Itineraries
  useGetAudioItinerariesQuery,
  useGetAudioItineraryQuery,
  useGetNearbyItinerariesQuery,

  // Tracks
  useGetItineraryTracksQuery,
  useGetAudioTrackQuery,

  // POI
  useGetPoisForMapQuery,

  // Favorites
  useGetUserFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,

  // Signed URLs
  useGetSignedAudioUrlQuery,
  useGetSignedImageUrlQuery,
  useGetBatchSignedUrlsQuery,

  // Companies
  useGetCompaniesQuery,
} = apiSlice;

export default apiSlice;
