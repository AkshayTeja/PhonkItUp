"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Pause, SkipForward, SkipBack, Volume2, Search, Home, User, TrendingUp, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock data for tracks
const popularTracks = [
  {
    id: 1,
    title: "Midnight Drift",
    artist: "SHADXWBXRN",
    duration: "2:45",
    plays: "1.2M",
    cover: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    title: "Tokyo Phonk",
    artist: "Dvrst",
    duration: "3:21",
    plays: "956K",
    cover: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    title: "Murder In My Mind",
    artist: "Kordhell",
    duration: "2:58",
    plays: "875K",
    cover: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 4,
    title: "Close Eyes",
    artist: "DVRST",
    duration: "2:37",
    plays: "750K",
    cover: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 5,
    title: "Sahara",
    artist: "Hensonn",
    duration: "3:05",
    plays: "680K",
    cover: "/placeholder.svg?height=80&width=80",
  },
]

const popularArtists = [
  { id: 1, name: "SHADXWBXRN", followers: "2.4M", image: "/placeholder.svg?height=120&width=120" },
  { id: 2, name: "Dvrst", followers: "1.8M", image: "/placeholder.svg?height=120&width=120" },
  { id: 3, name: "Kordhell", followers: "1.5M", image: "/placeholder.svg?height=120&width=120" },
  { id: 4, name: "Pharmacist", followers: "1.2M", image: "/placeholder.svg?height=120&width=120" },
  { id: 5, name: "Hensonn", followers: "980K", image: "/placeholder.svg?height=120&width=120" },
]

export default function HomePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(popularTracks[0])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

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

  const playTrack = (track: any) => {
    setCurrentTrack(track)
    setIsPlaying(true)
    if (audioRef.current) {
      audioRef.current.src = "/placeholder.mp3" // In a real app, this would be the track's audio file
      audioRef.current.play()
    }
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
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navigation */}
      <div className="bg-[#0f0f0f] border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Volume2 className="h-6 w-6 text-purple-500" />
              <span className="text-xl font-bold">PhonkItUp</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/home" className="flex items-center text-white">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
              <Link href="/trending" className="flex items-center text-gray-400 hover:text-white">
                <TrendingUp className="mr-2 h-4 w-4" />
                What&apos;s Hot?
              </Link>
              <Link href="/profile" className="flex items-center text-gray-400 hover:text-white">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </div>

            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search tracks, artists..." className="pl-8 bg-gray-900 border-gray-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative rounded-xl overflow-hidden mb-10">
          <Image
            src="/placeholder.svg?height=400&width=1200"
            alt="Featured playlist"
            width={1200}
            height={400}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center">
            <div className="p-8">
              <div className="text-sm font-medium text-purple-400 mb-2">Featured Playlist</div>
              <h1 className="text-4xl font-bold mb-4">Phonk Essentials</h1>
              <p className="text-gray-300 mb-6 max-w-md">
                The ultimate collection of the most iconic phonk tracks that defined the genre.
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Play className="mr-2 h-4 w-4" /> Play All
              </Button>
            </div>
          </div>
        </div>

        {/* Popular Tracks */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Popular Tracks</h2>
            <Link href="/tracks" className="text-sm text-purple-400 hover:text-purple-300">
              View All
            </Link>
          </div>

          <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 overflow-hidden">
            <div className="grid grid-cols-12 text-sm text-gray-400 p-4 border-b border-gray-800">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Title</div>
              <div className="col-span-3 hidden md:block">Artist</div>
              <div className="col-span-2 hidden md:block">Plays</div>
              <div className="col-span-1 text-right">Duration</div>
            </div>

            <ScrollArea className="h-[400px]">
              {popularTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="grid grid-cols-12 items-center p-4 hover:bg-gray-800/30 cursor-pointer transition-colors"
                  onClick={() => playTrack(track)}
                >
                  <div className="col-span-1 text-gray-400">{index + 1}</div>
                  <div className="col-span-5 flex items-center">
                    <Image
                      src={track.cover || "/placeholder.svg"}
                      alt={track.title}
                      width={40}
                      height={40}
                      className="rounded mr-3"
                    />
                    <div>
                      <div className="font-medium">{track.title}</div>
                      <div className="text-sm text-gray-400 md:hidden">{track.artist}</div>
                    </div>
                  </div>
                  <div className="col-span-3 hidden md:block text-gray-400">{track.artist}</div>
                  <div className="col-span-2 hidden md:block text-gray-400">{track.plays}</div>
                  <div className="col-span-1 text-right text-gray-400">{track.duration}</div>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>

        {/* Popular Artists */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Popular Artists</h2>
            <Link href="/artists" className="text-sm text-purple-400 hover:text-purple-300">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {popularArtists.map((artist) => (
              <Link href={`/artist/${artist.id}`} key={artist.id} className="group">
                <div className="bg-[#0f0f0f] rounded-xl p-4 text-center transition-transform group-hover:translate-y-[-5px]">
                  <div className="relative mx-auto w-24 h-24 mb-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={artist.image || "/placeholder.svg"} alt={artist.name} />
                      <AvatarFallback>{artist.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="font-medium">{artist.name}</h3>
                  <p className="text-sm text-gray-400">{artist.followers} followers</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

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
    </div>
  )
}
