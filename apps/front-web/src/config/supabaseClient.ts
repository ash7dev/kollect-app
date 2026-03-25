// src/config/supabaseClient.ts
// Client Supabase côté navigateur pour l'authentification
//
// On utilise createBrowserClient de @supabase/ssr (et non createClient de supabase-js)
// car il stocke le code verifier PKCE dans les cookies HTTP plutôt que dans
// localStorage. Cela permet au route handler /auth/callback (serveur) de lire
// le verifier et d'appeler exchangeCodeForSession avec succès.
import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eslzutyspbtomjbotmxw.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzbHp1dHlzcGJ0b21qYm90bXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4ODA3MDMsImV4cCI6MjA3NzQ1NjcwM30.ZqFadF7j08DuB5Uvr9AaAu7KBPM2RjTkR7PsL_XyD8U';

export const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { SUPABASE_URL, SUPABASE_ANON_KEY };
