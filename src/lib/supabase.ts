import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper function to get signed URL for audio files
export const getSignedAudioUrl = async (storageKey: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('audio-files')
    .createSignedUrl(storageKey, 3600); // 1 hour expiration

  if (error) {
    throw new Error(`Failed to get signed audio URL: ${error.message}`);
  }

  return data.signedUrl;
};

// Helper function to get signed URL for image files
export const getSignedImageUrl = async (storageKey: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('image-files')
    .createSignedUrl(storageKey, 3600); // 1 hour expiration

  if (error) {
    throw new Error(`Failed to get signed image URL: ${error.message}`);
  }

  return data.signedUrl;
};
