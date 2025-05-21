"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = "/home"
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="container mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>

        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center mb-8">
            <Volume2 className="h-8 w-8 text-purple-500 mr-2" />
            <span className="text-2xl font-bold">PhonkItUp</span>
          </div>

          <div className="bg-[#0f0f0f] p-8 rounded-xl border border-gray-800">
            <h1 className="text-2xl font-bold text-center mb-6">Welcome back</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="bg-black border-gray-700 focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="bg-black border-gray-700 focus:border-purple-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="space-y-4">
              <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-gray-800">
                Continue with Google
              </Button>

              <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-gray-800">
                Continue with Facebook
              </Button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-purple-400 hover:text-purple-300">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
