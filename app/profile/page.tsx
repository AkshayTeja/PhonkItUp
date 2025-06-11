"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Settings,
  Music,
  Clock,
  Heart,
  AirplayIcon as PlaylistAdd,
  Play,
  Edit,
  Share2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationBar } from "@/components/navigation-bar";
import { MusicPlayer } from "@/components/music-player";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlayer } from "../context/PlayerContext";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState("/profilepic.jpg");
  const [wallpaper, setWallpaper] = useState("/profilewallpaper.jpg");
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [wallpaperFile, setWallpaperFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  const { playTrack } = usePlayer();

  // Fetch user data and liked songs on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) throw new Error(`Auth error: ${authError.message}`);
        if (!user) throw new Error("No user found");

        setUserId(user.id);
        const displayName =
          user.user_metadata?.display_name ||
          user.email?.split("@")[0] ||
          "User";
        setUsername(displayName);

        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("name, profile_picture, wallpaper")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          throw new Error(`Profile fetch error: ${profileError.message}`);
        }

        if (profile) {
          setName(profile.name || "");
          setProfilePic(profile.profile_picture || "/profilepic.jpg");
          setWallpaper(profile.wallpaper || "/profilewallpaper.jpg");
        }

        // Fetch liked songs
        const { data: liked, error: likedError } = await supabase
          .from("liked_songs")
          .select(
            `
            track_id,
            phonk_songs (
              id,
              song_name,
              song_artist,
              album_cover_url,
              track_url,
              song_popularity,
              song_duration
            )
          `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (likedError)
          throw new Error(`Liked songs fetch error: ${likedError.message}`);
        setLikedSongs(
          liked?.map((item) => ({
            id: item.phonk_songs.id,
            title: item.phonk_songs.song_name,
            artist: item.phonk_songs.song_artist,
            cover:
              item.phonk_songs.album_cover_url ||
              "/placeholder.svg?height=80&width=80",
            track_url: item.phonk_songs.track_url,
            popularity: item.phonk_songs.song_popularity || 0,
            duration: item.phonk_songs.song_duration?.toString() || "0",
            plays: "0", // Mocked
            change: "0", // Mocked
          })) || []
        );
      } catch (error: any) {
        console.error("Error fetching user data:", error.message || error);
        setErrorMessage("Failed to load user data. Please try again.");
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(`Logout error: ${error.message}`);
    } catch (error: any) {
      console.error("Error logging out:", error.message || error);
      setErrorMessage("Failed to log out. Please try again.");
    }
  };

  const handleProfileUpdate = async () => {
    try {
      if (!userId) throw new Error("No user ID found");

      // Validate inputs
      if (!username.trim()) throw new Error("Username cannot be empty");
      if (profilePicFile && profilePicFile.size > 5 * 1024 * 1024) {
        throw new Error("Profile picture must be less than 5MB");
      }
      if (wallpaperFile && wallpaperFile.size > 10 * 1024 * 1024) {
        throw new Error("Wallpaper must be less than 10MB");
      }

      const updates: { [key: string]: any } = {
        name: name.trim() || null,
        updated_at: new Date().toISOString(),
      };

      // Update display name in auth
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw new Error(`Auth fetch error: ${authError.message}`);
      if (username !== user?.user_metadata?.display_name) {
        const { error } = await supabase.auth.updateUser({
          data: { display_name: username.trim() },
        });
        if (error) throw new Error(`Auth update error: ${error.message}`);
      }

      // Handle profile picture upload
      if (profilePicFile) {
        const fileExt = profilePicFile.name.split(".").pop()?.toLowerCase();
        if (!["jpg", "jpeg", "png", "gif"].includes(fileExt || "")) {
          throw new Error("Profile picture must be JPG, PNG, or GIF");
        }
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("profile-pics")
          .upload(fileName, profilePicFile, { upsert: true });
        if (uploadError)
          throw new Error(
            `Profile picture upload error: ${uploadError.message}`
          );

        const { data: publicUrlData } = supabase.storage
          .from("profile-pics")
          .getPublicUrl(fileName);
        if (!publicUrlData.publicUrl)
          throw new Error("Failed to get profile picture URL");
        updates.profile_picture = publicUrlData.publicUrl;
        setProfilePic(publicUrlData.publicUrl);
      }

      // Handle wallpaper upload
      if (wallpaperFile) {
        const fileExt = wallpaperFile.name.split(".").pop()?.toLowerCase();
        if (!["jpg", "jpeg", "png", "gif"].includes(fileExt || "")) {
          throw new Error("Wallpaper must be JPG, PNG, or GIF");
        }
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("wallpapers")
          .upload(fileName, wallpaperFile, { upsert: true });
        if (uploadError)
          throw new Error(`Wallpaper upload error: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from("wallpapers")
          .getPublicUrl(fileName);
        if (!publicUrlData.publicUrl)
          throw new Error("Failed to get wallpaper URL");
        updates.wallpaper = publicUrlData.publicUrl;
        setWallpaper(publicUrlData.publicUrl);
      }

      // Update profile in Supabase
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, ...updates }, { onConflict: "id" })
        .eq("id", userId);
      if (error) throw new Error(`Profile update error: ${error.message}`);

      setIsEditModalOpen(false);
      setProfilePicFile(null);
      setWallpaperFile(null);
      setErrorMessage(null);
    } catch (error: any) {
      const message =
        error.message ||
        "An unexpected error occurred while updating the profile";
      console.error("Error updating profile:", {
        message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      setErrorMessage(message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <NavigationBar />
      <div className="flex-1 container mx-auto px-4 py-8">
        {errorMessage && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-md mb-4">
            {errorMessage}
          </div>
        )}
        <div className="relative mb-10">
          <div className="h-48 rounded-xl overflow-hidden">
            <Image
              src={wallpaper}
              alt="Profile cover"
              width={1200}
              height={300}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-16 left-8 flex items-end">
            <Avatar className="h-32 w-32 border-4 border-black">
              <AvatarImage src={profilePic} alt="User" />
              <AvatarFallback>
                {username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 mb-4">
              <h1 className="text-3xl font-bold">{name || username}</h1>
              <p className="text-gray-400">
                @{username} • 42 Playlists • 128 Followers
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-4 py-2 text-sm transition-transform duration-300 transform group hover:scale-105"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
              <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
            </Button>
            <Button className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-4 py-2 text-sm transition-transform duration-300 transform group hover:scale-105">
              <Share2 className="mr-2 h-4 w-4" />
              Share
              <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
            </Button>
            <Button className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-4 py-2 text-sm transition-transform duration-300 transform group hover:scale-105">
              <Settings className="h-4 w-4" />
              <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
            </Button>
            <Link
              href="/login"
              onClick={handleLogout}
              className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-4 py-2 text-sm transition-transform duration-300 transform group hover:scale-105 inline-flex items-center rounded-md"
            >
              <span className="relative z-10 flex items-center">Logout</span>
              <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
            </Link>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-[#0f0f0f] text-white border-gray-800">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-900 border-gray-800 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-900 border-gray-800 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profilePic">Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <input
                    id="profilePic"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setProfilePicFile(e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                  <label
                    htmlFor="profilePic"
                    className="flex items-center gap-2 cursor-pointer text-[#ff6700]"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload</span>
                  </label>
                  <span className="text-sm text-gray-400">
                    {profilePicFile ? profilePicFile.name : "No file chosen"}
                  </span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="wallpaper">Wallpaper</Label>
                <div className="flex items-center gap-4">
                  <input
                    id="wallpaper"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setWallpaperFile(e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                  <label
                    htmlFor="wallpaper"
                    className="flex items-center gap-2 cursor-pointer text-[#ff6700]"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload</span>
                  </label>
                  <span className="text-sm text-gray-400">
                    {wallpaperFile ? wallpaperFile.name : "No file chosen"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setProfilePicFile(null);
                  setWallpaperFile(null);
                }}
                className="w-auto px-4 text-[#ff6700] hover:bg-[#ff6700] hover:text-white text-sm py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProfileUpdate}
                className="relative overflow-hidden w-auto px-4 bg-[#ff6700] hover:bg-[#cc5300] text-white border-none py-2 text-sm transition-transform duration-300 transform group hover:scale-105 flex items-center justify-center space-x-2"
              >
                Save Changes
                <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
              {likedSongs.length === 0 ? (
                <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 p-8 text-center">
                  <Heart className="h-16 w-16 text-[#ff6700] mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    No liked tracks yet
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Start liking tracks to see them here
                  </p>
                  <Link href="/home">
                    <Button className="bg-[#ff6700] hover:bg-[#cc5300]">
                      Discover Music
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {likedSongs.map((track) => (
                    <div
                      key={track.id}
                      className="group cursor-pointer"
                      onClick={() => playTrack(track)}
                    >
                      <div className="bg-[#0f0f0f] rounded-xl overflow-hidden transition-transform group-hover:translate-y-[-5px]">
                        <div className="relative aspect-square">
                          <Image
                            src={track.cover || "/placeholder.svg"}
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
                          <h3 className="font-medium truncate">
                            {track.title}
                          </h3>
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <MusicPlayer />
    </div>
  );
}
