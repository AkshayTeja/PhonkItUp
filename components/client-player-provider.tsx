"use client";

import { PlayerProvider } from "../app/context/PlayerContext";
import { ReactNode } from "react";

export const ClientPlayerProvider = ({ children }: { children: ReactNode }) => {
  return <PlayerProvider>{children}</PlayerProvider>;
};
