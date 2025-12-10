'use client';

import { cn } from "@/core/utils";
import { Flame, Trophy } from "lucide-react";
import { StreakIndicatorProps } from "../../types/progress";

export function StreakIndicator({
  currentStreak,
  bestStreak,
  className = '',
}: StreakIndicatorProps) {
  return (
    <div className={cn("flex gap-4", className)}>
      <div className="flex-1 bg-white/10 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm text-white/80">Current Streak</span>
        </div>
        <div className="text-2xl font-bold text-white">{currentStreak}</div>
      </div>

      <div className="flex-1 bg-white/10 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-white/80">Best Streak</span>
        </div>
        <div className="text-2xl font-bold text-white">{bestStreak}</div>
      </div>
    </div>
  );
}
