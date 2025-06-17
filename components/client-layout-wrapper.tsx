"use client";

import { usePathname } from "next/navigation";
import MusicPlayer from "./music-player";

export function ClientLayoutWrapper() {
  const pathname = usePathname();
  const hidePlayerRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  const shouldHidePlayer = hidePlayerRoutes.includes(pathname);

  return <>{!shouldHidePlayer && <MusicPlayer />}</>;
}
