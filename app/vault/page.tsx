"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigationBar } from "@/components/navigation-bar";
import { MusicPlayer } from "@/components/music-player";
import { supabase } from "@/lib/supabaseClient";
import { usePlayer } from "../context/PlayerContext";

export default function VaultPage() {
  const [songs, setSongs] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { playTrack } = usePlayer();

  // Fetch all songs from phonk_songs in alphabetical order
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setIsLoading(true);
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
        console.error("Error fetching songs:", error.message || error);
        setErrorMessage("Failed to load songs. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSongs();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <NavigationBar />
      <div className="flex-1 container mx-auto px-4 py-8">
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
                className="group cursor-pointer"
                onClick={() => playTrack(track)}
              >
                <div className="bg-[#0f0f0f] rounded-xl overflow-hidden transition-transform group-hover:translate-y-[-5px]">
                  <div className="relative aspect-square">
                    <Image
                      src={track.cover}
                      alt={track.title}
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
      <MusicPlayer />
    </div>
  );
}
