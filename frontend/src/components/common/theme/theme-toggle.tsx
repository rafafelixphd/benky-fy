'use client';

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./theme-context";
import { ThemeToggleProps } from "./types";
import { cn } from "@/core/utils";

const variants = {
  default: "border-primary-purple/30 text-primary-purple hover:bg-primary-purple/10 dark:border-primary-purple/50 dark:text-primary-purple dark:hover:bg-primary-purple/20",
  floating: "fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-primary-purple/30 text-primary-purple hover:bg-primary-purple/10 dark:border-primary-purple/50 dark:text-primary-purple dark:hover:bg-primary-purple/20 bg-background/90 dark:bg-background/90 backdrop-blur-sm",
  minimal: "bg-transparent border-0 hover:bg-transparent text-primary-purple hover:text-primary-purple/80 dark:text-primary-purple dark:hover:text-primary-purple/80",
};

const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconSizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function ThemeToggle({
  variant = "default",
  className,
  showLabel = false,
  size = "sm",
}: ThemeToggleProps) {
  const { theme, setTheme, mounted } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!mounted || !isClient) {
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn(
          variants[variant],
          sizes[size],
          "opacity-0",
          className
        )}
        aria-hidden="true"
      >
        <Sun className={iconSizes[size]} />
      </Button>
    );
  }

  const isDark = theme === "dark" || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const Icon = isDark ? Sun : Moon;
  const label = isDark ? "Light mode" : "Dark mode";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        variants[variant],
        sizes[size],
        className
      )}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && (
        <span className="sr-only">{label}</span>
      )}
    </Button>
  );
}

export function FloatingThemeToggle(props: Omit<ThemeToggleProps, 'variant'>) {
  return <ThemeToggle variant="floating" {...props} />;
}