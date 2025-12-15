'use client';

import { cn } from "@/core/utils";
import { CheckCircle, XCircle, SkipForward } from "lucide-react";
import { AccuracyChartProps } from "../../types/progress";

export function AccuracyChart({
  correct,
  incorrect,
  skipped,
  className = '',
}: AccuracyChartProps) {
  const total = correct + incorrect + skipped;
  const correctPercentage = (correct / total) * 100;
  const incorrectPercentage = (incorrect / total) * 100;
  const skippedPercentage = (skipped / total) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex h-2 rounded-full overflow-hidden">
        <div 
          className="bg-emerald-500 transition-all duration-300"
          style={{ width: `${correctPercentage}%` }}
        />
        <div 
          className="bg-red-500 transition-all duration-300"
          style={{ width: `${incorrectPercentage}%` }}
        />
        <div 
          className="bg-yellow-500 transition-all duration-300"
          style={{ width: `${skippedPercentage}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/10 rounded-lg p-2">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/80">Correct</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {Math.round(correctPercentage)}%
          </div>
          <div className="text-xs text-white/60">{correct} answers</div>
        </div>

        <div className="bg-white/10 rounded-lg p-2">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-white/80">Incorrect</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {Math.round(incorrectPercentage)}%
          </div>
          <div className="text-xs text-white/60">{incorrect} answers</div>
        </div>

        <div className="bg-white/10 rounded-lg p-2">
          <div className="flex items-center gap-2 mb-1">
            <SkipForward className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white/80">Skipped</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {Math.round(skippedPercentage)}%
          </div>
          <div className="text-xs text-white/60">{skipped} answers</div>
        </div>
      </div>
    </div>
  );
}
