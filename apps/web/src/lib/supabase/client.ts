import { createBrowserClient } from '@supabase/ssr';
import { publicSupabaseConfig } from './config';

export function createBrowserSupabaseClient() {
  const { url, anonKey } = publicSupabaseConfig();
  return createBrowserClient(url, anonKey);
}
