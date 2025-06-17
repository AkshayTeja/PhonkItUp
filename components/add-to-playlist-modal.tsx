import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Playlist {
  id: string;
  title: string;
}

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
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setSelectedPlaylistId(null);
      setError(null);
      if (userId) {
        const fetchPlaylists = async () => {
          const { data, error } = await supabase
            .from("playlists")
            .select("id, title")
            .eq("user_id", userId)
            .neq("title", "Liked Songs"); // Exclude "Liked Songs" playlist
          if (error) {
            setError("Failed to load playlists");
          } else {
            setPlaylists(data || []);
          }
        };
        fetchPlaylists();
      }
    } else {
      // Reset state when modal closes
      setSelectedPlaylistId(null);
      setError(null);
    }
  }, [isOpen, userId]);

  const handleSelectPlaylist = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    setError(null); // Clear error on new selection
  };

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylistId) {
      setError("Please select a playlist.");
      return;
    }

    setIsLoading(true);
    try {
      // Check for duplicates
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

      // Insert track
      const { error: insertError } = await supabase
        .from("playlist_tracks")
        .insert({ playlist_id: selectedPlaylistId, track_id: trackId });
      if (insertError)
        throw new Error(`Failed to add track: ${insertError.message}`);

      // Fetch updated track count
      const { count, error: countError } = await supabase
        .from("playlist_tracks")
        .select("id", { count: "exact", head: true })
        .eq("playlist_id", selectedPlaylistId);
      if (countError)
        throw new Error(`Failed to fetch track count: ${countError.message}`);

      // Re-fetch playlists excluding "Liked Songs"
      const { data: updatedPlaylists, error: playlistError } = await supabase
        .from("playlists")
        .select("id, title")
        .eq("user_id", userId)
        .neq("title", "Liked Songs");
      if (playlistError) {
        throw new Error(
          `Failed to refresh playlists: ${playlistError.message}`
        );
      }
      setPlaylists(updatedPlaylists || []);

      // Call callback with accurate track count
      if (onTrackAdded) {
        onTrackAdded(selectedPlaylistId, count || 0);
      }
      onClose();
    } catch (error: any) {
      console.error("Error in handleAddToPlaylist:", error.message || error);
      setError(error.message || "Failed to add track to playlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[280px] sm:max-w-[360px] bg-[#0f0f0f] text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Add to Phonkit
          </DialogTitle>
        </DialogHeader>
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 p-2 rounded-md mb-2 text-xs sm:text-sm">
            {error}
          </div>
        )}
        <div className="space-y-2">
          {playlists.length === 0 ? (
            <p className="text-gray-400 text-center text-xs sm:text-sm">
              No playlists available. Create a playlist to add this track.
            </p>
          ) : (
            playlists.map((playlist) => (
              <Button
                key={playlist.id}
                onClick={() => handleSelectPlaylist(playlist.id)}
                className={`w-full text-white text-xs sm:text-sm py-1.5 ${
                  selectedPlaylistId === playlist.id
                    ? "bg-[#ff6700] hover:bg-[#cc5300]"
                    : "bg-black hover:bg-gray-800"
                }`}
              >
                {playlist.title}
              </Button>
            ))
          )}
        </div>
        <div className="mt-3 flex justify-center">
          <Button
            onClick={handleAddToPlaylist}
            disabled={!selectedPlaylistId || isLoading}
            className={`w-full inline-flex items-center justify-center relative overflow-hidden text-white px-3 py-1 text-xs sm:text-sm transition-transform duration-300 transform group ${
              selectedPlaylistId && !isLoading
                ? "bg-[#ff6700] hover:bg-[#cc5300] hover:scale-105"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            <span className="relative z-10">
              {isLoading ? "Adding..." : "Add"}
            </span>
            {selectedPlaylistId && !isLoading && (
              <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-200 ease-in-out" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
