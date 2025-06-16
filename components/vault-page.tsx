"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigationBar } from "@/components/navigation-bar";
import MusicPlayer from "@/components/music-player";
import { supabase } from "@/lib/supabaseClient";
import { usePlayer } from "../app/context/PlayerContext";
import { AddToPlaylistModal } from "@/components/add-to-playlist-modal";

interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  track_url: string;
  popularity: number;
  duration: string;
  plays: string;
  change: string;
}

export default function VaultPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] =
    useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const { playTrack } = usePlayer();
  const searchParams = useSearchParams();
  const highlightedSongRef = useRef<HTMLDivElement | null>(null);
  const highlightedSong = searchParams.get("song");

  // Fetch user ID and songs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch user ID
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) throw new Error(`Auth error: ${authError.message}`);
        if (user) setUserId(user.id);

        // Fetch all songs from phonk_songs in alphabetical order
        const { data: songsData, error: songsError } = await supabase
          .from("phonk_songs")
          .select(
            "id, song_name, song_artist, album_cover_url, track_url, song_duration, song_popularity"
          )
          .order("song_name", { ascending: true });

        if (songsError) {
          throw new Error(`Songs fetch error: ${songsError.message}`);
        }

        setSongs(
          songsData?.map((song) => ({
            id: song.id,
            title: song.song_name,
            artist: song.song_artist,
            cover:
              song.album_cover_url || "/placeholder.svg?height=80&width=80",
            track_url: song.track_url,
            popularity: song.song_popularity || 0,
            duration: song.song_duration?.toString() || "0",
            plays: "0", // Mocked
            change: "0", // Mocked
          })) || []
        );
      } catch (error: any) {
        console.error("Error fetching data:", error.message || error);
        setErrorMessage("Failed to load songs. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Scroll to the highlighted song and center it
  useEffect(() => {
    if (highlightedSong && highlightedSongRef.current) {
      highlightedSongRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [highlightedSong, songs]);

  // Handle track added to playlist (optional, for consistency with HomePage)
  const handleTrackAdded = async () => {
    // No action needed unless you want to refresh data or show a notification
    console.log("Track added to playlist");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <NavigationBar />
      <div className="flex-1 container mx-auto px-4 py-8 pb-24">
        <style jsx>{`
          .highlighted {
            position: relative;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            animation: float 3s ease-in-out infinite;
            z-index: 10;
            overflow: hidden;
          }

          .highlighted::after {
            content: "";
            position: absolute;
            top: -50%;
            left: -100%;
            width: 50%;
            height: 200%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.3),
              transparent
            );
            transform: rotate(30deg);
            animation: shine 1.5s linear forwards;
            pointer-events: none;
          }

          @keyframes shine {
            0% {
              transform: rotate(30deg) translateX(-100%);
              opacity: 1;
            }
            80% {
              transform: rotate(30deg) translateX(300%);
              opacity: 1;
            }
            100% {
              transform: rotate(30deg) translateX(400%);
              opacity: 0;
            }
          }

          @keyframes float {
            0% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-8px);
            }
            100% {
              transform: translateY(0);
            }
          }

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
        <h1 className="text-3xl font-bold mb-6">The Vault</h1>
        <p className="text-gray-400 mb-6">
          Discover the complete collection of raw, atmospheric, and hard-hitting
          phonk tracks. Dive deep into <b>The Vault</b> to explore our
          ever-growing database of underground anthems, classic phonk beats, and
          new releases from your favorite artists.
        </p>
        {isLoading ? (
          <div className="text-center text-gray-400">Loading songs...</div>
        ) : songs.length === 0 ? (
          <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 p-8 text-center">
            <h3 className="text-xl font-bold mb-2">No songs found</h3>
            <p className="text-gray-400">
              Add songs to the vault to see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {songs.map((track) => (
              <div
                key={track.id}
                ref={
                  track.title === highlightedSong ? highlightedSongRef : null
                }
                className={`group cursor-pointer ${
                  track.title === highlightedSong ? "highlighted" : ""
                }`}
                onClick={() => playTrack(track)} // Add this line
              >
                <div className="bg-[#0f0f0f] rounded-xl overflow-hidden transition-transform group-hover:translate-y-[-5px]">
                  <div className="relative aspect-square">
                    <Image
                      src={track.cover}
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
                      <h3 className="font-medium truncate">{track.title}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#ff6700] hover:text-[#cc5300]"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent onClick
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
            ))}
          </div>
        )}
      </div>
      <MusicPlayer />
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
