import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL = 'https://ngksgohjiagxvjvwfubc.supabase.co'; // TODO: Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5na3Nnb2hqaWFneHZqdndmdWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MTMyNjksImV4cCI6MjA2NzA4OTI2OX0.5kQRfhkF8uB7GeaU8qdb1ZeQMAfHoI-2i6tDKO7PCQM'; // TODO: Replace with your Supabase anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth helpers
export const signUp = async (email: string, password: string) => {
  return supabase.auth.signUp({ email, password });
};

export const signInWithPassword = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return supabase.auth.signOut();
}; 