import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use localStorage for session persistence (default) but with a safe
    // storage key that avoids collisions with other Supabase projects.
    storageKey: 'mi-pana-auth',
    // Automatically refresh the token before it expires.
    autoRefreshToken: true,
    // Persist the session across page reloads.
    persistSession: true,
    // Detect the session from the URL hash after OAuth redirects.
    detectSessionInUrl: true,
  },
});
