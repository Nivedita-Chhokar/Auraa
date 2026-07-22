import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isPlaceholder = !supabaseUrl || 
                      supabaseUrl === 'YOUR_SUPABASE_URL' || 
                      !supabaseAnonKey || 
                      supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY';

if (isPlaceholder) {
  console.warn(
    'Auraa: Supabase URL or Anon Key is missing or set to placeholder. ' +
    'Please create a project on Supabase and update your .env file at the project root.'
  );
}

// Fallback to placeholder values if keys are missing to prevent initialization failure
const finalUrl = isPlaceholder ? 'https://placeholder-project.supabase.co' : supabaseUrl;
const finalKey = isPlaceholder ? 'placeholder-anon-key' : supabaseAnonKey;

export const supabase = createClient(finalUrl, finalKey);
