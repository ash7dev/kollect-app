// src/features/auth/services/supabaseConfig.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL = 'https://eslzutyspbtomjbotmxw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzbHp1dHlzcGJ0b21qYm90bXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4ODA3MDMsImV4cCI6MjA3NzQ1NjcwM30.ZqFadF7j08DuB5Uvr9AaAu7KBPM2RjTkR7PsL_XyD8U';

// Adapter SecureStore pour Supabase Auth (stockage des tokens Supabase)
const SecureStoreAdapter = {
    getItem: async (key: string): Promise<string | null> => {
        return SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string): Promise<void> => {
        await SecureStore.setItemAsync(key, value);
    },
    removeItem: async (key: string): Promise<void> => {
        await SecureStore.deleteItemAsync(key);
    },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: SecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Important pour React Native
    },
});

export { SUPABASE_URL, SUPABASE_ANON_KEY };
