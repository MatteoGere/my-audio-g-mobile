import { createApi, fetchBaseQuery, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { Database, Tables, TablesInsert, TablesUpdate } from '../../types/supabase-types';
import { supabase, getSignedAudioUrl, getSignedImageUrl } from '../../lib/supabase';

// Custom base query for Supabase
const supabaseBaseQuery: BaseQueryFn<
  {
    table?: keyof Database['public']['Tables'];
    operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert' | 'rpc';
    query?: any;
    data?: any;
    rpcName?: string;
    rpcParams?: any;
  },
  unknown,
  { error: string; details?: any }
> = async ({ table, operation, query, data, rpcName, rpcParams }) => {
  try {
    let result;

    switch (operation) {
      case 'select':
        if (!table) throw new Error('Table is required for select operation');
        result = await supabase.from(table as any).select(query);
        break;

      case 'insert':
        if (!table) throw new Error('Table is required for insert operation');
        result = await supabase.from(table as any).insert(data);
        break;

      case 'update':
        if (!table) throw new Error('Table is required for update operation');
        result = await supabase
          .from(table as any)
          .update(data)
          .match(query);
        break;

      case 'delete':
        if (!table) throw new Error('Table is required for delete operation');
        result = await supabase
          .from(table as any)
          .delete()
          .match(query);
        break;

      case 'upsert':
        if (!table) throw new Error('Table is required for upsert operation');
        result = await supabase.from(table as any).upsert(data);
        break;

      case 'rpc':
        if (!rpcName) throw new Error('RPC name is required for RPC operation');
        result = await supabase.rpc(rpcName as any, rpcParams);
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    if (result.error) {
      return {
        error: {
          error: result.error.message,
          details: result.error,
        },
      };
    }

    return { data: result.data };
  } catch (error) {
    return {
      error: {
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error,
      },
    };
  }
};

// Define our API slice
export const supabaseApi = createApi({
  reducerPath: 'supabaseApi',
  baseQuery: supabaseBaseQuery,
  tagTypes: [
    'AudioItinerary',
    'AudioTrack',
    'AudioTrackPoi',
    'UserProfile',
    'UserFavourite',
    'ImageFile',
    'SignedUrl',
    'NearbyItineraries',
  ],
  endpoints: (builder) => ({
    // Authentication endpoints
    signIn: builder.mutation<{ user: any; session: any }, { email: string; password: string }>({
      queryFn: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { error: { error: error.message, details: error } };
        }

        return { data };
      },
    }),

    signUp: builder.mutation<
      { user: any; session: any },
      { email: string; password: string; name: string; surname: string }
    >({
      queryFn: async ({ email, password, name, surname }) => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) {
          return { error: { error: authError.message, details: authError } };
        }

        // Create user profile
        if (authData.user) {
          const { error: profileError } = await supabase.from('user_profile').insert({
            id: authData.user.id,
            name,
            surname,
            role: 'USER',
          });

          if (profileError) {
            return { error: { error: profileError.message, details: profileError } };
          }
        }

        return { data: authData };
      },
      invalidatesTags: ['UserProfile'],
    }),

    signOut: builder.mutation<void, void>({
      queryFn: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          return { error: { error: error.message, details: error } };
        }
        return { data: undefined };
      },
    }),

    // User Profile endpoints
    getUserProfile: builder.query<Database['public']['Tables']['user_profile']['Row'], string>({
      query: (userId) => ({
        table: 'user_profile',
        operation: 'select',
        query: `*`,
      }),
      providesTags: ['UserProfile'],
    }),

    updateUserProfile: builder.mutation<
      Database['public']['Tables']['user_profile']['Row'],
      {
        userId: string;
        updates: TablesUpdate<'user_profile'>;
      }
    >({
      query: ({ userId, updates }) => ({
        table: 'user_profile',
        operation: 'update',
        query: { id: userId },
        data: updates,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // Audio Itineraries
    getAudioItineraries: builder.query<
      Database['public']['Tables']['audio_itinerary']['Row'][],
      void
    >({
      query: () => ({
        table: 'audio_itinerary',
        operation: 'select',
        query: `
          *,
          image_file:image_file_id (
            id,
            image_storage_key,
            image_type
          )
        `,
      }),
      providesTags: ['AudioItinerary'],
    }),

    getAudioItinerary: builder.query<
      Database['public']['Tables']['audio_itinerary']['Row'] & {
        image_file?: Database['public']['Tables']['image_file']['Row'];
      },
      string
    >({
      query: (id) => ({
        table: 'audio_itinerary',
        operation: 'select',
        query: `
          *,
          image_file:image_file_id (
            id,
            image_storage_key,
            image_type
          )
        `,
      }),
      providesTags: ['AudioItinerary'],
    }),

    // Get nearby itineraries using the database function
    getNearbyItineraries: builder.query<
      Database['public']['Functions']['fn_nearby_audio_itineraries']['Returns'],
      {
        latitude: number;
        longitude: number;
        radiusMeters?: number;
      }
    >({
      query: ({ latitude, longitude, radiusMeters = 1000 }) => ({
        operation: 'rpc',
        rpcName: 'fn_nearby_audio_itineraries',
        rpcParams: {
          user_lat: latitude,
          user_lng: longitude,
          radius_meters: radiusMeters,
        },
      }),
      providesTags: ['NearbyItineraries'],
    }),

    // Audio Tracks
    getAudioTracks: builder.query<Database['public']['Tables']['audio_track']['Row'][], string>({
      query: (itineraryId) => ({
        table: 'audio_track',
        operation: 'select',
        query: `
          *,
          image_file:image_file_id (
            id,
            image_storage_key,
            image_type
          ),
          audio_track_poi (
            latitude,
            longitude,
            location
          )
        `,
      }),
      providesTags: ['AudioTrack'],
    }),

    getAudioTrack: builder.query<
      Database['public']['Tables']['audio_track']['Row'] & {
        image_file?: Database['public']['Tables']['image_file']['Row'];
        audio_track_poi?: Database['public']['Tables']['audio_track_poi']['Row'];
      },
      string
    >({
      query: (trackId) => ({
        table: 'audio_track',
        operation: 'select',
        query: `
          *,
          image_file:image_file_id (
            id,
            image_storage_key,
            image_type
          ),
          audio_track_poi (
            latitude,
            longitude,
            location
          )
        `,
      }),
      providesTags: ['AudioTrack'],
    }),

    // User Favourites
    getUserFavourites: builder.query<
      Database['public']['Tables']['user_favourite']['Row'][],
      string
    >({
      query: (userId) => ({
        table: 'user_favourite',
        operation: 'select',
        query: `*`,
      }),
      providesTags: ['UserFavourite'],
    }),

    addFavourite: builder.mutation<
      Database['public']['Tables']['user_favourite']['Row'],
      {
        userId: string;
        favouriteId: string;
        type: Database['public']['Enums']['user_favourite_type'];
      }
    >({
      query: ({ userId, favouriteId, type }) => ({
        table: 'user_favourite',
        operation: 'insert',
        data: {
          user_id: userId,
          favourite_id: favouriteId,
          type,
        },
      }),
      invalidatesTags: ['UserFavourite'],
    }),

    removeFavourite: builder.mutation<
      void,
      {
        userId: string;
        favouriteId: string;
        type: Database['public']['Enums']['user_favourite_type'];
      }
    >({
      query: ({ userId, favouriteId, type }) => ({
        table: 'user_favourite',
        operation: 'delete',
        query: {
          user_id: userId,
          favourite_id: favouriteId,
          type,
        },
      }),
      invalidatesTags: ['UserFavourite'],
    }),

    // Signed URL endpoints
    getSignedAudioUrl: builder.query<string, string>({
      queryFn: async (storageKey) => {
        try {
          const url = await getSignedAudioUrl(storageKey);
          return { data: url };
        } catch (error) {
          return {
            error: {
              error: error instanceof Error ? error.message : 'Failed to get signed audio URL',
              details: error,
            },
          };
        }
      },
      providesTags: ['SignedUrl'],
    }),

    getSignedImageUrl: builder.query<string, string>({
      queryFn: async (storageKey) => {
        try {
          const url = await getSignedImageUrl(storageKey);
          return { data: url };
        } catch (error) {
          return {
            error: {
              error: error instanceof Error ? error.message : 'Failed to get signed image URL',
              details: error,
            },
          };
        }
      },
      providesTags: ['SignedUrl'],
    }),
  }),
});

// Export hooks for each endpoint
export const {
  // Auth
  useSignInMutation,
  useSignUpMutation,
  useSignOutMutation,

  // User Profile
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,

  // Audio Itineraries
  useGetAudioItinerariesQuery,
  useGetAudioItineraryQuery,
  useGetNearbyItinerariesQuery,

  // Audio Tracks
  useGetAudioTracksQuery,
  useGetAudioTrackQuery,

  // User Favourites
  useGetUserFavouritesQuery,
  useAddFavouriteMutation,
  useRemoveFavouriteMutation,

  // Signed URLs
  useGetSignedAudioUrlQuery,
  useGetSignedImageUrlQuery,
} = supabaseApi;
