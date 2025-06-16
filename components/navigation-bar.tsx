"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Volume2,
  Search,
  Home,
  User,
  TrendingUp,
  Menu,
  X,
  Vault,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface Song {
  id: number;
  song_name: string;
  song_artist: string | null;
  album_cover_url: string | null;
  type: "song";
}

interface Playlist {
  id: string;
  title: string;
  cover_url: string | null;
  type: "playlist";
}

type SearchResult = Song | Playlist;

export function NavigationBar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [userDisplayName, setUserDisplayName] = useState<string>("User");
  const [authDisplayName, setAuthDisplayName] = useState<string>("User");
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pathname = usePathname();

  // Fetch user data for dynamic profile
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) {
          console.error("Error fetching user:", authError.message);
          setErrorMessage("Failed to authenticate user.");
          return;
        }
        if (user) {
          // Fetch display_name from user_metadata for the handle
          const authName =
            user.user_metadata?.display_name || `user_${user.id.slice(0, 8)}`;
          setAuthDisplayName(authName);

          // Fetch name and profile picture from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("name, profile_picture")
            .eq("id", user.id)
            .single();

          if (profileError) {
            console.error("Error fetching profile data:", profileError.message);
            setErrorMessage("Failed to fetch profile data.");
            setUserDisplayName(`user_${user.id.slice(0, 8)}`);
            setUserAvatarUrl(null);
          } else if (!profileData) {
            console.warn("No profile found for user:", user.id);
            setErrorMessage("No profile found. Please create a profile.");
            setUserDisplayName(`user_${user.id.slice(0, 8)}`);
            setUserAvatarUrl(null);
          } else {
            setUserDisplayName(
              profileData?.name || `user_${user.id.slice(0, 8)}`
            );
            setUserAvatarUrl(profileData?.profile_picture || null);
          }
        } else {
          console.warn("No authenticated user found.");
          setErrorMessage("No user authenticated.");
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error.message || error);
        setErrorMessage(
          "An unexpected error occurred while fetching profile data."
        );
      }
    };
    fetchUserData();
  }, []);

  // Fetch search results from Supabase
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          console.error("No user found");
          setSearchResults([]);
          return;
        }

        // Fetch songs
        const { data: songsData, error: songsError } = await supabase
          .from("phonk_songs")
          .select("id, song_name, song_artist, album_cover_url")
          .or(
            `song_name.ilike.%${searchQuery}%,song_artist.ilike.%${searchQuery}%`
          )
          .limit(5);

        if (songsError) {
          console.error("Error fetching songs:", songsError);
        }

        // Fetch playlists
        const { data: playlistsData, error: playlistsError } = await supabase
          .from("playlists")
          .select("id, title, cover_url")
          .eq("user_id", user.id)
          .ilike("title", `%${searchQuery}%`)
          .limit(5);

        if (playlistsError) {
          console.error("Error fetching phonkits:", playlistsError);
        }

        // Combine results
        const songsResults: Song[] = (songsData || []).map((song) => ({
          ...song,
          type: "song",
        }));

        const playlistsResults: Playlist[] = (playlistsData || []).map(
          (playlist) => ({
            ...playlist,
            type: "playlist",
          })
        );

        setSearchResults([...songsResults, ...playlistsResults]);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]);
      }
    };

    const debounce = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Helper function to determine active link classes
  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;
    return `flex items-center transition-colors ${
      isActive ? "text-white font-bold" : "text-gray-400 hover:text-white"
    }`;
  };

  // Helper function to determine active mobile link classes
  const getMobileLinkClasses = (href: string) => {
    const isActive = pathname === href;
    return `flex items-center p-3 rounded-lg ${
      isActive
        ? "bg-gray-800 text-white font-bold"
        : "hover:bg-gray-800 text-gray-400"
    }`;
  };

  // Generate AvatarFallback from display name
  const getAvatarFallback = (name: string) => {
    const initials = name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return initials || "JD";
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="bg-[#0f0f0f] border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Image
                src="/skull.png" // Replace with your actual image path
                alt="PhonkItUp Logo"
                width={82} // Increased width for mobile (48px)
                height={82} // Increased height for mobile (48px)
                className="h-12 w-12 md:h-14 md:w-14 object-contain" // 48x48 mobile, 56x56 laptop
              />
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/home" className={getLinkClasses("/home")}>
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
              <Link href="/trending" className={getLinkClasses("/trending")}>
                <TrendingUp className="mr-2 h-4 w-4" />
                What's Hot?
              </Link>
              <Link href="/vault" className={getLinkClasses("/vault")}>
                <Vault className="mr-2 h-4 w-4" />
                The Vault
              </Link>
              <Link href="/profile" className={getLinkClasses("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </div>

            <div className="hidden md:block relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tracks, artists or phonkits"
                className="pl-8 bg-gray-900 border-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                  {searchResults.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      href={
                        result.type === "song"
                          ? `/vault?song=${encodeURIComponent(
                              result.song_name
                            )}`
                          : `/playlist/${result.id}`
                      }
                      className="flex items-center p-3 hover:bg-gray-800 border-b border-gray-800 last:border-0"
                      onClick={() => setSearchQuery("")}
                    >
                      {(result.type === "song"
                        ? result.album_cover_url
                        : result.cover_url) && (
                        <img
                          src={
                            result.type === "song"
                              ? result.album_cover_url!
                              : result.cover_url ||
                                "/placeholder.svg?height=40&width=40"
                          }
                          alt={
                            result.type === "song"
                              ? result.song_name
                              : result.title
                          }
                          className="h-10 w-10 object-cover rounded mr-3"
                        />
                      )}
                      <div>
                        <div className="font-medium text-white">
                          {result.type === "song"
                            ? result.song_name
                            : result.title}
                          <span className="ml-2 text-xs text-gray-500">
                            {result.type === "playlist" ? "[Playlist]" : ""}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {result.type === "song"
                            ? result.song_artist || "Unknown Artist"
                            : "Your Phonkit"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="bg-[#0f0f0f] border-gray-800 p-0 text-[#ff6700] hover:text-[#cc5200]"
                >
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-800">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage
                            src={
                              userAvatarUrl ||
                              "/placeholder.svg?height=40&width=40"
                            }
                            alt={userDisplayName}
                          />
                          <AvatarFallback>
                            {getAvatarFallback(userDisplayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-[#ff6700]">
                            {userDisplayName}
                          </div>
                          <div className="text-sm text-gray-400">
                            @{authDisplayName.toLowerCase().replace(/\s+/g, "")}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 py-4">
                      <nav className="space-y-2 px-2">
                        <Link
                          href="/home"
                          className={getMobileLinkClasses("/home")}
                        >
                          <Home className="mr-3 h-5 w-5" />
                          Home
                        </Link>
                        <Link
                          href="/trending"
                          className={getMobileLinkClasses("/trending")}
                        >
                          <TrendingUp className="mr-3 h-5 w-5" />
                          What's Hot?
                        </Link>
                        <Link
                          href="/vault"
                          className={getMobileLinkClasses("/vault")}
                        >
                          <Vault className="mr-3 h-5 w-5" />
                          The Vault
                        </Link>
                        <Link
                          href="/profile"
                          className={getMobileLinkClasses("/profile")}
                        >
                          <User className="mr-3 h-5 w-5" />
                          Profile
                        </Link>
                      </nav>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden bg-[#0f0f0f] border-b border-gray-800 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tracks, artists or phonkits"
              className="pl-9 bg-gray-900 border-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-[#ff6700] hover:text-[#cc5200] bg-transparent hover:bg-transparent p-0 focus:ring-0 focus:outline-none"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
              }}
            >
              <X className="h-3 w-3 bg-transparent text-[#ff6700] hover:text-[#cc5200]" />
            </Button>
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                {searchResults.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={
                      result.type === "song"
                        ? `/vault?song=${encodeURIComponent(result.song_name)}`
                        : `/playlist/${result.id}`
                    }
                    className="flex items-center p-3 hover:bg-gray-800 border-b border-gray-800 last:border-0"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    {(result.type === "song"
                      ? result.album_cover_url
                      : result.cover_url) && (
                      <img
                        src={
                          result.type === "song"
                            ? result.album_cover_url!
                            : result.cover_url ||
                              "/placeholder.svg?height=40&width=40"
                        }
                        alt={
                          result.type === "song"
                            ? result.song_name
                            : result.title
                        }
                        className="h-10 w-10 object-cover rounded mr-3"
                      />
                    )}
                    <div>
                      <div className="font-medium text-white">
                        {result.type === "song"
                          ? result.song_name
                          : result.title}
                        <span className="ml-2 text-xs text-gray-500">
                          {result.type === "playlist" ? "[Playlist]" : ""}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {result.type === "song"
                          ? result.song_artist || "Unknown Artist"
                          : "Your Phonkit"}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
