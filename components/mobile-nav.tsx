// components/MobileNav.tsx
"use client";

import { Home, TrendingUp, Search, User } from "lucide-react";
import Link from "next/link";

export function MobileNav() {
  return (
    <div className="md:hidden bg-[#0f0f0f] border-t border-gray-800 fixed bottom-16 left-0 right-0 z-40">
      <div className="flex items-center justify-around py-3">
        <Link href="/home" className="flex flex-col items-center text-white">
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          href="/trending"
          className="flex flex-col items-center text-gray-400"
        >
          <TrendingUp className="h-5 w-5" />
          <span className="text-xs mt-1">Trending</span>
        </Link>
        <Link
          href="/search"
          className="flex flex-col items-center text-gray-400"
        >
          <Search className="h-5 w-5" />
          <span className="text-xs mt-1">Search</span>
        </Link>
        <Link
          href="/profile"
          className="flex flex-col items-center text-gray-400"
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
}
