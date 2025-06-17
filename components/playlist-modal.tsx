"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistCreated: () => void;
  userId: string | null;
}

export function PlaylistModal({
  isOpen,
  onClose,
  onPlaylistCreated,
  userId,
}: PlaylistModalProps) {
  const [title, setTitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setError("Only JPEG or PNG images are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Image size must be less than 5MB");
        return;
      }
      setCoverFile(file);
      setError(null);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!title.trim()) {
      setError("Playlist title is required");
      return;
    }
    if (!userId) {
      setError("You must be logged in to create a playlist");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let coverUrl: string | null = null;
      if (coverFile) {
        const fileExt = coverFile.name.split(".").pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("playlist-covers")
          .upload(fileName, coverFile, {
            cacheControl: "3600",
            upsert: false,
          });
        if (uploadError) {
          throw new Error(`Image upload error: ${uploadError.message}`);
        }
        const { data: publicUrlData } = supabase.storage
          .from("playlist-covers")
          .getPublicUrl(fileName);
        coverUrl = publicUrlData.publicUrl;
      }

      const { error: createError } = await supabase
        .from("playlists")
        .insert([{ user_id: userId, title, cover_url: coverUrl }]);

      if (createError) {
        throw new Error(`Failed to create playlist: ${createError.message}`);
      }

      setTitle("");
      setCoverFile(null);
      onPlaylistCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the playlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[280px] sm:max-w-[360px] bg-[#0f0f0f] text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Create New Phonkit
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-3">
          <div className="grid gap-1.5">
            <Label htmlFor="title" className="text-xs sm:text-sm">
              Phonkit Title
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Phonkit Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-900 border-gray-800 text-white text-sm py-1.5"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="coverImage" className="text-xs sm:text-sm">
              Cover Image (optional)
            </Label>
            <div className="flex items-center gap-2">
              <input
                id="coverImage"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="coverImage"
                className="flex items-center gap-1.5 cursor-pointer text-[#ff6700] text-xs sm:text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </label>
              <span className="text-xs text-gray-400 truncate max-w-[120px] sm:max-w-[150px]">
                {coverFile ? coverFile.name : "No file chosen"}
              </span>
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
        </div>
        <DialogFooter className="flex justify-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              setCoverFile(null);
              setTitle("");
              setError(null);
            }}
            className="px-2 text-[#ff6700] hover:bg-[#ff6700] hover:text-white text-xs py-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreatePlaylist}
            disabled={isLoading}
            className="relative overflow-hidden px-2 bg-[#ff6700] hover:bg-[#cc5300] text-white border-none py-1 text-xs transition-transform duration-300 transform group hover:scale-105 flex items-center justify-center"
          >
            {isLoading ? "Creating..." : "Create"}
            <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-200 ease-in-out" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
