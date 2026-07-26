import { createClient } from '@supabase/supabase-js';

// Lecture des variables d'environnement Vercel / Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '[CareVoice Supabase] Configuration Supabase manquante dans .env. Veuillez configurer VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'
  );
}

/**
 * Instance unique du Client Supabase pour l'application CareVoice
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
