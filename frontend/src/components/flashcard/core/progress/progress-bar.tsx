'use client';

import { cn } from "@/core/utils";
import { ProgressBarProps } from "../../types/progress";

export function ProgressBar({
  progress,
  showPercentage = true,
  className = '',
}: ProgressBarProps) {
  const roundedProgress = Math.round(progress);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="w-full bg-white/20 rounded-full h-2">
        <div
          className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {showPercentage && (
        <div className="flex justify-between text-xs text-white/60">
          <span>0%</span>
          <span>{roundedProgress}%</span>
          <span>100%</span>
        </div>
      )}
    </div>
  );
}
