"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Volume2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signInWithEmail, signInWithGoogle } from "@/lib/auth";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error } = await signInWithEmail(email, password);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push("/home");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="container mx-auto px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>

        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center mb-8">
            <Image
              src="/skull.png" // Replace with your actual image path
              alt="PhonkItUp Logo"
              width={82} // Increased width for mobile (48px)
              height={82} // Increased height for mobile (48px)
              className="h-12 w-12 md:h-14 md:w-14 object-contain" // 48x48 mobile, 56x56 laptop
            />
            <span className="text-2xl font-bold">PhonkItUp</span>
          </div>

          <div className="bg-[#0f0f0f] p-8 rounded-xl border border-gray-800">
            <h1 className="text-2xl font-bold text-center mb-6">
              Welcome back
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="bg-black border-gray-700 focus:border-[#ff6700]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#ff6700] hover:text-orange-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    className="bg-black border-gray-700 focus:border-[#ff6700] pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button
                type="submit"
                disabled={isLoading}
                className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-6 py-3 text-base transition-transform duration-300 transform group hover:scale-105 w-full"
              >
                <span className="relative z-10">
                  {isLoading ? "Logging in..." : "Login"}
                </span>
                <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="space-y-4">
              <Button
                variant="outline"
                className="relative overflow-hidden w-full bg-[#ff6700] hover:bg-[#cc5300] text-white hover:text-white border-none px-6 py-3 text-base transition-transform duration-300 transform group hover:scale-105 flex items-center justify-center space-x-3"
                onClick={async () => {
                  setIsLoading(true);
                  const { error } = await signInWithGoogle();
                  if (error) {
                    setError(error.message);
                    setIsLoading(false);
                  }
                }}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  {/* Google Icon */}
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 533.5 544.3"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.2H272v95h146.9c-6.3 33.9-25 62.5-53.2 81.6v67.5h85.9c50.4-46.4 81.9-114.8 81.9-194z"
                      fill="#4285F4"
                    />
                    <path
                      d="M272 544.3c72.6 0 133.5-24.1 178-65.2l-85.9-67.5c-23.9 16-54.5 25.5-92.1 25.5-70.7 0-130.6-47.7-152.1-111.6H30.3v69.9C75.5 475.1 167.4 544.3 272 544.3z"
                      fill="#34A853"
                    />
                    <path
                      d="M119.9 325.5c-10.6-31.5-10.6-65.4 0-96.9V158.7H30.3c-37.2 73.6-37.2 160.4 0 234l89.6-67.2z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M272 107.7c39.4 0 74.8 13.6 102.6 40.4l76.9-76.9C405.5 26.4 344.6 0 272 0 167.4 0 75.5 69.2 30.3 158.7l89.6 69.9C141.4 155.4 201.3 107.7 272 107.7z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </span>
                <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
              </Button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-[#ff6700] hover:text-orange-300"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
