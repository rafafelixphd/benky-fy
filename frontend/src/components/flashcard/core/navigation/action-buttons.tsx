'use client';

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";

interface ActionButtonsProps {
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  disabled: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function ActionButtons({
  onNext,
  onPrevious,
  onSkip,
  disabled,
  canGoPrevious,
  canGoNext,
}: ActionButtonsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-center gap-4">
        <Button
          onClick={onPrevious}
          disabled={disabled || !canGoPrevious}
          variant="outline"
          className="border-primary-purple/50 text-primary-purple hover:bg-primary-purple/10 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <Button
          onClick={onSkip}
          disabled={disabled}
          variant="outline"
          className="border-primary-purple/50 text-primary-purple hover:bg-primary-purple/10 disabled:opacity-50"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Skip
        </Button>

        <Button
          onClick={onNext}
          disabled={disabled || !canGoNext}
          variant="outline"
          className="border-primary-purple/50 text-primary-purple hover:bg-primary-purple/10 disabled:opacity-50"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="text-center text-primary-purple/60 text-xs mt-4">
        <p>Use arrow keys to navigate • Space to skip</p>
      </div>
    </div>
  );
}
