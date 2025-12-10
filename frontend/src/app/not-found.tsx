"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FloatingElements } from "@/components/common/layout/background";
import { Home, BookOpen, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
      <FloatingElements />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-md mx-auto">
          {/* Error Section */}
          <h1 className="text-6xl font-bold text-primary-foreground mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-primary-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8">
            Oops! The page you're looking for doesn't exist.
          </p>

          {/* Helpful Message */}
          <p className="text-base text-primary-foreground/80 mb-8">
            The page might have been moved, deleted, or you entered the wrong
            URL.
          </p>

          {/* Navigation Options */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-background text-primary-purple hover:bg-background/90 px-8 py-3"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>

            <Button
              onClick={() => router.push("/modules")}
              variant="secondary"
              className="w-full px-6 py-3"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Learning Modules
            </Button>

            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full bg-transparent border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-6 py-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Additional Help */}
          <p className="text-sm text-primary-foreground/70 mt-8">
            Need help? Contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
