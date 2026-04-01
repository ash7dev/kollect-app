// src/features/auth/services/supabaseConfig.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Import web fallback
import { getItemAsync as webGetItemAsync, setItemAsync as webSetItemAsync, deleteItemAsync as webDeleteItemAsync } from '../../../../secureStore.web';

const SUPABASE_URL = 'https://eslzutyspbtomjbotmxw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzbHp1dHlzcGJ0b21qYm90bXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4ODA3MDMsImV4cCI6MjA3NzQ1NjcwM30.ZqFadF7j08DuB5Uvr9AaAu7KBPM2RjTkR7PsL_XyD8U';

// Adapter SecureStore pour Supabase Auth (stockage des tokens Supabase)
const SecureStoreAdapter = {
    getItem: async (key: string): Promise<string | null> => {
        // Utiliser le fallback web si expo-secure-store n'est pas disponible
        try {
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            return await webGetItemAsync(key);
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            await webSetItemAsync(key, value);
        }
    },
    removeItem: async (key: string): Promise<void> => {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            await webDeleteItemAsync(key);
        }
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
