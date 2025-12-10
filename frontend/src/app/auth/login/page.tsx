"use client";

import { useState, useEffect } from "react";
import { FloatingElements } from "@/components/common/layout/background";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted for client-side interactions
  useEffect(() => {
    setIsMounted(true);

    // Check for logout success and clear localStorage
    const urlParams = new URLSearchParams(window.location.search);
    if (
      urlParams.get("logout") === "success" &&
      urlParams.get("clear") === "true"
    ) {
      localStorage.removeItem("benkyfy_user");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSocialLogin = async (provider: string) => {
    if (!isMounted) return;

    setIsLoading(true);
    setError(null);

    try {
      if (provider === "google") {
        // Direct Google OAuth integration
        window.location.href = "/api/auth/google";
      } else {
        // Other providers still need Auth0 setup
        setTimeout(() => {
          setIsLoading(false);
          setError(`${provider} login coming soon - Google is ready!`);
        }, 1000);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleEmailLogin = () => {
    if (!isMounted) return;

    setIsLoading(true);
    // TODO: Auth0 integration - redirect to Universal Login
    // window.location.href = '/api/auth/login';

    // Mock implementation for testing - will be replaced with Auth0
    setTimeout(() => {
      setIsLoading(false);
      setError("Auth0 email login ready for configuration");
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-secondary-purple">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-foreground" />
          <p className="text-primary-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
      <FloatingElements />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-md mx-auto">
          {/* Welcome Section */}
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">
            Welcome to Benky-Fy
          </h1>
          <p className="text-lg text-primary-foreground/90 mb-4">
            Sign in to continue your Japanese learning journey
          </p>
          <div className="bg-primary-purple/20 border border-primary-purple/30 rounded-lg p-4 mb-8">
            <p className="text-primary-foreground/90 text-sm">
              <span className="font-semibold">New to Benky-Fy?</span> You can
              explore our home page and basic features without signing in. Sign
              in to track your progress and access advanced learning tools.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Social Login Options */}
          <div className="space-y-3 mb-6">
            <Button
              onClick={() => handleSocialLogin("google")}
              className="w-full bg-white text-gray-800 hover:bg-gray-50 border border-gray-300 px-6 py-3"
              disabled={isLoading || !isMounted}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button
              onClick={() => handleSocialLogin("github")}
              className="w-full bg-gray-900 text-white hover:bg-gray-800 px-6 py-3"
              disabled={isLoading || !isMounted}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </Button>

            <Button
              onClick={() => handleSocialLogin("facebook")}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 px-6 py-3"
              disabled={isLoading || !isMounted}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-primary-foreground/30"></div>
            <span className="px-4 text-primary-foreground/70 text-sm">or</span>
            <div className="flex-1 border-t border-primary-foreground/30"></div>
          </div>

          {/* Email Login */}
          <Button
            onClick={handleEmailLogin}
            size="lg"
            className="w-full bg-background text-primary-purple hover:bg-background/90 px-8 py-3"
            disabled={isLoading || !isMounted}
          >
            Sign in with Email
          </Button>

          {/* Additional Help */}
          <p className="text-sm text-primary-foreground/70 mt-8">
            Need help? Contact our support team.
          </p>

          {/* Logout Success Message */}
          {typeof window !== "undefined" &&
            new URLSearchParams(window.location.search).get("logout") ===
              "success" && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mt-6">
                <p className="text-green-200 text-sm">
                  Successfully logged out!
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
