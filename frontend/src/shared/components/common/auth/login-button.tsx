'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils";
import { LoginButtonProps } from "./types";

const providerConfig = {
  google: {
    icon: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
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
    ),
    text: "Continue with Google",
  },
  github: {
    icon: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.24.73-.53v-1.85c-3.03.66-3.67-1.45-3.67-1.45-.5-1.27-1.21-1.6-1.21-1.6-.99-.67.07-.66.07-.66 1.09.08 1.67 1.12 1.67 1.12.97 1.66 2.54 1.18 3.16.9.1-.7.38-1.18.69-1.45-2.42-.27-4.96-1.2-4.96-5.35 0-1.18.42-2.15 1.12-2.91-.11-.27-.49-1.37.11-2.86 0 0 .92-.29 3 1.12a10.5 10.5 0 015.52 0c2.08-1.41 3-.12 3-.12.6 1.49.22 2.59.11 2.86.7.76 1.12 1.73 1.12 2.91 0 4.16-2.54 5.08-4.96 5.35.39.34.73 1 .73 2.01v2.98c0 .29.18.62.74.52A11 11 0 0012 1.27"
        />
      </svg>
    ),
    text: "Continue with GitHub",
  },
};

export function LoginButton({
  provider,
  onLogin,
  className,
}: LoginButtonProps) {
  const config = providerConfig[provider];
  const Icon = config.icon;

  const handleClick = () => {
    if (onLogin) {
      onLogin();
    } else {
      window.location.href = `/api/auth/${provider}`;
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className={cn(
        "w-full flex items-center justify-center gap-2 py-6 text-foreground/80 hover:text-foreground hover:bg-accent/50",
        className
      )}
    >
      <Icon />
      <span>{config.text}</span>
    </Button>
  );
}
