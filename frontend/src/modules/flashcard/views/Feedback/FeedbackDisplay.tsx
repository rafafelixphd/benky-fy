"use client";

import React, { useState, useEffect } from "react";
import { ValidationResult } from "@/core/validation";
import { cn } from "@/core/utils";
import { AnswerFeedback } from "./AnswerFeedback";
import { FloatingFeedback } from "./FloatingFeedback";

interface FeedbackData {
  item: any;
  userAnswer: string;
  isCorrect: boolean;
  matchedType?: string;
  convertedAnswer?: string;
  validationResult?: ValidationResult;
  userAnswers?: Record<string, string>;
}

interface FeedbackDisplayProps {
  feedbackData: FeedbackData | null;
  settings: any;
  onFeedbackClose: () => void;
  displayMode?: "table" | "floating" | "both";
  showFloating?: boolean;
  floatingPosition?: "top" | "bottom" | "center";
}

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  feedbackData,
  settings,
  onFeedbackClose,
  displayMode = "both",
  showFloating = true,
  floatingPosition = "top",
}) => {
  const [showFloatingFeedback, setShowFloatingFeedback] = useState(false);
  const [showTableFeedback, setShowTableFeedback] = useState(false);

  useEffect(() => {
    if (feedbackData) {
      setShowTableFeedback(true);

      if (showFloating && displayMode !== "table") {
        setShowFloatingFeedback(true);
      }
    } else {
      setShowFloatingFeedback(false);
      setShowTableFeedback(false);
    }
  }, [feedbackData, showFloating, displayMode]);

  const handleFloatingClose = () => {
    setShowFloatingFeedback(false);
    onFeedbackClose();
  };

  const handleTableClose = () => {
    setShowTableFeedback(false);
    onFeedbackClose();
  };

  if (!feedbackData) return null;

  return (
    <>
      {/* Floating Feedback */}
      {showFloatingFeedback && feedbackData.validationResult && (
        <FloatingFeedback
          validationResult={feedbackData.validationResult}
          isVisible={showFloatingFeedback}
          onClose={handleFloatingClose}
          position={floatingPosition}
        />
      )}

      {/* Table Feedback */}
      {(displayMode === "table" || displayMode === "both") &&
        showTableFeedback && (
          <div className="relative">
            <AnswerFeedback
              item={feedbackData.item}
              userAnswer={feedbackData.userAnswer}
              isCorrect={feedbackData.isCorrect}
              matchedType={feedbackData.matchedType}
              convertedAnswer={feedbackData.convertedAnswer}
              settings={settings}
              frontendValidationResult={feedbackData.validationResult}
              userAnswers={feedbackData.userAnswers}
              moduleName={feedbackData.item?.type}
            />

            {/* Close Button for Table */}
            <button
              onClick={handleTableClose}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
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
        )}

      {/* Summary Feedback */}
      {displayMode === "both" && (
        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span
                className={`text-lg ${feedbackData.isCorrect ? "text-green-400" : "text-red-400"}`}
              >
                {feedbackData.isCorrect ? "✅" : "❌"}
              </span>
              <span className="text-white font-medium">
                {feedbackData.isCorrect ? "Correct!" : "Incorrect"}
              </span>
            </div>

            <div className="text-sm text-white/70">
              {feedbackData.matchedType && (
                <span>Matched: {feedbackData.matchedType}</span>
              )}
            </div>
          </div>

          {feedbackData.validationResult?.feedback &&
            feedbackData.validationResult.feedback.length > 0 && (
              <div className="mt-2 text-sm text-white/80">
                {feedbackData.validationResult.feedback[0]}
              </div>
            )}
        </div>
      )}
    </>
  );
};

export default FeedbackDisplay;
