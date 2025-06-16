"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  Trash2,
  Heart,
  Home,
  Search,
  User,
  TrendingUp,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigationBar } from "@/components/navigation-bar";
import MusicPlayer from "../../../components/music-player";
import { supabase } from "@/lib/supabaseClient";
import { usePlayer } from "../../context/PlayerContext";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";

interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  track_url: string;
  duration: string;
  plays: string;
  change: string;
  popularity: number;
  playlist_track_id: string;
}

interface Playlist {
  id: string;
  title: string;
  cover_url: string | null;
  user_id: string | null;
  tracks: Track[];
}

export default function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { playTrack } = usePlayer();
  const router = useRouter();
  const resolvedParams = React.use(params);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) console.warn("Auth error:", authError.message);
        setCurrentUserId(user?.id || null);

        const { data: playlistData, error: playlistError } = await supabase
          .from("playlists")
          .select(
            `
            id,
            title,
            cover_url,
            user_id,
            playlist_tracks (
              id,
              track_id,
              phonk_songs (
                id,
                song_name,
                song_artist,
                album_cover_url,
                track_url,
                song_duration,
                song_popularity
              )
            )
          `
          )
          .eq("id", resolvedParams.id)
          .single();

        if (playlistError) {
          console.error("Playlist fetch error:", playlistError);
          throw new Error(`Playlist fetch error: ${playlistError.message}`);
        }
        if (!playlistData) {
          console.error("No playlist data returned");
          throw new Error("Playlist not found");
        }

        console.log("Playlist Data:", JSON.stringify(playlistData, null, 2));

        const tracks: Track[] = playlistData.playlist_tracks
          ? playlistData.playlist_tracks.map((pt: any) => ({
              id: pt.phonk_songs.id,
              title: pt.phonk_songs.song_name,
              artist: pt.phonk_songs.song_artist,
              cover:
                pt.phonk_songs.album_cover_url ||
                "/placeholder.svg?height=80&width=80",
              track_url: pt.phonk_songs.track_url,
              duration: pt.phonk_songs.song_duration?.toString() || "0",
              plays: "0",
              change: "0",
              popularity: pt.phonk_songs.song_popularity || 0,
              playlist_track_id: pt.id,
            }))
          : [];

        console.log("Fetched playlist:", {
          id: playlistData.id,
          title: playlistData.title,
          trackCount: tracks.length,
          tracks: tracks.map((t) => t.title),
        });

        setPlaylist({
          id: playlistData.id,
          title: playlistData.title,
          cover_url:
            playlistData.cover_url || "/placeholder.svg?height=300&width=300",
          user_id: playlistData.user_id,
          tracks,
        });
        setNewPlaylistName(playlistData.title);
      } catch (error: any) {
        console.error("Error fetching playlist:", error.message || error);
        setErrorMessage("Failed to load playlist. Please try again.");
      }
    };
    fetchPlaylist();
  }, [resolvedParams.id]);

  const handleDeleteTrack = async (playlistTrackId: string) => {
    try {
      const { error } = await supabase
        .from("playlist_tracks")
        .delete()
        .eq("id", playlistTrackId);
      if (error) throw new Error(`Delete track error: ${error.message}`);
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              tracks: prev.tracks.filter(
                (t) => t.playlist_track_id !== playlistTrackId
              ),
            }
          : null
      );
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to remove track from playlist");
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlist) return;
    try {
      const { data: playlistData } = await supabase
        .from("playlists")
        .select("title")
        .eq("id", playlist.id)
        .single();
      if (playlistData?.title === "Liked Songs") {
        setErrorMessage("Cannot delete the Liked Songs playlist");
        return;
      }

      setIsDeleteConfirmOpen(true);
    } catch (error: any) {
      console.error("Error checking playlist:", error.message);
      setErrorMessage(error.message || "Failed to check playlist");
    }
  };

  const confirmDeletePlaylist = async () => {
    if (!playlist) return;
    try {
      const { error } = await supabase
        .from("playlists")
        .delete()
        .eq("id", playlist.id);
      if (error) throw new Error(`Delete playlist error: ${error.message}`);
      setIsDeleteConfirmOpen(false);
      router.push("/profile"); // Redirect to profile page after deletion
    } catch (error: any) {
      console.error("Error deleting playlist:", error.message);
      setErrorMessage(error.message || "Failed to delete playlist");
    }
  };

  const handleRenamePlaylist = async () => {
    if (!playlist || !newPlaylistName.trim()) {
      setErrorMessage("Playlist name cannot be empty");
      return;
    }
    try {
      const { error } = await supabase
        .from("playlists")
        .update({ title: newPlaylistName.trim() })
        .eq("id", playlist.id);
      if (error) throw new Error(`Rename playlist error: ${error.message}`);
      setPlaylist((prev) =>
        prev ? { ...prev, title: newPlaylistName.trim() } : null
      );
      setIsRenameDialogOpen(false);
    } catch (error: any) {
      console.error("Error renaming playlist:", error.message);
      setErrorMessage(error.message || "Failed to rename playlist");
    }
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handlePlayTrack = (track: Track, index: number) => {
    console.log("Playing track:", {
      track: track.title,
      index,
      queueLength: playlist?.tracks.length,
    });
    if (playlist?.tracks.length) {
      playTrack(track, playlist.tracks, index, playlist.title);
    } else {
      console.warn("No tracks in playlist, playing single track");
      playTrack(track, [track], 0, playlist?.title || "");
    }
  };

  // Debounce handlePlayAll to prevent multiple clicks
  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handlePlayAll = useCallback(
    debounce(() => {
      if (playlist?.tracks.length) {
        console.log("Playing all tracks:", {
          queueLength: playlist.tracks.length,
          tracks: playlist.tracks.map((t) => t.title),
        });
        playTrack(playlist.tracks[0], playlist.tracks, 0, playlist.title);
      } else {
        console.warn("No tracks in playlist");
      }
    }, 300),
    [playlist?.tracks, playTrack]
  );

  if (!playlist && !errorMessage) {
    return <div className="text-white text-center">Loading...</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <NavigationBar />
        <div className="flex-1 container mx-auto px-4 py-8 mb-15">
          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-md mb-4">
              {errorMessage}
            </div>
          )}

          {playlist && (
            <>
              <div className="flex flex-col md:flex-row items-center gap-6 mb-10 pb-3 p-5">
                <Image
                  src={playlist.cover_url}
                  alt={playlist.title}
                  width={300}
                  height={300}
                  className="rounded-xl object-cover"
                />
                <div>
                  <h1 className="text-4xl font-bold mb-2">{playlist.title}</h1>
                  <p className="text-gray-400 mb-4">
                    {playlist.tracks.length} tracks
                  </p>
                  <div>
                    <div className="flex gap-4">
                      {playlist.user_id === currentUserId && (
                        <>
                          {playlist.title === "Liked Songs" ? (
                            <Button
                              className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-4 py-2 text-sm transition-transform duration-300 transform group hover:scale-105 inline-flex items-center rounded-md"
                              onClick={() => handleNavigation("/vault")}
                            >
                              <Heart className="mr-1 h-4 w-4" /> Add More
                              <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
                            </Button>
                          ) : (
                            <>
                              <Button
                                className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-4 py-2 text-sm transition-transform duration-300 transform group hover:scale-105 inline-flex items-center rounded-md"
                                onClick={() => setIsRenameDialogOpen(true)}
                              >
                                <Edit2 className="mr-1 h-4 w-4" /> Rename
                                <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
                              </Button>
                              <Button
                                className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-4 py-2 text-sm transition-transform duration-300 transform group hover:scale-105 inline-flex items-center rounded-md"
                                onClick={() => handleNavigation("/vault")}
                              >
                                <Heart className="mr-1 h-4 w-4" /> Add More
                                <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
                              </Button>
                              <Button
                                variant="destructive"
                                className="relative overflow-hidden bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm transition-transform duration-300 transform group hover:scale-105 inline-flex items-center rounded-md"
                                onClick={handleDeletePlaylist}
                              >
                                <Trash2 className="mr-1 h-4 w-4" /> Delete
                                Playlist
                                <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Tracks</h2>
                {playlist.tracks.length === 0 ? (
                  <div className="bg-[#0f0f0f] rounded-xl border border-gray-600 p-8 text-center">
                    <h3 className="text-xl font-bold mb-2">No tracks yet</h3>
                    <p className="text-gray-400 mb-6">
                      Add some tracks to this playlist
                    </p>
                    <Link
                      href="/vault"
                      onClick={() => handleNavigation("/vault")}
                    >
                      <Button className="bg-[#ff6700] hover:bg-[#cc5200]">
                        Find Tracks
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {playlist.tracks.map((track, index) => (
                      <div
                        key={track.playlist_track_id}
                        className="flex items-center gap-4 bg-[#0f0f0f] rounded-xl p-4 group"
                      >
                        <Image
                          src={track.cover}
                          alt={track.title}
                          width={60}
                          height={60}
                          className="rounded-md"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{track.title}</h3>
                          <p className="text-sm text-gray-400">
                            {track.artist}
                          </p>
                        </div>
                        <p className="text-sm text-gray-400">
                          {Math.floor(parseInt(track.duration || "0") / 60)}:
                          {(parseInt(track.duration || "0") % 60)
                            .toString()
                            .padStart(2, "0")}
                        </p>
                        {playlist.title !== "Liked Songs" &&
                          playlist.title !== "Phonk Essentials" &&
                          playlist.user_id === currentUserId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100"
                              onClick={() =>
                                handleDeleteTrack(track.playlist_track_id)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        <Button
                          className="bg-[#ff6700] hover:bg-[#cc5200] h-10 w-10 rounded-full p-0 opacity-0 group-hover:opacity-100"
                          onClick={() => handlePlayTrack(track, index)}
                        >
                          <Play className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <MusicPlayer />
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
              <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#0f0f0f] text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>Rename Playlist</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Enter new playlist name"
              className="bg-[#1a1a1a] text-white border-gray-600"
            />
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsRenameDialogOpen(false);
                setNewPlaylistName(playlist?.title || "");
              }}
              className="w-auto px-4 text-[#ff6700] hover:bg-[#ff6700] hover:text-white text-sm py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenamePlaylist}
              className="relative overflow-hidden w-auto px-4 bg-[#ff6700] hover:bg-[#cc5300] text-white border-none py-2 text-sm transition-transform duration-300 transform group hover:scale-105 flex items-center justify-center space-x-2"
            >
              Save
              <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
