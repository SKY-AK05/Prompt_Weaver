"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        console.error("Auth Callback Error:", error);
        router.push("/login?error=Auth session missing");
        return;
      }

      const user = data.session.user;

      // Update profiles table for social login users
      const username = user.user_metadata.name || user.email?.split('@')[0] || 'User';
      const email = user.email || '';

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username,
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Profile Upsert Error:", profileError);
        router.push("/login?error=Failed to update profile");
        return;
      }

      router.push("/dashboard");
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="animate-spin h-10 w-10" />
      <p>Processing authentication...</p>
    </div>
  );
}