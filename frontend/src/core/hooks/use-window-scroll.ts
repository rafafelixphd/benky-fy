import { useState, useEffect } from "react";

interface ScrollState {
  y: number;
  lastY: number;
  direction: "up" | "down" | null;
}

export function useWindowScroll() {
  const [scroll, setScroll] = useState<ScrollState>({
    y: 0,
    lastY: 0,
    direction: null,
  });

  useEffect(() => {
    // Skip if not in browser environment
    if (typeof window === "undefined") return;

    let ticking = false;
    let lastKnownScrollY = window.scrollY;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setScroll((prev) => ({
            y: currentScrollY,
            lastY: prev.y,
            direction: currentScrollY > prev.y ? "down" : "up",
          }));
          lastKnownScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scroll;
}
