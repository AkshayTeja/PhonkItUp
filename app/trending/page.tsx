import Image from "next/image"
import Link from "next/link"
import { Play, TrendingUp, FlameIcon as Fire, BarChart3, Calendar } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NavigationBar } from "@/components/navigation-bar"
import { MusicPlayer } from "@/components/music-player"

// Mock data for trending tracks
const trendingTracks = [
  {
    id: 1,
    title: "Midnight Drift",
    artist: "SHADXWBXRN",
    duration: "2:45",
    plays: "1.2M",
    cover: "/placeholder.svg?height=80&width=80",
    change: "+12",
  },
  {
    id: 2,
    title: "Tokyo Phonk",
    artist: "Dvrst",
    duration: "3:21",
    plays: "956K",
    cover: "/placeholder.svg?height=80&width=80",
    change: "+5",
  },
  {
    id: 3,
    title: "Murder In My Mind",
    artist: "Kordhell",
    duration: "2:58",
    plays: "875K",
    cover: "/placeholder.svg?height=80&width=80",
    change: "+8",
  },
  {
    id: 4,
    title: "Close Eyes",
    artist: "DVRST",
    duration: "2:37",
    plays: "750K",
    cover: "/placeholder.svg?height=80&width=80",
    change: "+3",
  },
  {
    id: 5,
    title: "Sahara",
    artist: "Hensonn",
    duration: "3:05",
    plays: "680K",
    cover: "/placeholder.svg?height=80&width=80",
    change: "+15",
  },
  {
    id: 6,
    title: "Neon Blade",
    artist: "MoonDeity",
    duration: "2:51",
    plays: "620K",
    cover: "/placeholder.svg?height=80&width=80",
    change: "+7",
  },
  {
    id: 7,
    title: "Psycho Cruise",
    artist: "Phonk Killer",
    duration: "3:12",
    plays: "590K",
    cover: "/placeholder.svg?height=80&width=80",
    change: "+9",
  },
  {
    id: 8,
    title: "Drift Phonk",
    artist: "KSLV Noh",
    duration: "2:42",
    plays: "540K",
    cover: "/placeholder.svg?height=80&width=80",
    change: "+4",
  },
  {
    id: 9,
    title: "Gangsta Paradise",
    artist: "Phonk Version",
    duration: "3:25",
    plays: "510K",
    cover: "/placeholder.svg?height=80&width=80",
    change: "+6",
  },
  {
    id: 10,
    title: "RAVE",
    artist: "Dxrk ダーク",
    duration: "2:39",
    plays: "480K",
    cover: "/placeholder.svg?height=80&width=80",
    change: "+11",
  },
]

export default function TrendingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navigation Bar Component would be here */}
      <NavigationBar />

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
          <h1 className="text-3xl font-bold">What&apos;s Hot?</h1>
        </div>

        <Tabs defaultValue="trending" className="mb-10">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger value="trending" className="data-[state=active]:bg-purple-600">
              <Fire className="mr-2 h-4 w-4" />
              Trending Now
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-purple-600">
              <Calendar className="mr-2 h-4 w-4" />
              This Week
            </TabsTrigger>
            <TabsTrigger value="monthly" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="mr-2 h-4 w-4" />
              This Month
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="mt-6">
            <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 overflow-hidden">
              <div className="grid grid-cols-12 text-sm text-gray-400 p-4 border-b border-gray-800">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Title</div>
                <div className="col-span-2 hidden md:block">Artist</div>
                <div className="col-span-2 hidden md:block">Plays</div>
                <div className="col-span-1 text-center">Trend</div>
                <div className="col-span-1 text-right">Duration</div>
              </div>

              <ScrollArea className="h-[600px]">
                {trendingTracks.map((track, index) => (
                  <div
                    key={track.id}
                    className="grid grid-cols-12 items-center p-4 hover:bg-gray-800/30 cursor-pointer transition-colors"
                  >
                    <div className="col-span-1 text-gray-400">{index + 1}</div>
                    <div className="col-span-5 flex items-center">
                      <div className="relative group">
                        <Image
                          src={track.cover || "/placeholder.svg"}
                          alt={track.title}
                          width={40}
                          height={40}
                          className="rounded mr-3"
                        />
                        <div className="absolute inset-0 bg-black/60 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">{track.title}</div>
                        <div className="text-sm text-gray-400 md:hidden">{track.artist}</div>
                      </div>
                    </div>
                    <div className="col-span-2 hidden md:block text-gray-400">{track.artist}</div>
                    <div className="col-span-2 hidden md:block text-gray-400">{track.plays}</div>
                    <div className="col-span-1 text-center">
                      <span className="inline-flex items-center text-green-500">
                        {track.change}
                        <TrendingUp className="ml-1 h-3 w-3" />
                      </span>
                    </div>
                    <div className="col-span-1 text-right text-gray-400">{track.duration}</div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 p-8 text-center">
              <h3 className="text-xl font-bold mb-2">Weekly Charts</h3>
              <p className="text-gray-400">Check back to see the most popular tracks this week.</p>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 p-8 text-center">
              <h3 className="text-xl font-bold mb-2">Monthly Charts</h3>
              <p className="text-gray-400">Check back to see the most popular tracks this month.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Trending Artists */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Trending Artists</h2>
            <Link href="/artists" className="text-sm text-purple-400 hover:text-purple-300">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((id) => (
              <Link href={`/artist/${id}`} key={id} className="group">
                <div className="bg-[#0f0f0f] rounded-xl p-4 text-center transition-transform group-hover:translate-y-[-5px]">
                  <div className="relative mx-auto w-24 h-24 mb-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={`/placeholder.svg?height=120&width=120`} />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="font-medium">Artist Name</h3>
                  <p className="text-sm text-gray-400">1.2M followers</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Music Player Component would be here */}
      <MusicPlayer />
    </div>
  )
}
