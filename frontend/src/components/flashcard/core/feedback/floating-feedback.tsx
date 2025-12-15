'use client';

import { useEffect, useState } from "react";
import { FloatingFeedbackProps } from "../../types/feedback";
import { getEnabledInputModes, getFeedbackContainerColor } from "./utils";
import { FeedbackTable } from "./feedback-table";

export function FloatingFeedback({
  item,
  userAnswer,
  isCorrect,
  matchedType,
  convertedAnswer,
  settings,
  frontendValidationResult,
  userAnswers = {},
  moduleName,
  timerDuration = 8000,
  onClose,
}: FloatingFeedbackProps) {
  const [timeLeft, setTimeLeft] = useState(Math.ceil(timerDuration / 1000));
  const enabledModes = getEnabledInputModes(settings, moduleName);
  const containerFeedbackColor = getFeedbackContainerColor(frontendValidationResult, isCorrect);

  // Auto-close timer
  useEffect(() => {
    const timer = setTimeout(onClose, timerDuration);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [timerDuration, onClose]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyPress, true);
    return () => document.removeEventListener("keydown", handleKeyPress, true);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`max-w-2xl w-full p-6 rounded-lg border backdrop-blur-sm ${containerFeedbackColor}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Answer Feedback</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/70">
              Auto-advancing in {timeLeft}s
            </span>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Close feedback"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-4 p-3 bg-white/10 rounded-lg">
          <p className="text-sm text-white/80 mb-2">Quick Actions:</p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm text-white transition-colors"
            >
              Press Enter to Continue
            </button>
            <span className="text-xs text-white/60 self-center">
              or wait {timeLeft} seconds
            </span>
          </div>
        </div>

        <FeedbackTable
          enabledModes={enabledModes}
          userAnswers={{ ...userAnswers, [matchedType || ""]: userAnswer }}
          item={item}
          frontendValidationResult={frontendValidationResult}
          isCorrect={isCorrect}
          matchedType={matchedType}
          convertedAnswer={convertedAnswer}
        />
      </div>
    </div>
  );
}
