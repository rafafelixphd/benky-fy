import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { FloatingThemeToggle } from "@/components/common/theme";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Benky-Fy - Japanese Learning Platform",
  description:
    "AI-powered Japanese learning with flashcards, conjugation practice, and adaptive learning paths",
  keywords: [
    "Japanese",
    "learning",
    "flashcards",
    "conjugation",
    "language",
    "education",
  ],
  authors: [{ name: "Benky-Fy Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <FloatingThemeToggle />
        </Providers>
      </body>
    </html>
  );
}
