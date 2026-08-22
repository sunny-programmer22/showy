import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = (): boolean =>
  Boolean(
    url &&
      anonKey &&
      /^https?:\/\/.+/.test(url) &&
      !url.includes('YOUR-PROJECT-REF') &&
      anonKey.length > 20
  );

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(url!, anonKey!)
  : null;
