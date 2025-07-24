import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import type { AuthError } from '@supabase/supabase-js';
import { Alert } from 'react-native';

// It's crucial that these are exposed to the client using the EXPO_PUBLIC_ prefix.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const message = "CRITICAL ERROR: Make sure you have a .env file with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.";
  Alert.alert("Configuration Error", message);
  throw new Error(message);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // For production apps, it's recommended to use a secure storage option
    // like expo-secure-store, but AsyncStorage (the default) is fine for now.
    storage: undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// The signUp function from your Register screen can also live here.
export const signUp = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });
  return { error };
};

// Sign in with email and password
export const signInWithPassword = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  if (error) {
    console.error("Supabase signInWithPassword error:", error);
  }
  return { error };
};

// Sign out the current user
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signOut();
  return { error };
};