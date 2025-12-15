'use client';

import { Button } from "@/components/ui/button";
import { AuthErrorProps } from "./types";

export function AuthError({
  message = "Authentication error occurred",
  onRetry = () => window.location.reload(),
}: AuthErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-secondary-purple">
      <div className="text-center">
        <p className="text-primary-foreground mb-4">{message}</p>
        <Button onClick={onRetry}>Retry</Button>
      </div>
    </div>
  );
}
