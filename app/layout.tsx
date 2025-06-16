import type { Metadata } from "next";
import "./globals.css";
import { Play } from "next/font/google";
import { PlayerProvider } from "../app/context/PlayerContext";
import { ClientLayoutWrapper } from "../components/client-layout-wrapper";
import { ClientPlayerProvider } from "@/components/client-player-provider";

const play = Play({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-play",
});

export const metadata: Metadata = {
  title: "PhonkItUp",
  description: "The best phonk music app",
  generator: "v0.dev",
  icons: {
    icon: "/skull.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={play.variable}>
      <body className="font-anta">
        <ClientPlayerProvider>
          <main>{children}</main>
          <ClientLayoutWrapper />
        </ClientPlayerProvider>
      </body>
    </html>
  );
}
