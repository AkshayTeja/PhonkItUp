import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackAdded?: (playlistId: string, trackCount: number) => void;
  trackId: string;
  userId: string | null;
}

export function AddToPlaylistModal({
  isOpen,
  onClose,
  onTrackAdded,
  trackId,
  userId,
}: AddToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (isOpen && userId) {
      const fetchPlaylists = async () => {
        const { data, error } = await supabase
          .from("playlists")
          .select("id, title")
          .eq("user_id", userId);
        if (error) {
          setError("Failed to load playlists");
        } else {
          setPlaylists(data || []);
        }
      };
      fetchPlaylists();
    }
  }, [isOpen, userId]);

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylistId) {
      setError("Please select a playlist.");
      return;
    }

    try {
      // Check if the track is already in the playlist to prevent duplicates
      const { data: existingEntry, error: checkError } = await supabase
        .from("playlist_tracks")
        .select("id")
        .eq("playlist_id", selectedPlaylistId)
        .eq("track_id", trackId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw new Error(`Error checking existing track: ${checkError.message}`);
      }

      if (existingEntry) {
        setError("This track is already in the playlist.");
        return;
      }

      // Insert the track into the playlist
      const { error: insertError } = await supabase
        .from("playlist_tracks")
        .insert({ playlist_id: selectedPlaylistId, track_id: trackId });
      if (insertError)
        throw new Error(`Failed to add track: ${insertError.message}`);

      // Fetch the updated track count for the playlist
      const { count, error: countError } = await supabase
        .from("playlist_tracks")
        .select("id", { count: "exact", head: true })
        .eq("playlist_id", selectedPlaylistId);
      if (countError)
        throw new Error(`Failed to fetch track count: ${countError.message}`);

      console.log(
        `Added track ${trackId} to playlist ${selectedPlaylistId}. New track count: ${count}`
      );

      // Call the onTrackAdded callback with the playlistId and updated track count
      if (onTrackAdded) {
        onTrackAdded(selectedPlaylistId, count || 0);
      }
      onClose();
    } catch (error: any) {
      console.error("Error in handleAddToPlaylist:", error.message || error);
      setError(error.message || "Failed to add track to playlist");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f0f0f] text-white">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-md mb-4">
            {error}
          </div>
        )}
        <div className="space-y-4">
          {playlists.map((playlist) => (
            <Button
              key={playlist.id}
              onClick={() => setSelectedPlaylistId(playlist.id)}
              className={`w-full text-white ${
                selectedPlaylistId === playlist.id
                  ? "bg-[#ff6700] hover:bg-[#cc5300]"
                  : "bg-black hover:bg-gray-800"
              }`}
            >
              {playlist.title}
            </Button>
          ))}
        </div>
        <div className="mt-4">
          <Button
            onClick={handleAddToPlaylist}
            disabled={!selectedPlaylistId}
            className={`w-full relative overflow-hidden text-white px-6 py-3 transition-transform duration-300 transform group ${
              selectedPlaylistId
                ? "bg-[#ff6700] hover:bg-[#cc5300] hover:scale-105"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            <span className="relative z-10">Add</span>
            {selectedPlaylistId && (
              <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
