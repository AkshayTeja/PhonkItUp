import { supabase } from './supabaseClient'

// Sign Up
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

// Sign In
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

// Sign Out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return error
}

// Google Sign-In
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`, // Or your custom redirect page
    },
  });
  return { data, error };
};

