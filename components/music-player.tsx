"use client";

import Image from "next/image";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Heart,
  FastForward,
  Repeat,
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
  id: "",
  title: "No Track Selected",
  artist: "Unknown Artist",
  duration: "0:00",
  plays: "0",
  cover: "/placeholder.svg?height=40&width=40",
  change: "",
  popularity: 0,
  track_url: "",
};

export default function MusicPlayer() {
  const {
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
    togglePlay,
    skipForward,
    skipBackward,
    skipForwardSeconds,
    skipBackwardSeconds,
    setCurrentTime,
    setVolume,
    toggleLike,
    toggleLoop,
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

  const hasNextTrack = queue.length > 0 && currentTrackIndex < queue.length - 1;
  const hasPreviousTrack = queue.length > 0 && currentTrackIndex > 0;

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
          <div className="flex items-center h-18">
            {/* Track Info */}
            <div className="flex items-center flex-1 min-w-0">
              <Image
                src={track.cover || defaultTrack.cover}
                alt={track.title}
                width={40}
                height={40}
                className="rounded-sm mr-3 hidden sm:block object-cover"
                onError={(e) => {
                  e.currentTarget.src = defaultTrack.cover;
                }}
              />
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <div className="truncate flex-1 flex items-center gap-1">
                  <div className="truncate">
                    <span className="text-sm text-white font-medium truncate block">
                      {track.title}
                    </span>
                    <span className="text-xs text-gray-400 truncate block">
                      {track.artist}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleLike}
                    className="p-0 hover:bg-transparent flex-shrink-0"
                    disabled={isLoading || !currentTrack}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        liked
                          ? "text-[#ff6700] fill-[#ff6700]"
                          : "text-gray-400 hover:text-white"
                      }`}
                    />
                  </Button>
                  {(playlistName || isLoading) && (
                    <span className="text-xs text-gray-400 truncate max-w-[80px]">
                      {isLoading ? "Loading..." : playlistName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {error && (
                    <span className="text-red-600 text-xs">{error}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center m-2 mb-1 gap-2">
                {/* Loop Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLoop}
                  className={`h-8 w-8 rounded-full p-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isLooping
                      ? "bg-[#ff6700] hover:bg-[#cc5200]"
                      : "hover:bg-[#ff6700]"
                  }`}
                  disabled={!currentTrack || isLoading}
                  title={isLooping ? "Loop: On" : "Loop: Off"}
                >
                  <Repeat
                    className={`h-4 w-4 ${
                      isLooping ? "text-white" : "text-gray-300"
                    }`}
                  />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipBackward}
                  className="bg-[#ff6700] hover:bg-[#cc5200] h-8 w-8 rounded-full p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!hasPreviousTrack || isLoading}
                >
                  <SkipBack className="h-4 w-4 text-white" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipBackwardSeconds}
                  className="bg-[#ff6700] hover:bg-[#cc5200] h-8 w-8 rounded-full p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!currentTrack || isLoading}
                >
                  <FastForward className="h-4 w-4 text-white transform rotate-180" />
                </Button>

                <Button
                  onClick={togglePlay}
                  disabled={
                    !currentTrack || !currentTrack.track_url || isLoading
                  }
                  className="bg-[#ff6700] hover:bg-[#cc5200] h-8 w-8 rounded-full p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-5 w-5 text-white" />
                  ) : (
                    <Play className="h-5 w-5 text-white" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipForwardSeconds}
                  className="bg-[#ff6700] hover:bg-[#cc5200] h-8 w-8 rounded-full p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!currentTrack || isLoading}
                >
                  <FastForward className="h-4 w-4 text-white" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipForward}
                  className="bg-[#ff6700] hover:bg-[#cc5200] h-8 w-8 rounded-full p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!hasNextTrack || isLoading}
                >
                  <SkipForward className="h-4 w-4 text-white" />
                </Button>
              </div>

              <div className="w-full hidden sm:flex items-center gap-2 mt-1 m-2 ">
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
