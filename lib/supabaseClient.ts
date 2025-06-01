import { createClient } from '@supabase/supabase-js';

// Ensure these environment variables are set in your deployment environment
// and locally via a .env file (which should be excluded from Git).
// The 'NEXT_PUBLIC_' prefix is a convention for client-side accessible variables
// in frameworks like Next.js. Adjust if your framework uses a different convention.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Basic validation to ensure keys are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is not defined in environment variables.');
  // Depending on your application, you might want to throw an error or handle this more gracefully.
  // For production, you should ensure these are always set during deployment.
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!); // Use non-null assertion if you've handled the error case
