"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavigationBar } from "@/components/navigation-bar";
import MusicPlayer from "@/components/music-player";
import { PlaylistModal } from "@/components/playlist-modal";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlayer } from "../context/PlayerContext";

interface Playlist {
  id: string;
  title: string;
  tracks: number;
  cover: string;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  plays: string;
  cover: string;
  change: string;
  popularity: number;
  track_url: string;
  playedAt?: string;
}

interface PhonkSong {
  id: string;
  song_name: string;
  song_artist: string;
  album_cover_url: string | null;
  track_url: string;
  song_popularity: number | null;
  song_duration: number | null;
}

interface RecentlyPlayedResponse {
  track_id: string;
  played_at: string;
  phonk_songs: PhonkSong;
}

interface LikedSongsResponse {
  track_id: string;
  phonk_songs: PhonkSong;
}

interface ProfileData {
  name: string | null;
  profile_picture: string | null;
  wallpaper: string | null;
}

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [profilePic, setProfilePic] = useState<string>("/profilepic.jpg");
  const [wallpaper, setWallpaper] = useState<string>("/profilewallpaper.jpg");
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [wallpaperFile, setWallpaperFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] =
    useState<boolean>(false);
  const { playTrack } = usePlayer();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] =
    useState<boolean>(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<string | null>(null);
  const [playlistCount, setPlaylistCount] = useState<number>(0);
  const router = useRouter();

  const fetchPlaylists = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: playlistData, error: playlistError } = await supabase
          .from("playlists")
          .select("id, title, cover_url")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (playlistError) {
          console.error("Playlist fetch error:", playlistError);
          throw new Error(`Playlists fetch error: ${playlistError.message}`);
        }

        setPlaylistCount(playlistData?.length || 0);

        const playlistsWithCounts = await Promise.all(
          (playlistData || []).map(async (playlist) => {
            const { count, error: countError } = await supabase
              .from("playlist_tracks")
              .select("id", { count: "exact", head: true })
              .eq("playlist_id", playlist.id);
            if (countError) {
              console.error("Track count error:", countError);
              throw new Error(`Track count error: ${countError.message}`);
            }
            return {
              id: playlist.id,
              title: playlist.title,
              tracks: count || 0,
              cover:
                playlist.cover_url ||
                (playlist.title === "Liked Songs"
                  ? "/liked.jpg"
                  : "/placeholder.svg?height=120&width=120"),
            };
          })
        );

        setPlaylists(playlistsWithCounts);
      }
    } catch (error: any) {
      console.error("Error fetching playlists:", error.message || error);
      setErrorMessage("Failed to fetch playlists. Please try again.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) {
          console.error("Auth error:", authError);
          throw new Error(`Auth error: ${authError.message}`);
        }
        if (!user) {
          console.error("No user found in auth.getUser()");
          router.push("/login");
          throw new Error("No user found");
        }

        console.log("Authenticated user:", { id: user.id, email: user.email });

        setUserId(user.id);
        const fullName = user.user_metadata?.full_name || "New User";
        const displayName =
          user.user_metadata?.display_name || `user_${user.id.slice(0, 8)}`;
        setUsername(displayName);
        setName(fullName);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("name, profile_picture, wallpaper")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Profile fetch error:", profileError);
          throw new Error(`Profile fetch error: ${profileError.message}`);
        }

        if (profile) {
          console.log("Profile data:", profile);
          setName(
            fullName !== "New User" ? fullName : profile.name || fullName
          );
          setProfilePic(profile.profile_picture || "/profilepic.jpg");
          setWallpaper(profile.wallpaper || "/profilewallpaper.jpg");
        } else {
          console.log("No profile data found for user:", user.id);
        }

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
          .order("created_at", { ascending: false })
          .returns<LikedSongsResponse[]>();
        if (likedError) {
          console.error("Liked songs fetch error:", likedError);
          throw new Error(`Liked songs fetch error: ${likedError.message}`);
        }
        console.log("Liked songs data:", liked);
        setLikedSongs(
          liked?.map((item) => ({
            id: item.phonk_songs.id.toString(),
            title: item.phonk_songs.song_name || "Unknown Title",
            artist: item.phonk_songs.song_artist || "Unknown Artist",
            duration: item.phonk_songs.song_duration?.toString() || "0",
            plays: "0",
            cover:
              item.phonk_songs.album_cover_url ||
              "/placeholder.svg?height=80&width=80",
            change: "0",
            popularity: item.phonk_songs.song_popularity || 0,
            track_url: item.phonk_songs.track_url || "",
          })) || []
        );

        const { data: recent, error: recentError } = await supabase
          .from("recently_played")
          .select(
            `
            track_id,
            played_at,
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
          .order("played_at", { ascending: false })
          .limit(5)
          .returns<RecentlyPlayedResponse[]>();
        if (recentError) {
          console.error("Recently played fetch error:", recentError);
          throw new Error(
            `Recently played fetch error: ${recentError.message}`
          );
        }
        console.log("Recently played data:", recent);
        setRecentlyPlayed(
          recent?.map((item) => ({
            id: item.phonk_songs.id.toString(),
            title: item.phonk_songs.song_name || "Unknown Title",
            artist: item.phonk_songs.song_artist || "Unknown Artist",
            duration: item.phonk_songs.song_duration?.toString() || "0",
            plays: "0",
            cover:
              item.phonk_songs.album_cover_url ||
              "/placeholder.svg?height=80&width=80",
            change: "0",
            popularity: item.phonk_songs.song_popularity || 0,
            track_url: item.phonk_songs.track_url || "",
            playedAt: formatDistanceToNow(new Date(item.played_at), {
              addSuffix: true,
            }),
          })) || []
        );

        await fetchPlaylists();
      } catch (error: any) {
        console.error("Error fetching user data:", error.message || error);
        setErrorMessage("Failed to load user data. Please try again.");
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    if (userId) {
      const playlistSubscription = supabase
        .channel("playlist_tracks_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "playlist_tracks",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            console.log("Playlist tracks changed, refreshing playlists");
            fetchPlaylists();
          }
        )
        .subscribe();

      return () => {
        playlistSubscription.unsubscribe();
      };
    }
  }, [userId]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(`Logout error: ${error.message}`);
      router.push("/login");
    } catch (error: any) {
      console.error("Error logging out:", error.message || error);
      setErrorMessage("Failed to log out. Please try again.");
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    try {
      const { data: playlist } = await supabase
        .from("playlists")
        .select("title")
        .eq("id", playlistId)
        .single();
      if (playlist?.title === "Liked Songs") {
        setErrorMessage("Cannot delete Liked Songs playlist");
        return;
      }

      setPlaylistToDelete(playlistId);
      setIsDeleteConfirmOpen(true);
    } catch (error: any) {
      console.error("Error checking playlist:", error.message);
      setErrorMessage(error.message || "Failed to check playlist");
    }
  };

  const confirmDeletePlaylist = async () => {
    if (!playlistToDelete) return;

    try {
      const { error } = await supabase
        .from("playlists")
        .delete()
        .eq("id", playlistToDelete);
      if (error) throw new Error(`Delete playlist error: ${error.message}`);
      await fetchPlaylists();
      setIsDeleteConfirmOpen(false);
      setPlaylistToDelete(null);
    } catch (error: any) {
      console.error("Error deleting playlist:", error.message);
      setErrorMessage(error.message || "Failed to delete playlist");
    }
  };

  const handleProfileUpdate = async () => {
    try {
      if (!userId) throw new Error("No user ID found");

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

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <NavigationBar />
        <div className="flex-1 container mx-auto px-4 py-8">
          <style jsx>{`
            .play-overlay {
              background: linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.3),
                rgba(255, 103, 0, 0.2)
              );
              transition: opacity 0.3s ease-in-out, background 0.3s ease-in-out;
            }

            .play-button {
              background: rgba(255, 103, 0, 0.9) !important;
              border: 2px solid rgba(255, 255, 255, 0.3);
              transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
            }

            .group:hover .play-button {
              transform: scale(1.1);
            }
          `}</style>
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
                  @{username} • {playlistCount} Phonkits
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
                <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-200 ease-in-out" />
              </Button>
              <Link
                href="/login"
                onClick={handleLogout}
                className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-4 py-2 text-sm transition-transform duration-300 transform group hover:scale-105 inline-flex items-center rounded-md"
              >
                <span className="relative z-10 flex items-center">Logout</span>
                <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-200 ease-in-out" />
              </Link>
            </div>
          </div>

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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setName(e.target.value)
                    }
                    className="bg-gray-900 border-gray-800 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setUsername(e.target.value)
                    }
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                  <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-200 ease-in-out" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="mt-20 mb-20">
            <Tabs defaultValue="playlists" className="mb-10">
              <TabsList className="bg-gray-900 border border-gray-800">
                <TabsTrigger
                  value="playlists"
                  className="data-[state=active]:bg-[#ff6700] text-white"
                >
                  <Music className="mr-2 h-4 w-4" />
                  Phonkits
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
                  <h2 className="text-2xl font-bold">Your Phonkits</h2>
                  <Button
                    onClick={() => setIsPlaylistModalOpen(true)}
                    className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-4 py-2 text-sm transition-transform duration-300 transform group hover:scale-105 inline-flex items-center rounded-md"
                  >
                    <PlaylistAdd className="mr-2 h-4 w-4" />
                    Create a Phonkit
                    <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-200 ease-in-out" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {playlists.length === 0 ? (
                    <div className="col-span-full text-center text-gray-400">
                      No playlists yet. Create one to get started!
                    </div>
                  ) : (
                    playlists.map((playlist) => (
                      <div key={playlist.id} className="group relative">
                        <Link
                          href={`/playlist/${playlist.id}`}
                          className="block"
                          onClick={() =>
                            handleNavigation(`/playlist/${playlist.id}`)
                          }
                        >
                          <div className="bg-[#0f0f0f] rounded-xl overflow-hidden transition-transform group-hover:translate-y-[-5px]">
                            <div className="relative aspect-square">
                              <Image
                                src={playlist.cover}
                                alt={playlist.title}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 play-overlay opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                <Button className="play-button h-12 w-12 rounded-full p-0">
                                  <Play className="h-6 w-6" />
                                </Button>
                              </div>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                              <div>
                                <h3 className="font-medium truncate">
                                  {playlist.title}
                                </h3>
                                <p className="text-sm text-gray-400">
                                  {playlist.tracks} tracks
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-400"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeletePlaylist(playlist.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="recent" className="mt-6 mb-20">
                <h2 className="text-2xl font-bold mb-6">Recently Played</h2>
                {recentlyPlayed.length === 0 ? (
                  <div className="bg-[#0f0f0f] rounded-xl border border-gray-600 p-8 text-center">
                    <Clock className="h-16 w-16 text-[#ff6700] mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">
                      No recently played tracks yet
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Play some tracks to see them here
                    </p>
                    <Link
                      href="/home"
                      onClick={() => handleNavigation("/home")}
                    >
                      <Button className="bg-[#ff6700] hover:bg-[#cc5300]">
                        Discover Music
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {recentlyPlayed.map((track) => (
                      <div
                        key={track.id}
                        className="group cursor-pointer"
                        onClick={() => {
                          console.log("Playing track:", track);
                          playTrack(track);
                        }}
                      >
                        <div className="bg-[#0f0f0f] rounded-xl overflow-hidden transition-transform group-hover:translate-y-[-5px]">
                          <div className="relative aspect-square">
                            <Image
                              src={track.cover || "/placeholder.svg"}
                              alt={track.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 play-overlay opacity-0 group-hover:opacity-100 flex items-center justify-center">
                              <Button className="play-button h-12 w-12 rounded-full p-0">
                                <Play className="h-6 w-6" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium truncate">
                              {track.title}
                            </h3>
                            <p className="text-sm text-gray-400 truncate">
                              {track.artist}
                            </p>
                            <p className="text-sm text-gray-400">
                              {Math.floor(parseInt(track.duration) / 60)}:
                              {(parseInt(track.duration) % 60)
                                .toString()
                                .padStart(2, "0")}
                            </p>
                            <p className="text-sm text-gray-400">
                              {track.playedAt}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="liked" className="mt-6 mb-20">
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
                    <Link
                      href="/home"
                      onClick={() => handleNavigation("/home")}
                    >
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
                        onClick={() => {
                          console.log("Playing track:", track);
                          playTrack(track);
                        }}
                      >
                        <div className="bg-[#0f0f0f] rounded-xl overflow-hidden transition-transform group-hover:translate-y-[-5px]">
                          <div className="relative aspect-square">
                            <Image
                              src={track.cover || "/placeholder.svg"}
                              alt={track.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 play-overlay opacity-0 group-hover:opacity-100 flex items-center justify-center">
                              <Button className="play-button h-12 w-12 rounded-full p-0">
                                <Play className="h-6 w-6" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium truncate">
                              {track.title}
                            </h3>
                            <p className="text-sm text-gray-400 truncate">
                              {track.artist}
                            </p>
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
        <PlaylistModal
          isOpen={isPlaylistModalOpen}
          onClose={() => setIsPlaylistModalOpen(false)}
          onPlaylistCreated={() => {
            console.log("Playlist created, refreshing playlists");
            fetchPlaylists();
          }}
          userId={userId}
        />
      </div>
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#0f0f0f] text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-400">
              Are you sure you want to delete this playlist? This action cannot
              be undone.
            </p>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setPlaylistToDelete(null);
              }}
              className="w-auto px-4 text-[#ff6700] hover:bg-[#ff6700] hover:text-white text-sm py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeletePlaylist}
              className="relative overflow-hidden w-auto px-4 bg-red-500 hover:bg-red-600 text-white border-none py-2 text-sm transition-transform duration-300 transform group hover:scale-105 flex items-center justify-center space-x-2"
            >
              Delete
              <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-200 ease-in-out" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
