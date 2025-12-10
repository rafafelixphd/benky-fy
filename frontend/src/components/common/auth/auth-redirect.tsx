'use client';

import { Loader2 } from "lucide-react";
import { AuthRedirectProps } from "./types";

export function AuthRedirect({
  message = "Redirecting to login...",
}: AuthRedirectProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-secondary-purple">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-foreground" />
        <p className="text-primary-foreground">{message}</p>
      </div>
    </div>
  );
}
