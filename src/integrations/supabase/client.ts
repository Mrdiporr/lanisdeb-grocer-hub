// Secure supabase client for frontend
// Replaces hard-coded URL/KEY with build-time env vars.
// Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// It's deliberately the anon/public key for client-side usage.
// Never place service_role or admin keys here.
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // In development it's helpful to surface the problem early
  // but avoid embedding secrets in the repo.
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. The app will run in demo mode.');
}

export const supabase = createClient<Database>(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
  auth: {
    // Keep client side session behavior unchanged; for SSR adjust as needed.
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});

export const isSupabaseConfigured = () => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
};