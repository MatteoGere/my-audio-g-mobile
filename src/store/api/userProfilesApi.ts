import { apiSlice } from './apiSlice'
import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase-types'

export const userProfilesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get user profile
    getUserProfile: builder.query<Tables<'user_profile'>, string>({
      query: (userId) => `user_profile?id=eq.${userId}&select=*`,
      transformResponse: (response: Tables<'user_profile'>[]) => response[0],
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
    
    // Create user profile
    createUserProfile: builder.mutation<Tables<'user_profile'>, TablesInsert<'user_profile'>>({
      query: (profile) => ({
        url: 'user_profile',
        method: 'POST',
        body: profile,
      }),
      invalidatesTags: (result, error, profile) => [{ type: 'User', id: profile.id }],
    }),
    
    // Update user profile
    updateUserProfile: builder.mutation<Tables<'user_profile'>, { id: string; data: TablesUpdate<'user_profile'> }>({
      query: ({ id, data }) => ({
        url: `user_profile?id=eq.${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
    
    // Delete user profile
    deleteUserProfile: builder.mutation<void, string>({
      query: (id) => ({
        url: `user_profile?id=eq.${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }],
    }),
  }),
})

export const {
  useGetUserProfileQuery,
  useCreateUserProfileMutation,
  useUpdateUserProfileMutation,
  useDeleteUserProfileMutation,
} = userProfilesApi