"use client";

import React from "react";
import { cn } from "@/core/utils";

interface ProgressBarProps {
  progress: number;
  total: number;
  showPercentage?: boolean;
  color?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  total,
  showPercentage = true,
  color = "from-blue-500 to-cyan-500",
  size = "md",
  animated = true,
  label,
}) => {
  const percentage =
    total > 0 ? Math.min(Math.max((progress / total) * 100, 0), 100) : 0;

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-1";
      case "lg":
        return "h-3";
      case "md":
      default:
        return "h-2";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-xs";
      case "lg":
        return "text-sm";
      case "md":
      default:
        return "text-xs";
    }
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/80 text-sm font-medium">{label}</span>
          {showPercentage && (
            <span className={`text-white/70 ${getTextSize()}`}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar Container */}
      <div
        className={cn(
          "w-full bg-white/20 rounded-full overflow-hidden",
          getSizeClasses(),
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            `bg-gradient-to-r ${color}`,
            animated && "animate-pulse",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Percentage Display */}
      {showPercentage && !label && (
        <div className="flex justify-between mt-2 text-xs text-white/60">
          <span>0%</span>
          <span className="font-medium">{Math.round(percentage)}%</span>
          <span>100%</span>
        </div>
      )}

      {/* Progress Text */}
      <div className="mt-1 text-center">
        <span className="text-white/70 text-sm">
          {progress} / {total}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
