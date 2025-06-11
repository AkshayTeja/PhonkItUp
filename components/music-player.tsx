"use client";

import Image from "next/image";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Home, TrendingUp, Search, User } from "lucide-react";
import Link from "next/link";
import { usePlayer } from "../app/context/PlayerContext";

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

const defaultTrack = {
  title: "No Track Selected",
  artist: "Unknown Artist",
  cover: "/placeholder.svg?height=80&width=80",
};

export function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    liked,
    isLoading,
    error,
    togglePlay,
    skipForward,
    skipBackward,
    setCurrentTime,
    setVolume,
    toggleLike,
  } = usePlayer();

  const track = currentTrack || defaultTrack;

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleTimeSliderChange = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden bg-[#0f0f0f] border-t border-gray-800 fixed bottom-16 left-0 right-0 z-40">
        <div className="flex items-center justify-around py-3">
          <Link href="/home" className="flex flex-col items-center text-white">
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            href="/trending"
            className="flex flex-col items-center text-gray-400"
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs mt-1">Trending</span>
          </Link>
          <Link
            href="/search"
            className="flex flex-col items-center text-gray-400"
          >
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">Search</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center text-gray-400"
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>

      {/* Player */}
      <div className="bg-[#0f0f0f] border-t border-gray-800 fixed bottom-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            {/* Track Info */}
            <div className="flex items-center flex-1">
              <Image
                src={track.cover || "/placeholder.svg"}
                alt={track.title}
                width={48}
                height={48}
                className="rounded mr-3 hidden sm:block"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg?height=48&width=48";
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 font-medium truncate">
                  <span className="text-white">
                    {track.title}
                    <div className="text-sm text-gray-400 truncate -mt-1 leading-snug">
                      {track.artist}
                    </div>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleLike}
                    className="p-0 transition-colors duration-300 hover:bg-transparent"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        liked
                          ? "text-[#ff6700]"
                          : "text-gray-400 hover:text-white"
                      }`}
                      fill={liked ? "#ff6700" : "none"}
                    />
                  </Button>
                  {isLoading && (
                    <span className="text-[#ff6700] text-sm">Loading...</span>
                  )}
                  {error && (
                    <span className="text-red-500 text-xs ml-2">{error}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center mb-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipBackward}
                  className="mx-2 bg-[#ff6700] hover:bg-[#cc5300] h-8 w-8 rounded-full p-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!currentTrack || isLoading}
                >
                  <SkipBack className="h-5 w-5 text-white" />
                </Button>
                <Button
                  onClick={togglePlay}
                  disabled={
                    !currentTrack || !currentTrack.track_url || isLoading
                  }
                  className="mx-2 bg-[#ff6700] hover:bg-[#cc5300] h-8 w-8 rounded-full p-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipForward}
                  className="mx-2 bg-[#ff6700] hover:bg-[#cc5300] h-8 w-8 rounded-full p-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!currentTrack || isLoading}
                >
                  <SkipForward className="h-5 w-5 text-white" />
                </Button>
              </div>

              <div className="w-full hidden sm:flex items-center gap-2">
                <span className="text-xs text-gray-400 min-w-[35px]">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  className="flex-1 [&>div]:bg-[#ff6700] [&>div>div]:bg-[#ff6700]"
                  onValueChange={handleTimeSliderChange}
                  disabled={!currentTrack || isLoading}
                />
                <span className="text-xs text-gray-400 min-w-[35px]">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Volume */}
            <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
              <Volume2 className="h-5 w-5 text-gray-400" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                className="w-24 [&>div]:bg-[#ff6700] [&>div>div]:bg-[#ff6700]"
                onValueChange={(value) => setVolume(value[0])}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
