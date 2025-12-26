"use client";

import React, { useState } from "react";
import { FlashcardItem } from "../../types/FlashcardTypes";
import { UserSettings } from "@/core/api-client";
import { FlashcardContent } from "./FlashcardContent";
import { FlashcardActions } from "./FlashcardActions";
import { cn } from "@/core/utils";

interface FlashcardDisplayProps {
  flashcard: FlashcardItem;
  settings: UserSettings;
  isUserInteraction: boolean;
  mode: "flashcard";
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  disabled?: boolean;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
}

export const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({
  flashcard,
  settings,
  isUserInteraction,
  mode,
  onNext,
  onPrevious,
  onSkip,
  disabled = false,
  canGoPrevious = true,
  canGoNext = true,
}) => {
  const [displayMode, setDisplayMode] = useState<"question" | "answer">(
    "question",
  );

  const handleFlip = () => {
    setDisplayMode((prev) => (prev === "question" ? "answer" : "question"));
  };

  const handleNext = () => {
    if (onNext && canGoNext && !disabled) {
      onNext();
      setDisplayMode("question"); // Reset to question for next card
    }
  };

  const handlePrevious = () => {
    if (onPrevious && canGoPrevious && !disabled) {
      onPrevious();
      setDisplayMode("question"); // Reset to question for previous card
    }
  };

  const handleSkip = () => {
    if (onSkip && !disabled) {
      onSkip();
      setDisplayMode("question"); // Reset to question for skipped card
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        className={cn(
          "relative bg-gradient-to-br from-primary-purple/20 to-secondary-purple/20 backdrop-blur-sm rounded-lg p-8 min-h-[300px] flex flex-col items-center justify-center transition-all duration-300 border border-primary-purple/30 shadow-lg",
          isUserInteraction && "opacity-75",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {/* Flashcard Content */}
        <div className="flex-1 flex items-center justify-center w-full">
          <FlashcardContent
            flashcard={flashcard}
            settings={settings}
            displayMode={displayMode}
            mode={mode}
          />
        </div>

        {/* Flip Button */}
        <button
          onClick={handleFlip}
          disabled={disabled}
          className="mt-4 px-4 py-2 bg-primary-purple/30 hover:bg-primary-purple/50 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {displayMode === "question" ? "Show Answer" : "Show Question"}
        </button>

        {/* Action Buttons */}
        <FlashcardActions
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
          disabled={disabled}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
        />
      </div>
    </div>
  );
};

export default FlashcardDisplay;
