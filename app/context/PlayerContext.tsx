"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";

interface Track {
  id: string | number; // Matches phonk_songs.id (bigint)
  title: string; // Maps to song_name
  artist: string; // Maps to song_artist
  duration: string; // Maps to song_duration (as string for display)
  plays: string; // Mocked, not in phonk_songs
  cover: string; // Maps to album_cover_url
  change: string; // Mocked, not in phonk_songs
  popularity: number; // Maps to song_popularity
  track_url: string; // Maps to track_url
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  liked: boolean;
  isLoading: boolean;
  error: string | null;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleLike: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [liked, setLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const isDragging = useRef(false);
  const lastUpdateTime = useRef<number>(0); // Track last state update time

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleTrackEnded);
    audio.addEventListener("error", handleAudioError);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadstart", handleLoadStart);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleTrackEnded);
      audio.removeEventListener("error", handleAudioError);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.pause();
      audio.src = "";
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Load and play track when currentTrack changes
  useEffect(() => {
    if (currentTrack && currentTrack.track_url && audioRef.current) {
      setError(null);
      setIsLoading(true);
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current.src = currentTrack.track_url;
      audioRef.current.load();
      audioRef.current.onloadedmetadata = () => {
        setDuration(audioRef.current!.duration);
      };
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          animationRef.current = requestAnimationFrame(syncTime);
        })
        .catch((error) => {
          console.error("Error playing track:", error);
          setError("Failed to play track");
          setIsLoading(false);
        });
    }
  }, [currentTrack]);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Check if current track is liked
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!currentTrack) {
        setLiked(false);
        return;
      }
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("liked_songs")
            .select("id")
            .eq("user_id", user.id)
            .eq("track_id", currentTrack.id)
            .single();
          setLiked(!!data);
        }
      } catch (err) {
        console.error("Error checking liked status:", err);
        setError("Failed to check liked status");
      }
    };
    checkIfLiked();
  }, [currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTrackEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const handleAudioError = () => {
    setError("Failed to load audio");
    setIsLoading(false);
    setIsPlaying(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const playTrack = async (track: Track) => {
    setCurrentTrack(track);

    // Log to recently_played table
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const durationInSeconds = parseInt(track.duration); // Convert duration to integer (seconds)
        if (!isNaN(durationInSeconds)) {
          const { error } = await supabase.from("recently_played").insert({
            user_id: user.id,
            track_id: track.id,
            duration: durationInSeconds,
          });
          if (error) {
            console.error(
              "Error logging recently played track:",
              error.message
            );
          }
        } else {
          console.warn("Invalid track duration:", track.duration);
        }
      }
    } catch (error: any) {
      console.error("Error logging recently played track:", error.message);
    }
  };

  const togglePlay = () => {
    if (!currentTrack || !currentTrack.track_url || !audioRef.current) {
      console.warn("No track selected or track URL missing");
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setError(null);
          animationRef.current = requestAnimationFrame(syncTime);
        })
        .catch((error) => {
          console.error("Error playing track:", error);
          setError("Failed to play track");
        });
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 10,
        duration
      );
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime - 10,
        0
      );
    }
  };

  const syncTime = () => {
    if (audioRef.current && !isDragging.current && isPlaying) {
      const now = performance.now();
      // Update state only every 1000ms (1 second)
      if (now - lastUpdateTime.current >= 1000) {
        setCurrentTime(audioRef.current.currentTime);
        lastUpdateTime.current = now;
      }
      animationRef.current = requestAnimationFrame(syncTime);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleSetCurrentTime = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleLike = async () => {
    if (!currentTrack) {
      setError("No track selected");
      return;
    }
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: existingLike } = await supabase
        .from("liked_songs")
        .select("id")
        .eq("user_id", user.id)
        .eq("track_id", currentTrack.id)
        .single();

      if (existingLike) {
        // Unlike: Delete from liked_songs
        const { error } = await supabase
          .from("liked_songs")
          .delete()
          .eq("id", existingLike.id);
        if (error) throw new Error(`Unlike error: ${error.message}`);
        setLiked(false);
      } else {
        // Like: Insert into liked_songs
        const { error } = await supabase
          .from("liked_songs")
          .insert({ user_id: user.id, track_id: currentTrack.id });
        if (error) throw new Error(`Like error: ${error.message}`);
        setLiked(true);
      }
    } catch (err: any) {
      console.error("Error toggling like:", err.message);
      setError("Failed to update liked status");
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        liked,
        isLoading,
        error,
        playTrack,
        togglePlay,
        skipForward,
        skipBackward,
        setCurrentTime: handleSetCurrentTime,
        setVolume,
        toggleLike,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
