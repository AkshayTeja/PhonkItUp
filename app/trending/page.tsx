"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, TrendingUp } from "lucide-react";
import { NavigationBar } from "@/components/navigation-bar";
import { usePlayer } from "../context/PlayerContext";
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

export default function TrendingPage() {
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      await fetchTopTracks();
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

  const formatPlays = (plays: number): string => {
    if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`;
    if (plays >= 1000) return `${(plays / 1000).toFixed(0)}K`;
    return `${plays}`;
  };

  const fetchTopTracks = async (): Promise<void> => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data, error } = await supabase.rpc("get_top_tracks_with_trend", {
      trend_period: oneDayAgo.toISOString(),
      limit_count: 10,
    });

    if (error) {
      console.error("Error fetching top tracks:", error.message);
      return;
    }

    if (data) {
      const formattedTracks: Track[] = data.map((track: any) => ({
        id: track.id,
        title: track.song_name,
        artist: track.song_artist,
        duration: formatDuration(track.song_duration),
        plays: formatPlays(track.total_plays || 0),
        cover: track.album_cover_url || "/placeholder.svg?height=80&width=80",
        change: `+${track.trend_plays || 0}`,
        popularity: track.total_plays || 0,
        track_url: track.track_url,
      }));

      setTopTracks(formattedTracks);
    }
  };

  const handleTrackPlay = (track: Track): void => {
    if (!track.track_url) {
      console.error("Track URL is missing for:", track.title);
      return;
    }

    console.log("Playing track:", track.title, "URL:", track.track_url);
    playTrack(track);
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
      <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 p-4 overflow-x-auto">
        <style jsx>{`
          .shine {
            position: relative;
            overflow: hidden;
            transition: transform 0.3s ease, background-color 0.3s ease;
          }
          .shine:hover {
            transform: scale(1.05);
          }
          .shine::after {
            content: "";
            position: absolute;
            top: 0;
            left: -75%;
            width: 50%;
            height: 100%;
            background: rgba(255, 255, 255, 0.2);
            transform: skewX(-20deg);
            transition: left 0.7s ease-in-out;
          }
          .shine:hover::after {
            left: 125%;
          }
        `}</style>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topTracks.map((track, index) => (
            <div
              key={track.id}
              className="bg-gray-900 rounded-lg p-4 hover:bg-[#cc5300] cursor-pointer flex items-center relative shine"
              onClick={() => handleTrackPlay(track)}
            >
              <div className="flex items-center w-full">
                <div className="relative group w-[60px] h-[60px] flex-shrink-0">
                  <Image
                    src={track.cover}
                    alt={track.title}
                    width={60}
                    height={60}
                    className="rounded object-cover"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg?height=60&width=60";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/60 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate text-white">
                      {track.title}
                    </div>
                    <div className="text-gray-200 text-sm">
                      Rank {index + 1}
                    </div>
                  </div>
                  <div className="text-sm text-gray-200 truncate">
                    {track.artist}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-200 mt-2">
                    <div className="flex items-center">
                      <span>{track.plays} plays</span>
                    </div>
                    <div className="flex items-center text-white">
                      {track.change} <TrendingUp className="h-3 w-3 ml-1" />
                    </div>
                    <div>{track.duration}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col mb-15">
      <NavigationBar />
      <div className="flex-1 container mx-auto px-4 py-8 pb-24">
        <div className="flex items-center mb-8">
          <TrendingUp className="h-8 w-8 text-[#ff6700] mr-3" />
          <h1 className="text-3xl font-bold">Top Tracks</h1>
        </div>
        {renderTopTracks()}
      </div>
    </div>
  );
}
