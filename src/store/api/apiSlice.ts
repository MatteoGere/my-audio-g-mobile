import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../types/supabase-types'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
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