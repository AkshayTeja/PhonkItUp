"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/login"
            className="inline-flex items-center text-gray-400 hover:text-white mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>

          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center mb-8">
              <Image
                src="/skull.png"
                alt="PhonkItUp Logo"
                width={82}
                height={82}
                className="h-12 w-12 md:h-14 md:w-14 object-contain"
              />
              <span className="text-2xl font-bold">PhonkItUp</span>
            </div>

            <div className="bg-[#0f0f0f] p-8 rounded-xl border border-gray-800 text-center">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-4">Check your email</h1>

              <p className="text-gray-400 mb-6">
                We've sent a password reset link to{" "}
                <span className="text-white font-medium">{email}</span>
              </p>

              <p className="text-sm text-gray-500 mb-8">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="text-[#ff6700] hover:text-orange-300 underline"
                >
                  try again
                </button>
              </p>

              <Link href="/login">
                <Button className="w-full bg-[#ff6700] hover:bg-[#cc5300] text-white">
                  Back to Login
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
      <div className="container mx-auto px-4 py-6">
        <Link
          href="/login"
          className="inline-flex items-center text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>

        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center mb-8">
            <Image
              src="/skull.png"
              alt="PhonkItUp Logo"
              width={82}
              height={82}
              className="h-12 w-12 md:h-14 md:w-14 object-contain"
            />
            <span className="text-2xl font-bold">PhonkItUp</span>
          </div>

          <div className="bg-[#0f0f0f] p-8 rounded-xl border border-gray-800">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-[#ff6700] bg-opacity-20 p-3">
                  <Mail className="h-8 w-8 text-[#ff6700]" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2">Forgot your password?</h1>
              <p className="text-gray-400 text-sm">
                No worries! Enter your email address and we'll send you a link
                to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
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

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button
                type="submit"
                disabled={isLoading}
                className="relative overflow-hidden bg-[#ff6700] hover:bg-[#cc5300] text-white px-6 py-3 text-base transition-transform duration-300 transform group hover:scale-105 w-full"
              >
                <span className="relative z-10">
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </span>
                <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-white opacity-20 transform skew-x-[-20deg] group-hover:left-[125%] transition-all duration-700 ease-in-out" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-[#ff6700] hover:text-orange-300"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
