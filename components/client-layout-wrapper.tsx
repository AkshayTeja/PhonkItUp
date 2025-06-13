"use client";

import { usePathname } from "next/navigation";
import MusicPlayer from "./music-player";
import { MobileNav } from "./mobile-nav";

export function ClientLayoutWrapper() {
  const pathname = usePathname();
  const hidePlayerRoutes = ["/", "/login", "/signup"];
  const shouldHidePlayer = hidePlayerRoutes.includes(pathname);

  return (
    <>
      {!shouldHidePlayer && <MobileNav />}
      {!shouldHidePlayer && <MusicPlayer />}
    </>
  );
}
