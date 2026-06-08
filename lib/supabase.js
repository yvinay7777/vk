import { createClient } from '@supabase/supabase-js';

const isConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== '' &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_') &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim() !== '' &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your_');

const finalUrl = isConfigured ? process.env.NEXT_PUBLIC_SUPABASE_URL : 'https://placeholder-url-for-build.supabase.co';
const finalKey = isConfigured ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : 'placeholder-key';

export const supabase = createClient(finalUrl, finalKey);
export const supabaseReady = isConfigured;
