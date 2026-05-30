import { createClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL  || '';
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// URL・key が空の場合は null を返し、他コードでガード
export const supabase = (url && key)
  ? createClient(url, key, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export function isSupabaseConfigured() {
  return !!(url && key);
}
