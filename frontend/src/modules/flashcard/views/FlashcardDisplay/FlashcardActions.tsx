"use client";

import React, { useEffect } from "react";
import { cn } from "@/core/utils";

interface FlashcardActionsProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  disabled?: boolean;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
}

export const FlashcardActions: React.FC<FlashcardActionsProps> = ({
  onNext,
  onPrevious,
  onSkip,
  disabled = false,
  canGoPrevious = true,
  canGoNext = true,
}) => {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case "Enter":
          if (onNext && canGoNext) {
            event.preventDefault();
            onNext();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [onNext, onPrevious, onSkip, disabled, canGoPrevious, canGoNext]);

  return (
    <div className="flex items-center justify-center space-x-4 mt-6">
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={disabled || !canGoPrevious}
        className={cn(
          "px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2",
          "bg-white/10 hover:bg-white/20 text-white border border-white/20",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10",
          "focus:outline-none focus:ring-2 focus:ring-white/50",
        )}
        title="Previous (←)"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Skip Button */}
      {onSkip && (
        <button
          onClick={onSkip}
          disabled={disabled}
          className={cn(
            "px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2",
            "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 border border-yellow-500/30",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-500/20",
            "focus:outline-none focus:ring-2 focus:ring-yellow-500/50",
          )}
          title="Skip (S)"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
          <span className="hidden sm:inline">Skip</span>
        </button>
      )}

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={disabled || !canGoNext}
        className={cn(
          "px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2",
          "bg-white/10 hover:bg-white/20 text-white border border-white/20",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10",
          "focus:outline-none focus:ring-2 focus:ring-white/50",
        )}
        title="Next (→ or Space)"
      >
        <span className="hidden sm:inline">Next</span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
};

export default FlashcardActions;
