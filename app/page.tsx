"use client";

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Play, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
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
        <div className="absolute top-0 left-0 w-full h-full bg-black/60"></div>

        <div className="container mx-auto px-4 relative z-10 h-full flex flex-col">
          {/* Navigation */}
          <nav className="flex items-center justify-between py-6">
            <div className="flex items-center gap-2">
              <Volume2 className="h-8 w-8 text-[#ff6700]" />
              <span className="text-2xl font-bold tracking-tighter">PhonkItUp</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:text-[#ff6700]">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-[#ff6700] hover:bg-[#cc5300] text-white">Sign Up</Button>
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="flex flex-col items-center justify-center flex-grow text-center">
            <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl p-10 w-full max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                Experience <span className="text-[#ff6700]">Phonk</span> Like Never Before
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-10">
                The ultimate destination for phonk music enthusiasts. Listen for free, even when you switch tabs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button className="bg-[#ff6700] hover:bg-[#cc5300] text-white px-8 py-6 text-lg">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button
                    variant="outline"
                    className="border-[#ff6700] text-white hover:bg-[#331a00] px-8 py-6 text-lg"
                  >
                    Try Demo <Play className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Features Section */}
      <div className="bg-[#0f0f0f] py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why <span className="text-[#ff6700]">PhonkItUp</span>?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Volume2 className="h-8 w-8 text-[#ff6700]" />,
                title: "Uninterrupted Listening",
                desc: "Keep the phonk playing even when you switch tabs or minimize your browser.",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#ff6700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                ),
                title: "Exclusive Phonk Collection",
                desc: "Access the largest library of phonk music, from classics to underground gems.",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#ff6700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "Discover Artists",
                desc: "Find new phonk artists and tracks based on your listening preferences.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="bg-black/50 p-8 rounded-xl border border-[#993f00]/30 hover:border-[#ff6700]/50 transition-all"
              >
                <div className="bg-[#993f00]/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>


      {/* CTA Section */}
      <div className="bg-black py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to <span className="text-[#ff6700]">Phonk It Up</span>?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Join thousands of phonk enthusiasts and start your journey into the world of phonk music today.
          </p>
          <Link href="/signup">
            <Button className="bg-[#ff6700] hover:bg-[#cc5300] text-white px-8 py-6 text-lg">
              Create Free Account
            </Button>
          </Link>
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
            <div className="text-gray-400 text-sm">© {new Date().getFullYear()} PhonkItUp. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
