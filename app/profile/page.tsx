import Image from "next/image";
import Link from "next/link";
import {
  Settings,
  Music,
  Clock,
  Heart,
  AirplayIcon as PlaylistAdd,
  Edit,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationBar } from "@/components/navigation-bar";
import { MusicPlayer } from "@/components/music-player";

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

// Mock data for recently played
const recentlyPlayed = [
  {
    id: 1,
    title: "Midnight Drift",
    artist: "SHADXWBXRN",
    playedAt: "2 hours ago",
    cover: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    title: "Tokyo Phonk",
    artist: "Dvrst",
    playedAt: "Yesterday",
    cover: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    title: "Murder In My Mind",
    artist: "Kordhell",
    playedAt: "Yesterday",
    cover: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 4,
    title: "Close Eyes",
    artist: "DVRST",
    playedAt: "2 days ago",
    cover: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 5,
    title: "Sahara",
    artist: "Hensonn",
    playedAt: "3 days ago",
    cover: "/placeholder.svg?height=80&width=80",
  },
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navigation Bar Component would be here */}
      <NavigationBar />

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="relative mb-10">
          <div className="h-48 rounded-xl overflow-hidden">
            <Image
              src="/profilewallpaper.jpg"
              alt="Profile cover"
              width={1200}
              height={300}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute -bottom-16 left-8 flex items-end">
            <Avatar className="h-32 w-32 border-4 border-black">
              <AvatarImage src="/profilepic.jpg" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="ml-4 mb-4">
              <h1 className="text-3xl font-bold">John Doe</h1>
              <p className="text-gray-400">
                @johndoe • 42 Playlists • 128 Followers
              </p>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              size="sm"
              className="bg-[#ff6700] text-white hover:bg-[#cc5200]"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <Button
              size="sm"
              className="bg-[#ff6700] text-white hover:bg-[#cc5200]"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button
              size="sm"
              className="bg-[#ff6700] text-white hover:bg-[#cc5200]"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-20">
          <Tabs defaultValue="playlists" className="mb-10">
            <TabsList className="bg-gray-900 border border-gray-800">
              <TabsTrigger
                value="playlists"
                className="data-[state=active]:bg-[#ff6700] text-white"
              >
                <Music className="mr-2 h-4 w-4" />
                Playlists
              </TabsTrigger>
              <TabsTrigger
                value="recent"
                className="data-[state=active]:bg-[#ff6700] text-white"
              >
                <Clock className="mr-2 h-4 w-4" />
                Recently Played
              </TabsTrigger>
              <TabsTrigger
                value="liked"
                className="data-[state=active]:bg-[#ff6700] text-white"
              >
                <Heart className="mr-2 h-4 w-4" />
                Liked Tracks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="playlists" className="mt-6">
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
                            <Music className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium truncate">
                          {playlist.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {playlist.tracks} tracks
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="mt-6">
              <h2 className="text-2xl font-bold mb-6">Recently Played</h2>

              <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 overflow-hidden">
                <ScrollArea className="h-[400px]">
                  {recentlyPlayed.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center p-4 hover:bg-gray-800/30 cursor-pointer transition-colors"
                    >
                      <div className="relative group mr-4">
                        <Image
                          src={track.cover || "/placeholder.svg"}
                          alt={track.title}
                          width={48}
                          height={48}
                          className="rounded"
                        />
                        <div className="absolute inset-0 bg-black/60 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Music className="h-5 w-5 text-white" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="font-medium">{track.title}</div>
                        <div className="text-sm text-gray-400">
                          {track.artist}
                        </div>
                      </div>

                      <div className="text-sm text-gray-400">
                        {track.playedAt}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="liked" className="mt-6">
              <h2 className="text-2xl font-bold mb-6">Liked Tracks</h2>

              <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 p-8 text-center">
                <Heart className="h-16 w-16 text-[#ff6700] mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No liked tracks yet</h3>
                <p className="text-gray-400 mb-6">
                  Start liking tracks to see them here
                </p>
                <Link href="/home">
                  <Button className="bg-[#ff6700] hover:bg-[#cc5300]">
                    Discover Music
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Music Player Component would be here */}
      <MusicPlayer />
    </div>
  );
}
