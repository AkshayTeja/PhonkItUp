"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  Search,
  Home,
  User,
  TrendingUp,
  Heart,
  AirplayIcon as PlaylistAdd,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigationBar } from "@/components/navigation-bar";
import { supabase } from "@/lib/supabaseClient";
import { usePlayer } from "../context/PlayerContext";
import MusicPlayer from "@/components/music-player";
import { PlaylistModal } from "@/components/playlist-modal";
import { AddToPlaylistModal } from "@/components/add-to-playlist-modal";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";

interface Playlist {
  id: string;
  title: string;
  tracks: number;
  cover: string;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  track_url: string;
  popularity?: number;
  duration: string;
  plays: string;
  change?: string;
  playedAt?: string;
}

interface PhonkSong {
  id: string;
  song_name: string;
  song_artist: string;
  album_cover_url: string | null;
  track_url: string;
  song_popularity: number | null;
  song_duration: number | null;
}

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongsPlaylistId, setLikedSongsPlaylistId] = useState<
    string | null
  >(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] =
    useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { playTrack, toggleLike } = usePlayer();
  const router = useRouter();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPlaylists = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Fetch recently played track IDs for the user
        const { data: recentTracks, error: recentError } = await supabase
          .from("recently_played")
          .select("track_id")
          .eq("user_id", user.id)
          .order("played_at", { ascending: false });
        if (recentError)
          throw new Error(`Recent tracks fetch error: ${recentError.message}`);

        const recentTrackIds =
          recentTracks?.map((track) => track.track_id) || [];

        // Fetch playlists with tracks in recently_played
        const { data: playlistData, error: playlistError } = await supabase
          .from("playlists")
          .select(
            `
          id,
          title,
          cover_url,
          playlist_tracks (
            track_id
          )
        `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (playlistError)
          throw new Error(`Playlists fetch error: ${playlistError.message}`);

        // Filter playlists with recently played tracks and limit to 5
        const filteredPlaylists = await Promise.all(
          (playlistData || [])
            .filter((playlist) =>
              playlist.playlist_tracks.some((track: { track_id: string }) =>
                recentTrackIds.includes(track.track_id)
              )
            )
            .slice(0, 5) // Limit to 5 playlists
            .map(async (playlist) => {
              const { count, error: countError } = await supabase
                .from("playlist_tracks")
                .select("id", { count: "exact", head: true })
                .eq("playlist_id", playlist.id);
              if (countError)
                throw new Error(`Track count error: ${countError.message}`);
              return {
                id: playlist.id,
                title: playlist.title,
                tracks: count || 0,
                cover:
                  playlist.cover_url ||
                  (playlist.title === "Liked Songs"
                    ? "/liked.jpg"
                    : "/placeholder.svg?height=120&width=120"),
              };
            })
        );

        setPlaylists(filteredPlaylists);

        const likedPlaylist = playlistData?.find(
          (p) => p.title === "Liked Songs"
        );
        setLikedSongsPlaylistId(likedPlaylist?.id || null);
        console.log(
          "Fetched Liked Songs Playlist ID:",
          likedPlaylist?.id || "Not found",
          "Cover:",
          likedPlaylist?.cover_url || "None"
        );
      }
    } catch (error: any) {
      console.error("Error fetching playlists:", error.message || error);
      setErrorMessage("Failed to fetch playlists. Please try again.");
    }
  };

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw new Error(`Auth error: ${authError.message}`);
      if (!user) throw new Error("No user found");

      await fetchPlaylists();

      // Fetch liked songs
      const { data: liked, error: likedError } = await supabase
        .from("liked_songs")
        .select(
          `
    track_id,
    phonk_songs (
      id,
      song_name,
      song_artist,
      album_cover_url,
      track_url,
      song_popularity,
      song_duration
    )
  `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .returns<
          {
            track_id: string;
            phonk_songs: PhonkSong;
          }[]
        >();
      if (likedError)
        throw new Error(`Liked songs fetch error: ${likedError.message}`);
      setLikedSongs(
        liked?.map((item) => ({
          id: item.phonk_songs.id.toString(),
          title: item.phonk_songs.song_name || "Unknown Title",
          artist: item.phonk_songs.song_artist || "Unknown Artist",
          duration: item.phonk_songs.song_duration?.toString() || "0",
          plays: "0",
          cover:
            item.phonk_songs.album_cover_url ||
            "/placeholder.svg?height=80&width=80",
          change: "0",
          popularity: item.phonk_songs.song_popularity || 0,
          track_url: item.phonk_songs.track_url || "",
        })) || []
      );

      // Fetch recently played songs
      const { data: recent, error: recentError } = await supabase
        .from("recently_played")
        .select(
          `
    track_id,
    played_at,
    phonk_songs (
      id,
      song_name,
      song_artist,
      album_cover_url,
      track_url,
      song_popularity,
      song_duration
    )
  `
        )
        .eq("user_id", user.id)
        .order("played_at", { ascending: false })
        .limit(5)
        .returns<
          {
            track_id: string;
            played_at: string;
            phonk_songs: PhonkSong;
          }[]
        >();
      if (recentError)
        throw new Error(`Recently played fetch error: ${recentError.message}`);
      setRecentlyPlayed(
        recent?.map((item) => ({
          id: item.phonk_songs.id.toString(),
          title: item.phonk_songs.song_name || "Unknown Title",
          artist: item.phonk_songs.song_artist || "Unknown Artist",
          duration: item.phonk_songs.song_duration?.toString() || "0", // Use song_duration
          plays: "0",
          cover:
            item.phonk_songs.album_cover_url ||
            "/placeholder.svg?height=80&width=80",
          change: "0",
          popularity: item.phonk_songs.song_popularity || 0,
          track_url: item.phonk_songs.track_url || "",
          playedAt: formatDistanceToNow(new Date(item.played_at), {
            addSuffix: true,
          }),
        })) || []
      );
    } catch (error: any) {
      console.error("Error fetching user data:", error.message || error);
      setErrorMessage("Failed to load user data. Please try again.");
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError)
          throw new Error(`Session error: ${sessionError.message}`);

        if (session?.user) {
          const displayName =
            session.user.user_metadata?.display_name ||
            `user_${session.user.id.slice(0, 8)}`;
          setUsername(displayName);
          setUserId(session.user.id);

          const hasShownGreeting = sessionStorage.getItem("hasShownGreeting");
          if (!hasShownGreeting) {
            setShowGreeting(true);
          }
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" && session?.user) {
            const displayName =
              session.user.user_metadata?.display_name ||
              `user_${session.user.id.slice(0, 8)}`;
            setUsername(displayName);
            setUserId(session.user.id);
            sessionStorage.removeItem("hasShownGreeting");
            setShowGreeting(true);
          } else if (event === "SIGNED_OUT") {
            setUserId(null);
          }
        });

        return () => {
          subscription?.unsubscribe();
        };
      } catch (error: any) {
        console.error("Error checking session:", error.message || error);
        setErrorMessage("Failed to check user session. Please try again.");
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (showGreeting) {
      sessionStorage.setItem("hasShownGreeting", "true");
      setShowGreeting(false);
    }
  }, [showGreeting]);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      const playlistSubscription = supabase
        .channel("playlist_tracks_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "playlist_tracks",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetchPlaylists();
          }
        )
        .subscribe();

      const likedSubscription = supabase
        .channel("liked_songs_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "liked_songs",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetchUserData();
            console.log("Liked songs changed, refreshing data");
          }
        )
        .subscribe();

      return () => {
        playlistSubscription.unsubscribe();
        likedSubscription.unsubscribe();
      };
    }
  }, [userId]);

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    try {
      const { data: playlist } = await supabase
        .from("playlists")
        .select("title")
        .eq("id", playlistId)
        .single();
      if (playlist?.title === "Liked Songs") {
        setErrorMessage("Cannot delete Liked Songs playlist");
        return;
      }

      // Open confirmation dialog instead of deleting immediately
      setPlaylistToDelete(playlistId);
      setIsDeleteConfirmOpen(true);
    } catch (error: any) {
      console.error("Error checking playlist:", error.message);
      setErrorMessage(error.message || "Failed to check playlist");
    }
  };

  const confirmDeletePlaylist = async () => {
    if (!playlistToDelete) return;

    try {
      const { error } = await supabase
        .from("playlists")
        .delete()
        .eq("id", playlistToDelete);
      if (error) throw new Error(`Delete playlist error: ${error.message}`);
      await fetchPlaylists();
      setIsDeleteConfirmOpen(false);
      setPlaylistToDelete(null);
    } catch (error: any) {
      console.error("Error deleting playlist:", error.message);
      setErrorMessage(error.message || "Failed to delete playlist");
    }
  };

  const handleTrackAdded = async (playlistId: string) => {
    await fetchPlaylists();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <NavigationBar />
      <div className="flex-1 container mx-auto px-4 py-8">
        <style jsx>{`
          .play-overlay {
            background: linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.3),
              rgba(255, 103, 0, 0.2)
            );
            transition: opacity 0.3s ease-in-out, background 0.3s ease-in-out;
          }

          .play-button {
            background: rgba(255, 103, 0, 0.9) !important;
            border: 2px solid rgba(255, 255, 255, 0.3);
            transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
          }

          .group:hover .play-button {
            transform: scale(1.1);
          }
        `}</style>

        {errorMessage && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-md mb-4">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/20 border border-green-500 text-green-500 p-4 rounded-md mb-4 flex items-center justify-between">
            <span>{successMessage}</span>
            <Button
              variant="ghost"
              size="icon"
              className="text-green-500 hover:text-green-400"
              onClick={() => setSuccessMessage(null)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        )}

        {showGreeting && username && (
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#ff6700]">
              Welcome {username}
            </h1>
          </div>
        )}

        <div className="relative rounded-xl overflow-hidden mb-10">
          <Image
            src="/placeholder.jpg"
            alt="Featured playlist"
            width={1200}
            height={400}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center">
            <div className="p-8">
              <div className="text-sm font-medium text-[#ff6700] mb-2">
                Featured Phonkit
              </div>
              <h1 className="text-4xl font-bold mb-4">Phonk Essentials</h1>
              <p className="text-gray-300 mb-6 max-w-md">
                The ultimate collection of the most iconic phonk tracks that
                defined the genre.
              </p>
              <Button className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-6 py-3 text-base transition-transform duration-300 transform group hover:scale-105">
                <span className="relative z-10 flex items-center">
                  <Play className="mr-2 h-4 w-4" /> Play All
                </span>
                <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Phonkits</h2>
            <div className="flex gap-4">
              <Button
                onClick={() => setIsPlaylistModalOpen(true)}
                className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-4 py-2 text-sm transition-transform duration-300 transform group hover:scale-105 inline-flex items-center rounded-md"
              >
                <PlaylistAdd className="mr-2 h-4 w-4" />
                Create a Phonkit
                <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
              </Button>
              <Button
                onClick={() => handleNavigation("/profile")}
                className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-4 py-2 text-sm transition-transform duration-300 transform group hover:scale-105 inline-flex items-center rounded-md"
              >
                View All
                <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {playlists.length === 0 ? (
              <div className="col-span-full text-center text-gray-400">
                No playlists yet. Create one to get started!
              </div>
            ) : (
              playlists.map((playlist) => (
                <div key={playlist.id} className="group relative">
                  <Link
                    href={`/playlist/${playlist.id}`}
                    className="block"
                    onClick={() => handleNavigation(`/playlist/${playlist.id}`)}
                  >
                    <div className="bg-[#0f0f0f] rounded-xl overflow-hidden transition-transform group-hover:translate-y-[-5px]">
                      <div className="relative aspect-square">
                        <Image
                          src={playlist.cover}
                          alt={playlist.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 play-overlay opacity-0 group-hover:opacity-100 flex items-center justify-center">
                          <Button className="play-button h-12 w-12 rounded-full p-0">
                            <Play className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-medium truncate">
                            {playlist.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {playlist.tracks} tracks
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-400"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeletePlaylist(playlist.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Favorites</h2>
            {(likedSongs.length > 0 || likedSongsPlaylistId) && (
              <Button
                onClick={() =>
                  handleNavigation(`/playlist/${likedSongsPlaylistId || ""}`)
                }
                className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-4 py-2 text-sm transition-transform duration-300 transform group hover:scale-105 inline-flex items-center rounded-md"
                disabled={!likedSongsPlaylistId}
              >
                View All
                <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
              </Button>
            )}
          </div>
          {likedSongs.length === 0 ? (
            <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 p-8 text-center">
              <Heart className="h-16 w-16 text-[#ff6700] mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No favorite tracks yet</h3>
              <p className="text-gray-400 mb-6">
                Start liking tracks to see them here
              </p>
              <Link
                href="/trending"
                onClick={() => handleNavigation("/trending")}
              >
                <Button className="relative overflow-hidden w-full bg-[#ff6700] hover:bg-[#cc5300] text-white hover:text-white border-none px-6 py-3 text-base transition-transform duration-300 transform group hover:scale-105 flex items-center justify-center space-x-3">
                  Discover Music
                  <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {likedSongs.map((track) => (
                <div key={track.id} className="group relative">
                  <div
                    className="cursor-pointer"
                    onClick={() => playTrack(track)}
                  >
                    <div className="bg-[#0f0f0f] rounded-xl overflow-hidden transition-transform group-hover:translate-y-[-5px]">
                      <div className="relative aspect-square">
                        <Image
                          src={track.cover || "/placeholder.svg"}
                          alt={track.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 play-overlay opacity-0 group-hover:opacity-100 flex items-center justify-center">
                          <Button className="play-button h-12 w-12 rounded-full p-0">
                            <Play className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">
                            {track.title}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#ff6700] hover:text-[#cc5300]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTrackId(track.id);
                              setIsAddToPlaylistModalOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-400 truncate">
                          {track.artist}
                        </p>
                        <p className="text-sm text-gray-400">
                          {Math.floor(parseInt(track.duration) / 60)}:
                          {(parseInt(track.duration) % 60)
                            .toString()
                            .padStart(2, "0")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-6">Recently Played</h2>
          {recentlyPlayed.length === 0 ? (
            <div className="bg-[#0f0f0f] rounded-xl border border-gray-600 p-8 text-center">
              <h3 className="text-xl font-bold mb-2">
                No recently played tracks yet
              </h3>
              <p className="text-gray-400 mb-6">
                Play some tracks to see them here
              </p>
              <Link
                href="/trending"
                onClick={() => handleNavigation("/trending")}
              >
                <Button className="relative overflow-hidden w-full bg-[#ff6700] hover:bg-[#cc5300] text-white hover:text-white border-none px-6 py-3 text-base transition-transform duration-300 transform group hover:scale-105 flex items-center justify-center space-x-3">
                  Discover Music
                  <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {recentlyPlayed.map((track) => (
                <div key={track.id} className="group relative">
                  <div
                    className="cursor-pointer"
                    onClick={() => playTrack(track)}
                  >
                    <div className="bg-[#0f0f0f] rounded-xl overflow-hidden transition-transform group-hover:translate-y-[-5px]">
                      <div className="relative aspect-square">
                        <Image
                          src={track.cover || "/placeholder.svg"}
                          alt={track.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 play-overlay opacity-0 group-hover:opacity-100 flex items-center justify-center">
                          <Button className="play-button h-12 w-12 rounded-full p-0">
                            <Play className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">
                            {track.title}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#ff6700] hover:text-[#cc5300]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTrackId(track.id);
                              setIsAddToPlaylistModalOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-400 truncate">
                          {track.artist}
                        </p>
                        <p className="text-sm text-gray-400">
                          {Math.floor(parseInt(track.duration) / 60)}:
                          {(parseInt(track.duration) % 60)
                            .toString()
                            .padStart(2, "0")}
                        </p>
                        <p className="text-sm text-gray-400">
                          {track.playedAt}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden bg-[#0f0f0f] border-t border-gray-800 fixed bottom-16 left-0 right-0 z-40">
        <div className="flex items-center justify-around py-3">
          <Link
            href="/home"
            className="flex flex-col items-center text-white"
            onClick={() => handleNavigation("/home")}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            href="/trending"
            className="flex flex-col items-center text-gray-400"
            onClick={() => handleNavigation("/trending")}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs mt-1">Trending</span>
          </Link>
          <Link
            href="/search"
            className="flex flex-col items-center text-gray-400"
            onClick={() => handleNavigation("/search")}
          >
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">Search</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center text-gray-400"
            onClick={() => handleNavigation("/profile")}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>

      <MusicPlayer />
      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        onPlaylistCreated={async () => {
          await fetchPlaylists();
          setSuccessMessage(
            "Your Phonkit has been created, add songs to view it"
          );
        }}
        userId={userId}
      />
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent
          className="sm:max-w-[425px] bg-[#0f0f0f] text-white border-gray-800"
          aria-describedby="delete-playlist-description"
        >
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p id="delete-playlist-description" className="text-gray-400">
              Are you sure you want to delete this playlist? This action cannot
              be undone.
            </p>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setPlaylistToDelete(null);
              }}
              className="w-auto px-4 text-[#ff6700] hover:bg-[#ff6700] hover:text-white text-sm py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeletePlaylist}
              className="relative overflow-hidden w-auto px-4 bg-red-500 hover:bg-red-600 text-white border-none py-2 text-sm transition-transform duration-300 transform group hover:scale-105 flex items-center justify-center space-x-2"
            >
              Delete
              <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <AddToPlaylistModal
        isOpen={isAddToPlaylistModalOpen}
        onClose={() => {
          setIsAddToPlaylistModalOpen(false);
          setSelectedTrackId(null);
        }}
        onTrackAdded={handleTrackAdded}
        trackId={selectedTrackId || ""}
        userId={userId}
      />
    </div>
  );
}
