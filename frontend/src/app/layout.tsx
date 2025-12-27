import "../shared/styles/globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import AppLayout from "@/features/index/layout";

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
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
