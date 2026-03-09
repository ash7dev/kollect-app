// src/config/supabaseClient.ts
// Client Supabase côté navigateur pour l'authentification
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eslzutyspbtomjbotmxw.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzbHp1dHlzcGJ0b21qYm90bXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4ODA3MDMsImV4cCI6MjA3NzQ1NjcwM30.ZqFadF7j08DuB5Uvr9AaAu7KBPM2RjTkR7PsL_XyD8U';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true, // Important pour OAuth callbacks
    },
});

export { SUPABASE_URL, SUPABASE_ANON_KEY };
