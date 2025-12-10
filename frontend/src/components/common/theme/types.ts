import { ComponentProps } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export interface ThemeProviderProps extends ComponentProps<typeof NextThemesProvider> {}

export interface ThemeToggleProps {
  variant?: "default" | "floating" | "minimal";
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export interface ThemeContextValue {
  theme?: string;
  setTheme: (theme: string) => void;
  systemTheme?: string;
  resolvedTheme?: string;
  forcedTheme?: string;
  themes: string[];
  mounted: boolean;
}