"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (session) {
        router.push("/home");
      } else {
        router.push("/login");
      }
    };

    getSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center">
      <p>Redirecting...</p>
    </div>
  );
}
