"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FloatingElements } from "@/shared/components/common/layout/background";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/services/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get("error") === "session_expired") {
      setError("Your session has expired. Please log in again.");
    }

    if (
      urlParams.get("logout") === "success" &&
      urlParams.get("clear") === "true"
    ) {
      localStorage.removeItem("benkyfy_user");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.login({ email, password });

      if (response.success) {
        router.push("/modules");
      } else {
        setError(response.message || response.error || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    // Keep existing social login logic if functionality exists or acts as placeholder
    if (provider === "google") {
      window.location.href = "/api/auth/google";
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden flex items-center justify-center">
      <FloatingElements />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-purple-100">Sign in to continue your learning</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-6 text-center">
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-100 mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-200/50 focus:border-white/50"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-100 mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-200/50 focus:border-white/50"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-primary-purple hover:bg-purple-50"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>

          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-purple-200/20"></div>
            <span className="px-3 text-sm text-purple-200/60">or continue with</span>
            <div className="flex-1 border-t border-purple-200/20"></div>
          </div>

          <div className="mt-6 space-y-3">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("google")}
              className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
          </div>

          <div className="mt-8 text-center text-sm text-purple-200">
            Don't have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-white hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
