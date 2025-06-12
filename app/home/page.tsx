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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigationBar } from "@/components/navigation-bar";
import { supabase } from "@/lib/supabaseClient";
import { usePlayer } from "../context/PlayerContext";
import { MusicPlayer } from "@/components/music-player";
import { formatDistanceToNow } from "date-fns";

// Mock data for user's playlists
const userPlaylists = [
  {
    id: 1,
    title: "My Phonk Favorites",
    tracks: 24,
    cover: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 2,
    title: "Drift Phonk",
    tracks: 18,
    cover: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 3,
    title: "Workout Phonk",
    tracks: 15,
    cover: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 4,
    title: "Chill Phonk",
    tracks: 12,
    cover: "/placeholder.svg?height=120&width=120",
  },
];

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [showGreeting, setShowGreeting] = useState(false);
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { playTrack } = usePlayer();
  const router = useRouter();

  // Check for existing session and auth state changes
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
            sessionStorage.removeItem("hasShownGreeting");
            setShowGreeting(true);
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

  // Hide greeting after it's been shown once
  useEffect(() => {
    if (showGreeting) {
      sessionStorage.setItem("hasShownGreeting", "true");
      setShowGreeting(false);
    }
  }, [showGreeting]);

  // Fetch user data, liked songs, and recently played songs on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) throw new Error(`Auth error: ${authError.message}`);
        if (!user) throw new Error("No user found");

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
          .order("created_at", { ascending: false });
        if (likedError)
          throw new Error(`Liked songs fetch error: ${likedError.message}`);
        setLikedSongs(
          liked?.map((item) => ({
            id: item.phonk_songs.id,
            title: item.phonk_songs.song_name,
            artist: item.phonk_songs.song_artist,
            cover:
              item.phonk_songs.album_cover_url ||
              "/placeholder.svg?height=80&width=80",
            track_url: item.phonk_songs.track_url,
            popularity: item.phonk_songs.song_popularity || 0,
            duration: item.phonk_songs.song_duration?.toString() || "0",
            plays: "0",
            change: "0",
          })) || []
        );

        // Fetch recently played songs
        const { data: recent, error: recentError } = await supabase
          .from("recently_played")
          .select(
            `
            track_id,
            played_at,
            duration,
            phonk_songs (
              id,
              song_name,
              song_artist,
              album_cover_url,
              track_url
            )
          `
          )
          .eq("user_id", user.id)
          .order("played_at", { ascending: false })
          .limit(5); // Limit to 10 recent tracks
        if (recentError)
          throw new Error(
            `Recently played fetch error: ${recentError.message}`
          );
        setRecentlyPlayed(
          recent?.map((item) => ({
            id: item.phonk_songs.id,
            title: item.phonk_songs.song_name,
            artist: item.phonk_songs.song_artist,
            cover:
              item.phonk_songs.album_cover_url ||
              "/placeholder.svg?height=80&width=80",
            track_url: item.phonk_songs.track_url,
            playedAt: formatDistanceToNow(new Date(item.played_at), {
              addSuffix: true,
            }), // e.g., "2 hours ago"
            duration: item.duration,
          })) || []
        );
      } catch (error: any) {
        console.error("Error fetching user data:", error.message || error);
        setErrorMessage("Failed to load user data. Please try again.");
      }
    };
    fetchUserData();
  }, []);

  // Handle navigation with router.push as fallback
  const handleNavigation = (href: string) => {
    router.push(href);
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
                Featured Playlist
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
            <h2 className="text-2xl font-bold">Your Playlists</h2>
            <Button className="bg-[#ff6700] hover:bg-[#cc5300]">
              <PlaylistAdd className="mr-2 h-4 w-4" />
              Create Playlist
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {userPlaylists.map((playlist) => (
              <Link
                href={`/playlist/${playlist.id}`}
                key={playlist.id}
                className="group"
                onClick={() => handleNavigation(`/playlist/${playlist.id}`)}
              >
                <div className="bg-[#0f0f0f] rounded-xl overflow-hidden transition-transform group-hover:translate-y-[-5px]">
                  <div className="relative aspect-square">
                    <Image
                      src={playlist.cover || "/placeholder.svg"}
                      alt={playlist.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Button className="bg-[#ff6700] hover:bg-[#cc5300] h-12 w-12 rounded-full p-0">
                        <Play className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium truncate">{playlist.title}</h3>
                    <p className="text-sm text-gray-400">
                      {playlist.tracks} tracks
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Favorites</h2>
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
                <Button className="bg-[#ff6700] hover:bg-[#cc5300]">
                  Discover Music
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {likedSongs.map((track) => (
                <div
                  key={track.id}
                  className="group cursor-pointer"
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
                      <h3 className="font-medium truncate">{track.title}</h3>
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
              ))}
            </div>
          )}
        </div>

        <div className="mb-12">
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
                <Button className="bg-[#ff6700] hover:bg-[#cc5300]">
                  Discover Music
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {recentlyPlayed.map((track) => (
                <div
                  key={track.id}
                  className="group cursor-pointer"
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
                      <h3 className="font-medium truncate">{track.title}</h3>
                      <p className="text-sm text-gray-400 truncate">
                        {track.artist}
                      </p>
                      <p className="text-sm text-gray-400">
                        {Math.floor(track.duration / 60)}:
                        {(track.duration % 60).toString().padStart(2, "0")}
                      </p>
                      <p className="text-sm text-gray-400">{track.playedAt}</p>
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
    </div>
  );
}
