'use client';

import { ProgressSectionProps } from "../../types/progress";
import { ProgressBar } from "./progress-bar";
import { ProgressChart } from "./progress-chart";

export function ProgressSection({
  currentItem,
  totalItems,
  moduleName,
  stats,
}: ProgressSectionProps) {
  const progress = (currentItem / totalItems) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <span className="text-white font-medium">
            {moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Progress
          </span>
          <span className="text-white/80 text-sm">
            {currentItem} / {totalItems}
          </span>
        </div>

        {/* Progress Bar */}
        <ProgressBar progress={progress} />

        {/* Stats Charts */}
        {stats && <ProgressChart stats={stats} />}
      </div>
    </div>
  );
}
