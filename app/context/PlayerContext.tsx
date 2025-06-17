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
  id: string | number;
  title: string;
  artist: string;
  duration: string;
  plays: string;
  cover: string;
  change: string;
  popularity: number;
  track_url: string;
  playlist_track_id?: string;
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
  queue: Track[];
  currentTrackIndex: number;
  playlistName: string | null;
  isLooping: boolean;
  playTrack: (
    track: Track,
    queue?: Track[],
    index?: number,
    playlistName?: string
  ) => void;
  togglePlay: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  skipForwardSeconds: () => void;
  skipBackwardSeconds: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleLike: () => Promise<void>;
  toggleLoop: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const isMediaSessionSupported =
  typeof navigator !== "undefined" && "mediaSession" in navigator;

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [liked, setLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [playlistName, setPlaylistName] = useState<string | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const isDragging = useRef(false);
  const lastUpdateTime = useRef<number>(0);
  const lastToggleLoopTime = useRef<number>(0);
  const mediaSessionUpdateRef = useRef<number | null>(null);

  // Log queue changes
  useEffect(() => {
    console.log("Queue state changed:", {
      queueLength: queue.length,
      queue: queue.map((t) => t.title),
      currentTrackIndex,
      playlistName,
    });
  }, [queue, currentTrackIndex, playlistName]);

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
      if (mediaSessionUpdateRef.current) {
        clearInterval(mediaSessionUpdateRef.current);
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Ensure "Liked Songs" playlist exists on user login
  useEffect(() => {
    const ensureLikedSongsPlaylist = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          console.warn(
            "No user authenticated, skipping Liked Songs playlist creation"
          );
          return;
        }

        const { data: playlist, error: selectError } = await supabase
          .from("playlists")
          .select("id")
          .eq("user_id", user.id)
          .eq("title", "Liked Songs")
          .maybeSingle();

        if (selectError) {
          console.error("Error checking Liked Songs playlist:", selectError);
          return;
        }

        if (!playlist) {
          const { error: insertError } = await supabase
            .from("playlists")
            .insert({
              user_id: user.id,
              title: "Liked Songs",
              cover_url: "/liked.jpg",
              created_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error("Error creating Liked Songs playlist:", insertError);
          } else {
            console.log(`Created Liked Songs playlist for user ${user.id}`);
          }
        }
      } catch (err: any) {
        console.error("Error ensuring Liked Songs playlist:", err.message);
      }
    };

    ensureLikedSongsPlaylist();
  }, []);

  // Load and play current track
  useEffect(() => {
    if (currentTrack && currentTrack.track_url && audioRef.current) {
      setError(null);
      setIsLoading(true);
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current.src = currentTrack.track_url;
      audioRef.current.loop = isLooping;
      audioRef.current.load();
      audioRef.current.onloadedmetadata = () => {
        const newDuration = audioRef.current!.duration;
        setDuration(newDuration);

        // Initialize MediaSession position state
        if (isMediaSessionSupported) {
          navigator.mediaSession.setPositionState({
            duration: newDuration,
            playbackRate: 1.0,
            position: 0,
          });
        }
      };
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          animationRef.current = requestAnimationFrame(syncTime);
          if (isMediaSessionSupported) {
            navigator.mediaSession.playbackState = "playing";
            navigator.mediaSession.metadata = new MediaMetadata({
              title: currentTrack.title,
              artist: currentTrack.artist,
              artwork: [
                {
                  src:
                    currentTrack.cover || "/placeholder.svg?height=96&width=96",
                  sizes: "96x96",
                  type: "image/png",
                },
                {
                  src:
                    currentTrack.cover ||
                    "/placeholder.svg?height=192&width=192",
                  sizes: "192x192",
                  type: "image/png",
                },
              ],
            });
          }
        })
        .catch((error) => {
          console.error("Error playing track:", error);
          setError("Failed to play track");
          setIsLoading(false);
          setIsPlaying(false);
          if (isMediaSessionSupported) {
            navigator.mediaSession.playbackState = "paused";
          }
        });
    } else if (!currentTrack) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      if (isMediaSessionSupported) {
        navigator.mediaSession.playbackState = "none";
        navigator.mediaSession.metadata = null;
      }
    }
  }, [currentTrack, isLooping]);

  // Check if track is liked
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
        if (!user) {
          console.warn("No user authenticated, skipping like check");
          setLiked(false);
          return;
        }
        const { data, error } = await supabase
          .from("liked_songs")
          .select("id")
          .eq("user_id", user.id)
          .eq("track_id", Number(currentTrack.id))
          .maybeSingle();
        if (error) {
          console.error("Error checking liked status:", error);
          setError("Failed to check like status");
          setLiked(false);
          return;
        }
        setLiked(!!data);
      } catch (err: any) {
        console.error("Unexpected error checking liked status:", err.message);
        setError("Unexpected error checking like status");
        setLiked(false);
      }
    };
    checkIfLiked();
  }, [currentTrack]);

  useEffect(() => {
    if (isPlaying && duration > 0) {
      // Update MediaSession position every second
      mediaSessionUpdateRef.current = window.setInterval(() => {
        updateMediaSessionPosition();
      }, 1000);
    } else {
      if (mediaSessionUpdateRef.current) {
        clearInterval(mediaSessionUpdateRef.current);
        mediaSessionUpdateRef.current = null;
      }
    }

    return () => {
      if (mediaSessionUpdateRef.current) {
        clearInterval(mediaSessionUpdateRef.current);
        mediaSessionUpdateRef.current = null;
      }
    };
  }, [isPlaying, duration]);

  // Media Session action handlers
  useEffect(() => {
    if (isMediaSessionSupported) {
      navigator.mediaSession.setActionHandler("play", () => {
        console.log("Media Session: Play triggered");
        togglePlay();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        console.log("Media Session: Pause triggered");
        togglePlay();
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        console.log("Media Session: Next triggered");
        skipForward();
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        console.log("Media Session: Previous triggered");
        skipBackward();
      });
      navigator.mediaSession.setActionHandler("seekforward", () => {
        console.log("Media Session: Seek forward triggered");
        skipForwardSeconds();
      });
      navigator.mediaSession.setActionHandler("seekbackward", () => {
        console.log("Media Session: Seek backward triggered");
        skipBackwardSeconds();
      });
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        console.log("Media Session: Seek to triggered", details.seekTime);
        if (audioRef.current && details.seekTime !== undefined) {
          const newTime = Math.max(0, Math.min(details.seekTime, duration));
          audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
          navigator.mediaSession.setPositionState({
            duration: duration,
            playbackRate: audioRef.current.playbackRate,
            position: newTime,
          });
        }
      });

      return () => {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("seekforward", null);
        navigator.mediaSession.setActionHandler("seekbackward", null);
        navigator.mediaSession.setActionHandler("seekto", null);
      };
    }
  }, [currentTrack, isPlaying, queue, currentTrackIndex]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const updateMediaSessionPosition = () => {
    if (isMediaSessionSupported && audioRef.current && duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: duration,
          playbackRate: audioRef.current.playbackRate,
          position: audioRef.current.currentTime,
        });
      } catch (error) {
        console.warn("Failed to update MediaSession position:", error);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTrackEnded = () => {
    console.log("Track ended:", {
      currentTrack: currentTrack?.title,
      currentTrackIndex,
      queueLength: queue.length,
      isLooping,
    });

    if (isLooping) {
      // Loop is handled by audioRef.current.loop, no action needed
      return;
    }

    // If not looping and there’s a next track, skip to it
    if (queue.length > 0 && currentTrackIndex < queue.length - 1) {
      console.log(
        "Skipping to next track:",
        queue[currentTrackIndex + 1].title
      );
      setCurrentTrack(queue[currentTrackIndex + 1]);
      setCurrentTrackIndex(currentTrackIndex + 1);
      setCurrentTime(0);
      setIsPlaying(true);
      if (isMediaSessionSupported) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: queue[currentTrackIndex + 1].title,
          artist: queue[currentTrackIndex + 1].artist,
          artwork: [
            {
              src:
                queue[currentTrackIndex + 1].cover ||
                "/placeholder.svg?height=96&width=96",
              sizes: "96x96",
              type: "image/png",
            },
            {
              src:
                queue[currentTrackIndex + 1].cover ||
                "/placeholder.svg?height=192&width=192",
              sizes: "192x192",
              type: "image/png",
            },
          ],
        });
        navigator.mediaSession.playbackState = "playing";
      }
    } else {
      // No next track, stop playback
      console.log("No next track, stopping playback");
      setIsPlaying(false);
      setCurrentTrack(null);
      setCurrentTrackIndex(-1);
      setCurrentTime(0);
      setPlaylistName(null);
      setError("No more tracks in queue");
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (isMediaSessionSupported) {
        navigator.mediaSession.playbackState = "paused";
        navigator.mediaSession.metadata = null;
      }
    }
  };

  const handleAudioError = (event: Event) => {
    const audio = event.target as HTMLAudioElement;
    console.error("Audio error:", {
      code: audio.error?.code,
      message: audio.error?.message,
      src: audio.src,
    });
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

  const playTrack = async (
    track: Track,
    newQueue: Track[] = [],
    index: number = 0,
    playlistName: string = ""
  ) => {
    console.log("playTrack called:", {
      track: track.title,
      track_id: track.id,
      queueLength: newQueue.length || queue.length || 1,
      index,
      playlistName,
      newQueue: newQueue.map((t) => t.title),
      existingQueue: queue.map((t) => t.title),
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn("No authenticated user found:", authError?.message);
      setError("Please log in to play tracks");
    } else {
      const trackId = Number(track.id);
      if (isNaN(trackId)) {
        console.error("Invalid track_id:", track.id);
        setError("Invalid track ID");
        return;
      }

      console.log("Inserting into recently_played:", {
        user_id: user.id,
        track_id: trackId,
        played_at: new Date().toISOString(),
      });
      const { error: insertError } = await supabase
        .from("recently_played")
        .insert({
          user_id: user.id,
          track_id: trackId,
          played_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Failed to log play to recently_played:", insertError);
        setError("Failed to log play");
      } else {
        console.log(
          `Successfully logged play for track ${track.title} (ID: ${trackId}) by user ${user.id}`
        );
      }
    }

    setPlaylistName(playlistName || null);
    const updatedQueue =
      newQueue.length > 0 ? newQueue : queue.length > 0 ? queue : [track];
    setQueue(updatedQueue);
    setCurrentTrack(track);
    setCurrentTrackIndex(
      newQueue.length > 0 ? index : updatedQueue.indexOf(track)
    );
  };

  const togglePlay = () => {
    console.log("togglePlay called:", {
      isPlaying,
      currentTrack: currentTrack?.title,
    });
    if (!currentTrack || !currentTrack.track_url || !audioRef.current) {
      console.warn("No track selected or track URL missing");
      setError("No track selected");
      return;
    }
    if (isPlaying) {
      try {
        audioRef.current.pause();
        setIsPlaying(false);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (isMediaSessionSupported) {
          navigator.mediaSession.playbackState = "paused";
        }
      } catch (error) {
        console.error("Error pausing track:", error);
        setError("Failed to pause track");
      }
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setError(null);
          animationRef.current = requestAnimationFrame(syncTime);
          if (isMediaSessionSupported) {
            navigator.mediaSession.playbackState = "playing";
          }
        })
        .catch((error) => {
          console.error("Error playing track:", error);
          setError("Failed to play track");
          if (isMediaSessionSupported) {
            navigator.mediaSession.playbackState = "paused";
          }
        });
    }
  };

  const toggleLoop = () => {
    const now = Date.now();
    // Debounce: Ignore if called within 300ms of the last toggle
    if (now - lastToggleLoopTime.current < 300) {
      console.log("toggleLoop debounced: too soon since last toggle");
      return;
    }
    lastToggleLoopTime.current = now;

    console.log("Toggling loop:", !isLooping);
    setIsLooping((prev) => {
      const newLoopState = !prev;
      if (audioRef.current) {
        audioRef.current.loop = newLoopState;
        console.log("Audio loop property set to:", newLoopState);
      } else {
        console.warn("Audio element not ready when toggling loop");
      }
      return newLoopState;
    });
  };

  const skipForward = () => {
    console.log("skipForward:", {
      currentTrackIndex,
      queueLength: queue.length,
    });
    if (queue.length === 0) {
      console.log("No queue, cannot skip forward");
      setError("No tracks in queue");
      return;
    }
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex < queue.length) {
      console.log("Skipping to next track:", queue[nextIndex].title);
      setCurrentTrack(queue[nextIndex]);
      setCurrentTrackIndex(nextIndex);
      if (isMediaSessionSupported) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: queue[nextIndex].title,
          artist: queue[nextIndex].artist,
          artwork: [
            {
              src:
                queue[nextIndex].cover || "/placeholder.svg?height=96&width=96",
              sizes: "96x96",
              type: "image/png",
            },
            {
              src:
                queue[nextIndex].cover ||
                "/placeholder.svg?height=192&width=192",
              sizes: "192x192",
              type: "image/png",
            },
          ],
        });
        navigator.mediaSession.playbackState = "playing";
      }
    } else {
      console.log("No next track, stopping playback");
      setCurrentTrack(null);
      setCurrentTrackIndex(-1);
      setIsPlaying(false);
      setPlaylistName(null);
      setError("No more tracks");
      if (isMediaSessionSupported) {
        navigator.mediaSession.playbackState = "none";
        navigator.mediaSession.metadata = null;
      }
    }
  };

  const skipBackward = () => {
    console.log("skipBackward:", {
      currentTrackIndex,
      queueLength: queue.length,
    });
    if (queue.length === 0) {
      console.log("No queue, cannot skip backward");
      setError("No tracks in queue");
      return;
    }
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex >= 0) {
      console.log("Skipping to previous track:", queue[prevIndex].title);
      setCurrentTrack(queue[prevIndex]);
      setCurrentTrackIndex(prevIndex);
      if (isMediaSessionSupported) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: queue[prevIndex].title,
          artist: queue[prevIndex].artist,
          artwork: [
            {
              src:
                queue[prevIndex].cover || "/placeholder.svg?height=96&width=96",
              sizes: "96x96",
              type: "image/png",
            },
            {
              src:
                queue[prevIndex].cover ||
                "/placeholder.svg?height=192&width=192",
              sizes: "192x192",
              type: "image/png",
            },
          ],
        });
        navigator.mediaSession.playbackState = "playing";
      }
    } else {
      console.log("No previous track, staying at first track");
      setCurrentTrack(queue[0]);
      setCurrentTrackIndex(0);
      if (isMediaSessionSupported) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: queue[0].title,
          artist: queue[0].artist,
          artwork: [
            {
              src: queue[0].cover || "/placeholder.svg?height=96&width=96",
              sizes: "96x96",
              type: "image/png",
            },
            {
              src: queue[0].cover || "/placeholder.svg?height=192&width=192",
              sizes: "192x192",
              type: "image/png",
            },
          ],
        });
        navigator.mediaSession.playbackState = "playing";
      }
    }
  };

  const skipForwardSeconds = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 10,
        duration
      );
      const newTime = audioRef.current.currentTime;
      setCurrentTime(newTime);
      if (isMediaSessionSupported) {
        navigator.mediaSession.setPositionState({
          duration: duration,
          playbackRate: audioRef.current.playbackRate,
          position: newTime,
        });
      }
    }
  };

  const skipBackwardSeconds = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime - 10,
        0
      );
      const newTime = audioRef.current.currentTime;
      setCurrentTime(newTime);
      if (isMediaSessionSupported) {
        navigator.mediaSession.setPositionState({
          duration: duration,
          playbackRate: audioRef.current.playbackRate,
          position: newTime,
        });
      }
    }
  };

  const syncTime = () => {
    if (audioRef.current && !isDragging.current && isPlaying) {
      const now = performance.now();
      const actualTime = audioRef.current.currentTime;
      // Check for a significant discrepancy (e.g., >1 second) that might indicate an external seek
      if (Math.abs(actualTime - currentTime) > 1) {
        console.log(
          "Detected external seek, updating currentTime:",
          actualTime
        );
        setCurrentTime(actualTime);
      }
      if (now - lastUpdateTime.current >= 1000) {
        setCurrentTime(actualTime);
        lastUpdateTime.current = now;
        if (isMediaSessionSupported) {
          navigator.mediaSession.setPositionState({
            duration: duration,
            playbackRate: audioRef.current.playbackRate,
            position: actualTime,
          });
        }
      }
      animationRef.current = requestAnimationFrame(syncTime);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleSetCurrentTime = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      const newTime = audioRef.current.currentTime;
      setCurrentTime(newTime);
      if (isMediaSessionSupported) {
        navigator.mediaSession.setPositionState({
          duration: duration,
          playbackRate: audioRef.current.playbackRate,
          position: newTime,
        });
      }
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
      if (!user) {
        setError("User not authenticated");
        return;
      }

      const { data: playlist, error: selectPlaylistError } = await supabase
        .from("playlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("title", "Liked Songs")
        .maybeSingle();

      if (selectPlaylistError) {
        console.error(
          "Error checking Liked Songs playlist:",
          selectPlaylistError
        );
        setError("Failed to access playlist");
        return;
      }

      let playlistId: string;
      if (!playlist) {
        const { data, error: insertError } = await supabase
          .from("playlists")
          .insert({
            user_id: user.id,
            title: "Liked Songs",
            cover_url: "/liked.jpg",
            created_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("Error creating Liked Songs playlist:", insertError);
          setError("Failed to create playlist");
          return;
        }
        playlistId = data.id;
      } else {
        playlistId = playlist.id;
      }

      const trackId = Number(currentTrack.id);
      if (isNaN(trackId)) {
        console.error("Invalid track_id:", currentTrack.id);
        setError("Invalid track ID");
        return;
      }

      const { data: existingLike, error: selectError } = await supabase
        .from("liked_songs")
        .select("id")
        .eq("user_id", user.id)
        .eq("track_id", trackId)
        .maybeSingle();

      if (selectError) {
        console.error("Select error:", selectError);
        setError("Failed to check like status");
        return;
      }

      if (existingLike) {
        const { error } = await supabase
          .from("liked_songs")
          .delete()
          .eq("id", existingLike.id);
        if (error) {
          console.error("Unlike error:", error.message);
          setError("Failed to unlike track");
          return;
        }

        const { error: deletePlaylistError } = await supabase
          .from("playlist_tracks")
          .delete()
          .eq("playlist_id", playlistId)
          .eq("track_id", trackId);

        if (deletePlaylistError) {
          console.error(
            "Error removing song from playlist:",
            deletePlaylistError
          );
          setError("Failed to update playlist");
          return;
        }

        setLiked(false);
      } else {
        const { error } = await supabase
          .from("liked_songs")
          .insert({ user_id: user.id, track_id: trackId });
        if (error) {
          console.error("Like error:", error.message);
          setError("Failed to like track");
          return;
        }

        const { data: existingPlaylistTrack } = await supabase
          .from("playlist_tracks")
          .select("id")
          .eq("playlist_id", playlistId)
          .eq("track_id", trackId)
          .maybeSingle();

        if (!existingPlaylistTrack) {
          const { error: insertPlaylistError } = await supabase
            .from("playlist_tracks")
            .insert({
              playlist_id: playlistId,
              track_id: trackId,
              added_at: new Date().toISOString(),
            });

          if (insertPlaylistError) {
            console.error(
              "Error adding song to playlist:",
              insertPlaylistError
            );
            setError("Failed to update playlist");
            return;
          }
        }

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
        queue,
        currentTrackIndex,
        playlistName,
        isLooping,
        playTrack,
        togglePlay,
        skipForward,
        skipBackward,
        skipForwardSeconds,
        skipBackwardSeconds,
        setCurrentTime: handleSetCurrentTime,
        setVolume,
        toggleLike,
        toggleLoop,
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
