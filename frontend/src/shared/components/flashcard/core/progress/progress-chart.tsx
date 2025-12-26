'use client';

import { cn } from "@/core/utils";
import { Clock } from "lucide-react";
import { ProgressChartProps } from "../../types/progress";
import { AccuracyChart } from "./accuracy-chart";
import { StreakIndicator } from "./streak-indicator";

export function ProgressChart({
  stats,
  className = '',
}: ProgressChartProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.round(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <AccuracyChart
        correct={stats.correct}
        incorrect={stats.incorrect}
        skipped={stats.skipped}
      />

      <StreakIndicator
        currentStreak={stats.streakCount}
        bestStreak={stats.bestStreak}
      />

      <div className="bg-white/10 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-white/80">Average Response Time</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {formatTime(stats.averageResponseTime)}
        </div>
      </div>
    </div>
  );
}
