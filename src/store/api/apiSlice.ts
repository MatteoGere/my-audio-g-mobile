import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../types/supabase-types'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Custom base query for Supabase
const supabaseBaseQuery = fetchBaseQuery({
  baseUrl: supabaseUrl + '/rest/v1/',
  prepareHeaders: async (headers) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`)
    }
    headers.set('apikey', supabaseAnonKey)
    headers.set('Content-Type', 'application/json')
    headers.set('Prefer', 'return=representation')
    return headers
  },
})

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: supabaseBaseQuery,
  tagTypes: [
    'User',
    'Company', 
    'AudioItinerary',
    'AudioTrack',
    'AudioQrToken',
    'UserFavourite',
    'ImageFile'
  ],
  endpoints: () => ({}),
})

export default apiSlice