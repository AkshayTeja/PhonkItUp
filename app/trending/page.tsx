"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavigationBar } from "@/components/navigation-bar";
import { usePlayer } from "../context/PlayerContext"; // Import player context
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
}

interface Artist {
  name: string;
  popularity: number;
  cover: string;
  followers: string;
}

export default function TrendingPage() {
  const [trendingArtists, setTrendingArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const { playTrack } = usePlayer(); // Use context to control player

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      await Promise.all([fetchTopTracks(), fetchTrendingArtists()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPlays = (popularity: number): string => {
    if (popularity > 90) return `${(popularity * 15).toFixed(1)}M`;
    if (popularity > 70) return `${(popularity * 12).toFixed(0)}K`;
    if (popularity > 50) return `${(popularity * 8).toFixed(0)}K`;
    return `${(popularity * 5).toFixed(0)}K`;
  };

  const fetchTopTracks = async (): Promise<void> => {
    const { data, error } = await supabase
      .from("phonk_songs")
      .select("*")
      .order("song_popularity", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching top tracks:", error.message);
      return;
    }

    if (data) {
      const formattedTracks: Track[] = data.map(
        (track: any, index: number) => ({
          id: track.id,
          title: track.song_name,
          artist: track.song_artist,
          duration: formatDuration(track.song_duration),
          plays: formatPlays(track.song_popularity),
          cover: track.album_cover_url || "/placeholder.svg?height=80&width=80",
          change: `+${Math.floor(Math.random() * 20) + 1}`,
          popularity: track.song_popularity,
          track_url: track.track_url,
        })
      );

      setTopTracks(formattedTracks);
    }
  };

  const fetchTrendingArtists = async (): Promise<void> => {
    const { data, error } = await supabase
      .from("phonk_songs")
      .select("song_artist, song_popularity, album_cover_url")
      .order("song_popularity", { ascending: false });

    if (error) {
      console.error("Error fetching trending artists:", error);
      return;
    }

    if (data) {
      const artistMap = new Map<string, Artist>();
      data.forEach((track: any) => {
        if (
          !artistMap.has(track.song_artist) ||
          artistMap.get(track.song_artist)!.popularity < track.song_popularity
        ) {
          artistMap.set(track.song_artist, {
            name: track.song_artist,
            popularity: track.song_popularity,
            cover:
              track.album_cover_url || "/placeholder.svg?height=120&width=120",
            followers: formatPlays(track.song_popularity * 10),
          });
        }
      });

      const artists: Artist[] = Array.from(artistMap.values()).slice(0, 5);
      setTrendingArtists(artists);
    }
  };

  const handleTrackPlay = (track: Track): void => {
    // Validate track_url before playing
    if (!track.track_url) {
      console.error("Track URL is missing for:", track.title);
      return;
    }

    console.log("Playing track:", track.title, "URL:", track.track_url);
    playTrack(track); // Use context to play track
  };

  const renderTopTracks = () => {
    if (loading) {
      return (
        <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6700] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tracks...</p>
        </div>
      );
    }

    if (!topTracks.length) {
      return (
        <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 p-8 text-center">
          <h3 className="text-xl font-bold mb-2">No Tracks Found</h3>
          <p className="text-gray-400">
            Add some phonk beats to your database to see them here.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 overflow-hidden">
        <div className="grid grid-cols-12 text-sm text-gray-400 p-4 border-b border-gray-800">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Title</div>
          <div className="col-span-2 hidden md:block">Artist</div>
          <div className="col-span-2 hidden md:block">Plays</div>
          <div className="col-span-1 text-center">Trend</div>
          <div className="col-span-1 text-right">Duration</div>
        </div>

        {topTracks.map((track, index) => (
          <div
            key={track.id}
            className="grid grid-cols-12 items-center p-4 hover:bg-gray-800/30 cursor-pointer transition-colors"
            onClick={() => handleTrackPlay(track)}
          >
            <div className="col-span-1 text-gray-400">{index + 1}</div>
            <div className="col-span-5 flex items-center">
              <div className="relative group">
                <Image
                  src={track.cover}
                  alt={track.title}
                  width={40}
                  height={40}
                  className="rounded mr-3"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg?height=40&width=40";
                  }}
                />
                <div className="absolute inset-0 bg-black/60 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <div className="font-medium">{track.title}</div>
                <div className="text-sm text-gray-400 md:hidden">
                  {track.artist}
                </div>
              </div>
            </div>
            <div className="col-span-2 hidden md:block text-gray-400">
              {track.artist}
            </div>
            <div className="col-span-2 hidden md:block text-gray-400">
              {track.plays}
            </div>
            <div className="col-span-1 text-center text-green-500">
              {track.change} <TrendingUp className="inline h-3 w-3 ml-1" />
            </div>
            <div className="col-span-1 text-right text-gray-400">
              {track.duration}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <NavigationBar />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <TrendingUp className="h-8 w-8 text-[#ff6700] mr-3" />
          <h1 className="text-3xl font-bold">Top Tracks</h1>
        </div>

        {renderTopTracks()}

        {/* Trending Artists */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Trending Artists</h2>
            <Link
              href="/artists"
              className="text-sm text-[#ff6700] hover:text-[#cc5300]"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((id) => (
                <div
                  key={id}
                  className="bg-[#0f0f0f] rounded-xl p-4 text-center animate-pulse"
                >
                  <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {trendingArtists.map((artist, index) => (
                <Link
                  href={`/artist/${encodeURIComponent(artist.name)}`}
                  key={index}
                  className="group"
                >
                  <div className="bg-[#0f0f0f] rounded-xl p-4 text-center transition-transform group-hover:translate-y-[-5px]">
                    <div className="relative mx-auto w-24 h-24 mb-4">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={artist.cover || "/placeholder.svg"} />
                        <AvatarFallback>
                          {artist.name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="font-medium">{artist.name}</h3>
                    <p className="text-sm text-gray-400">
                      {artist.followers} followers
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && trendingArtists.length === 0 && (
            <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 p-8 text-center">
              <h3 className="text-xl font-bold mb-2">No Artists Found</h3>
              <p className="text-gray-400">
                Add some phonk tracks with artist names to see trending artists.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
