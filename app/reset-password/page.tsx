"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "@/lib/auth";

// Child component to handle useSearchParams
function ResetPasswordForm({ setError }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    if (!accessToken || !refreshToken) {
      setError("Invalid or missing tokens");
    }
  }, [searchParams, setError]);

  return null; // This component only handles side effects
}

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    const { error } = await updatePassword(password);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <Image
                src="/skull.png"
                alt="PhonkItUp Logo"
                width={82}
                height={82}
                className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain"
              />
              <span className="text-xl sm:text-2xl font-bold">PhonkItUp</span>
            </div>

            <div className="bg-[#0f0f0f] p-6 sm:p-8 rounded-xl border border-gray-800 text-center">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="rounded-full bg-green-100 p-2 sm:p-3">
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                Password Updated!
              </h1>

              <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">
                Your password has been successfully updated. You'll be
                redirected to the login page shortly.
              </p>

              <Link href="/login">
                <Button className="w-full bg-[#ff6700] hover:bg-[#cc5300] text-white text-sm sm:text-base py-2 sm:py-3">
                  Go to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <Link
          href="/login"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 sm:mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>

        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <Image
              src="/skull.png"
              alt="PhonkItUp Logo"
              width={82}
              height={82}
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain"
            />
            <span className="text-xl sm:text-2xl font-bold">PhonkItUp</span>
          </div>

          <div className="bg-[#0f0f0f] p-6 sm:p-8 rounded-xl border border-gray-800">
            <div className="text-center mb-4 sm:mb-6">
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="rounded-full bg-[#ff6700] bg-opacity-20 p-2 sm:p-3">
                  <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-[#ff6700]" />
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold mb-2">
                Reset your password
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm">
                Enter your new password below.
              </p>
            </div>

            <Suspense fallback={<p>Loading...</p>}>
              <ResetPasswordForm setError={setError} />
            </Suspense>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    required
                    className="bg-black border-gray-700 focus:border-[#ff6700] pr-10 text-sm sm:text-base"
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
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    required
                    className="bg-black border-gray-700 focus:border-[#ff6700] pr-10 text-sm sm:text-base"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs sm:text-sm">{error}</p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base transition-transform duration-300 transform group hover:scale-105 w-full"
              >
                <span className="relative z-10">
                  {isLoading ? "Updating..." : "Update Password"}
                </span>
                <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
