"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { name, email, password } = formData;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      // Wait a moment for the session to be established
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if user was created and session exists
      if (data.user && data.session) {
        // Store user info in localStorage temporarily for the starter page
        localStorage.setItem(
          "tempUserData",
          JSON.stringify({
            user: data.user,
            session: data.session,
            timestamp: Date.now(),
          })
        );

        // Successful signup - redirect to start journey page
        window.location.href = "/home";
      } else if (data.user && !data.session) {
        // User created but needs email confirmation
        setError(
          "Please check your email and click the confirmation link to continue."
        );
        setIsLoading(false);
      } else {
        setError("Something went wrong during signup. Please try again.");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Something went wrong");
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback?redirect=/starter`,
        },
      });
      if (error) {
        setError(error.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setIsLoading(false);
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
            <Volume2 className="h-8 w-8 text-[#ff6700] mr-2" />
            <span className="text-2xl font-bold">PhonkItUp</span>
          </div>

          <div className="bg-[#0f0f0f] p-8 rounded-xl border border-gray-800">
            <h1 className="text-2xl font-bold text-center mb-6">
              Create your account
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                  className="bg-black border-gray-700 focus:border-[#ff6700]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="bg-black border-gray-700 focus:border-[#ff6700]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                    className="bg-black border-gray-700 focus:border-[#ff6700] pr-10"
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
                <p className="text-xs text-gray-400">
                  Must be at least 8 characters long
                </p>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-500 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="relative overflow-hidden w-full bg-[#ff6700] hover:bg-[#cc5300] text-white px-6 py-3 text-base transition-transform duration-300 transform group hover:scale-105"
                disabled={isLoading}
              >
                <span className="relative z-10">
                  {isLoading ? "Creating account..." : "Create Account"}
                </span>
                <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="space-y-4">
              <Button
                type="button"
                onClick={handleGoogleSignup}
                variant="outline"
                className="relative overflow-hidden w-full bg-[#ff6700] hover:bg-[#cc5300] text-white hover:text-white border-none px-6 py-3 text-base transition-transform duration-300 transform group hover:scale-105 flex items-center justify-center space-x-3"
                disabled={isLoading}
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
                  <span>
                    {isLoading ? "Signing up..." : "Continue with Google"}
                  </span>
                </span>
                <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
              </Button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#ff6700] hover:text-orange-300"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
