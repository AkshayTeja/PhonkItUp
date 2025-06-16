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
              <div className="relative group w-[40px] h-[40px]">
                <Image
                  src={track.cover}
                  alt={track.title}
                  width={40}
                  height={40}
                  className="rounded mr-4 object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg?height=40&width=40";
                  }}
                />
                <div className="absolute inset-0 bg-black/60 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-5">
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
