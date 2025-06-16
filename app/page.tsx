"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Headphones, Mic, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-[100vh] sm:h-screen overflow-hidden">
        {/* Video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
          src="/hero-background.mp4"
        />

        {/* Overlay for dark tint */}
        <div className="absolute top-0 left-0 w-full h-full backdrop-blur-sm bg-black/40 border border-white/10"></div>

        <div className="container mx-auto px-4 relative z-10 h-full flex flex-col">
          {/* Navigation */}
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.jpg" // Replace with your actual image path
                alt="PhonkItUp Logo"
                width={72} // Increased width for mobile (48px)
                height={72} // Increased height for mobile (48px)
                className="h-28 w-28 md:h-24 md:w-32 object-contain" // 48x48 mobile, 56x56 laptop
              />
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-white hover:text-[#ff6700] transition-transform duration-300 transform hover:scale-105"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-6 py-3 text-base transition-transform duration-300 transform group hover:scale-105">
                  <span className="relative z-10">Sign Up</span>
                  <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
                </Button>
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="flex flex-col items-center justify-center flex-grow text-center">
            <div className="backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-10 w-full max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                Experience <span className="text-[#ff6700]">Phonk</span> Like
                Never Before
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-10">
                The ultimate destination for phonk music enthusiasts. Listen for
                free, even when you switch tabs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-8 py-6 text-lg transition-transform duration-300 transform group hover:scale-105">
                    <span className="relative z-10">Start Now</span>
                    <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features + CTA Combined Section */}
      <div className="bg-gradient-to-b from-black via-black to-[#ff6700]/20 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-6"
            >
              Ready to <span className="text-[#ff6700]">Phonk It Up</span>?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-gray-300 max-w-2xl mx-auto mb-10"
            >
              Join thousands of phonk enthusiasts and start your journey into
              the world of phonk music today.
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10 m-5 md:m-0">
              {[
                {
                  icon: (
                    <Volume2 className="h-6 sm:h-8 w-6 sm:w-8 text-[#ff6700]" />
                  ),
                  title: "Uninterrupted Listening",
                  desc: "Keep the phonk playing even when you switch tabs or minimize your browser.",
                },
                {
                  icon: (
                    <Headphones className="h-6 sm:h-8 w-6 sm:w-8 text-[#ff6700]" />
                  ),
                  title: "Exclusive Phonk Collection",
                  desc: "Access the largest library of phonk music, from classics to underground gems.",
                },
                {
                  icon: (
                    <Mic className="h-6 sm:h-8 w-6 sm:w-8 text-[#ff6700]" />
                  ),
                  title: "Discover Artists",
                  desc: "Find new phonk artists and tracks based on your listening preferences.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 60, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.2,
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -10,
                    transition: { duration: 0.3, ease: "easeOut" },
                  }}
                  viewport={{ once: true }}
                  className="relative overflow-hidden group cursor-pointer"
                >
                  <div className="relative bg-gradient-to-br from-white/20 via-white/10 to-transparent backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-white/20 shadow-2xl transition-all duration-500 group-hover:border-[#ff6700]/60 group-hover:shadow-[0_0_40px_rgba(255,103,0,0.3)]">
                    {/* Glassmorphism background overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#ff6700]/5 via-transparent to-black/20 rounded-2xl"></div>

                    {/* Shine effect */}
                    <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-[-20deg] group-hover:left-[100%] transition-all duration-1000 ease-out"></div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <motion.div
                        className="bg-gradient-to-br from-[#ff6700]/20 to-[#ff6700]/10 backdrop-blur-sm p-3 sm:p-4 rounded-full w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center mb-4 sm:mb-6 border border-[#ff6700]/30 group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        {feature.icon}
                      </motion.div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-[#ff6700] transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-base sm:text-base text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                        {feature.desc}
                      </p>
                    </div>

                    {/* Animated border gradient */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#ff6700] via-transparent to-[#ff6700] p-px">
                        <div className="bg-black/80 backdrop-blur-xl rounded-2xl w-full h-full"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="mt-10"
            >
              <Link href="/signup">
                <Button className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-8 py-6 text-lg transition-transform duration-300 transform group hover:scale-105">
                  <span className="relative z-10">Create Free Account</span>
                  <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0f0f0f] py-10 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Volume2 className="h-6 w-6 text-[#ff6700]" />
              <span className="text-xl font-bold">PhonkItUp</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} PhonkItUp. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
