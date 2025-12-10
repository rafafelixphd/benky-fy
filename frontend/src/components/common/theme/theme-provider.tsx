'use client';

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeContextProvider } from "./theme-context";
import { ThemeProviderProps } from "./types";

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeContextProvider>{children}</ThemeContextProvider>
    </NextThemesProvider>
  );
}
