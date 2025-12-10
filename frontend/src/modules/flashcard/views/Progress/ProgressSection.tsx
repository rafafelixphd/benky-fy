"use client";

import React from "react";
import { ProgressData, ProgressMetrics } from "../../types/ProgressTypes";
import { UserSettings } from "@/core/api-client";
import { ProgressBar } from "./ProgressBar";
import { cn } from "@/core/utils";

interface ProgressSectionProps {
  currentItem: number;
  totalItems: number;
  progress?: ProgressData;
  metrics?: ProgressMetrics;
  settings: UserSettings;
  moduleName: string;
  showMetrics?: boolean;
  showInsights?: boolean;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  currentItem,
  totalItems,
  progress,
  metrics,
  settings,
  moduleName,
  showMetrics = true,
  showInsights = true,
}) => {
  const completionPercentage =
    totalItems > 0 ? (currentItem / totalItems) * 100 : 0;
  const accuracy = progress?.accuracy || 0;
  const streakDays = progress?.streakDays || 0;

  const getProgressColor = () => {
    if (completionPercentage >= 100) return "from-green-500 to-emerald-500";
    if (completionPercentage >= 75) return "from-blue-500 to-cyan-500";
    if (completionPercentage >= 50) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const getAccuracyColor = () => {
    if (accuracy >= 90) return "text-green-400";
    if (accuracy >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getProgressInsights = () => {
    const insights = [];

    if (completionPercentage >= 100) {
      insights.push({ type: "success", message: "Module completed! 🎉" });
    } else if (completionPercentage >= 75) {
      insights.push({ type: "info", message: "Almost there! Keep going! 💪" });
    } else if (completionPercentage < 25) {
      insights.push({ type: "info", message: "Just getting started! 🚀" });
    }

    if (accuracy >= 90) {
      insights.push({ type: "success", message: "Excellent accuracy! 🌟" });
    } else if (accuracy < 50) {
      insights.push({ type: "warning", message: "Focus on accuracy 📚" });
    }

    if (streakDays > 0) {
      insights.push({
        type: "success",
        message: `${streakDays} day streak! 🔥`,
      });
    }

    return insights;
  };

  const insights = getProgressInsights();

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-white font-semibold text-lg">
              {moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}{" "}
              Progress
            </h3>
            <p className="text-white/70 text-sm">
              {currentItem} of {totalItems} items completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {Math.round(completionPercentage)}%
            </div>
            <div className="text-sm text-white/70">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          progress={completionPercentage}
          total={100}
          showPercentage={false}
          color={getProgressColor()}
        />

        {/* Metrics */}
        {showMetrics && (progress || metrics) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-white">
                {progress?.correctAnswers || 0}
              </div>
              <div className="text-xs text-white/70">Correct</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-semibold text-white">
                {progress?.incorrectAnswers || 0}
              </div>
              <div className="text-xs text-white/70">Incorrect</div>
            </div>

            <div className="text-center">
              <div className={`text-lg font-semibold ${getAccuracyColor()}`}>
                {accuracy.toFixed(1)}%
              </div>
              <div className="text-xs text-white/70">Accuracy</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-semibold text-white">
                {streakDays}
              </div>
              <div className="text-xs text-white/70">Day Streak</div>
            </div>
          </div>
        )}

        {/* Insights */}
        {showInsights && insights.length > 0 && (
          <div className="mt-4 space-y-2">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={cn(
                  "p-2 rounded-lg text-sm",
                  insight.type === "success" &&
                    "bg-green-500/20 text-green-200 border border-green-500/30",
                  insight.type === "warning" &&
                    "bg-yellow-500/20 text-yellow-200 border border-yellow-500/30",
                  insight.type === "info" &&
                    "bg-blue-500/20 text-blue-200 border border-blue-500/30",
                )}
              >
                {insight.message}
              </div>
            ))}
          </div>
        )}

        {/* Additional Metrics */}
        {metrics && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/70">Average Time per Item:</span>
                <span className="text-white ml-2">
                  {Math.round(metrics.timePerItem / 1000)}s
                </span>
              </div>

              <div>
                <span className="text-white/70">Total Time Spent:</span>
                <span className="text-white ml-2">
                  {Math.round(metrics.totalTimeSpent / 60000)}m
                </span>
              </div>

              <div>
                <span className="text-white/70">Improvement Rate:</span>
                <span className="text-white ml-2">
                  {metrics.improvementRate.toFixed(1)}%
                </span>
              </div>

              <div>
                <span className="text-white/70">Average Attempts:</span>
                <span className="text-white ml-2">
                  {metrics.averageAttempts.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressSection;
