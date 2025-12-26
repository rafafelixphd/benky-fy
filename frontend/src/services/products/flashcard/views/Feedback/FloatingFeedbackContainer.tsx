"use client";

import React, { useEffect, useCallback } from "react";
import { FlashcardItem } from "../../types/FlashcardTypes";
import { UserSettings } from "@/core/api-client";
import { ValidationResult, getFeedbackColor } from "@/core/validation";
import { X, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/core/utils";

interface FloatingFeedbackContainerProps {
  validationResult: ValidationResult;
  item: FlashcardItem;
  userAnswer: string | Record<string, string>;
  userAnswers?: Record<string, string>;
  settings: UserSettings;
  isVisible: boolean;
  onClose: () => void;
  position: "top" | "bottom" | "center" | "modal";
  autoHide: boolean;
  autoHideDelay: number;
  moduleName?: string;
  showDetailedFeedback?: boolean;
}

export const FloatingFeedbackContainer: React.FC<
  FloatingFeedbackContainerProps
> = ({
  validationResult,
  item,
  userAnswer,
  userAnswers = {},
  settings,
  isVisible,
  onClose,
  position,
  autoHide,
  autoHideDelay,
  moduleName,
  showDetailedFeedback = false,
}) => {
  // Auto-hide functionality
  useEffect(() => {
    if (isVisible && autoHide) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHide, autoHideDelay, onClose]);

  // Keyboard event handling
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isVisible, handleKeyDown]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  // Get feedback color
  const feedbackColor = getFeedbackColor([validationResult.isCorrect]);
  const bgColor = validationResult.isCorrect ? "bg-green-500" : "bg-red-500";
  const iconColor = validationResult.isCorrect
    ? "text-green-100"
    : "text-red-100";

  // Get feedback icon
  const getFeedbackIcon = () => {
    if (validationResult.isCorrect) {
      return <CheckCircle className="w-6 h-6" />;
    }
    return <XCircle className="w-6 h-6" />;
  };

  // Position styles
  const getPositionStyles = () => {
    switch (position) {
      case "top":
        return "top-4 left-1/2 transform -translate-x-1/2";
      case "bottom":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      case "center":
        return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
      case "modal":
        return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
      default:
        return "top-4 left-1/2 transform -translate-x-1/2";
    }
  };

  // Modal overlay for modal position
  if (position === "modal") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div
          className={cn(
            "relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4",
            "border-2",
            validationResult.isCorrect ? "border-green-500" : "border-red-500",
          )}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="flex items-start gap-3">
            <div className={cn("flex-shrink-0", iconColor)}>
              {getFeedbackIcon()}
            </div>
            <div className="flex-1">
              <h3
                className={cn(
                  "text-lg font-semibold mb-2",
                  validationResult.isCorrect
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300",
                )}
              >
                {validationResult.isCorrect ? "Correct!" : "Incorrect"}
              </h3>

              {showDetailedFeedback && (
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {validationResult.isCorrect ? "Great job!" : "Try again!"}
                </div>
              )}

              {/* Answer details */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <div>
                  Your answer:{" "}
                  {typeof userAnswer === "string"
                    ? userAnswer
                    : Object.values(userAnswer).join(", ")}
                </div>
                <div>Expected: {item.english}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Floating notification
  return (
    <div className={cn("fixed z-50 max-w-sm w-full mx-4", getPositionStyles())}>
      <div
        className={cn(
          "bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 p-4",
          validationResult.isCorrect ? "border-green-500" : "border-red-500",
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn("flex-shrink-0", iconColor)}>
            {getFeedbackIcon()}
          </div>
          <div className="flex-1">
            <div
              className={cn(
                "font-semibold text-sm",
                validationResult.isCorrect
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300",
              )}
            >
              {validationResult.isCorrect ? "Correct!" : "Incorrect"}
            </div>

            {showDetailedFeedback && (
              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {validationResult.isCorrect ? "Great job!" : "Try again!"}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
