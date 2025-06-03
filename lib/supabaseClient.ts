import { createClient } from '@supabase/supabase-js';

// Type the environment variables for safety and clarity
const supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Enhanced error handling for missing environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase configuration failed: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Please check your environment variables.'
  );
}

// Create the Supabase client with additional configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Define interfaces for type safety
interface Track {
  id: string | number;
  song_name: string;
  song_artist: string;
  song_duration: number;
  song_popularity: number;
  album_cover_url: string | null;
  track_url: string;
}

// Function to fetch trending tracks from phonk_songs table
export const fetchTrendingTracks = async (): Promise<Track[]> => {
  const { data, error } = await supabase
    .from('phonk_songs')
    .select('*')
    .order('song_popularity', { ascending: false })
    .limit(15);

  if (error) {
    console.error('Error fetching trending tracks:', error);
    throw new Error(`Failed to fetch trending tracks: ${error.message}`);
  }

  return data || [];
};

// Function to fetch weekly tracks from phonk_songs table
export const fetchWeeklyTracks = async (): Promise<Track[]> => {
  const { data, error } = await supabase
    .from('phonk_songs')
    .select('*')
    .gte('song_popularity', 50)
    .order('song_popularity', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching weekly tracks:', error);
    throw new Error(`Failed to fetch weekly tracks: ${error.message}`);
  }

  return data || [];
};

// Function to fetch monthly tracks from phonk_songs table
export const fetchMonthlyTracks = async (): Promise<Track[]> => {
  const { data, error } = await supabase
    .from('phonk_songs')
    .select('*')
    .gte('song_popularity', 30)
    .order('song_popularity', { ascending: false })
    .limit(12);

  if (error) {
    console.error('Error fetching monthly tracks:', error);
    throw new Error(`Failed to fetch monthly tracks: ${error.message}`);
  }

  return data || [];
};

// Function to fetch trending artists from phonk_songs table
export const fetchTrendingArtists = async (): Promise<{ name: string; popularity: number; cover: string; followers: string }[]> => {
  const { data, error } = await supabase
    .from('phonk_songs')
    .select('song_artist, song_popularity, album_cover_url')
    .order('song_popularity', { ascending: false });

  if (error) {
    console.error('Error fetching trending artists:', error);
    throw new Error(`Failed to fetch trending artists: ${error.message}`);
  }

  const artistMap = new Map<string, { name: string; popularity: number; cover: string; followers: string }>();
  data?.forEach((track: any) => {
    if (
      !artistMap.has(track.song_artist) ||
      artistMap.get(track.song_artist)!.popularity < track.song_popularity
    ) {
      artistMap.set(track.song_artist, {
        name: track.song_artist,
        popularity: track.song_popularity,
        cover: track.album_cover_url || '/placeholder.svg?height=120&width=120',
        followers: formatPlays(track.song_popularity * 10),
      });
    }
  });

  return Array.from(artistMap.values()).slice(0, 5);
};

// Utility function to format plays for display
const formatPlays = (popularity: number): string => {
  if (popularity > 90) return `${(popularity * 15).toFixed(1)}M`;
  if (popularity > 70) return `${(popularity * 12).toFixed(0)}K`;
  if (popularity > 50) return `${(popularity * 8).toFixed(0)}K`;
  return `${(popularity * 5).toFixed(0)}K`;
};

export { supabase };