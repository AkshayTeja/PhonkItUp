"use client";

import Link from "next/link";
import { useState } from "react";
import { Volume2, Search, Home, User, TrendingUp, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function NavigationBar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <div className="bg-[#0f0f0f] border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Volume2 className="h-6 w-6 text-[#ff6700]" />
              <span className="text-xl font-bold">PhonkItUp</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/home" className="flex items-center text-white">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
              <Link
                href="/trending"
                className="flex items-center text-gray-400 hover:text-white"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                What&apos;s Hot?
              </Link>
              <Link
                href="/profile"
                className="flex items-center text-gray-400 hover:text-white"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </div>

            <div className="hidden md:block relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tracks, artists..."
                className="pl-8 bg-gray-900 border-gray-700"
              />
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
                  className="bg-[#0f0f0f] border-gray-800 p-0"
                >
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-800">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage
                            src="/placeholder.svg?height=40&width=40"
                            alt="User"
                          />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">John Doe</div>
                          <div className="text-sm text-gray-400">@johndoe</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 py-4">
                      <nav className="space-y-2 px-2">
                        <Link
                          href="/home"
                          className="flex items-center p-3 rounded-lg hover:bg-gray-800"
                        >
                          <Home className="mr-3 h-5 w-5" />
                          Home
                        </Link>
                        <Link
                          href="/trending"
                          className="flex items-center p-3 rounded-lg hover:bg-gray-800"
                        >
                          <TrendingUp className="mr-3 h-5 w-5" />
                          What&apos;s Hot?
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center p-3 rounded-lg hover:bg-gray-800"
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
        <div className="md:hidden bg-[#0f0f0f] border-b border-gray-800 p-3 sticky top-16 z-40">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tracks, artists..."
              className="pl-9 bg-gray-900 border-gray-700"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400"
              onClick={() => setIsSearchOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
