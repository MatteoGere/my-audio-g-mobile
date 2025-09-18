import { apiSlice, supabase } from './apiSlice';
import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase-types';

export const userProfilesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get user profile
    getUserProfile: builder.query<Tables<'user_profile'>, string>({
      queryFn: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('user_profile')
            .select('*')
            .eq('id', userId)
            .single();

          if (error) throw error;
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),

    // Create user profile
    createUserProfile: builder.mutation<Tables<'user_profile'>, TablesInsert<'user_profile'>>({
      queryFn: async (profile) => {
        try {
          const { data, error } = await supabase
            .from('user_profile')
            .insert(profile)
            .select()
            .single();

          if (error) throw error;
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, profile) => [{ type: 'User', id: profile.id }],
    }),

    // Update user profile
    updateUserProfile: builder.mutation<
      Tables<'user_profile'>,
      { id: string; data: TablesUpdate<'user_profile'> }
    >({
      queryFn: async ({ id, data }) => {
        try {
          const { data: result, error } = await supabase
            .from('user_profile')
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
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),

    // Delete user profile
    deleteUserProfile: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          const { error } = await supabase.from('user_profile').delete().eq('id', id);

          if (error) throw error;
          return { data: undefined };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, id) => [{ type: 'User', id }],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useCreateUserProfileMutation,
  useUpdateUserProfileMutation,
  useDeleteUserProfileMutation,
} = userProfilesApi;
