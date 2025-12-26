"use client";

import React, { useEffect, useState } from "react";
import { ValidationResult } from "@/core/validation";
import { cn } from "@/core/utils";

interface FloatingFeedbackProps {
  validationResult: ValidationResult;
  isVisible: boolean;
  onClose: () => void;
  position?: "top" | "bottom" | "center";
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const FloatingFeedback: React.FC<FloatingFeedbackProps> = ({
  validationResult,
  isVisible,
  onClose,
  position = "top",
  autoHide = true,
  autoHideDelay = 3000,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);

      if (autoHide) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoHideDelay);

        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, autoHide, autoHideDelay]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const getFeedbackIcon = () => {
    if (validationResult.isCorrect) {
      return (
        <svg
          className="w-6 h-6 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-6 h-6 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      );
    }
  };

  const getFeedbackColor = () => {
    if (validationResult.isCorrect) {
      return "bg-green-500/90 border-green-400/50";
    } else {
      return "bg-red-500/90 border-red-400/50";
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "top-4 left-1/2 transform -translate-x-1/2";
      case "bottom":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      case "center":
        return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
      default:
        return "top-4 left-1/2 transform -translate-x-1/2";
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed z-50 pointer-events-none">
      <div
        className={cn(
          "absolute flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm",
          "transition-all duration-300 ease-in-out",
          getFeedbackColor(),
          getPositionClasses(),
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95",
        )}
      >
        {/* Icon */}
        <div className="flex-shrink-0">{getFeedbackIcon()}</div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">
            {validationResult.isCorrect ? "Correct!" : "Incorrect"}
          </p>
          {validationResult.feedback &&
            validationResult.feedback.length > 0 && (
              <p className="text-xs text-white/80 mt-1">
                {validationResult.feedback[0]}
              </p>
            )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors pointer-events-auto"
          aria-label="Close feedback"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FloatingFeedback;
