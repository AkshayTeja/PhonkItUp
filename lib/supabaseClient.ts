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

interface FormattedTrack {
  id: string | number;
  title: string;
  artist: string;
  duration: string;
  plays: string;
  cover: string;
  change: string;
  popularity: number;
  track_url: string;
}

// Utility function to format duration from seconds to MM:SS
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Utility function to format plays for display
const formatPlays = (popularity: number): string => {
  if (popularity > 90) return `${(popularity * 15).toFixed(1)}M`;
  if (popularity > 70) return `${(popularity * 12).toFixed(0)}K`;
  if (popularity > 50) return `${(popularity * 8).toFixed(0)}K`;
  return `${(popularity * 5).toFixed(0)}K`;
};

// Utility function to format raw track data
const formatTrackData = (track: any): FormattedTrack => {
  return {
    id: track.id,
    title: track.song_name,
    artist: track.song_artist,
    duration: formatDuration(track.song_duration),
    plays: formatPlays(track.song_popularity),
    cover: track.album_cover_url || "/placeholder.svg?height=80&width=80",
    change: `+${Math.floor(Math.random() * 20) + 1}`,
    popularity: track.song_popularity,
    track_url: track.track_url,
  };
};

// Function to fetch trending tracks from phonk_songs table
export const fetchTrendingTracks = async (): Promise<FormattedTrack[]> => {
  const { data, error } = await supabase
    .from('phonk_songs')
    .select('*')
    .order('song_popularity', { ascending: false })
    .limit(15);

  if (error) {
    console.error('Error fetching trending tracks:', error);
    throw new Error(`Failed to fetch trending tracks: ${error.message}`);
  }

  return data ? data.map(formatTrackData) : [];
};

// Function to fetch weekly tracks from phonk_songs table
export const fetchWeeklyTracks = async (): Promise<FormattedTrack[]> => {
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

  return data ? data.map(formatTrackData) : [];
};

// Function to fetch monthly tracks from phonk_songs table
export const fetchMonthlyTracks = async (): Promise<FormattedTrack[]> => {
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

  return data ? data.map(formatTrackData) : [];
};

// Function to fetch a single track by ID
export const fetchTrackById = async (id: string | number): Promise<FormattedTrack | null> => {
  const { data, error } = await supabase
    .from('phonk_songs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching track by ID:', error);
    return null;
  }

  return data ? formatTrackData(data) : null;
};

// Function to fetch tracks by artist
export const fetchTracksByArtist = async (artistName: string): Promise<FormattedTrack[]> => {
  const { data, error } = await supabase
    .from('phonk_songs')
    .select('*')
    .ilike('song_artist', `%${artistName}%`)
    .order('song_popularity', { ascending: false });

  if (error) {
    console.error('Error fetching tracks by artist:', error);
    throw new Error(`Failed to fetch tracks by artist: ${error.message}`);
  }

  return data ? data.map(formatTrackData) : [];
};

// Function to search tracks by title or artist
export const searchTracks = async (query: string): Promise<FormattedTrack[]> => {
  const { data, error } = await supabase
    .from('phonk_songs')
    .select('*')
    .or(`song_name.ilike.%${query}%,song_artist.ilike.%${query}%`)
    .order('song_popularity', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error searching tracks:', error);
    throw new Error(`Failed to search tracks: ${error.message}`);
  }

  return data ? data.map(formatTrackData) : [];
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

// Function to increment play count (if you want to track plays)
export const incrementPlayCount = async (trackId: string | number): Promise<void> => {
  try {
    // First, get current play count or popularity
    const { data: currentTrack } = await supabase
      .from('phonk_songs')
      .select('song_popularity')
      .eq('id', trackId)
      .single();

    if (currentTrack) {
      // Increment the popularity slightly to simulate play tracking
      const newPopularity = Math.min(100, currentTrack.song_popularity + 0.1);
      
      await supabase
        .from('phonk_songs')
        .update({ song_popularity: newPopularity })
        .eq('id', trackId);
    }
  } catch (error) {
    console.error('Error incrementing play count:', error);
  }
};

// Function to validate track URL
export const validateTrackUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && !!response.headers.get('content-type')?.startsWith('audio/');
  } catch {
    return false;
  }
};

// Function to get random tracks for shuffle/discovery
export const getRandomTracks = async (limit: number = 10): Promise<FormattedTrack[]> => {
  const { data, error } = await supabase
    .from('phonk_songs')
    .select('*')
    .gte('song_popularity', 20)
    .limit(limit * 3); // Get more to randomize from

  if (error) {
    console.error('Error fetching random tracks:', error);
    return [];
  }

  // Shuffle and return limited results
  const shuffled = data?.sort(() => 0.5 - Math.random()).slice(0, limit) || [];
  return shuffled.map(formatTrackData);
};

export { supabase, formatTrackData, formatDuration, formatPlays };