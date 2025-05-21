"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Home, TrendingUp, Search, User } from "lucide-react"
import Link from "next/link"

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(100)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Mock current track data
  const currentTrack = {
    title: "Midnight Drift",
    artist: "SHADXWBXRN",
    cover: "/placeholder.svg?height=80&width=80",
  }

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/placeholder.mp3")

    audioRef.current.addEventListener("timeupdate", () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime)
      }
    })

    audioRef.current.addEventListener("loadedmetadata", () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration)
      }
    })

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [])

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause()
    } else {
      audioRef.current?.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const handleTimeChange = (value: number[]) => {
    const newTime = value[0]
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden bg-[#0f0f0f] border-t border-gray-800 fixed bottom-16 left-0 right-0 z-40">
        <div className="flex items-center justify-around py-3">
          <Link href="/home" className="flex flex-col items-center text-white">
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/trending" className="flex flex-col items-center text-gray-400">
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs mt-1">Trending</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center text-gray-400">
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">Search</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-gray-400">
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
                src={currentTrack.cover || "/placeholder.svg"}
                alt={currentTrack.title}
                width={48}
                height={48}
                className="rounded mr-3 hidden sm:block"
              />
              <div>
                <div className="font-medium truncate">{currentTrack.title}</div>
                <div className="text-sm text-gray-400">{currentTrack.artist}</div>
              </div>
              <Button variant="ghost" size="icon" className="ml-2 text-gray-400 hover:text-white">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center mb-1">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button
                  onClick={togglePlay}
                  className="mx-2 bg-purple-600 hover:bg-purple-700 h-8 w-8 rounded-full p-0 flex items-center justify-center"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              <div className="w-full hidden sm:flex items-center gap-2">
                <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  className="flex-1"
                  onValueChange={handleTimeChange}
                />
                <span className="text-xs text-gray-400">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Volume */}
            <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
              <Volume2 className="h-5 w-5 text-gray-400" />
              <Slider defaultValue={[70]} max={100} step={1} className="w-24" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
